import React from 'react';
import { ethers } from "ethers";
import { useWeb3Context } from "web3-react";
import GetArweaveResource from './GetArweaveResource.js'
import { abi } from "../PublicResolver"
import { Button, Form, Row, Col } from 'react-bootstrap'

function SetArweaveComponent (props) {
  const context = useWeb3Context();
  const [arweaveURL, setarweaveURL] = React.useState('none')
  const [ensDomainName, setEnsDomainName] = React.useState()

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

  async function associateArweaveWithENS (arweaveUrl)
  {
    const signer = context.library.getSigner()
    var nameHash = ethers.utils.namehash(ensDomainName)
    console.log('Namehash of ' + ensDomainName + ' is ' + nameHash)
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
      setarweaveURL('none')
    })

  }

  if (context.active){
    return (
      <React.Fragment>
        {context.connectorName === 'Injected' &&
          <div className='container mt-4 text-center'><h3>Link ENS to hosted Arweave page</h3></div>}
        {context.connectorName === 'Injected' &&              
          <Form onSubmit={handleArweaveSubmit}>
           <Row>
            <Col>
            <Form.Group controlId='ensDomain'>
              <Form.Label>ENS Domain</Form.Label>
              <Form.Control type="text" placeholder="alice.eth" onChange={handleENSChange}/>
              <Form.Text className="text-muted">
                Enter the ENS domain or subdomain you wish to link to Arweave content
              </Form.Text>
            </Form.Group>
            </Col>
           <Col>
            <Form.Group controlId='arweaveId'>
              <Form.Label>Arweave Transaction ID</Form.Label>
              <Form.Control type="text" placeholder="" onChange={handleArweaveChange}/>
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
          </Row>
        </Form>}
      <Row>
        <div className='container py-3 text-center'>
          <Button variant="primary" type="submit" onClick={handleENSSubmit}>Retrieve Arweave Resource</Button>
        </div>
      </Row>
        {arweaveURL !== 'none' && 
        <p>The Arweave transction ID is: {arweaveURL}</p>}
         {arweaveURL !== 'none' && 
        <GetArweaveResource arweaveHash={arweaveURL} source='app' />}
      </React.Fragment>
    )
  }
  else return null
}

export default SetArweaveComponent;
