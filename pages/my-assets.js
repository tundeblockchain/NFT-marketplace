import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import axios from 'axios';
import NFT from '../build/contracts/NFT.json'
import Market from '../build/contracts/NFTMarket.json'

export default function MyAssets(){
    const [nfts, setNfts] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');

    useEffect(() => {
        loadNFTs();
    }, []);
    
    async function loadNFTs() {
        const web3Modal = new Web3Modal();
        web3Modal.clearCachedProvider();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const tokenContract = new ethers.Contract(process.env.NEXT_PUBLIC_NFTADDRESS, NFT.abi, signer);
        const marketContract = new ethers.Contract(process.env.NEXT_PUBLIC_NFTMARKETADDRESS, Market.abi, signer);
        try {
            const data = await marketContract.fetchMyNFTs()
            const items = await Promise.all(data.map(async i => {
              console.log(i);
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
            setLoadingState('loaded');
        }catch(err){
            console.log(err);
        }
        
    }

    // Display no items message if no assets in wallet
    if (loadingState === 'loaded' && !nfts.length) {
        return (
        <h1 className="text-white px20 py-10 text-3xl mt-12 ml-6">
            No Assets Owned
        </h1>
        )
    }

    return (
        <div className="flex justify-center">
            <div className="px-4 mt-12" style={{maxWidth: '1600px'}}>
                <h1 className="my-4 text-white font-bold mt-6 px20 py-10 text-3xl">
                    My NFTs
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                    nfts.map((nft, i) => {
                    return <div key={i} className="border shadow rounded-xl overflow-hidden block p-6 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                        <img src={nft.image} className="object-cover h-56 w-96"/>
                        <div className="p-4">
                            <p style={{height: '64px'}} className="text-2xl font-semibold">{nft.name}</p>
                            <div style={{height: '70px', overflow: 'hidden'}}>
                                <p className="text-gray-400">{nft.description}</p>
                            </div>
                        </div>
                    </div>
                    })
                }
                </div>
            </div>
        </div>
    )
}