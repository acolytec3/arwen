import React, { useState } from 'react';
import connectors from "../Connectors.js";
import { useWeb3Context } from "web3-react";
import { Button, Modal, Row } from 'react-bootstrap';

function ActivateConnectors(props) {
  const context = useWeb3Context();
  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);

  console.log(Object.keys(connectors));
  if (props.source === 'router'){
    context.setConnector('Network')
  }
  else context.setFirstValidConnector(['Injected','Network'])
  if (context.error) {
    console.error("Error!");
  }
  if (props.source === 'router')
  {  
    return null
  }
  else {
  return (
    <React.Fragment>
      <Row><div className="container text-center">
        {context.error && (
          <p>Please verify that you have Metamask unlocked and try again</p>
        )}
      </div></Row>
      <Row><div className="container text-center">
      {(context.active && (context.connectorName === 'Network')) && 
      <p>You do not currently have Metamask activated.  Please unlock Metamask in order to begin ENS domain registration process.</p>
      }
      </div></Row>
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
            <li> An Arweave wallet with some AR in it<br />
            <span> Get a free one <a href="https://tokens.arweave.org" target="_blank">here</a> with 1 AR so you can try it out</span></li>
            <li> Something you want to host permanently on the permaweb</li>
          </ol>
          <h4>How do I do this?</h4>
          <p> The Dapp will walk you through it but below are the steps</p>
          <ol>
            <li> Pick an ENS domain/subdomain to registering</li>
            <li> Provide your Arweave key file</li>
            <li> Upload your text/html file to the permaweb</li>
            <li> Link your ENS domain to your permanently hosted file</li>
            <li> Share your newly hosted page with everyone</li>
          </ol>
        </Modal.Body>
      </Modal> }
      <div className='container text-center'>
        {((context.active && (context.connectorName === 'Network'))|| (context.error && context.connectorName)) && (
          <Button onClick={() => context.unsetConnector()}>
            {context.active ? "Retry Metamask" : "Reset"}
          </Button>
        )}
      </div>
    </React.Fragment>
  );
  }
  
}   

export default ActivateConnectors;
