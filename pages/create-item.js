import { ethers } from 'ethers';
import { useState } from 'react';
import Web3Modal from 'web3modal';
import { create as ipfsHttpClient} from 'ipfs-http-client';
import { useRouter } from 'next/router';
import NFT from '../build/contracts/NFT.json'
import Market from '../build/contracts/NFTMarket.json'

  


export default function CreateItem(){
    const auth = 'Basic ' + Buffer.from(process.env.NEXT_PUBLIC_IPFSPROJECTID + ':' + process.env.NEXT_PUBLIC_IPFSPROJECTSECRET).toString('base64');

    const client = ipfsHttpClient({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: auth,
        },
    });
        const [fileUrl, setFileUrl] = useState(null);
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: ''});
    const router = useRouter();

    async function onChange(e){
        const file = e.target.files[0];
        try {
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log('received: ${prog}')
                }
            )

            const url = process.env.NEXT_PUBLIC_IPFSDEDICATED + added.path;
            setFileUrl(url);
        }catch(e){
            console.log(e);
        }
    }

    async function createItem(){
        const { name, description, price } = formInput;
        if (!name || !description || !price || !fileUrl)
            return;
        const data = JSON.stringify({
            name, description, image: fileUrl
        })

        try{
            const added = await client.add(data);
            const url = process.env.NEXT_PUBLIC_IPFSDEDICATED + added.path;
            createSale(url);
        }catch(e){
            console.log(e);
        }
    }

    async function createSale(url){
        const web3Modal = new Web3Modal();
        web3Modal.clearCachedProvider();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const signer = provider.getSigner();

        let contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFTADDRESS, NFT.abi, signer);
        try {
            let transaction = await contract.createToken(url);
            let tx = await transaction.wait();
    
            let event = tx.events[0];
            let value = event.args[2];
            let tokenID = value.toNumber();
    
            const price = ethers.utils.parseUnits(formInput.price, 'ether');
    
            contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFTMARKETADDRESS, Market.abi, signer);
            let listingPrice = await contract.getListingPrice();
            listingPrice = listingPrice.toString();
    
            transaction = await contract.createMarketItem(
                process.env.NEXT_PUBLIC_NFTADDRESS, tokenID, price, {value: listingPrice}
            )
            await transaction.wait();
            router.push('/');
        }catch(err){
            console.log(err);
        }
        
    }

    return (
            <div className='w-1/2 flex flex-col pb-12 m-12'>
                <div className='mt-12 block p-6 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700'>
                    <h1 className="my-4 text-5xl font-bold leading-tight">
                        Create NFT
                    </h1>
                    <div className='flex flex-col pb-12'>
                        <input 
                            placeholder='Asset Name'
                            className='mt-8 border rounded p-4'
                            onChange={e => updateFormInput({ ...formInput, name: e.target.value})}
                        />
                        <textarea 
                            placeholder='Asset Description'
                            className='mt-2 border rounded p-4'
                            onChange={e => updateFormInput({ ...formInput, description: e.target.value})}
                        />
                        <input 
                            placeholder='Asset Price in Matic'
                            className='mt-2 border rounded p-4'
                            onChange={e => updateFormInput({ ...formInput, price: e.target.value})}
                        />
                        <input
                            type='file' 
                            name='Asset'
                            className='my-4'
                            onChange={onChange}
                        />
                        {fileUrl && (
                            <img className='rounded mt-4' width='350' src={fileUrl} />
                        )}
                        <button
                            onClick={createItem}
                            className="font-bold mt-4 gradient text-white rounded p-4 shadow-lg"
                        >
                            Create Asset
                        </button>
                    </div>
                </div>
                
            </div>
    )
}