import React, { useState, useEffect, useMemo } from "react";
import {
  useGetOrdersQuery,
  useUpdateOrderMutation,
  Order,
} from "@/services/orderApi";
import { socket } from "@/utils/socket";
import {
  Clock,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Flame,
  Check,
  Utensils,
  ShoppingBag,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";

// Helper to format elapsed time in mm:ss
const formatElapsed = (createdAt: string) => {
  const diffMs = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const totalSec = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const getTimerUrgency = (createdAt: string) => {
  const diffMinutes = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
  if (diffMinutes >= 20) return "text-rose-500 bg-rose-500/10 border-rose-500/30 animate-pulse";
  if (diffMinutes >= 10) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
  return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
};

export const KitchenDisplaySystem: React.FC<{ isStandalone?: boolean }> = ({
  isStandalone = false,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setTick] = useState(0);

  // Fetch recent active orders (limit 50)
  const {
    data: ordersResponse,
    isLoading,
    refetch,
  } = useGetOrdersQuery({ limit: 50 });

  const [updateOrder] = useUpdateOrderMutation();

  // Tick elapsed timer every second
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for real-time socket events
  useEffect(() => {
    const handleNewOrder = (order: Order) => {
      refetch();
      if (soundEnabled) {
        try {
          // Play subtle synthesized audio chime
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
          console.warn("Audio playback not permitted yet", e);
        }
      }
    };

    const handleOrderUpdate = () => {
      refetch();
    };

    socket.on("newOrder", handleNewOrder);
    socket.on("orderStatusUpdated", handleOrderUpdate);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("orderStatusUpdated", handleOrderUpdate);
    };
  }, [soundEnabled, refetch]);

  const orders: Order[] = ordersResponse?.data || [];

  // Group into Kanban Columns
  const kanbanColumns = useMemo(() => {
    const newOrders = orders.filter(
      (o) => o.status === "pending" || o.status === "confirmed"
    );
    const preparingOrders = orders.filter((o) => o.status === "preparing");
    const readyOrders = orders.filter((o) => o.status === "ready");
    const completedOrders = orders
      .filter((o) => o.status === "served" || o.status === "completed")
      .slice(0, 10);

    return {
      newOrders,
      preparingOrders,
      readyOrders,
      completedOrders,
    };
  }, [orders]);

  const handleAdvanceStatus = async (order: Order, nextStatus: any) => {
    try {
      await updateOrder({
        id: order._id,
        data: { status: nextStatus },
      }).unwrap();
    } catch (err) {
      console.error("Failed to advance order status", err);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 p-3 sm:p-4 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black">
            🍳
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Kitchen Display System
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Real-time ticket queue, elapsed preparation timers & order dispatch
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 px-3 rounded-xl bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Sync
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`h-9 px-3 rounded-xl border text-xs font-bold transition-all ${
              soundEnabled
                ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 mr-1 text-amber-400" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 mr-1" />
            )}
            Sound {soundEnabled ? "ON" : "OFF"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-9 px-3 rounded-xl bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5 mr-1" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5 mr-1" />
            )}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </Button>
        </div>
      </div>

      {/* 4 Kanban Status Columns */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 pt-3 overflow-hidden min-h-0">
        {/* Column 1: New Orders */}
        <div className="flex flex-col h-full rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-amber-500/10 flex items-center justify-between">
            <span className="font-extrabold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              New Tickets ({kanbanColumns.newOrders.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {kanbanColumns.newOrders.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8 font-medium">
                No new orders
              </p>
            ) : (
              kanbanColumns.newOrders.map((order) => (
                <KdsTicketCard
                  key={order._id}
                  order={order}
                  actionLabel="Start Preparing"
                  actionColor="bg-amber-600 hover:bg-amber-500 text-white"
                  onAction={() => handleAdvanceStatus(order, "preparing")}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="flex flex-col h-full rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-blue-500/10 flex items-center justify-between">
            <span className="font-extrabold text-sm text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-blue-400" />
              Preparing ({kanbanColumns.preparingOrders.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {kanbanColumns.preparingOrders.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8 font-medium">
                No tickets preparing
              </p>
            ) : (
              kanbanColumns.preparingOrders.map((order) => (
                <KdsTicketCard
                  key={order._id}
                  order={order}
                  actionLabel="Mark as Ready"
                  actionColor="bg-blue-600 hover:bg-blue-500 text-white"
                  onAction={() => handleAdvanceStatus(order, "ready")}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Pickup / Serving */}
        <div className="flex flex-col h-full rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-emerald-500/10 flex items-center justify-between">
            <span className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Ready to Serve ({kanbanColumns.readyOrders.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {kanbanColumns.readyOrders.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8 font-medium">
                No orders ready
              </p>
            ) : (
              kanbanColumns.readyOrders.map((order) => (
                <KdsTicketCard
                  key={order._id}
                  order={order}
                  actionLabel="Complete / Served"
                  actionColor="bg-emerald-600 hover:bg-emerald-500 text-white"
                  onAction={() => handleAdvanceStatus(order, "served")}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 4: Completed History */}
        <div className="flex flex-col h-full rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-slate-800/40 flex items-center justify-between">
            <span className="font-extrabold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Check className="h-4 w-4 text-slate-400" />
              Completed ({kanbanColumns.completedOrders.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 opacity-75">
            {kanbanColumns.completedOrders.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8 font-medium">
                No completed orders
              </p>
            ) : (
              kanbanColumns.completedOrders.map((order) => (
                <KdsTicketCard key={order._id} order={order} isCompleted />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface KdsTicketCardProps {
  order: Order;
  actionLabel?: string;
  actionColor?: string;
  onAction?: () => void;
  isCompleted?: boolean;
}

const KdsTicketCard: React.FC<KdsTicketCardProps> = ({
  order,
  actionLabel,
  actionColor,
  onAction,
  isCompleted = false,
}) => {
  const isTakeaway = order.orderType === "takeaway";
  const timerClass = getTimerUrgency(order.createdAt);
  const elapsed = formatElapsed(order.createdAt);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5 shadow-md flex flex-col justify-between gap-3 transition-all hover:border-slate-700">
      {/* Header: Order ID, Table/Takeaway, Elapsed Time */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-white tracking-tight">
              #{order.customOrderID || order._id.slice(-6)}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                isTakeaway
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {isTakeaway ? "Takeaway" : order.table?.name || "Dine-In"}
            </span>
          </div>

          {order.customer && (
            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
              Guest: {order.customer.name}
            </p>
          )}
        </div>

        {/* Elapsed Prep Timer */}
        {!isCompleted && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-black font-tabular border ${timerClass}`}
          >
            <Clock className="h-3 w-3" />
            {elapsed}
          </span>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-2 py-1">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex flex-col text-xs">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-extrabold text-white text-sm">
                <span className="text-amber-400 mr-1.5">{item.quantity}x</span>
                {item.name || (item.product as any)?.name || "Item"}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                {item.size}
              </span>
            </div>

            {/* Modifiers Badges */}
            {item.selectedModifiers && item.selectedModifiers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 pl-4">
                {item.selectedModifiers.map((m, mIdx) => (
                  <span
                    key={mIdx}
                    className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20"
                  >
                    +{m.optionName}
                  </span>
                ))}
              </div>
            )}

            {/* Kitchen Item Note */}
            {item.itemNote && (
              <p className="text-[11px] text-amber-300 font-bold italic mt-0.5 pl-4 flex items-center gap-1">
                <Edit3 className="h-2.5 w-2.5 text-amber-400" />
                Note: "{item.itemNote}"
              </p>
            )}
          </div>
        ))}

        {/* General Order Note */}
        {order.orderNote && (
          <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-900/40 text-[11px] text-amber-200 font-medium">
            Order Note: {order.orderNote}
          </div>
        )}
      </div>

      {/* Action Advancement Button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className={`w-full h-9 rounded-xl font-extrabold text-xs shadow-md active:scale-98 transition-all ${actionColor}`}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default KitchenDisplaySystem;
