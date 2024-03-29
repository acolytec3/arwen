import { Connectors } from "web3-react";
//import TrezorApi from "trezor-connect";
//import WalletConnectApi from "@walletconnect/web3-subprovider";
//import FortmaticApi from "fortmatic";
import PortisApi from "@portis/web3";

const {
  InjectedConnector,
  NetworkOnlyConnector,
 // TrezorConnector,
 // LedgerConnector,
 // WalletConnectConnector,
 // FortmaticConnector,
  PortisConnector
} = Connectors;

const supportedNetworkURLs = {
  1: "https://mainnet.infura.io/v3/",
  3: "https://ropsten.infura.io/v3/c4809a978c5b48c8a5b8fdc9133cef42",
  4: "https://rinkeby.infura.io/v3/"
};

// const defaultNetwork = 1;

const Injected = new InjectedConnector({
  supportedNetworks: [1, 3, 4]
});

const Network = new NetworkOnlyConnector({
  providerURL: supportedNetworkURLs[3]
});
/*
const Trezor = new TrezorConnector({
  api: TrezorApi,
  supportedNetworkURLs,
  defaultNetwork,
  manifestEmail: "",
  manifestAppUrl: ""
});

const Ledger = new LedgerConnector({
  supportedNetworkURLs,
  defaultNetwork
});

const WalletConnect = new WalletConnectConnector({
  api: WalletConnectApi,
  bridge: "https://bridge.walletconnect.org",
  supportedNetworkURLs,
  defaultNetwork
});

const Fortmatic = new FortmaticConnector({
  api: FortmaticApi,
  apiKey: "",
  logoutOnDeactivation: false
});
*/
const Portis = new PortisConnector({
  api: PortisApi,
  dAppId: "c5ae5710-95ad-43ff-8d6b-e7657ab429b4",
  network: "ropsten"
});

export default {
  Injected,
  Network,
/*  Trezor,
  Ledger,
  WalletConnect,
  Fortmatic,*/
  Portis
};
