import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import axios from 'axios';
import NFT from '../build/contracts/NFT.json'
import Market from '../build/contracts/NFTMarket.json'

export default function CreatorDashboard(){
    const [nfts, setNfts] = useState([]);
    const [sold, setSold] = useState([]);
    const [value, setValue] = useState('initial');
    const [loadingState, setLoadingState] = useState('not-loaded');

    useEffect(() => {
        loadNFTs();
    }, [value]);

    async function loadNFTs() {
        const web3Modal = new Web3Modal();
        web3Modal.clearCachedProvider();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const tokenContract = new ethers.Contract(process.env.NEXT_PUBLIC_NFTADDRESS, NFT.abi, signer);
        const marketContract = new ethers.Contract(process.env.NEXT_PUBLIC_NFTMARKETADDRESS, Market.abi, signer);
        try {
            const data = await marketContract.fetchItemsCreated();
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
    
            const soldItems = items.filter(i => i.sold);
            setSold(soldItems);
            setNfts(items);
            console.log(nfts);
            setLoadingState('loaded');
        }catch(err){
            console.log(err);
        }
        
    }
    // Display no items message if marketplace is empty
    if (loadingState === 'loaded' && !nfts.length) {
        return (
        <h1 className="px20 py-10 text-3xl">
            No Items Created
        </h1>
        )
    }
    
    return(
        <div>
            <div className="p-4">
                <h2 className='my-4 text-white font-bold mt-6 px20 py-10 text-3xl'>My Created NFTs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                    nfts.map((nft, i) => {
                        return <div key={i} className="border shadow rounded-xl overflow-hidden">
                            <img src={nft.image} className="rounded object-cover h-56 w-full" />
                            <div className="p-4 bg-black">
                                <p className="text-2xl font-bold text-white">Price - {nft.price}</p>
                            </div>
                        </div>
                    })
                }
                </div>
            </div>
            <div className="px-4">
            <h2 className='my-4 text-white font-bold mt-6 px20 py-10 text-3xl'>My Sold NFTs</h2>
                {
                    Boolean(sold.length) && (
                        <div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                                {
                                    sold.map((nft, i) => {
                                        <div key={i} className="border shadow rounded-xl overflow-hidden">
                                            <img src={nft.image} className="rounded object-cover h-56 w-96" />
                                            <div className="p-4 bg-black">
                                                <p className="text-2xl font-bold text-white">Price - {nft.price}</p>
                                            </div>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}