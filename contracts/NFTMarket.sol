// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarket is ReentrancyGuard{
    using Counters for Counters.Counter;
    Counters.Counter private _itemIDs;
    Counters.Counter private _itemsSold;
    address payable public owner;
    uint256 listingPrice = 0.02 ether;

    struct MarketItem {
        uint256 itemID;
        address nftContract;
        uint256 tokenID;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        bool delivered;
    }

    mapping(uint256 => MarketItem) private _marketItems;

    event MarketItemCreated (
        uint indexed itemID,
        address indexed nftContract,
        uint256 indexed tokenID,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    event MarketItemSold (
        uint indexed itemID,
        address indexed nftContract,
        uint256 indexed tokenID,
        address newOwner,
        uint256 price
    );

    constructor(){
        owner = payable(msg.sender);
    }

    function getListingPrice() public view returns (uint256){
        return listingPrice;
    }

    // Lists a new item on the NFT Marketplace
    function createMarketItem(address nftContract, uint256 tokenID, uint256 price) public payable nonReentrant{
        require(price > 0, "Price cannot be set to free");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        _itemIDs.increment();
        uint256 itemID = _itemIDs.current();

        _marketItems[itemID] = MarketItem(itemID, nftContract, tokenID, payable(msg.sender), payable(address(0)), price, false, false);
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenID);

        emit MarketItemCreated(itemID, nftContract, tokenID, payable(msg.sender), payable(address(0)), price, false);
    }

    // Allows an account to purchase an NFT from the marketplace
    function createMarketSale(address nftContract, uint256 itemID) public payable nonReentrant{
        uint price = _marketItems[itemID].price;
        uint tokenID = _marketItems[itemID].tokenID;
        require(msg.value == price, "Please Submit asking price in order to complete the purchase");

        _marketItems[itemID].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenID);
        _marketItems[itemID].owner = payable(msg.sender);
        _marketItems[itemID].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice);
        emit MarketItemSold(itemID, nftContract, tokenID, payable(msg.sender), price);
    }

    // Returns all NFTs on marketplace
    function fetchMarketItems() public view returns (MarketItem[] memory){
        uint totalItems = _itemIDs.current();
        uint unsold = totalItems - _itemsSold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsold);
        for (uint i = 0; i < totalItems; i++){
            if (_marketItems[i + 1].owner == address(0)){
                uint currentItemID = _marketItems[i + 1].itemID;
                MarketItem storage currentItem = _marketItems[currentItemID];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    // Fetches all NFTs bought from the sender from this marketplace
    function fetchMyNFTs() public view returns (MarketItem[] memory){
        uint totalItemCount = _itemIDs.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++){
            if (_marketItems[i + 1].owner == msg.sender){
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
         for (uint i = 0; i < totalItemCount; i++){
            if (_marketItems[i + 1].owner == msg.sender){
                uint currentItemID = _marketItems[i + 1].itemID;
                MarketItem storage currentItem = _marketItems[currentItemID];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    // Fetches all NFTs created and listed to the marketplace by the sender
    function fetchItemsCreated() public view returns (MarketItem[] memory){
        uint totalItemCount = _itemIDs.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++){
            if (_marketItems[i + 1].seller == msg.sender){
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++){
            if (_marketItems[i + 1].seller == msg.sender){
                uint currentItemID = _marketItems[i].itemID;
                MarketItem storage currentItem = _marketItems[currentItemID];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }
}