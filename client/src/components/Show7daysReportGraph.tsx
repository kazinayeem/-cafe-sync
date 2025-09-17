import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useGetSalesByDateRangeQuery } from "@/services/orderApi";

export default function Last7DaysSalesPage() {
  // Default: last 7 days
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 6))
      .toISOString()
      .slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const { data, isLoading, isError, refetch } = useGetSalesByDateRangeQuery({
    startDate: new Date(`${startDate}T00:00:00+06:00`).toISOString(),
    endDate: new Date(`${endDate}T23:59:59+06:00`).toISOString(),
  });

  const chartData: { date: string; totalSales: number }[] = data?.data || [];

  // Refetch if date range changes
  useEffect(() => {
    refetch();
  }, [startDate, endDate, refetch]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">Loading chart...</p>
      </div>
    );

  if (isError)
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Failed to load chart data.</p>
      </div>
    );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded p-4 space-y-4 w-full overflow-x-hidden">
      {/* Date Range Picker */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-gray-700 dark:text-gray-200">From:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200"
        />
        <label className="text-gray-700 dark:text-gray-200">To:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200"
        />
        <button
          onClick={() => refetch()}
          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Update
        </button>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="w-full">
          <ResponsiveContainer
            width="100%"
            height={Math.min(400, chartData.length * 50)}
          >
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" stroke="#000" />
              <YAxis tickFormatter={(value) => `৳${value}`} stroke="#000" />
              <Tooltip formatter={(value: number) => `৳${value.toFixed(2)}`} />
              <Bar
                dataKey="totalSales"
                fill="#6366f1"
                barSize={Math.max(20, Math.min(40, 400 / chartData.length))}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No sales data available.
        </p>
      )}
    </div>
  );
}
