"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import ContractABI from "../../utils/TitanSentara.json";

const CONTRACT_ADDRESS = "0xC36c049Ec23c30D2CBFADAf15A33F8481A754d24";

export default function vote() {
  const router = useRouter();
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({}); // { [positionId]: { candidateId, quantity } }
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [voteCost, setVoteCost] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      connectWallet();
    } else {
      setError("Please install MetaMask");
      router.push("/");
    }
  }, []);

  async function connectWallet() {
    try {
      setLoading(true);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        ContractABI,
        signer
      );
      setContract(contractInstance);
      await fetchData(contractInstance);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchData(contractInstance) {
    try {
      // Fetch positions and candidates
      const positionsData = await contractInstance.getPositions();
      const candidatesData = await contractInstance.getCandidates();
      console.log("Positions:", positionsData);
      console.log("Candidates:", candidatesData);
      setPositions(positionsData);
      setCandidates(candidatesData);
      // Fetch vote cost and convert to Ether string
      const voteCostRaw = await contractInstance.voteCost();
      const voteCostFormatted = ethers.formatEther(voteCostRaw);
      setVoteCost(voteCostFormatted);
    } catch (err) {
      handleError(err);
    }
  }

  function handleError(err: any) {
    console.error(err);
    const message =
      err.reason || err.data?.message || err.message || "Unknown error occurred";
    setError(message);
    setTimeout(() => setError(""), 5000);
  }

  // Update the selected vote for a given position
  interface SelectedVote {
    candidateId: number;
    quantity: number;
  }

  function handleSelection(positionId: number, candidateId: number, quantity: number) {
    setSelectedVotes((prev: { [key: number]: SelectedVote }) => ({
      ...prev,
      [positionId]: { candidateId, quantity }
    }));
  }

  interface SelectedVotes {
    [key: number]: SelectedVote;
  }

  interface ContractInstance extends ethers.Contract {
    getPositions(): Promise<any>;
    getCandidates(): Promise<any>;
    voteCost(): Promise<any>;
    castVotes(positionId: number, candidateId: number, quantity: number, options: { value: ethers.BigNumber }): Promise<ethers.ContractTransaction>;
    [key: string]: ethers.ContractFunction | any;
  }

  async function castVote(positionId: number) {
    try {
      const selection = selectedVotes[positionId];
      if (!selection || !selection.candidateId || !selection.quantity) {
        alert("Please select a candidate and enter vote quantity");
        return;
      }
      const { candidateId, quantity } = selection;
      // Calculate the total cost (voteCost is in ETH, so we parse it to BigNumber)
      const totalCost = ethers.parseEther(voteCost).mul(quantity);
      const tx = await (contract as ContractInstance).castVotes(positionId, candidateId, quantity, {
        value: totalCost
      });
      await tx.wait();
      alert("Vote cast successfully!");
      // Refresh positions and candidates after voting
      await fetchData(contract as ContractInstance);
    } catch (err) {
      handleError(err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading voter dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 py-8 px-4">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-center text-white">
          Voter Dashboard
        </h1>
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="text-center text-white">
          <p className="text-lg">Vote Cost per Vote: {voteCost} ETH</p>
        </div>
        {positions.length === 0 ? (
          <p className="text-center text-white text-lg">
            No positions found. Please contact the admin.
          </p>
        ) : (
          positions.map((position) => {
            // Filter candidates that belong to this position
            const candidatesForPosition = candidates.filter(
              (c) => c.positionId === position.id
            );
            const selection = selectedVotes[position.id] || {};
            return (
              <div key={position.id} className="rounded-xl shadow-md overflow-hidden bg-white">
                <div className="px-6 py-4 bg-blue-600">
                  <h2 className="text-2xl font-semibold text-white">{position.name}</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {candidatesForPosition.map((candidate) => (
                      <div key={candidate.id} className="flex items-center space-x-4">
                        <input
                          type="radio"
                          name={`position-${position.id}`}
                          value={candidate.id}
                          checked={selection.candidateId == candidate.id}
                          onChange={() =>
                            handleSelection(position.id, candidate.id, selection.quantity || 1)
                          }
                          className="form-radio h-5 w-5 text-blue-600"
                        />
                        <span className="text-lg">
                          {candidate.name} (Votes: {candidate.voteCount})
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <input
                      type="number"
                      min="1"
                      value={selection.quantity || ""}
                      onChange={(e) =>
                        handleSelection(position.id, selection.candidateId, Number(e.target.value))
                      }
                      placeholder="Enter vote quantity"
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => castVote(position.id)}
                    className="w-full mt-4 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    Vote
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
