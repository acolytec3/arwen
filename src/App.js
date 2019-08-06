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
        <ArweaveComponent />
        <RetrieveArweave />
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

  function sendTransaction() {
    const signer = context.library.getSigner();

    signer
      .sendTransaction({
        to: ethers.constants.AddressZero,
        value: ethers.utils.bigNumberify("0")
      })
      .then(({ hash }) => {
        setTransactionHash(hash);
      });
  }

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

      {context.active && context.account && !transactionHash && (
        <button onClick={sendTransaction}>Send Dummy Transaction</button>
      )}

      {transactionHash && <p>{transactionHash}</p>}

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

function ArweaveComponent () {
  const context = useWeb3Context();
  const [arweaveURL, setarweaveURL] = React.useState()

  const handleChange = evt => {
    setarweaveURL(evt.target.value)
    console.log('Setting URL to ' + arweaveURL)
  }

  const handleSubmit = (evt) => {
    evt.preventDefault();
    setArweave(arweaveURL)
  }

  async function setArweave (arweaveUrl)
  {
    const signer = context.library.getSigner()
    var nameHash = ethers.utils.namehash('acolytec3.test')
    const publicResolver = new ethers.Contract('0x5FfC014343cd971B7eb70732021E26C35B744cc4', abi, signer)
    var tx = await publicResolver.setText(nameHash,'url',arweaveUrl)
    console.log(tx.hash)
    await tx.wait()
    console.log(publicResolver.text(nameHash,'url'))
   }
  
  function getArweave ()
  {
    var nameHash = ethers.utils.namehash('acolytec3.test')
    const publicResolver = new ethers.Contract('0x5FfC014343cd971B7eb70732021E26C35B744cc4', abi, context.library)
    publicResolver.text(nameHash,'url')
    .then(link => {
      console.log(link)
      setarweaveURL(link)
    })
    console.error("Error!");
    return <p>Error</p>
  }
  if (context.active){
    return (
      <React.Fragment>
        {!arweaveURL && (
        <button onClick={getArweave}>Retrieve Arweave URL</button>
      )}
        {arweaveURL && <p>{arweaveURL}</p>}        

          <form onSubmit={handleSubmit}>
            <label>Arweave URL
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

      </React.Fragment>
    )
  }
  else return <p>Connection not active</p>
}

function RetrieveArweave ()
{
  const [arweavePage, setArweavePage] = React.useState()
  const arw = Arweave.init({
    host: 'arweave.net',
  });
  arw.network.getInfo().then(console.log).catch(console.log)

  const transaction = arw.transactions.get('bNbA3TEQVL60xlgCcqdz4ZPHFZ711cZ3hmkpGttDt_U')
  .then(transaction => {
    transaction.get('tags').forEach(tag => {
      let key = tag.get('name', {decode: true, string: true});
      let value = tag.get('value', {decode: true, string: true});
      console.log(`${key} : ${value}`);
      })
      var page = transaction.get('data', {decode: true, string: true});
      setArweavePage(page)
      console.log(arweavePage)
    }
  );

  return <div dangerouslySetInnerHTML={{ __html:arweavePage }} />
}
export default App;

