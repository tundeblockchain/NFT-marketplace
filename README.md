This is a NFT Marketplace project which can be deployed to any EVM-compatible blockchain.
It uses NextJS for the frontend and Solidity for the smart contracts.

## Getting Started

First, install the required packages by running the following:

```bash
npm install
```
## Environment Variables
This project requires a few environment variables
Create a .env file in the root of the project
Add the following envrionment variables
This is the contract address for the NFT marketplace deployed to the network.
NEXT_PUBLIC_NFTMARKETADDRESS

IPFS variables are used to store NFT metadata. Add the following to .env file with details for your IPFS details
NEXT_PUBLIC_IPFSPROJECTID
NEXT_PUBLIC_IPFSPROJECTSECRET 
NEXT_PUBLIC_IPFSDEDICATED

## Run Project

First, run the development server:
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Live Demo on Polygon network
[View Demo](https://nft-marketplace-tunde.herokuapp.com/)
