"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import ContractABI from "../utils/TitanSentara.json";

const CONTRACT_ADDRESS = "0xC36c049Ec23c30D2CBFADAf15A33F8481A754d24";
// const { AddressZero } = ethers.constants;

interface Position {
  id: number;
  name: string;
  exists: boolean;
}

interface Candidate {
  id: number;
  name: string;
  positionId: number;
  voteCount: number;
  exists: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [formData, setFormData] = useState({
    voteCost: "",
    startTime: "",
    endTime: "",
    position: "",
    candidate: { name: "", positionId: "" }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      connectWallet();
    } else {
      setError("Please install MetaMask.");
    }
  }, []);

  useEffect(() => {
    if (contract) {
      fetchData();
    }
  }, [contract]);

  const fetchData = async () => {
    try {
      const positions: Position[] = [];
      let positionCount = 1;
      while (true) {
        const position = await contract!.positions(positionCount);
        if (!position.exists) break;
        positions.push(position);
        positionCount++;
      }
      
      const candidates: Candidate[] = [];
      let candidateCount = 1;
      while (true) {
        const candidate = await contract!.candidates(candidateCount);
        if (!candidate.exists) break;
        candidates.push(candidate);
        candidateCount++;
      }

      setPositions(positions);
      setCandidates(candidates);
    } catch (error) {
      console.error("Data fetch error:", error);
      setError("Failed to fetch data. Please try again.");
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError("");

      if (!window.ethereum) {
        setError("Please install MetaMask.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      console.log("Connected to:", network.name);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const signer = await provider.getSigner();
      setUserAddress(accounts[0]);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);
      setContract(contract);

      const adminAddress = await contract.admin();
      console.log("Admin address:", adminAddress);

      } catch(error) {
        setError("Admin privileges required.");
        router.push("/"); // Redirect to home page or any other page
        return;
      }
    } catch (err) {
      console.error("Connection error:", err);
      setError((err as any).shortMessage || (err as any).message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (type: string) => {
    if (!contract) return;

    try {
      setLoading(true);
      setError("");

      switch (type) {
        case "parameters":
          await contract.setVotingParameters(
            ethers.parseEther(formData.voteCost),
            Math.floor(new Date(formData.startTime).getTime() / 1000),
            Math.floor(new Date(formData.endTime).getTime() / 1000)
          );
          break;
          
        case "position":
          await contract.addPosition(formData.position);
          break;
          
        case "candidate":
          await contract.addCandidate(
            formData.candidate.name,
            parseInt(formData.candidate.positionId)
          );
          break;
      }
      
      await fetchData();
      setFormData({
        voteCost: "",
        startTime: "",
        endTime: "",
        position: "",
        candidate: { name: "", positionId: "" }
      });
    } catch (error) {
      console.error("Transaction error:", error);
      setError("Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-gray-800">Create Contest</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {/* Parameters Form */}
      <div className="bg-white text-black p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Voting Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Vote Cost (ETH) "
            className="p-2 border rounded"
            value={formData.voteCost}
            onChange={(e) => setFormData({...formData, voteCost: e.target.value})}
          />
          <input
            type="datetime-local"
            className="p-2 border rounded"
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
          />
          <input
            type="datetime-local"
            className="p-2 border rounded"
            value={formData.endTime}
            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
          />
        </div>
        <button
          onClick={() => handleFormSubmit("parameters")}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Parameters"}
        </button>
      </div>

      {/* Positions Table */}
      <div className="bg-white p-6 text-black rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Positions</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New Position"
              className="p-2 border rounded"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
            />
            <button
              onClick={() => handleFormSubmit("position")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Position"}
            </button>
          </div>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-black border-b">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Position Name</th>
              <th className="p-3 text-left">Candidates</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={position.id} className="border-b">
                <td className="p-3">{position.id.toString()}</td>
                <td className="p-3">{position.name}</td>
                <td className="p-3">
                  {candidates
                    .filter(c => c.positionId === position.id)
                    .map(c => c.name)
                    .join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Candidates Table */}
      <div className="bg-white p-6 text-black rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Candidates</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Candidate Name"
              className="p-2 border rounded"
              value={formData.candidate.name}
              onChange={(e) => setFormData({
                ...formData,
                candidate: {...formData.candidate, name: e.target.value}
              })}
            />
            <input
              type="number"
              placeholder="Position ID"
              className="p-2 border rounded"
              value={formData.candidate.positionId}
              onChange={(e) => setFormData({
                ...formData,
                candidate: {...formData.candidate, positionId: e.target.value}
              })}
            />
            <button
              onClick={() => handleFormSubmit("candidate")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Candidate"}
            </button>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-black border-b">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Position</th>
              <th className="p-3 text-left">Votes</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="border-b">
                <td className="p-3">{candidate.id.toString()}</td>
                <td className="p-3">{candidate.name}</td>
                <td className="p-3">
                  {positions.find(p => p.id === candidate.positionId)?.name || 'N/A'}
                </td>
                <td className="p-3">{candidate.voteCount.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}