async function main() {
    const MyNFT = await ethers.getContractFactory("MyNFT");
  
    const nft = await MyNFT.attach("your_contract_address");
  
    const metadataURI1 = "https://gateway.pinata.cloud/ipfs/Qmbmkz3VjYTH3SbgZavg3WddU4gesdyekFvn9iUL38FvNU";
    const metadataURI2 = "https://gateway.pinata.cloud/ipfs/QmexFC27iacKZXHoGXeEBeLu282HY83UWP4aLYge2dsGNb";
    recipient = ""
  
    console.log("Minting NFT...");
    const tx = await nft.mintNFT(recipient, metadataURI1);
    await tx.wait();
    const tx2 = await nft.mintNFT(recipient, metadataURI2);
    await tx2.wait();
  
    console.log("NFT minted to:", recipient.address);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
  