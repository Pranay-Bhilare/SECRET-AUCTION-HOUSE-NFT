import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreateAuctionItem from "./components/CreateAuctionItem";
import Navigation from "./components/Navigation";
import BidOnAuctionItem from "./components/BidOnAuctionItem";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";
import { projectId, testnets, mainnets, metadata } from "./config/config"

const ethersConfig = defaultConfig({
    //Required/
    metadata,
  
    //Optional
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    enableCoinbase: true, // true by default
    rpcUrl: "...", // used for the Coinbase SDK
    defaultChainId: 1, // used for the Coinbase SDK
  });
  
  createWeb3Modal({
    chainImages: {
      // Arbitrum Mainnet
      42161: "https://arbiscan.io/images/svg/brands/arbitrum.svg?v=1.5",
      // Linea Mainnet
      59144: "https://lineascan.build/images/svg/brands/main.svg?v=24.4.2.0",
  
      //Scroll Mainnet
      534352: "https://scrollscan.com/images/svg/brands/main.svg?v=24.4.3.0",
  
      // Metis Mainnet
      1088: "https://cms-cdn.avascan.com/cms2/metis.97de56bab032.svg",
  
      //Sepolia Testnet
      11155111:
        "https://sepolia.etherscan.io/images/svg/brands/ethereum-original.svg",
  
      // Scroll Testnet
      534351: "https://scrollscan.com/images/svg/brands/main.svg?v=24.4.3.0",
  
      // Polygon Amoy Testnet
      80002:
        "https://assets-global.website-files.com/637e2b6d602973ea0941d482/63e26c8a3f6e812d91a7aa3d_Polygon-New-Logo.png",
  
      // Optimism Testnet
      11155420:
        "https://optimistic.etherscan.io/assets/optimism/images/svg/logos/chain-light.svg?v=24.4.4.4",
  
      // Arbitrum Testnet
      421614: "https://arbiscan.io/images/svg/brands/arbitrum.svg?v=1.5",
  
      // Base Sepolia Testnet
      84532: "https://basescan.org/images/svg/brands/main.svg?v=24.4.4.9",
  
      // Berachain Testnet
      80085:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRq-tjg8Kqgr76Ved6PbcjBoGCHWwnhDUljH-CziyBOzw&s",
  
      // Etherlink Testnet
      128123: "https://www.etherlink.com/favicon.ico",
  
      //Metis Sepolia Testnet
      59902: "https://cms-cdn.avascan.com/cms2/metis.97de56bab032.svg",
  
      // Near Aurora Testnet
      1313161555:
        "https://play-lh.googleusercontent.com/0zJGaaodqDL--ig2W2h60zp5uLMexQs4_PRlon5qhakSwqsdwa_ZmV9DQKvg1WVnn-w=w240-h480-rw",
  
      // Linea Testnet
      59141: "https://lineascan.build/images/svg/brands/main.svg?v=24.4.2.0",
  
      // XDC Apothem
      51: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe2KDAtPElT99WYln7tyeQPlPCiBWaRfRA_guAL0HImJWBcRympM_r5VBSiOR29zFpKIU&usqp=CAU",
  
      //Lisk Sepolia
      4202: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRan6D0dfiYmx2sv4kUPsFkfUDxYUWEuuA_dLJWgPm8Q&s",
    },
    ethersConfig,
    chains: [
      mainnets.ethereumMainnet,
      mainnets.binanceSmartChainMainnet,
      mainnets.polygonMainnet,
      mainnets.optimismMainnet,
      mainnets.arbitrumMainnet,
      mainnets.avalancheMainnet,
      mainnets.baseMainnet,
      mainnets.lineaMainnet,
      mainnets.scrollMainnet,
      mainnets.metisMainnet,
      testnets.sepoliaTestnet,
      testnets.scrollTestnet,
      testnets.polygonTestnet,
      testnets.optimismTestnet,
      testnets.arbitrumTestnet,
      testnets.baseSepoliaTestnet,
      testnets.berachainTestnet,
      testnets.etherlinkTestnet,
      testnets.metisSepoliaTestnet,
      testnets.nearAuroraTestnet,
      testnets.lineaSepoliaTestnet,
      testnets.XDCApothemTestnet,
      testnets.liskSepoliaTestnet,
    ],
    projectId,
    enableAnalytics: true, 
  });


  function App() {
    return (
      <Router>
        <div className="bg-gray-900 min-h-screen text-white">
          <div className="container mx-auto px-4">
            {/* Navigation */}
            <nav className="py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">SECRET AUCTION HOUSE FOR NFTS</h1>
                <div className="space-x-4">
                  <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
                    Connect to Keplr Wallet
                  </button>
                </div>
              </div>
            </nav>

            {/* Navigation Component */}
            <Navigation/>
  
            {/* Hero Section */}
            <div className="text-center py-20">
              <h2 className="text-4xl font-bold mb-4">Sell / Bid NFT in sealed bid manner</h2>
              <p className="text-xl mb-8">
                A sealed bid auction house for selling / bidding NFT's
              </p>
            </div>
  
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-4">Current Auctions</h3>
            <BidOnAuctionItem />
          </div>
  
            {/* Navigation Component */}
            <Navigation/>
  
            {/* Routes */}
            <Routes>
              <Route path="/create" element={<CreateAuctionItem />} />
            </Routes>
          </div>
        </div>
      </Router>
    );
  }

export default App;