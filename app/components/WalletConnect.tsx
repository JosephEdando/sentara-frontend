"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEthereum } from "react-icons/fa";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import ContractABI from "../utils/TitanSentara.json";
const CONTRACT_ADDRESS = "0xC36c049Ec23c30D2CBFADAf15A33F8481A754d24";

declare global {
  interface Window {
    ethereum: any;
  }
}

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingVote, setLoadingVote] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (userAddress) {
      fetchBlockData();
    }
  }, [userAddress]);

  async function connectWallet() {
    try {
      setLoadingCreate(true);
      setError("");

      if (!window.ethereum) {
        setError("Please install MetaMask.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setUserAddress(accounts[0]);
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoadingCreate(false);
    }
  }

  async function fetchBlockData() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, provider);
      const adminAddress = await contract.admin();

      if (userAddress.toLowerCase() === adminAddress.toLowerCase()) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err: any) {
      console.error("Error fetching block data:", err);
      setError("Failed to fetch block data. Please try again.");
    }
  }

  function truncateAddress(address: string): string {
    if (!address || typeof address !== "string") return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">TitanSentara</h1>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition">
              Contact
            </Link>

            {isAdmin && (
              <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition">
                Create Contest
              </Link>
            )}

            <Link href="/vote" className="text-gray-600 hover:text-blue-600 transition">
              Vote
            </Link>

            <div className="flex items-center px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow">
              {userAddress ? (
                <>
                  <span className="mr-2">
                    <FaEthereum />
                  </span>
                  {truncateAddress(userAddress)}
                </>
              ) : (
                <button onClick={connectWallet} className="text-white">
                  {loadingCreate ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-2xl text-gray-600">
              {isMenuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white p-4 space-y-4">
            <Link href="/about" className="block text-gray-600 hover:text-blue-600">
              About
            </Link>
            <Link href="/contact" className="block text-gray-600 hover:text-blue-600">
              Contact
            </Link>

            <button className="block w-full text-left text-gray-600 hover:text-blue-600" disabled={loadingCreate || loadingVote}>
              {loadingCreate ? "Processing..." : "Create Contest"}
            </button>
            <button className="block w-full text-left text-gray-600 hover:text-blue-600" disabled={loadingCreate || loadingVote}>
              {loadingVote ? "Processing..." : "Vote"}
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center mt-16">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-5xl font-bold text-blue-900 mb-6">
            Welcome to TitanSentara
          </h1>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Decentralized Voting Platform
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Create secure voting contests or participate in existing ones
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-4">
            {isAdmin && (
              <Link href={"/admin"}>
                <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" disabled={loadingCreate || loadingVote}>
                  {loadingCreate ? "Initializing..." : "Start New Contest"}
                </button>
              </Link>
            )}

            <Link href={"/vote"}>
              <button className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition" disabled={loadingCreate || loadingVote}>
                {loadingVote ? "Connecting..." : "Participate in Vote"}
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}