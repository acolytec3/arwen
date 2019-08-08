import React from 'react';
import { ethers } from "ethers";
import { useWeb3Context } from "web3-react";
import GetArweaveResource from './GetArweaveResource.js'
import { abi } from "../PublicResolver"

function SetArweaveComponent (props) {
  const context = useWeb3Context();
  const [arweaveURL, setarweaveURL] = React.useState()
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
      setarweaveURL('Error in retrieving Arweave Key')
    })

  }

  if (context.active){
    return (
      <React.Fragment>
        <div>
        <form onSubmit={handleENSSubmit}>
          <label> ENS Domain to be queried
            <input type="text"
              value={ensDomainName}
              onChange={handleENSChange}
              />
          </label>
          <input type="submit" value="Submit" />
        </form>
        </div>
        {arweaveURL && <p>{arweaveURL}</p>}
        <form onSubmit={handleArweaveSubmit}>
          <label>Set Arweave URL
            <input
             type="text"
             value={arweaveURL}
             name="inputArweaveUrl"
             onChange={handleArweaveChange}
             required
            />
            </label>
            <input type="submit" value="Submit" />
        </form>
        {arweaveURL !== '' && <GetArweaveResource arweaveHash={arweaveURL} />}
      </React.Fragment>
    )
  }
  else return <p>Connection not active</p>
}

export default SetArweaveComponent;
