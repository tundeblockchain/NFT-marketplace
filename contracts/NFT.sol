// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIDs;
    address private contractAddress;
    address private owner;
    modifier onlyOwner(){
        require(msg.sender == owner, "untrusted message sender");
        _;
    }

    constructor(address marketPlaceAddress) ERC721("NFT Token", "METT"){
        owner == msg.sender;
        contractAddress = marketPlaceAddress;
    }

    function createToken(string memory tokenURI) public returns (uint256 newItemId){
        _tokenIDs.increment();
        newItemId = _tokenIDs.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);
    }
}