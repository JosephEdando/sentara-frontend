// app/about/page.tsx
"use client";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TitanSentara
            </span>
          </h1>
          <p className="mt-4 text-2xl text-gray-600">
            Democratizing Trust in Digital Voting
          </p>
        </div>

        {/* Problem Statement */}
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            The Voting Integrity Crisis
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4 text-gray-600">
              <p className="text-lg">
                In an era where digital transformation touches every aspect of our lives, 
                traditional voting systems remain plagued by:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Opaque counting processes</li>
                <li>Centralized control vulnerabilities</li>
                <li>Audit trail deficiencies</li>
                <li>Potential for electoral fraud</li>
                <li>Limited voter verification</li>
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="/assets/voting-problem.png" 
                alt="Voting System Issues"
                className="rounded-lg h-64 w-auto"
              />
            </div>
          </div>
        </div>

        {/* Our Solution */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6">The TitanSentara Revolution</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg mb-4">
                TitanSentara harnesses blockchain technology to create an immutable, 
                transparent voting ecosystem where:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="mr-2">🔒</span>
                  Every vote is cryptographically sealed
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🌐</span>
                  Results are publicly verifiable in real-time
                </li>
                <li className="flex items-center">
                  <span className="mr-2">⚖️</span>
                  Complete audit trail preserved permanently
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🤖</span>
                  Smart contracts enforce electoral integrity
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="bg-white/10 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Key Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="w-8">🏗️</span>
                    <span>Contest Creation Studio</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-8">👤</span>
                    <span>Participant Management</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-8">🗳️</span>
                    <span>Secure Voting Interface</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-8">🔍</span>
                    <span>Live Results Dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Architectural Foundation
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-bold mb-2">Blockchain Core</h3>
              <p className="text-gray-600">Ethereum Virtual Machine</p>
              <p className="text-gray-600">Solidity Smart Contracts</p>
              <p className="text-gray-600">IPFS Storage</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-bold mb-2">Security Framework</h3>
              <p className="text-gray-600">Zero-Knowledge Proofs</p>
              <p className="text-gray-600">Multi-Sig Verification</p>
              <p className="text-gray-600">Quantum-Resistant Encryption</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-bold mb-2">Access Layer</h3>
              <p className="text-gray-600">React/Next.js Frontend</p>
              <p className="text-gray-600">WalletConnect Integration</p>
              <p className="text-gray-600">Mobile-First Design</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            The Tech Titans Team
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {['Blockchain Architect', 'Security Lead', 'Frontend Maestro', 'Smart Contract Wizard'].map((role, i) => (
              <div key={i} className="p-6 bg-white rounded-lg shadow">
                <div className="h-32 w-32 mx-auto bg-gray-200 rounded-full mb-4" />
                <h3 className="text-lg font-semibold">Team Member {i+1}</h3>
                <p className="text-gray-600">{role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Revolutionize Voting?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the movement for transparent democracy
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Create Your First Contest
            </button>
            <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
              Read Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}