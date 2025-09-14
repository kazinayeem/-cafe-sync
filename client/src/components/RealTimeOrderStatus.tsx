import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router";

const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });

export default function OrderSummary() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Initial fetch
  useEffect(() => {
    const fetchInitialSummary = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/summary/today`
        );
        const data = await res.json();
        setSummary(data.data);
      } catch (err) {
        console.error("Failed to fetch initial summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSummary();
  }, []);

  // Realtime updates
  useEffect(() => {
    socket.on("orderSummaryUpdate", (data) => {
      setSummary(data);
    });

    return () => {
      socket.off("orderSummaryUpdate");
    };
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Card
      className="dark:bg-gray-900 dark:text-white cursor-pointer  "
      onClick={() => navigate("/dashboard/orders")}
    >
      <CardHeader>
        <CardTitle>📊 Today's Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {summary ? (
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{summary.totalOrders || 0}</span>
            </li>
            <li className="flex justify-between text-yellow-500">
              <span>🟡 Pending:</span>
              <span className="font-medium">{summary.pending || 0}</span>
            </li>
            <li className="flex justify-between text-blue-500">
              <span>👨‍🍳 Preparing:</span>
              <span className="font-medium">{summary.preparing || 0}</span>
            </li>
            <li className="flex justify-between text-green-600">
              <span>✅ Served:</span>
              <span className="font-medium">{summary.served || 0}</span>
            </li>
            <li className="flex justify-between text-red-500">
              <span>❌ Cancelled:</span>
              <span className="font-medium">{summary.cancelled || 0}</span>
            </li>
          </ul>
        ) : (
          <p>No orders yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
