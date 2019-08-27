import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import Web3Provider from "web3-react";
import connectors from "./Connectors.js";
import ActivateConnectors from "./components/ActivateConnectors.js";
import ArweaveComponent from "./components/ArweaveComponent.js";
import ArweaveRouterComponent from "./components/ArweaveRouterComponent"
import "./index.css";
import { Container, Row, Col } from 'react-bootstrap';


function App() {
  return (
    <HashRouter>
    <Switch>
    <Route exact path="/" render={() =>
    <Web3Provider connectors={connectors} libraryName="ethers.js">
      <Container className="App">
        <Row><div className='container text-center'><h1>ArwENS</h1></div></Row>
        <Row><div className='container text-center'>A simple Dapp for registering ENS domains and linking to content hosted on Arweave</div></Row>
        <Row>
          <Col>
            <ActivateConnectors />
          </Col>
        </Row>
        <Row>
          <Col>
            <ArweaveComponent />
          </Col>
        </Row>


      </Container>
    </Web3Provider>}/>
    <Route path="/:id" render={(routeProps) =>       
      <Web3Provider connectors={connectors} libraryName="ethers.js">
        <Row><Col>
            <ActivateConnectors source='router'/>
            <ArweaveRouterComponent domainName={routeProps.match.params.id} />
        </Col></Row>
      </Web3Provider>
    }
      /> 
    </Switch>
    </HashRouter>
  );
}

export default App;
