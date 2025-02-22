"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import ContractABI from "../../utils/TitanSentara.json";

const CONTRACT_ADDRESS = "0x82a65871BbEc87E0cE53fa72898f3b8B3306eF53";

export default function Admin() {
  const router = useRouter();
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState<{ name: string; positionId: number; voteCount: number }[]>([]);
  const [voteCost, setVoteCost] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newCandidate, setNewCandidate] = useState({ name: "", positionId: "" });
  const [contract, setContract] = useState(null);
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
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ContractABI,
        signer
      );

      // Verify admin status
      const adminAddress = await contract.getAdmin();
      const userAddress = await signer.getAddress();

      if (userAddress.toLowerCase() !== adminAddress.toLowerCase()) {
        router.push("/unauthorized");
        return;
      }

      setContract(contract);
      await fetchData(contract);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchData(contract) {
    try {
      const [positions, candidates] = await Promise.all([
        contract.getPositions(),
        contract.getCandidates()
      ]);
      setPositions(positions);
      setCandidates(candidates);
    } catch (error) {
      handleError(error);
    }
  }

  async function addPosition() {
    try {
      if (!newPosition) throw new Error("Position name required");
      const tx = await contract.addPosition(newPosition);
      await tx.wait();
      setNewPosition("");
      await fetchData(contract);
    } catch (error) {
      handleError(error);
    }
  }

  async function addCandidate() {
    try {
      if (!newCandidate.name || !newCandidate.positionId) {
        throw new Error("All candidate fields required");
      }
      const tx = await contract.addCandidate(
        newCandidate.name,
        Number(newCandidate.positionId)
      );
      await tx.wait();
      setNewCandidate({ name: "", positionId: "" });
      await fetchData(contract);
    } catch (error) {
      handleError(error);
    }
  }

  async function setVotingParameters() {
    try {
      if (!contract) {
        throw new Error("Contract not connected");
      }
      if (!voteCost || !startTime || !endTime) {
        throw new Error("All parameters required");
      }
      const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);
      if (startTimestamp >= endTimestamp) {
        throw new Error("End time must be after start time");
      }
      const tx = await contract.setVotingParameters(
        ethers.parseEther(voteCost),
        startTimestamp,
        endTimestamp
      );
      await tx.wait();
      alert("Parameters updated successfully");
      setVoteCost("");
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error("Parameter error:", error);
      alert(error.message || "Failed to update parameters");
    }
  }

  function handleError(error) {
    console.error(error);
    const message =
      error.reason || error.data?.message || error.message || "Unknown error occurred";
    setError(message);
    setTimeout(() => setError(""), 5000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-blue-500 to-purple-600 py-8">
  <div className="w-full max-w-7xl mx-auto px-6 space-y-8">
    <h1 className="text-4xl font-extrabold text-center text-white">
      Admin Dashboard
    </h1>
    {error && (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    )}

    {/* Set Voting Parameters */}
    <div className="rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-blue-600">
        <h2 className="text-2xl font-semibold text-white">Set Voting Parameters</h2>
      </div>
      <div className="bg-white p-6">
        <input
          type="number"
          step="0.001"
          className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Vote Cost in ETH"
          value={voteCost}
          onChange={(e) => setVoteCost(e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <input
            type="datetime-local"
            className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <input
            type="datetime-local"
            className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <button
          onClick={setVotingParameters}
          className="w-full mt-4 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Set Parameters
        </button>
      </div>
    </div>

    {/* Add Position */}
    <div className="rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-green-600">
        <h2 className="text-2xl font-semibold text-white">Add Position</h2>
      </div>
      <div className="bg-white p-6 flex gap-4">
        <input
          className="flex-1 p-3 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Position Name"
          value={newPosition}
          onChange={(e) => setNewPosition(e.target.value)}
        />
        <button
          onClick={addPosition}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Add
        </button>
      </div>
    </div>

    {/* Add Candidate */}
    <div className="rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-green-600">
        <h2 className="text-2xl font-semibold text-white">Add Candidate</h2>
      </div>
      <div className="bg-white p-6 space-y-4">
        <input
          className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Candidate Name"
          value={newCandidate.name}
          onChange={(e) =>
            setNewCandidate({ ...newCandidate, name: e.target.value })
          }
        />
        <select
          className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          value={newCandidate.positionId}
          onChange={(e) =>
            setNewCandidate({ ...newCandidate, positionId: e.target.value })
          }
        >
          <option value="">Select Position</option>
          {positions.map((pos) => (
            <option key={pos.id} value={pos.id}>
              {pos.name} (ID: {pos.id})
            </option>
          ))}
        </select>
        <button
          onClick={addCandidate}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
        >
          Add Candidate
        </button>
      </div>
    </div>

    {/* Positions & Candidates Table */}
    <div className="rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-purple-600">
        <h2 className="text-2xl font-semibold text-white">
          Positions & Candidates
        </h2>
      </div>
      <div className="bg-white text-black p-6 overflow-x-auto">
        <table className="w-full table-auto text-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Position</th>
              <th className="p-4 text-left">Candidates</th>
              <th className="p-4 text-left">Total Votes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {positions.map((pos) => (
              <tr key={pos.id}>
                <td className="p-4">{pos.id.toString()}</td>
                <td className="p-4">{pos.name}</td>
                <td className="p-4">
                  {candidates
                    .filter((c) => c.positionId === pos.id)
                    .map((c) => `${c.name} (${c.voteCount})`)
                    .join(", ")}
                </td>
                <td className="p-4">
                  {candidates
                    .filter((c) => c.positionId === pos.id)
                    .reduce((sum, c) => sum + Number(c.voteCount), 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>

  );
}





















"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import ContractABI from "../../utils/TitanSentara.json";

const CONTRACT_ADDRESS = "0x82a65871BbEc87E0cE53fa72898f3b8B3306eF53";

export default function Admin() {
  const router = useRouter();
  const [contract, setContract] = useState(null);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [newPosition, setNewPosition] = useState("");
  const [newCandidate, setNewCandidate] = useState({ name: "", positionId: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    if (window.ethereum?.selectedAddress) {
      setIsConnected(true);
      setUserAddress(window.ethereum.selectedAddress);
      await initializeContract();
    }
  }

  async function connectWallet() {
    try {
      setLoading(true);
      setError("");
      
      if (!window.ethereum) {
        setError("Please install MetaMask");
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      
      setIsConnected(true);
      setUserAddress(accounts[0]);
      await initializeContract();
    } catch (err) {
      console.error("Connection error:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }

  function disconnectWallet() {
    setIsConnected(false);
    setUserAddress("");
    setContract(null);
  }

  async function initializeContract() {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        ContractABI || ContractABI,
        signer
      );

      console.log("Contract instance:", contractInstance);

      // Verify admin status
      const adminAddress = await contractInstance.admin();
      console.log("Admin address:", adminAddress);
      if ((await signer.getAddress()).toLowerCase() !== adminAddress.toLowerCase()) {
        router.push("/unauthorized");
        return;
      }

      setContract(contractInstance);
      await fetchContractData(contractInstance);
    } catch (error) {
      console.error("Initialization error:", error);
      setError("Failed to initialize contract connection");
    } finally {
      setLoading(false);
    }
  }

  async function fetchContractData(contract) {
    try {
      const [positionsData, candidatesData] = await Promise.all([
        contract.getPositions(),
        contract.getCandidates(),
      ]);

      setPositions(positionsData.map(pos => pos.name));
      setCandidates(candidatesData.map(cand => ({
        name: cand.name,
        positionId: cand.positionId.toString(),
        voteCount: cand.voteCount.toString()
      })));
    } catch (error) {
      console.error("Data fetch error:", error);
      setError("Failed to load contract data");
    }
  }

  async function handleAddPosition() {
    if (!newPosition.trim()) {
      setError("Position name cannot be empty");
      return;
    }

    if (!contract) {
      setError("Contract is not initialized");
      return;
    }

    try {
      console.log("Adding position:", newPosition);
      const tx = await contract.addPosition(newPosition);
      await tx.wait();
      setNewPosition("");
      await fetchContractData(contract);
    } catch (error) {
      console.error("Add position error:", error);
      setError("Failed to add position: " + error.message);
    }
  }

  async function handleAddCandidate() {
    if (!newCandidate.name.trim() || !newCandidate.positionId) {
      setError("Please fill all candidate fields");
      return;
    }

    if (!contract) {
      setError("Contract is not initialized");
      return;
    }

    try {
      const tx = await contract.addCandidate(
        newCandidate.name,
        parseInt(newCandidate.positionId)
      );
      await tx.wait();
      setNewCandidate({ name: "", positionId: "" });
      await fetchContractData(contract);
    } catch (error) {
      console.error("Add candidate error:", error);
      setError("Failed to add candidate: " + error.message);
    }
  }

  async function handleStartVoting() {
    if (!contract) {
      setError("Contract is not initialized");
      return;
    }

    try {
      const tx = await contract.startVoting();
      await tx.wait();
      await fetchContractData(contract);
    } catch (error) {
      console.error("Start voting error:", error);
      setError("Failed to start voting: " + error.message);
    }
  }

  async function handleEndVoting() {
    if (!contract) {
      setError("Contract is not initialized");
      return;
    }

    try {
      const tx = await contract.endVoting();
      await tx.wait();
      await fetchContractData(contract);
    } catch (error) {
      console.error("End voting error:", error);
      setError("Failed to end voting: " + error.message);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading admin dashboard...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-blue-500 to-purple-600 py-8">
      <div className="w-full max-w-7xl mx-auto px-6 space-y-8">
        <h1 className="text-4xl font-extrabold text-center text-white">Admin Dashboard</h1>
        
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-white">
            {isConnected && `Connected as: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`}
          </div>
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={disconnectWallet}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Positions Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Manage Positions</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="New Position Name"
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            />
            <button
              onClick={handleAddPosition}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Position
            </button>
          </div>
          <ul className="divide-y divide-gray-200">
            {positions.map((position, index) => (
              <li key={index} className="py-2">
                {position}
              </li>
            ))}
          </ul>
        </div>

        {/* Candidates Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Manage Candidates</h2>
          <div className="mb-4 space-y-2">
            <input
              type="text"
              placeholder="Candidate Name"
              value={newCandidate.name}
              onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <select
              value={newCandidate.positionId}
              onChange={(e) => setNewCandidate({ ...newCandidate, positionId: e.target.value })}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Position</option>
              {positions.map((_, index) => (
                <option key={index} value={index}>
                  Position {index + 1}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddCandidate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Add Candidate
            </button>
          </div>
          <ul className="divide-y divide-gray-200">
            {candidates.map((candidate, index) => (
              <li key={index} className="py-2">
                <div className="flex justify-between items-center">
                  <span>{candidate.name}</span>
                  <div className="text-gray-600">
                    <span>Position: {parseInt(candidate.positionId) + 1}</span>
                    <span className="ml-4">Votes: {candidate.voteCount}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Voting Controls */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleStartVoting}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
          >
            Start Voting Period
          </button>
          <button
            onClick={handleEndVoting}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
          >
            End Voting Period
          </button>
        </div>
      </div>
    </div>
  );
}