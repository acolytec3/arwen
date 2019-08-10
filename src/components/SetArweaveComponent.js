import React from 'react';
import { ethers } from "ethers";
import { useWeb3Context } from "web3-react";
import GetArweaveResource from './GetArweaveResource.js'
import { abi } from "../PublicResolver"
import { Button, Form } from 'react-bootstrap'

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
          <Form>
            <Form.Group controlId='ensDomain'>
              <Form.Label>ENS Domain</Form.Label>
              <Form.Control type="text" placeholder="alice.eth" onChange={handleENSChange}/>
              <Form.Text className="text-muted">
                Enter the ENS domain or subdomain and retrieve any associated Arweave content
              </Form.Text>
            </Form.Group>     
          <Form onSubmit={handleArweaveSubmit}>
            <Form.Group controlId='arweaveId'>
              <Form.Label>Arweave Transaction ID</Form.Label>
              <Form.Control type="text" placeholder="" onChange={handleArweaveChange}/>
              <Form.Text className="text-muted">
                Enter the Arweave transaction ID you want link to your ENS domain/subdomain
              </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit">
              Link ENS to Arweave
            </Button>
          </Form>
      </Form>
      <Button variant="primary" type="submit" onClick={handleENSSubmit}>Retrieve Arweave Resource</Button>

        {arweaveURL !== 'none' && 
        <p>The Arweave transction ID is: {arweaveURL}</p>}
         {arweaveURL !== 'none' && 
        <GetArweaveResource arweaveHash={arweaveURL} />}
      </React.Fragment>
    )
  }
  else return <p>Connection not active</p>
}

export default SetArweaveComponent;
