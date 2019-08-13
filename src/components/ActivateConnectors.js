import React, { useState } from 'react';
import connectors from "../Connectors.js";
import { useWeb3Context } from "web3-react";
import Web3ConsumerComponent from './Web3ConsumerComponent.js'
import { Button, Modal } from 'react-bootstrap';

function ActivateConnectors() {
  const context = useWeb3Context();
  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);

  console.log(Object.keys(connectors));
  context.setFirstValidConnector(['Injected','Network'])
  if (context.error) {
    console.error("Error!");
  }
  return (
    <React.Fragment>
      {context.error && (
        <p>Please verify that you have Metamask unlocked and try again</p>
      )}
      {(context.active && (context.connectorName === 'Network')) && 
      <p>You do not currently have Metamask activated.  Please unlock Metamask in order to begin ENS domain registration process.</p>
      }
      {(context.connectorName === 'Injected') &&
      <Modal 
        size="lg" 
        centered show={show} 
        onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title id='intro-modal'>First time here?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>What is ArwENS?</h4>
          <p>
            ArwENS is a one-stop shop for registering ENS domain/subdomains, storing text or web pages on Arweave, and then linking your
            newly minted ENS domain to your Arweave content. 
          </p>
          <h4>What you need to get started</h4>
          <ol>
            <li> Metamask - you've already unlocked this if you're seeing this</li>
            <li> An Arweave wallet keyfile</li>
            <li> Something you want to host permanently on the permaweb</li>
          </ol>
          <h4>How do I do this?</h4>
          <ol>
            <li> Pick an ENS domain/subdomain to registering</li>
            <li> Provide your Arweave key file</li>
            <li> Upload your text/html file to the permaweb</li>
            <li> Link your ENS domain to your permanently hosted file</li>
            <li> Share your newly hosted page with everyone</li>
          </ol>
        </Modal.Body>
      </Modal> }
      
      {((context.active && (context.connectorName === 'Network'))|| (context.error && context.connectorName)) && (
        <Button onClick={() => context.unsetConnector()}>
          {context.active ? "Retry Metamask" : "Reset"}
        </Button>
      )}
    </React.Fragment>
  );
}

export default ActivateConnectors;
