import React, { useState } from 'react';
import connectors from "../Connectors.js";
import { useWeb3Context } from "web3-react";
import { Button, Modal, Row, ButtonToolbar } from 'react-bootstrap';

function ActivateConnectors(props) {
  const context = useWeb3Context();
  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);

  console.log(Object.keys(connectors));
  if (props.source === 'router'){
    context.setConnector('Network')
  }
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
        {!context.active && (
          <p>Please open Metamask or Portis</p>
        )}
        {!context.active && (
        <ButtonToolbar style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:'center'
        }}>
        <Button onClick={() => context.setConnector('Injected')}>
            Metamask
        </Button>
        <Button onClick={() => context.setConnector('Portis')}>
            Portis
        </Button>
        </ButtonToolbar>)}
      </div></Row>
      <Row><div className="container text-center">
        {context.error && (
          <p>Something went wrong.  Please refresh the page and unlock Metamask or Portis again.</p>
        )}
      </div></Row>
      <Row><div className="container text-center">
      {(context.active && (context.connectorName === 'Network')) && 
      <p>You do not currently have Metamask or Portis activated.  Please unlock Metamask or Portis in order to begin ENS domain registration process.</p>
      }
      </div></Row>
      {(context.connectorName !== 'Network') &&
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
            <li> Pick an ENS domain/subdomain to register and execute the transactions needed to register<br />
            <span>You'll be prompted a couple of times during the domain registration process.  If registering a domain name,the second transaction will include
              the total ETH required to register the domain for 1 year.</span></li>
            <li> Provide your Arweave key file<br />
            <span>Note, this key file is never leaving your device.  The Dapp is just using it to talk to Arweave.</span></li>
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
