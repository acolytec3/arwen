import React from 'react';
import { ethers } from "ethers";
import { useWeb3Context } from "web3-react";
import { registrarAbi } from "../Registrar.js"
import { Navbar, Form, FormControl, InputGroup, Button } from 'react-bootstrap';
import { ethControllerAbi } from '../EthController.js'

function ENSRegistrationComponent() {
  const context = useWeb3Context();
  const [ensSubDomainName, setEnsSubDomainName] = React.useState()
  const [ensDomainName, setEnsDomainName] = React.useState()

  const handleEnsSubDomainChange = evt => {
    setEnsSubDomainName(evt.target.value)
    console.log('Setting ENS Domain Name to ' + ensSubDomainName)
  }

  const handleEnsSubdomainSubmit = (evt) => {
    evt.preventDefault();
    registerEnsSubDomain()
  }

  const handleEnsDomainChange = evt => {
    setEnsDomainName(evt.target.value)
    console.log('Setting ENS Domain Name to ' + ensDomainName)
  }

  const handleEnsDomainSubmit = (evt) => {
    evt.preventDefault();
    registerEnsDomain()
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

  async function registerEnsDomain()
  {
    const signer = context.library.getSigner()
    console.log("ENS Domain Name Hash is " + ensDomainName)
    const ethController = new ethers.Contract('0x357DBd063BeA7F0713BF88A3e97B7436B0235979', ethControllerAbi, signer)
    var domainName = ensDomainName.split('.')[0]
    var txid = await ethController.available(domainName)
    console.log(txid)
    if (txid === false) {
      return console.log('Domain name unavailable')
    }
    var commitSecret = ethers.utils.formatBytes32String(domainName)
    var commitmentHash = await ethController.makeCommitment(domainName, signer._address, commitSecret)
    console.log("The commit hash for this registration request is " + commitmentHash + " and the commit secret is " + commitSecret)
    var rentPrice = await ethController.rentPrice(domainName, 31535999)
    rentPrice = rentPrice * 1.05
    console.log('ENS Domain Name Rent Price: ' + rentPrice)
    txid = await ethController.commit(commitmentHash)
    console.log(txid)
    await txid.wait()
    var minCommitTimeBN = await ethController.minCommitmentAge()
    var minCommitTime = minCommitTimeBN.toNumber()
    await new Promise(resolve => setTimeout(resolve, minCommitTime*1000))
    console.log('Waited ' + minCommitTime + ' seconds')
    var gasPrice = ethers.providers.getGasPrice()
    console.log(gasPrice.toNumber())
    txid = ethController.register(domainName, signer._address, ethers.utils.bigNumberify(31535999), commitSecret, { value: rentPrice, gasLimit: 300000, gasPrice: gasPrice })
    .then(txid => console.log(txid))
    .catch(error => console.log(error))
 }


  if (context.active){
  return (
    <Navbar className="bg-light justify-content-between">
      <Form inline onSubmit={handleEnsDomainSubmit}>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text id="basic-addon1">EBS Domain Name</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            placeholder="alice.eth"
            aria-label="ENSDomain"
            type='text'
            value={ensDomainName}
            onChange={handleEnsDomainChange}
            aria-describedby="basic-addon1"
          />
        </InputGroup>
        <Button type="submit">Register Domain</Button>
      </Form>
      <Form inline onSubmit={handleEnsSubdomainSubmit}>
        <FormControl
          type="text"
          value={ensSubDomainName}
          onChange={handleEnsSubDomainChange}
          placeholder="bob.alice.eth"
          className=" mr-sm-2" />
        <Button type="submit">Register Subdomain</Button>
      </Form>
    </Navbar>
  )}
  else return null
}

export default ENSRegistrationComponent;
