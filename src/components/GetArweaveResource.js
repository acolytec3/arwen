import React from 'react';
import Arweave from 'arweave/web';

function GetArweaveResource (props) {

  const [arweavePage, setArweavePage] = React.useState('')
  const arw = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
  });
  console.log(props.arweaveHash)
  arw.transactions.get(props.arweaveHash)
  .then(trxn => {
    trxn.get('tags').forEach(tag => {
    let key = tag.get('name', {decode: true, string: true});
    let value = tag.get('value', {decode: true, string: true});
    console.log(`${key} : ${value}`);
    })
    let page = trxn.get('data', {decode: true, string: true})
    setArweavePage(page);
    console.log(arweavePage)
  })
  .catch(error => {
    console.log(error)
    setArweavePage('error')
  })
  if (arweavePage === 'error'){
    return (
    <React.Fragment>
      {arweavePage === 'error' && <p>Still lost in the permaweb</p>}
    </React.Fragment>
    )}
    else if (props.source === "router") {
      return (<iframe width="100%" height="100%" frameborder="0" srcdoc={arweavePage} src={'https://arweave.net/'+props.arweaveHash} >></iframe>)
    }
    else return null
}

export default GetArweaveResource;
