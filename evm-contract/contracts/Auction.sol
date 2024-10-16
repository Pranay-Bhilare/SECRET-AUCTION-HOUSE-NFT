// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract NFTAuctionStorage is ERC721Holder {
    struct AuctionData {
        uint256 auctionID;
        address nftContract;
        uint256 tokenId;
        address seller;
        string metaDataURI;
        bool isActive;
    }

    mapping(uint256 => AuctionData) public auctions;
    uint256 public auctionCounter;

    event NFTStored(uint256 auctionId);
    event NFTReleased(uint256 auctionId, address to);

    function storeNFT(address _nftContract, uint256 _tokenId, address _KeplrAddress, string memory metaDataURI) external {
        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not the owner of the NFT");
        
        nft.safeTransferFrom(msg.sender, address(this), _tokenId);
        
        auctionCounter++;
        auctions[auctionCounter] = AuctionData(auctionCounter,_nftContract, _tokenId, _KeplrAddress,metaDataURI, true);
        emit NFTStored(auctionCounter);
    }

    function releaseNFT(uint256 _auctionId, address _to) external {
        AuctionData storage auction = auctions[_auctionId];
        require(auction.isActive, "Auction not active");
        
        IERC721(auction.nftContract).safeTransferFrom(address(this), _to, auction.tokenId);
        
        auction.isActive = false;
        
        emit NFTReleased(_auctionId, _to);
    }

    function getAuctionData(uint256 _auctionId) external view returns (AuctionData memory) {
        return auctions[_auctionId];
    }

    function getAllAuctions() external view returns (AuctionData[] memory) {
        uint256 totalAuctions = auctionCounter;

        AuctionData[] memory activeAuctions = new AuctionData[](totalAuctions);
        uint256 index = 0;

        for (uint256 i = 1; i <= totalAuctions; i++) {
            if (auctions[i].isActive) {
                activeAuctions[index] = auctions[i];
                index++;
            }
        }

        return activeAuctions;
    }

}