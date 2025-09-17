import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import axios from "axios";
import { useNavigate } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Stats {
  total: number;
  available: number;
}

const API_URL = "https://cafe-sync-mhnc.vercel.app/api/tables";

export default function TableSpotlightCard() {
  const [stats, setStats] = useState<Stats>({ total: 0, available: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/stats`).then((res) => setStats(res.data));
  }, []);

 
  useEffect(() => {
    socket.on("tableStatsUpdated", (data: Stats) => {
      setStats(data);
    });

    return () => {
      socket.off("tableStatsUpdated");
    };
  }, []);

  return (
    <Card
      className="cursor-pointer  transition-transform 
                 dark:bg-gray-900 dark:text-white"
      onClick={() => navigate("/dashboard/tables")}
    >
      <CardHeader>
        <CardTitle>📊 Table Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          Total Tables: <span className="font-bold">{stats.total}</span>
        </p>
        <p>
          Available:{" "}
          <span className="font-bold text-green-600">{stats.available}</span>
        </p>
      </CardContent>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 px-4 pb-4">
        Click to manage tables in the dashboard →
      </p>
    </Card>
  );
}
