async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);
  
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const nft = await MyNFT.deploy();
  
    await nft.deployed();
    console.log("NFT Contract deployed to:", nft.address);

    const auction = await ethers.getContractFactory("NFTAuctionStorage");
    const Auction = await auction.deploy();
  
    await Auction.deployed();
    console.log("Auction Contract deployed to:", Auction.address);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
  