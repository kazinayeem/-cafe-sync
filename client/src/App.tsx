"use client";

import { useNavigate } from "react-router";
import { BackgroundLines } from "@/components/ui/background-lines";

function App() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      {/* Background Animation */}
      <BackgroundLines children className="absolute inset-0 z-0" />

      {/* Centered Landing Card */}
      <div className="relative z-10 max-w-lg rounded-2xl bg-white p-8 shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          ☕ Cafe POS System
        </h1>
        <p className="text-gray-600 mb-6">
          A modern Point of Sale system built with{" "}
          <span className="font-semibold">MERN</span> +{" "}
          <span className="font-semibold">TypeScript</span>.
          <br />
          Manage orders, track sales, and run your café smoothly.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="rounded-xl bg-blue-600 px-6 py-2 text-white font-medium shadow hover:bg-blue-700 transition"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default App;
