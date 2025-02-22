"use client";

// import Admin from './components/admin/admin';
import WalletConnect from './components/WalletConnect';

export default function Home() {
  return (
    <main className="container flex flex-col min-h-screen">
      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 w-full">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Welcome to TitanSentara</h2>
        <p className="text-gray-600 mb-8">
          Decentralized voting platform powered by blockchain technology.
        </p>
        <WalletConnect />
      </div>

      <style jsx>{`
        /* Global Reset */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
        }
        /* Animated Background Container */
        .container {
          width: 100vw;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background-size: cover;
          background-position: center;
          animation: change 30s infinite ease-in-out;
        }
        @keyframes change {
          0% { background-image: url('images/2.jpeg'); }
          40% { background-image: url('images/6.jpeg'); }
          60% { background-image: url('images/4.jpeg'); }
          80% { background-image: url('images/5.jpeg'); }
          100% { background-image: url('images/3.jpeg'); }
        }
        /* Main Content */
        .container {
          flex: 1;
          padding: 20px;
          color: #fff;
        }
        /* Footer Styles */
        .footer {
          background-color: rgba(51, 51, 51, 0.9);
          color: #fff;
          padding: 20px;
          text-align: center;
          width: 100%;
          position: absolute;
          bottom: 0;
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 600px) {
          .footer {
            padding: 15px;
          }
          .footer-container p {
            font-size: 14px;
          }
        }
      `}</style>
    </main>
  );
}