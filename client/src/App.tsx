import { useNavigate } from "react-router";
import { BackgroundLines } from "@/components/ui/background-lines";

function App() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      {/* Background Animation */}
      <BackgroundLines children className="absolute inset-0 z-0" />

      {/* Centered Landing Card */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-xl text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white mb-4">
          <span className="flex items-center justify-center gap-3 sm:gap-4">
            <img
              src="/logo.png"
              alt="Cafe Sync Logo"
              className="w-14 h-14 sm:w-16 sm:h-16"
            />
            <span>Cafe Sync</span>
          </span>
          <span className="block text-xl sm:text-2xl font-semibold mt-2 text-blue-600 dark:text-blue-400">
            POS System
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-base sm:text-lg leading-relaxed">
          Welcome to <strong>Cafe Sync</strong>, where the aroma of freshly brewed coffee meets the efficiency of perfectly written code.
          This isn't just a Point of Sale system; it's a meticulously crafted solution for the tech-savvy café.
          <br />
          Engineered with <strong>MERN</strong> and <strong>TypeScript</strong>, it manages orders, tracks sales, and runs your café with code-like precision.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-white font-medium text-base sm:text-lg shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-300"
        >
          Start Coding Your Cafe's Success
        </button>
      </div>
    </div>
  );
}

export default App;
