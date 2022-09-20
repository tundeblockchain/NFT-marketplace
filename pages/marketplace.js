import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import NFT from '../build/contracts/NFT.json'
import Market from '../build/contracts/NFTMarket.json'

export default function MarketPlace() {
  const [nfts, setNfts] = useState([]);
  const [value, setValue] = useState('initial');
  const [loadingState, setLoadingState] = useState('not-loaded');
  useEffect(() => {
    try {
      loadNFTs();
    }catch(err){
      console.log(err);
    }
    
  }, [value]);

  // Load all nfts into marketplace
  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');
    console.log(process.env.NFTADDRESS);
    const tokenContract = new ethers.Contract(process.env.NEXT_PUBLIC_NFTADDRESS, NFT.abi, provider);
    const marketContract = new ethers.Contract(process.env.NEXT_PUBLIC_NFTMARKETADDRESS, Market.abi, provider);
    try {
      const data = await marketContract.fetchMarketItems()
      const items = await Promise.all(data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenID);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
        let item = {
          price,
          tokenID: i.tokenID.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description
        }
        return item;
      }))
      
      setNfts(items);
      console.log(nfts);
      setLoadingState('loaded');
    }catch(err){
      console.log(err);
    }
    
  }

  async function buyNft(nft){
    const web3Modal = new Web3Modal();
    web3Modal.clearCachedProvider();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFTMARKETADDRESS, Market.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');

    const transaction = await contract.createMarketSale(process.env.NEXT_PUBLIC_NFTADDRESS, nft.tokenID, {
      value: price
    });
    await transaction.wait();
    loadNFTs();
  }

  // Display no items message if marketplace is empty
  if (loadingState === 'loaded' && !nfts.length) {
    return (
      <h1 className="text-white px20 py-10 text-3xl mt-12 ml-6">
        No Items in marketplace
      </h1>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="px-4 mt-6" style={{maxWidth: '1600px'}}>
        <h1 className="text-white font-bold mt-6 px20 py-10 text-3xl">
            Explore Products
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => {
              return <div key={i} className="border shadow rounded-xl overflow-hidden block p-6 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <img src={nft.image} className="object-cover h-56 w-96"/>
                <div className="p-4">
                  <p style={{height: '64px'}} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{overflow: 'hidden'}}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4">
                <p className="text-gray-400 text-2xl">Price</p>
                  <p className="text-2xl mb-4 font-bold">{nft.price} MATIC</p>
                  <button className="w-full gradient font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                </div>
              </div>
            })
          }
        </div>
      </div>
    </div>
  )
}
