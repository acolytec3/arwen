import React from 'react';
import { ethers } from "ethers";
import { useWeb3Context } from "web3-react";
import { registrarAbi } from "../Registrar.js"
import { Navbar, Form, FormControl, InputGroup, Button } from 'react-bootstrap';


function ENSRegistrationComponent() {
  const context = useWeb3Context();
  const [ensSubDomainName, setEnsSubDomainName] = React.useState()

  const handleChange = evt => {
    setEnsSubDomainName(evt.target.value)
    console.log('Setting ENS Domain Name to ' + ensSubDomainName)
  }

  const handleSubmit = (evt) => {
    evt.preventDefault();
    registerEnsSubDomain()
  }

  async function registerEnsSubDomain()
  {
    const signer = context.library.getSigner()
    var names = ensSubDomainName.split('.')
    var subdomainNameHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(names[0]))
    var domainNameHash = ethers.utils.namehash(names[1] + '.' + names[2])
    console.log(subdomainNameHash)
    const registrar = new ethers.Contract('0x112234455c3a32fd11230c42e7bccd4a84e02010', registrarAbi, signer)
    var txid = await registrar.setSubnodeOwner(domainNameHash,subdomainNameHash,registrar.owner(domainNameHash))
    console.log(txid)
    await txid.wait()
    txid = await registrar.setResolver(ethers.utils.namehash(ensSubDomainName),'0x5FfC014343cd971B7eb70732021E26C35B744cc4')
    console.log(txid)

  }

  if (context.active){
  return (
    <Navbar className="bg-light justify-content-between">
      <Form inline>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            placeholder="ENS Domain"
            aria-label="ENSDomain"
            aria-describedby="basic-addon1"
          />
        </InputGroup>
      </Form>
      <Form inline>
        <FormControl
          type="text"
          value={ensSubDomainName}
          onChange={this.handleChange}
          placeholder="ENS SubDomain"
          className=" mr-sm-2" />
        <Button type="submit">Register</Button>
      </Form>
    </Navbar>
  )}
  else return null
}

export default ENSRegistrationComponent;
