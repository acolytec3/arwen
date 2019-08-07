# ENS-Arweave Project

## Usage
1. Clone this reposity
2. yarn install
3. yarn start
4. Navigate to localhost:3000
5. Click on "Activate Injected"
6. Open and unlock Metamask and accept "React App wants to connect to Metamask" prompt
7. Set Metamask to Ropsten network
8. Type in an ENS domain ('acolytec3.test') 
9. App will retrieve the Text URL field associated with that address in the Public Resolver.
10. If Text URL is a valid Arweave hash, will retrieve the file on Arweave associated with the hash and automatically render in the page.
11. Enter any value in the "Set Arweave URL" field and hit submit to add an Arewave URL to your ENS domain. 
12. Approve the transaction in Metamask and wait for the transaction to be mined.
13. Enter your ENS domain again and then submit and the Arweave page will be automatically rendered.
