import React from 'react';
import { ethers } from "ethers";
import { useWeb3Context } from "web3-react";
import GetArweaveResource from './GetArweaveResource.js'
import { abi } from "../PublicResolver"
import { Button, Form, Row, Col, Alert } from 'react-bootstrap'
const contentHash = require('content-hash')

function SetArweaveComponent (props) {
  const context = useWeb3Context();
  const [arweaveURL, setarweaveURL] = React.useState(props.txid)
  const [ensDomainName, setEnsDomainName] = React.useState(props.domainName)
  const [aTx, setaTx] = React.useState(false)

  const handleArweaveChange = evt => {
    setarweaveURL(evt.target.value)
    console.log('Setting URL to ' + arweaveURL)
  }

  const handleArweaveSubmit = (evt) => {
    evt.preventDefault();
    associateArweaveWithENS(arweaveURL)
  }

  const handleENSChange = evt => {
    setEnsDomainName(evt.target.value)
    console.log('Setting ensDomainName to ' + ensDomainName)
  }

  const handleENSSubmit = (evt) => {
    evt.preventDefault();
    getArweaveFromENS();
    console.log('An ENS Domain name of ' + ensDomainName + 'was entered')
  }

  function associateArweaveWithENS (arweaveUrl)
  {
    const signer = context.library.getSigner()
    var nameHash = ethers.utils.namehash(props.domainName)
    console.log('Namehash of ' + props.domainName + ' is ' + nameHash)
    const publicResolver = new ethers.Contract('0x5FfC014343cd971B7eb70732021E26C35B744cc4', abi, signer)
    publicResolver.setText(nameHash,'url',arweaveUrl)
    .then(txHash => {
      console.log(txHash)
      setaTx(true)
    })
    .catch(error => {
      console.log(error)
      setEnsDomainName('error')
    })
    publicResolver.setContenthash(nameHash,contentHash.fromIpfs(props.ipfsCid,))
    .then(txHash => {
      console.log(txHash)
      setaTx(true)
    })
    .catch(error => {
      console.log(error)
      setEnsDomainName('error')
    })
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
      setarweaveURL('none')
    })

  }

  if (context.active){
    return (
      <React.Fragment>
        {context.connectorName !== 'Network' &&
          <div className='container mt-4 text-center'><h3>Link ENS to hosted Arweave page</h3></div>}
        {context.connectorName !== 'Network' &&              
          <Form onSubmit={handleArweaveSubmit}>
           <Row>
            <Col>
            <Form.Group controlId='ensDomain'>
              <Form.Label>ENS Domain</Form.Label>
              <Form.Control type="text" defaultValue= {props.domainName} placeholder="alice.eth" onChange={handleENSChange}/>
              <Form.Text className="text-muted">
                Enter the ENS domain or subdomain you wish to link to Arweave content
              </Form.Text>
            </Form.Group>
            </Col>
           <Col>
            <Form.Group controlId='arweaveId'>
              <Form.Label>Arweave Transaction ID</Form.Label>
              <Form.Control type="text" defaultValue={props.txid} onChange={handleArweaveChange}/>
              <Form.Text className="text-muted">
                Enter the Arweave transaction ID you want link to your ENS domain/subdomain
              </Form.Text>
            </Form.Group>
            </Col>
          </Row>
          <Row className="justify-content-md-center">
             <Button variant="primary" type="submit">
               Link ENS to Arweave
             </Button>
             <Alert show={ensDomainName === 'error'} key='domainalert' variant='danger'>
              Something went wrong!  Please try again.
            </Alert>
          </Row>
        </Form>}
      <Row>
        <div className='container py-3 text-center'>
          <Button variant="primary" type="submit" onClick={handleENSSubmit}>Retrieve Arweave Resource</Button>
        </div>
      </Row>
      <Row>
        {arweaveURL !== 'none' && 
        <p>The Arweave transction ID is: {arweaveURL}</p>}
         {arweaveURL !== 'none' && 
        <GetArweaveResource arweaveHash={arweaveURL} source='app' />}
      </Row>
      <Row>
        {aTx &&
        <p>Your page is now permanently hosted on the permaweb and can be accessed from anywhere by using the below URL.
        {window.location.href +props.domainName}</p>}
      </Row>
      </React.Fragment>
    )
  }
  else return null
}

export default SetArweaveComponent;
