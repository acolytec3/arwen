import React from 'react';
import connectors from "../Connectors.js";
import { useWeb3Context } from "web3-react";
import Web3ConsumerComponent from './Web3ConsumerComponent.js'
import { Button } from 'react-bootstrap';

function ActivateConnectors() {
  const context = useWeb3Context();
  console.log(Object.keys(connectors));
  context.setFirstValidConnector(['Injected','Network'])
  if (context.error) {
    console.error("Error!");
  }
  return (
    <React.Fragment>
      <h1>ENS Arweave Explorer</h1>
      {context.error && (
        <p>An error occurred, check the console for details.</p>
      )}
      {(context.active && (context.connectorName === 'Network')) && 
      <p>You do not currently have Metamask activated.  Please unlock Metamask in order to begin ENS domain registration process.</p>
      }
      
      {((context.active && (context.connectorName === 'Network'))|| (context.error && context.connectorName)) && (
        <Button onClick={() => context.unsetConnector()}>
          {context.active ? "Retry Metamask" : "Reset"}
        </Button>
      )}
    </React.Fragment>
  );
}

export default ActivateConnectors;
