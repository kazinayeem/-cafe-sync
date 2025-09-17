import { useNavigate } from "react-router";
import { BackgroundLines } from "@/components/ui/background-lines";

function App() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      {/* Background Animation */}
      <BackgroundLines children className="absolute inset-0 z-0" />

      {/* Centered Landing Card */}
      <div className="relative z-10 max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-4">
          <span className="flex items-center justify-center gap-2">
            <img src="/logo.png" alt="Cafe Sync Logo" className="w-16 h-16 sm:w-20 sm:h-20" />
            Cafe Sync
          </span>
          <span className="block text-2xl font-bold mt-2">POS System</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
          Welcome to **Cafe Sync**, where the aroma of freshly brewed coffee meets the efficiency of perfectly written code.
          This isn't just a Point of Sale system; it's a meticulously crafted solution for the tech-savvy cafe.
          <br />
          Engineered with **MERN** and **TypeScript**, it manages orders, tracks sales, and runs your café with code-like precision.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="rounded-xl bg-blue-600 px-8 py-3 text-white font-medium text-lg shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-300"
        >
          Start Coding Your Cafe's Success
        </button>
      </div>
    </div>
  );
}

export default App;