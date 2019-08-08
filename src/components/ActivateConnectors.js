import React from 'react';
import connectors from "../Connectors.js";
import { useWeb3Context } from "web3-react";
import Web3ConsumerComponent from './Web3ConsumerComponent.js'
import { Button } from 'react-bootstrap';

function ActivateConnectors() {
  const context = useWeb3Context();
  console.log(Object.keys(connectors));
  if (context.error) {
    console.error("Error!");
  }
  return (
    <React.Fragment>
      <h1>ENS Arweave Explorer</h1>

      <Web3ConsumerComponent />
      {context.error && (
        <p>An error occurred, check the console for details.</p>
      )}
      {Object.keys(connectors).map(connectorName => (
        <Button
          key={connectorName}
          disabled={context.connectorName === connectorName}
          onClick={() => context.setConnector(connectorName)}
        >
          Activate {connectorName}
        </Button>
      ))}
      <br />
      <br />
      {(context.active || (context.error && context.connectorName)) && (
        <Button onClick={() => context.unsetConnector()}>
          {context.active ? "Deactivate Connector" : "Reset"}
        </Button>
      )}
    </React.Fragment>
  );
}

export default ActivateConnectors;
