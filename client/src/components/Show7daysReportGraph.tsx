import { useState } from "react";
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
import { TrendingUp } from "lucide-react";
import { Input } from "./ui/input";

export default function Last7DaysSalesPage() {
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 6))
      .toISOString()
      .slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const { data, isLoading } = useGetSalesByDateRangeQuery({
    startDate: new Date(`${startDate}T00:00:00+06:00`).toISOString(),
    endDate: new Date(`${endDate}T23:59:59+06:00`).toISOString(),
  });

  const chartData: { date: string; totalSales: number; totalOrders?: number }[] =
    data?.data || [];

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h3 className="font-extrabold text-base text-foreground">
            Revenue Trend Overview
          </h3>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 text-xs">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-8 rounded-lg text-xs"
          />
          <span className="text-muted-foreground font-bold">to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-8 rounded-lg text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading revenue graph...
        </div>
      ) : chartData.length > 0 ? (
        <div className="w-full h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-border/40"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickFormatter={(val) => `৳${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                formatter={(value: any) => [`৳${Number(value).toFixed(2)}`, "Sales"]}
              />
              <Bar
                dataKey="totalSales"
                fill="#d97706"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center text-xs text-muted-foreground py-12">
          No sales recorded for this date range.
        </p>
      )}
    </div>
  );
}
