import React, { useCallback, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import Arweave from 'arweave/web';
import { useWeb3Context } from "web3-react";

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
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

function ArweaveComponent ()
{


    const context = useWeb3Context();
    const [wallet, setWallet] = React.useState()
    const [balance, setBalance] = React.useState()
    const [data, setData] = React.useState()
    const [arweaveTxn, setTxn] = React.useState()

    React.useEffect(() => {
        if (wallet){
            var walletBalance = getBalance(wallet)
            .then(result => setBalance(result))
        }
    })

    var arw = Arweave.init({
      host: 'arweave.net',
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
                var txn = generateTransaction(wallet.privateKey, contents, {'name':'Content-Type', 'value':acceptedFiles[0].type})
                .then(txn => setTxn(txn))
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
        console.log('This transaction will cost ' + transaction.reward + ' winston')
        await arw.transactions.sign(transaction, wallet.privateKey)
        console.log(transaction)
        return transaction
    }

    async function postTransaction(transaction){

        console.log(transaction)
        const response = await arw.transactions.post(transaction)
        console.log(response)

        return response.status
    }

    async function arQLquery(){
        return null
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

    if (context.active && (context.connectorName === 'Injected')){
    return (
        <React.Fragment>
          {!wallet && <div className="container text-center mt-5">
            <div {...getRootProps({style})}>
                <input {...getInputProps()} />
                {!isDragActive && 'Click here or drop your Arweave keyfile here to connect to Arweave'}
                {isDragActive && !isDragReject && "Drop keyfile here"}
                {isDragReject && "Please only drop your keyfile "}
            </div>
            <ul className="list-group mt-2">
                {acceptedFiles.length > 0 && acceptedFiles.map(acceptedFile => (
                    <li className="list-group-item list-group-item-success">
                    {acceptedFile.name}
                </li>
                ))}
            </ul>
          </div>}
          <div>
              {wallet && <p>Your Arweave wallet address is {wallet.address}</p>}
          </div>
          <div>
              {balance && <p>Your Arweave wallet's current balance in winston is {balance}</p>}
          </div>
          
          {wallet && balance && <div className="container text-center mt-5">
            <div {...getRootProps({style})}>
                <input {...getInputProps()} />
                {!isDragActive && 'Click here or drop a file to deploy to Arweave'}
                {isDragActive && !isDragReject && "Drop file here"}
                {isDragReject && "Please only drop HTML or Text files here"}
            </div>
            <ul className="list-group mt-2">
                {acceptedFiles.length > 0 && acceptedFiles.map(acceptedFile => (
                    <li className="list-group-item list-group-item-success">
                    {acceptedFile.name}
                </li>
                ))}
            </ul>
          </div>}
          {data && <p>The contents of your file are below<p></p>
            <p></p>{data}</p>}
          {arweaveTxn && <p>The Transaction ID for your generated transaction is {arweaveTxn.id} and will cost {arweaveTxn.reward} winston</p>}
          {arweaveTxn && 
           <Button 
                key='submitTxn'
                onClick={() => postTransaction(arweaveTxn)}
                >Submit Transaction
            </Button>
          }
        </React.Fragment>
    )}
    else return null
}

export default ArweaveComponent
