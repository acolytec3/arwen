import * as React from "react";
//import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";
import Web3Provider, { useWeb3Context, Web3Consumer } from "web3-react";
import { ethers } from "ethers";
import { abi } from "./PublicResolver"
import connectors from "./Connectors.js";
import "./index.css";
import Arweave from 'arweave/web';

function App() {

  return (

    <Web3Provider connectors={connectors} libraryName="ethers.js">
      <div className="App">
        <ActivateConnectors/>
        <div>
          <SetArweaveComponent />
        </div>
      </div>      
    </Web3Provider>
  );
}

function ActivateConnectors() {
  const context = useWeb3Context();

  if (context.error) {
    console.error("Error!");
  }

  const [transactionHash, setTransactionHash] = React.useState();

  return (
    <React.Fragment>
      <h1>ENS Arweave Explorer</h1>

      <Web3ConsumerComponent />
      {context.error && (
        <p>An error occurred, check the console for details.</p>
      )}
      {Object.keys(connectors).map(connectorName => (
        <button
          key={connectorName}
          disabled={context.connectorName === connectorName}
          onClick={() => context.setConnector(connectorName)}
        >
          Activate {connectorName}
        </button>
      ))}
      <br />
      <br />
      {(context.active || (context.error && context.connectorName)) && (
        <button onClick={() => context.unsetConnector()}>
          {context.active ? "Deactivate Connector" : "Reset"}
        </button>
      )}
    </React.Fragment>
  );
}

function Web3ConsumerComponent() {
  return (
    <Web3Consumer>
      {context => {
        const { active, connectorName, account, networkId } = context;
        return (
          active && (
            <React.Fragment>
              <p>Active Connector: {connectorName}</p>
              <p>Account: {account || "None"}</p>
              <p>Network ID: {networkId}</p>
            </React.Fragment>
          )
        );
      }}
    </Web3Consumer>
  );
}

function SetArweaveComponent (props) {
  const context = useWeb3Context();
  const [arweaveURL, setarweaveURL] = React.useState()
  const [ensDomainName, setEnsDomainName] = React.useState('alice.eth')
  const handleChange = evt => {
    setarweaveURL(evt.target.value)
    console.log('Setting URL to ' + arweaveURL)
  }

  const handleSubmit = (evt) => {
    evt.preventDefault();
    associateArweaveWithENS(arweaveURL)
  }
 
  const handleENSChange = evt => {
    setEnsDomainName(evt.target.value)
    console.log('Setting URL to ' + arweaveURL)
  }

  const handleENSSubmit = (evt) => {
    evt.preventDefault();
    getArweaveFromENS();
    console.log('An ENS Domain name of ' + ensDomainName + 'was entered')
  }

  async function associateArweaveWithENS (arweaveUrl)
  {
    const signer = context.library.getSigner()
    var nameHash = ethers.utils.namehash(ensDomainName)
    const publicResolver = new ethers.Contract('0x5FfC014343cd971B7eb70732021E26C35B744cc4', abi, signer)
    var tx = await publicResolver.setText(nameHash,'url',arweaveUrl)
    console.log(tx.hash)
    await tx.wait()
    console.log(publicResolver.text(nameHash,'url'))
   }
  
  function getArweaveFromENS ()  {
    var nameHash = ethers.utils.namehash(ensDomainName)
    const publicResolver = new ethers.Contract('0x5FfC014343cd971B7eb70732021E26C35B744cc4', abi, context.library)
    publicResolver.text(nameHash,'url')
    .then(link => {
      console.log(link)
      setarweaveURL(link)
    })
    .catch(error => {
      console.log(error)
      setarweaveURL('Error in retrieving Arweave Key')
    })

  }

  if (context.active){
    return (
      <React.Fragment>
        <div>
        <form onSubmit={handleENSSubmit}>
          <label> ENS Domain
            <input type="text"
              value={ensDomainName}
              onChange={handleENSChange}
              />
          </label>
          <input type="submit" value="Submit" />
        </form>
        </div>
        {arweaveURL && <p>{arweaveURL}</p>}        
        <form onSubmit={handleSubmit}>
          <label>Set Arweave URL
            <input 
             type="text" 
             value={arweaveURL} 
             name="inputArweaveUrl" 
             onChange={handleChange} 
             required 
            />
            </label>
            <input type="submit" value="Submit" />  
        </form>
        {arweaveURL !== '' && <GetArweaveResource arweaveHash={arweaveURL} />}
      </React.Fragment>
    )
  }
  else return <p>Connection not active</p>
}

function GetArweaveResource (props) {

    const [arweavePage, setArweavePage] = React.useState('')
    const arw = Arweave.init({
      host: 'arweave.net',
    });
    console.log(props.arweaveHash)
    var transaction = arw.transactions.get(props.arweaveHash)
    .then(trxn => {
      trxn.get('tags').forEach(tag => {
      let key = tag.get('name', {decode: true, string: true});
      let value = tag.get('value', {decode: true, string: true});
      console.log(`${key} : ${value}`);
      })
      let page = trxn.get('data', {decode: true, string: true})
      setArweavePage(page);
      console.log(arweavePage)
    })
    .catch(error => {
      console.log(error)
      setArweavePage('error')
    })
    return (
      <React.Fragment>
        {arweavePage && (
        <div dangerouslySetInnerHTML={{ __html:arweavePage }} />)}
      </React.Fragment>
      )
}
export default App;

