import React from "react";
import { cn } from "@/lib/utils";

export type OrderStatusType =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled";

export type PaymentStatusType =
  | "unpaid"
  | "paid"
  | "partial"
  | "refunded"
  | "partially_refunded";

export type TableStatusType = "free" | "occupied" | "reserved" | "cleaning";

interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment" | "table" | "inventory" | "reservation" | "general";
  className?: string;
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  dot = true,
}) => {
  const normalized = status?.toLowerCase() || "unknown";

  const getStatusStyles = () => {
    switch (normalized) {
      case "completed":
      case "served":
      case "paid":
      case "free":
      case "in_stock":
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60";

      case "preparing":
      case "confirmed":
      case "reserved":
      case "partial":
      case "partially_paid":
      case "low_stock":
      case "upcoming":
        return "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60";

      case "ready":
      case "cleaning":
      case "seated":
        return "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60";

      case "pending":
      case "unpaid":
        return "bg-amber-50/80 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700";

      case "cancelled":
      case "refunded":
      case "partially_refunded":
      case "occupied":
      case "out_of_stock":
      case "inactive":
      case "no_show":
        return "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const formatLabel = () => {
    switch (normalized) {
      case "partially_refunded":
        return "Partially Refunded";
      case "partially_paid":
        return "Partial Pay";
      case "no_show":
        return "No-Show";
      case "in_stock":
        return "In Stock";
      case "low_stock":
        return "Low Stock";
      case "out_of_stock":
        return "Out of Stock";
      case "dine_in":
        return "Dine-In";
      case "free":
        return "Available";
      default:
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        getStatusStyles(),
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            normalized === "completed" ||
              normalized === "paid" ||
              normalized === "free" ||
              normalized === "served"
              ? "bg-emerald-500"
              : normalized === "preparing" || normalized === "confirmed"
              ? "bg-amber-500 animate-pulse"
              : normalized === "ready"
              ? "bg-blue-500"
              : normalized === "pending" || normalized === "unpaid"
              ? "bg-amber-500"
              : "bg-rose-500"
          )}
        />
      )}
      {formatLabel()}
    </span>
  );
};
