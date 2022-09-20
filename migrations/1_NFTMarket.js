const NFTMarket = artifacts.require("NFTMarket");
const NFT = artifacts.require("NFT");
module.exports = function (deployer) {
  // let nftMarket = await deployer.deploy(NFTMarket);
  // deployer.deploy(NFT, nftMarket);
  deployer.deploy(NFTMarket).then(function(){
    return deployer.deploy(NFT, NFTMarket.address)
});
};
