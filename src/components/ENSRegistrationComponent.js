import React from 'react';
import { ethers } from "ethers";
import { useWeb3Context } from "web3-react";
import { registrarAbi } from "../Registrar.js"
import { Alert, Form, FormControl, Button, ProgressBar, Row, Col, Container } from 'react-bootstrap';
import { ethControllerAbi } from '../EthController.js'
import SetArweaveComponent from "../components/SetArweaveComponent"

function ENSRegistrationComponent(props) {
  const context = useWeb3Context();
  const [ensSubDomainName, setEnsSubDomainName] = React.useState()
  const [ensDomainName, setEnsDomainName] = React.useState()
  const [ensSpinner, setEnsSpinner] = React.useState({state:'Not Started', per: 0})
  const [ensDomainAvailable, setEnsDomainAvailable] = React.useState(true)
  const [domain, setDomain] = React.useState()

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
    setEnsDomainAvailable(true)
    console.log('Setting ENS Domain Name to ' + ensDomainName)
  }

  const handleEnsDomainSubmit = (evt) => {
    evt.preventDefault();
    registerEnsDomain()
    .catch(error => {
      setEnsSpinner({state:'',per:0})
      console.log(error)
    })
  }
  async function registerEnsSubDomain()
  {
    const signer = context.library.getSigner()
    var names = ensSubDomainName.split('.')
    var subdomainNameHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(names[0]))
    var domainNameHash = ethers.utils.namehash(names[1] + '.' + names[2])
    console.log(subdomainNameHash)
    const registrar = new ethers.Contract('0x112234455c3a32fd11230c42e7bccd4a84e02010', registrarAbi, signer)
    setEnsSpinner({state:'Registering subdomain',per:33})
    var txid = await registrar.setSubnodeOwner(domainNameHash,subdomainNameHash,registrar.owner(domainNameHash))
    console.log(txid)
    await txid.wait()
    setEnsSpinner({state:'Setting Resolver',per:66})
    txid = await registrar.setResolver(ethers.utils.namehash(ensSubDomainName),'0x5FfC014343cd971B7eb70732021E26C35B744cc4')
    console.log(txid)
    setEnsSpinner({state:'Domain Registered',per:100})
    setDomain(ensSubDomainName)
  }

  async function registerEnsDomain()
  {
    const signer = context.library.getSigner()
    const provider = ethers.getDefaultProvider()
    console.log("ENS Domain Name Hash is " + ensDomainName)
    const ethController = new ethers.Contract('0x357DBd063BeA7F0713BF88A3e97B7436B0235979', ethControllerAbi, signer)
    var domainName = ensDomainName.split('.')[0]
    var txid = await ethController.available(domainName)
    console.log(txid)
    if (txid === false) {
      setEnsDomainAvailable(false)
      return console.log('Domain name unavailable')
    }
    var commitSecret = ethers.utils.formatBytes32String(domainName)
    var commitmentHash = await ethController.makeCommitment(domainName, signer._address, commitSecret)
    console.log("The commit hash for this registration request is " + commitmentHash + " and the commit secret is " + commitSecret)
    var rentPrice = await ethController.rentPrice(domainName, 31535999)
    console.log('ENS Domain Name Rent Price: ' + rentPrice)
    setEnsSpinner({state: "Committing Domain", per:33})
    txid = await ethController.commit(commitmentHash)
    console.log(txid)
    await txid.wait()
    var minCommitTimeBN = await ethController.minCommitmentAge()
    var minCommitTime = minCommitTimeBN.toNumber()
    await new Promise(resolve => setTimeout(resolve, minCommitTime*1000))
    console.log('Waited ' + minCommitTime + ' seconds')
    var gasPrice = await provider.getGasPrice()
    setEnsSpinner({state: "Registering Domain", per:66})
    txid = await ethController.register(domainName, signer._address, ethers.utils.bigNumberify(31535999), commitSecret, { value: rentPrice, gasLimit: 300000, gasPrice: gasPrice })
    await txid.wait()
    console.log("Registered " + ensDomainName + " with transaction " + txid)
    const registrar = new ethers.Contract('0x112234455c3a32fd11230c42e7bccd4a84e02010', registrarAbi, signer)
    setEnsSpinner({state: "Setting Resolver", per:90})
    txid = await registrar.setResolver(ethers.utils.namehash(ensDomainName),'0x5FfC014343cd971B7eb70732021E26C35B744cc4')
    await txid.wait()
    console.log(txid)
    setEnsSpinner({state: "Domain Registered", per:100})
    setDomain(ensDomainName)
 }

  if (context.active && (context.connectorName !== 'Network')){
  return (
  <Container>
      <Row>
        <Col>
          <Form onSubmit={handleEnsDomainSubmit}>
            <FormControl
              placeholder="alice.eth"
              aria-label="ENSDomain"
              type='text'
              value={ensDomainName}
              onChange={handleEnsDomainChange}
              aria-describedby="basic-addon1"
            />
              <Form.Text className="text-muted">
                3 Transactions - Commit; Register Domain; Set resolver
              </Form.Text>
          <div className='container pt-2 text-center '>
            <Button type="submit" disabled={ensSpinner.per > 0}>
              {(ensSpinner.per > 0) ? 'Registering Domain' : 'Register Domain'}</Button>
            <Alert show={!ensDomainAvailable} key='domainalert' variant='danger'>
              That ENS domain name is not available
            </Alert>
          </div>
        </Form>
        </Col>
      <Col>
        <Form onSubmit={handleEnsSubdomainSubmit}>
          <FormControl
            type="text"
            value={ensSubDomainName}
            onChange={handleEnsSubDomainChange}
            placeholder="bob.alice.eth"
            className=" mr-sm-2" />
          <Form.Text className="text-muted">
            2 Transactions - Register Subdomain; Set resolver
           </Form.Text>
           <div className='container pt-2 text-center '>
            <Button type="submit" disabled={ensSpinner.per > 0}>Register Subdomain</Button>
          </div>
        </Form>
        </Col>
        </Row>
      <Row>
        {ensSpinner.per > 0 && <div className='container text-center'>
        <ProgressBar now={ensSpinner.per} label={ensSpinner.state} /></div>}
      </Row>
      {ensSpinner.per === 100 && 
      <Row>
          <Col>
            <SetArweaveComponent domainName={domain} txid={props.txid} ipfsCid={props.ipfsCid}/>
          </Col>
      </Row>}
   </Container>

  )}
  else return null
}

export default ENSRegistrationComponent;
