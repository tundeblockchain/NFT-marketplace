const NFT = artifacts.require("./NFT.sol");
const NFTMarket = artifacts.require("./NFTMarket.sol");

contract("MyMine", accounts => {
    it("Create an item on the NFT Marketplace", async () => {
        const nftContract = await NFT.deployed();
        const nftMarketContract = await NFTMarket.deployed();

        let listingPrice = await nftMarketContract.getListingPrice();
        let nftAddress = nftContract.address;
        const auctionPrice = web3.utils.toWei('1', 'ether');
        let nftTokenTransaction = await nftContract.createToken('www.testtoken.com');
        let tokenID = nftTokenTransaction.logs[0].args[2];
        
        await nftMarketContract.createMarketItem(nftAddress, tokenID, auctionPrice, {value: listingPrice});
        const items = await nftMarketContract.fetchMarketItems();
        console.log('items:', items);
        expect(items.length).to.be.greaterThan(0);
      });

      it("Retrieve all NFTs created by account", async () => {
        const nftMarketContract = await NFTMarket.deployed();
        const nftContract = await NFT.deployed();

        let listingPrice = await nftMarketContract.getListingPrice();
        let nftAddress = nftContract.address;

        // Create an NFT with account
        const auctionPrice = web3.utils.toWei('1', 'ether');
        let nftTokenTransaction = await nftContract.createToken('www.testtoken2.com');
        let tokenID = nftTokenTransaction.logs[0].args[2];
        await nftMarketContract.createMarketItem(nftAddress, tokenID, auctionPrice, {value: listingPrice});

        const items = await nftMarketContract.fetchItemsCreated();
        console.log('items:', items);
        expect(items.length).to.be.greaterThan(0);
      });

      it("Retrieve all NFTs bought by account", async () => {
        const nftMarketContract = await NFTMarket.deployed();
        const nftContract = await NFT.deployed();

        let listingPrice = await nftMarketContract.getListingPrice();
        let nftAddress = nftContract.address;

        // Create an NFT Token
        const auctionPrice = web3.utils.toWei('1', 'ether');
        let nftTokenTransaction = await nftContract.createToken('www.testtoken2.com', {from: accounts[2]});
        let tokenID = nftTokenTransaction.logs[0].args[2];

        // Put NFT on Market with account 2
        // Buy NFT with account 1
        await nftMarketContract.createMarketItem(nftAddress, tokenID, auctionPrice, {value: listingPrice, from: accounts[2]});
        await nftMarketContract.createMarketSale(nftAddress, 1, {value: auctionPrice, from:accounts[1]});
        const items = await nftMarketContract.fetchMyNFTs({from:accounts[1]});
        console.log('items:', items);

        // Check if there is at least 1 NFT bought from market with account 1
        expect(items.length).to.be.greaterThan(0);
      });
});