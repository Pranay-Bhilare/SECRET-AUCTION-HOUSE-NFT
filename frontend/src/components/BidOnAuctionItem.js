import { ethers } from "ethers";
import { testnet, mainnet } from "../config/secretpath";
import { SecretNetworkClient } from "secretjs";
import ClipLoader from "react-spinners/ClipLoader";
import React, { useState, useEffect } from "react";
import {
  arrayify,
  hexlify,
  SigningKey,
  keccak256,
  recoverPublicKey,
  computeAddress,
} from "ethers/lib/utils";
import { ecdh, chacha20_poly1305_seal } from "@solar-republic/neutrino";
import {
  bytes,
  bytes_to_base64,
  json_to_bytes,
  sha256,
  concat,
  text_to_bytes,
  base64_to_bytes,
} from "@blake.regalia/belt";
import abi from "../config/abi.js";
import abiA from "../../../evm-contract/abiA.js"

export default function BidOnAuctionItem({ myAddress, setMyAddress }) {
  const [items, setItems] = useState([]);
  const [bids, setBids] = useState({});
  const [chainId, setChainId] = useState("");
  const [bidValues, setBidValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [keplrConnected, setKeplrConnected] = useState(false);
  const [secretAddress, setSecretAddress] = useState('');
  const [bidResult,setBidResult] = useState({});
  const [itemsMap, setItemsMap] = useState({});
  const [claimedNFTs, setClaimedNFTs] = useState();
  const auctionContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

  const connectKeplr = async () => {
    if (!window.keplr) {
      alert("Keplr wallet extension not found!");
      return null;
    }
    await window.keplr.enable("pulsar-3");
    const keplrOfflineSigner = window.keplr.getOfflineSignerOnlyAmino("pulsar-3");
    const [{ address: myAddress }] = await keplrOfflineSigner.getAccounts();
    return { keplrOfflineSigner, myAddress };
  };


  const handleBidChange = (itemKey, value) => {
    setBids((prev) => ({ ...prev, [itemKey]: value }));
    setBidValues((prev) => ({ ...prev, [itemKey]: value }));
  };

  const releaseNFT = async (auctionID, highestBidderAddress) => {
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    const [currentAddress] = await metamaskProvider.send("eth_requestAccounts", []);
  
    if (currentAddress.toLowerCase() !== highestBidderAddress.toLowerCase()) {
      throw new Error("Only the highest bidder can claim the NFT");
    }
  
    // Connect to Keplr wallet
    await window.keplr.enable(chainId);
    const keplrOfflineSigner = window.keplr.getOfflineSignerOnlyAmino(chainId);
    const [{ address: myKeplrAddress }] = await keplrOfflineSigner.getAccounts();
  
    // Initialize SecretJS client
    const secretjs = await SecretNetworkClient.create({
      grpcWebUrl: "https://lcd.secret.express",
      chainId: chainId,
      wallet: keplrOfflineSigner,
      walletAddress: myKeplrAddress,
    });
  
    // Send SCRT tokens
    const tx = await secretjs.tx.compute.executeContract(
      {
        sender: myKeplrAddress,
        contract_address: process.env.REACT_APP_SECRET_ADDRESS,
        msg: {
          transfer: {
            recipient: itemsMap[auctionID].seller, 
            amount: bidResult[auctionID].h_bid.amount,
            // @TODO idhar dono ko ache se set karna hai & cross ceck this implemetnation
          },
        },
      },
      {
        gasLimit: 100_000,
      }
    );
  
    if (tx.code !== 0) {
      throw new Error(`Failed to send SCRT tokens: ${tx.rawLog}`);
    }
  
    // Call the releaseNFT function on the Ethereum contract
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"s;
    const contractABI = abiA;
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
    const releaseTx = await contract.releaseNFT(auctionID, highestBidderAddress);
    await releaseTx.wait();
  
    return true;
  };
  
  // In your component
  const handleReleaseNFT = async (auctionID, highestBidderAddress) => {
    try {
      await releaseNFT(auctionID, highestBidderAddress);
      setClaimedNFTs(prev => ({ ...prev, [auctionID]: true }));
    } catch (error) {
      console.error("Failed to release NFT:", error);
      // Show error message to user
    }
  };

  const handleSubmit = async (e, itemKey, amount, index) => {
    e.preventDefault();
    // @TODO idhar metamask wala hi address chahiye.
    
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();

    const [myMAddress] = await provider.send("eth_requestAccounts", []);

    try {
      const { keplrOfflineSigner, myAddress } = await connectKeplr();
      if (!keplrOfflineSigner || !myAddress) {
        console.error("Failed to connect to Keplr wallet");
        return;
      }
  
      const secretjs = new SecretNetworkClient({
        url: "https://lcd.testnet.secretsaturn.net",
        chainId: "pulsar-3",
        wallet: keplrOfflineSigner,
        walletAddress: myAddress,
      });
  
      const routing_contract = process.env.REACT_APP_SECRET_ADDRESS;
      const bidAmount = bids[itemKey];
  
      console.log(
        `Submitting bid of ${bidAmount} for auctionId :  ${
          items.find((x) => x.auctionID === itemKey).auctionID
        }`
      );
  
      // Create the message object for the contract
      const msg = {
        create_bid: {
          amount: bidAmount.toString(),
          bidder_address: myMAddress,
          index: itemKey.toString(),
        }
      };
  
      // Call the contract's create_bid function
      const tx = await secretjs.tx.compute.executeContract(
        {
          sender: myAddress,
          contract_address: routing_contract,
          msg: msg,
          sent_funds: [{}], // @TODO check sent_funts sahi likha hai na 
        },
        {
          gasLimit: 100000,
        }
      );
  
      console.log(`Transaction successful: ${tx.transactionHash}`);
      setIsModalVisible(true);  // Show success modal
    } catch (error) {
      console.error("Error submitting bid:", error);
      alert("Error submitting bid. Check console for details.");
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false); // Function to close modal
  };

  useEffect(() => {
    const fetchItemsAndBids = async () => {
      const fetchedItems = await queryAllAuctionItems();
       // Fetch all auction items first
      setItems(fetchedItems);
      const fetchedBids = await queryBidsForItems(fetchedItems);
      const bidResultsMap = fetchedItems.reduce((acc, item, index) => {
        acc[item.auctionID] = fetchedBids[index];
        return acc;
      }, {});
      setBidResult(bidResultsMap);
      setLoading(false);
    };

    fetchItemsAndBids();
  }, []);

  const queryAllAuctionItems = async () => {
    let auctionItems;
    try {
      // Connect to MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Auction contract address (replace with your actual contract address)
      const auctionContractAddress = "0xYourAuctionContractAddress";
      
      // Initialize the contract
      const auctionContract = new ethers.Contract(auctionContractAddress, abi, provider);

      // Call the getAllAuctions function from the contract
      auctionItems = await auctionContract.getAllAuctions();
      const auctionItemsMap = auctionItems.reduce((acc, item) => {
        acc[item.auctionID.toString()] = {
          nftContract: item.nftContract,
          tokenId: item.tokenId.toString(),
          seller: item.seller,
          isActive: item.isActive
        };
        return acc;
      }, {});

      setItemsMap(auctionItemsMap);

      // // No formatting required, set auction items directly into state
      // setAuctions(auctionItems);
    } catch (error) {
      console.error("Error fetching auctions:", error);
    }

    return auctionItems;
  };

  const queryBidsForItems = async (items) => {
    const secretjs = new SecretNetworkClient({
      url: "https://lcd.testnet.secretsaturn.net",
      chainId: "pulsar-3",
    });

    let bidResults = [];

    console.log(items);
    for (let item of items) {
      try {
        const query_tx = await secretjs.query.compute.queryContract({
          contract_address: process.env.REACT_APP_SECRET_ADDRESS,
          code_hash: process.env.REACT_APP_CODE_HASH,
          query: { retrieve_bids: { key: item.auctionID } },
        });

        if (query_tx){
          bidResults.push(query_tx.h_bid);
        }

      } catch (error) {
        console.error(
          `Failed to query bids for item with auctionID ${item.auctionID}:`,
          error
        );
        bids.push("Error fetching bids");
      }
    }
    console.log(bidResults);
    return bidResults;
  };

  if (loading) {
    return (
      <ClipLoader
        color="#ffffff"
        loading={loading}
        size={150}
        className="flex justify-center items-center h-screen ml-32"
      />
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">All Active Auction Items</h2>
      {items.length > 0 ? (
        items.map((auction) => (
          <div key={auction.auctionID} className="border-4 rounded-lg p-4 m-4">
            <p><strong>NFT Contract:</strong> {auction.nftContract}</p>
            <p><strong>Token ID:</strong> {auction.tokenId.toString()}</p>
            <p><strong>Owner:</strong> {auction.owner}</p>
            <p><strong>Status:</strong> {auction.isActive ? "Active" : "Inactive"}</p>

            {auction.metaDataURI && (
              <div className="mb-4">
                <img
                  src={auction.metaDataURI}
                  alt={`NFT ${auction.tokenId}`}
                  className="w-full h-auto rounded"
                />
                </div>
            )}
            
            {auction.isActive && bidResult[auction.auctionID] && (
              bidResult[auction.auctionID].status === "Open" ? (
                <form onSubmit={(e) => handleSubmit(e, auction.auctionID)}>
                  <input
                    type="number"
                    onChange={(e) => handleBidChange(auction.auctionID, e.target.value)}
                    placeholder="Enter your bid in SCRT"
                    className="text-black mr-2 p-2 border rounded"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-blue-700"
                  >
                    Bid
                  </button>
                </form>
              ) : (
                <>
                  <p><strong>Highest bidder:</strong> {bidResult[auction.auctionID].h_bid.bidder_address}</p>
                  {claimedNFTs[auction.auctionID] ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
                    >
                      NFT CLAIMED!
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReleaseNFT(auction.auctionID,bidResult[auction.auctionID].h_bid.bidder_address)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Claim Your NFT
                    </button>
                  )}
                </>
              )
            )}
          </div>
        ))
      ) : (
        <p>No active auctions available.</p>
      )}
      
      {isModalVisible && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Bid Created Successfully!</h3>
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
