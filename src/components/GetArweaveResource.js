import React from 'react';
import Arweave from 'arweave/web';

function GetArweaveResource (props) {

  const [arweavePage, setArweavePage] = React.useState('')
  const arw = Arweave.init({
    host: 'arweave.net',
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
    if (props.source === 'router'){
      window.open('https://arweave.net/'+props.arweaveHash, '_self')
    }
    else window.open('https://arweave.net/'+props.arweaveHash, '_blank')
    
  })
  .catch(error => {
    console.log(error)
    setArweavePage('error')
  })
  if (arweavePage === 'error'){
  return (
    <React.Fragment>
      {arweavePage === 'error' && <p>No Arweave resource found</p>}
    </React.Fragment>
    )}
  else return null

}

export default GetArweaveResource;
