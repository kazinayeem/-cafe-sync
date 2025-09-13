import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import axios from "axios";
import { useNavigate } from "react-router";
import { CardSpotlight } from "@/components/ui/card-spotlight";

interface Stats {
  total: number;
  available: number;
}

const API_URL = "https://cafe-sync-mhnc.vercel.app/api/tables";

export default function TableSpotlightCard() {
  const [stats, setStats] = useState<Stats>({ total: 0, available: 0 });
  const navigate = useNavigate();

  // ✅ Fetch initial stats
  useEffect(() => {
    axios.get(`${API_URL}/stats`).then((res) => setStats(res.data));
  }, []);

  // ✅ Realtime updates
  useEffect(() => {
    socket.on("tableStatsUpdated", (data: Stats) => {
      setStats(data);
    });

    return () => {
      socket.off("tableStatsUpdated");
    };
  }, []);

  return (
    <CardSpotlight
      className="h-64 w-80 cursor-pointer 
                 bg-white dark:bg-neutral-900 
                 border border-neutral-200 dark:border-neutral-800 
                 shadow-md hover:shadow-lg 
                 transition-transform hover:scale-105"
      onClick={() => navigate("/dashboard/tables")}
    >
      <h2
        className="text-2xl font-bold relative z-20 mt-2 
                     text-gray-800 dark:text-white"
      >
        📊 Table Dashboard
      </h2>

      <div className="mt-6 relative z-20 space-y-2">
        <p className="text-lg text-gray-700 dark:text-gray-200">
          Total Tables:{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            {stats.total}
          </span>
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-200">
          Available:{" "}
          <span className="font-bold text-green-600 dark:text-green-400">
            {stats.available}
          </span>
        </p>
      </div>

      <p
        className="mt-6 relative z-20 text-sm 
                    text-gray-500 dark:text-gray-400"
      >
        Click to manage tables in the dashboard →
      </p>
    </CardSpotlight>
  );
}
