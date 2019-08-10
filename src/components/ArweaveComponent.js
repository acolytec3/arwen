import React, { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import Arweave from 'arweave/web';
import { useWeb3Context } from "web3-react";

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
    
    const { isDragActive, getRootProps, getInputProps, isDragReject, acceptedFiles } = useDropzone({
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
//        const response = await arw.transactions.post(transaction)
        var response = null
        console.log(response)

        return "200"
    }

    async function arQLquery(){
        return null
    }

    if (context.active){
    return (
        <React.Fragment>
          {!wallet && <div className="container text-center mt-5">
            <div {...getRootProps()}>
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
            <div {...getRootProps()}>
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
