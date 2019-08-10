import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Arweave from 'arweave/web';
var sizeof = require('object-sizeof')

function ArweaveComponent ()
{
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
                console.log(wallet)
                var contents = event.target.result
                setData(contents)
                var txn = generateTransaction(wallet.privateKey, data, {'name':'Content-Type', 'value':acceptedFiles[0].type})
                setTxn(txn)
            }
        }
        reader.readAsText(acceptedFiles[0])
 
      }, []);
    
    const { isDragActive, getRootProps, getInputProps, isDragReject, acceptedFiles } = useDropzone({
      onDrop,
      accept: 'application/json , text/html , text/plain',
      });

    async function getBalance(wallet) {
        var balance = await arw.wallets.getBalance(wallet.address)
        console.log('Wallet balance is currently ' + arw.ar.winstonToAr(balance))
        return balance
    }
    
    async function generateTransaction(privateKey, data, tags) {
        console.log(privateKey)
        let transaction = await arw.createTransaction({ data }, privateKey)
        tags.foreach(tag => {
            transaction.addTag(tag.key, tag.value)
        })
        console.log(transaction)
        var size = sizeof(data)
        var cost = arw.transactions.getPrice(size,wallet.address)
        console.log('This transaction will cost ' + cost + ' winston')
        return transaction
    }

    async function postTransaction(transaction){
        await arw.transactions.sign(transaction, wallet.privateKey)

        const response = await arw.transactions.post(transaction)

        console.log(response)

        return response.status
    }

    async function arQLquery(){
        return null
    }

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
          {arweaveTxn && <p>Your generated transaction is below<p></p>{arweaveTxn}</p>
        }
        </React.Fragment>
    )
}

export default ArweaveComponent
