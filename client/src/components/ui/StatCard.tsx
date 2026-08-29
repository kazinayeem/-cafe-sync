import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
  onClick?: () => void;
  accentColor?: "amber" | "emerald" | "blue" | "indigo" | "rose" | "slate";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  onClick,
  accentColor = "amber",
}) => {
  const getIconColor = () => {
    switch (accentColor) {
      case "emerald":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400";
      case "blue":
        return "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400";
      case "indigo":
        return "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400";
      case "rose":
        return "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400";
      default:
        return "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400";
    }
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative overflow-hidden border border-border/80 bg-card transition-all duration-200",
        onClick && "cursor-pointer hover:border-primary/50 hover:shadow-md active:scale-[0.99]",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold font-tabular text-foreground tracking-tight">
              {value}
            </p>
          </div>
          {Icon && (
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", getIconColor())}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>

        {(subtitle || trend) && (
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t pt-2.5">
            {subtitle && <span>{subtitle}</span>}
            {trend && (
              <span
                className={cn(
                  "font-medium inline-flex items-center gap-1",
                  trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
