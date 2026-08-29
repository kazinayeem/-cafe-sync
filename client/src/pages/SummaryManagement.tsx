import React, { useState } from "react";
import { useGetSalesSummaryQuery } from "@/services/orderApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Show7daysReportGraph from "@/components/Show7daysReportGraph";
import { generatePDF } from "@/components/GeneratePdf";
import {
  FileText,
  DollarSign,
  Receipt,
  TrendingUp,
  Calendar,
} from "lucide-react";

export const SummaryManagement: React.FC = () => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [status] = useState<string>("all");

  const { data, isLoading } = useGetSalesSummaryQuery({
    startDate: new Date(`${startDate}T00:00:00+06:00`).toISOString(),
    endDate: new Date(`${endDate}T23:59:59+06:00`).toISOString(),
    status: status !== "all" ? status : undefined,
  });

  const summary = data?.summary ?? { totalOrders: 0, totalSales: 0 };
  const allData = data?.allData ?? {};
  const orders = Object.values(allData).flat() as any[];

  const aov =
    summary.totalOrders > 0
      ? Number((summary.totalSales / summary.totalOrders).toFixed(2))
      : 0;

  const setPresetRange = (preset: "today" | "yesterday" | "week" | "month") => {
    const now = new Date();
    if (preset === "today") {
      const s = now.toISOString().split("T")[0];
      setStartDate(s);
      setEndDate(s);
    } else if (preset === "yesterday") {
      const y = new Date(now.setDate(now.getDate() - 1))
        .toISOString()
        .split("T")[0];
      setStartDate(y);
      setEndDate(y);
    } else if (preset === "week") {
      const w = new Date(now.setDate(now.getDate() - 7))
        .toISOString()
        .split("T")[0];
      setStartDate(w);
      setEndDate(todayStr);
    } else if (preset === "month") {
      const m = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      setStartDate(m);
      setEndDate(todayStr);
    }
  };

  const handleExportPDF = () => {
    generatePDF("custom", startDate, endDate, status, summary, orders);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Sales Reports & Financial Analytics"
        subtitle="Gross revenue, average order value, order lifecycle breakdown, and PDF export"
      >
        <Button
          onClick={handleExportPDF}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Export Sales PDF
        </Button>
      </PageHeader>

      {/* Date Filter & Presets Toolbar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { key: "today", label: "Today" },
              { key: "yesterday", label: "Yesterday" },
              { key: "week", label: "Last 7 Days" },
              { key: "month", label: "This Month" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPresetRange(key as any)}
                className="h-8 px-3 rounded-lg border border-border/80 bg-background hover:bg-accent text-xs font-bold text-foreground transition-all shrink-0"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 rounded-xl text-xs font-semibold"
            />
            <span className="text-muted-foreground text-xs font-bold">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
        <StatCard
          title="Total Gross Revenue"
          value={`৳${summary.totalSales.toLocaleString()}`}
          icon={DollarSign}
          accentColor="amber"
        />
        <StatCard
          title="Total Orders Placed"
          value={summary.totalOrders}
          icon={Receipt}
          accentColor="slate"
        />
        <StatCard
          title="Average Ticket (AOV)"
          value={`৳${aov}`}
          icon={TrendingUp}
          accentColor="emerald"
        />
        <StatCard
          title="Total Orders in Range"
          value={orders.length}
          icon={FileText}
          accentColor="blue"
        />
      </div>

      {/* 7-Day Revenue Trend Graph */}
      <Show7daysReportGraph />

      {/* Breakdown Orders Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-foreground">
            Sales Breakdown by Order
          </h3>
          <span className="text-xs text-muted-foreground font-semibold">
            {orders.length} transactions recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/80 uppercase font-bold text-muted-foreground tracking-wider">
              <tr>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Table / Type</th>
                <th className="py-3.5 px-4">Prep Status</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4 text-right">Order Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td colSpan={7} className="py-4 px-4 bg-muted/20" />
                    </tr>
                  ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No sales data found for the selected date range.
                  </td>
                </tr>
              ) : (
                orders.map((ord, idx) => (
                  <tr key={ord._id || idx} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3.5 px-4 text-muted-foreground">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-black text-foreground">
                      #{ord.customOrderID || ord._id?.slice(-6)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {ord.table?.name || "Dine-In"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ord.status} type="order" />
                    </td>
                    <td className="py-3.5 px-4 font-bold uppercase text-muted-foreground">
                      {ord.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {new Date(ord.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black font-tabular text-sm text-amber-600 dark:text-amber-400">
                      ৳{ord.totalPrice}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SummaryManagement;
