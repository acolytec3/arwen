import React, { useCallback, useMemo } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import Arweave from 'arweave/web';
import { useWeb3Context } from "web3-react";
import ENSRegistrationComponent from './ENSRegistrationComponent.js';
import Unixfs from 'ipfs-unixfs';
const ipid = require('ipld-dag-pb')

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  };
  
  const activeStyle = {
    borderColor: '#2196f3'
  };
  
  const acceptStyle = {
    borderColor: '#00e676'
  };
  
  const rejectStyle = {
    borderColor: '#ff1744'
  };

function ArweaveComponent (props)
{


    const context = useWeb3Context();
    const [wallet, setWallet] = React.useState()
    const [balance, setBalance] = React.useState()
    const [data, setData] = React.useState()
    const [arweaveTxn, setTxn] = React.useState('')
    const [cid, setCid] = React.useState()

    React.useEffect(() => {
        if (wallet){
            var walletBalance = getBalance(wallet)
            .then(result => setBalance(result))
        }
    })

    var arw = Arweave.init({
      host: 'arweave.net',
      port: 443,
      protocol: 'https',
    });

    const onDrop = useCallback(acceptedFiles => {
        console.log(acceptedFiles);
        const reader = new FileReader()


        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = function(event) {
            if (acceptedFiles[0].type === "application/json"){
                var key = JSON.parse(event.target.result)
                var address = arw.wallets.jwkToAddress(key)
                .then(address => {
                    setWallet({'privateKey':key, 'address':address})
                })
            }
            else {
                var contents = event.target.result
                setData(contents)
                var file = new Unixfs('file',contents)
                var node = new ipid.DAGNode(file.marshal());
                ipid.util.cid(ipid.util.serialize(node), {cidVersion:0})
                .then(ipfsCid => {
                  setCid(ipfsCid.toBaseEncodedString())
                  console.log('IPFS CID for this transaction is: ' + cid)
                  generateTransaction(wallet.privateKey, contents, {'name':'Content-Type', 'value':acceptedFiles[0].type, 'cid':ipfsCid})
                .then(txn => setTxn(txn))
                })
            }
        }
        reader.readAsText(acceptedFiles[0])
 
      }, [wallet, data]);
    
    const { isDragActive, isDragAccept, getRootProps, getInputProps, isDragReject, acceptedFiles } = useDropzone({
      onDrop,
      accept: 'application/json , text/html , text/plain',
      });

    async function getBalance(wallet) {
        var balance = await arw.wallets.getBalance(wallet.address)
        console.log('Wallet balance is currently ' + arw.ar.winstonToAr(balance))
        return balance
    }
    
    async function generateTransaction(privateKey, fileData, tags) {
        console.log(fileData)
        let transaction = await arw.createTransaction({ data : fileData }, privateKey)
        transaction.addTag(tags.name, tags.value)
        transaction.addTag('IPFS-Add',tags.cid)
        console.log('This transaction will cost ' + transaction.reward + ' winston')
        await arw.transactions.sign(transaction, wallet.privateKey)
        console.log(transaction)
        return transaction
    }

    async function postTransaction(transaction){

        console.log(transaction)
        const response = await arw.transactions.post(transaction)
        console.log(response)
        setData()
        return response.status
    }

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
      }), [
        isDragActive,
        isDragReject
      ]);


    if (context.active && (context.connectorName !== 'Network')){
    return (
        <React.Fragment>
          <div className='container mt-3 text-center'><h3>Arweave registration/file deployment</h3></div>
          {!wallet && <div className="container text-center mt-5">
            <div {...getRootProps({style})}>
                <input {...getInputProps()} />
                {!isDragActive && 'Click here or drop your Arweave keyfile here to connect to Arweave'}
                {isDragActive && !isDragReject && "Drop keyfile here"}
                {isDragReject && "Please only drop your keyfile "}
            </div>
          </div>}
          <div className='container text-left'>
              {wallet && <p>Arweave wallet address: {wallet.address}</p>}
          </div>
          <div className='container text-left'>
              {balance && <p>Arweave wallet balance: {balance} winston</p>}
          </div>
          
          {wallet && balance && !data && <div className="container text-center mt-5">
            <div {...getRootProps({style})}>
                <input {...getInputProps()} />
                {!isDragActive && 'Click here or drop a file to deploy to Arweave.'}
                {isDragActive && !isDragReject && "Drop file here"}
                {isDragReject && "Please only drop HTML or Text files here"}
            </div>
          </div>}
          {data && <p>The contents of your file are below<p></p>
            <p></p>{data}</p>}
          {arweaveTxn && 
            <ul>
                <li>Transaction ID: <a href={"https://arweave.net/tx/" + arweaveTxn.id} target="_blank">{arweaveTxn.id}</a></li> 
                <li>Transaction Cost: {arweaveTxn.reward} winston</li>
                <li>IPFS CID: {cid}</li>
            </ul>
            }
          <Row>{arweaveTxn && 
          <Col><div className="container pt-1">
           <Button 
                key='submitTxn'
                onClick={() => postTransaction(arweaveTxn)}
                >Submit Transaction
            </Button></div></Col>}
            {arweaveTxn && <Col><div className="container pt-1"><Button
                key='reset'
                onClick={() => {
                    setData()
                    setTxn('')    
                }}
                >Start Over</Button></div></Col>
            }</Row>
          {(arweaveTxn !== '') && <Row>
              <ENSRegistrationComponent txid={arweaveTxn.id} ipfsCid={cid} />
          </Row>}
        </React.Fragment>
    )}
    else return null
}

export default ArweaveComponent
