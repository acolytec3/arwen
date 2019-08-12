import React from 'react';
import { ethers } from "ethers";
import { useWeb3Context } from "web3-react";
import GetArweaveResource from './GetArweaveResource.js'
import { abi } from "../PublicResolver"

function ArweaveRouterComponent (props) {
  const context = useWeb3Context();
  const [arweaveURL, setarweaveURL] = React.useState('none')
  const [ensDomainName, setEnsDomainName] = React.useState(props.domainName)

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
    getArweaveFromENS()
    return (
      <React.Fragment>
      <p>{props.domainName}</p>
        {arweaveURL !== 'none' && 
        <p>The Arweave transction ID is: {arweaveURL}</p>}
         {arweaveURL !== 'none' && 
        <GetArweaveResource arweaveHash={arweaveURL} />}
      </React.Fragment>
    )
  }
  else return <p>Connection not active</p>
}

export default ArweaveRouterComponent;
