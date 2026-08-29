import React, { useState, useEffect } from "react";
import {
  useGetKdsOrdersQuery,
  useUpdateOrderMutation,
} from "@/services/orderApi";
import type { Order } from "@/services/orderApi";
import { socket } from "@/utils/socket";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const KDS_STATUSES = [
  { key: "pending", label: "New Ticket", color: "border-blue-500/40 bg-blue-500/5 text-blue-600" },
  { key: "preparing", label: "In Preparation", color: "border-amber-500/40 bg-amber-500/5 text-amber-600" },
  { key: "ready", label: "Ready to Serve", color: "border-emerald-500/40 bg-emerald-500/5 text-emerald-600" },
  { key: "served", label: "Completed / Served", color: "border-slate-500/40 bg-slate-500/5 text-slate-500" },
];

interface KDSProps {
  isStandalone?: boolean;
}

export const KitchenDisplaySystem: React.FC<KDSProps> = () => {
  const { data: kdsResponse, refetch } = useGetKdsOrdersQuery(
    undefined,
    { pollingInterval: 10000 }
  );
  const [updateOrder] = useUpdateOrderMutation();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  useEffect(() => {
    socket.on("newOrder", () => {
      refetch();
      playChime();
    });

    socket.on("orderStatusUpdated", () => {
      refetch();
    });

    return () => {
      socket.off("newOrder");
      socket.off("orderStatusUpdated");
    };
  }, [refetch, soundEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = "preparing";
    if (currentStatus === "pending") nextStatus = "preparing";
    else if (currentStatus === "preparing") nextStatus = "ready";
    else if (currentStatus === "ready") nextStatus = "served";

    try {
      await updateOrder({
        id: orderId,
        data: { status: nextStatus as any },
      }).unwrap();
    } catch (err) {
      console.error("Failed to advance order status", err);
    }
  };

  const allOrders: Order[] = kdsResponse?.data || [];

  const getElapsedMinutes = (dateStr: string) => {
    const elapsedMs = currentTime.getTime() - new Date(dateStr).getTime();
    return Math.floor(elapsedMs / 60000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 flex flex-col gap-5 select-none font-sans">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Kitchen Display System (KDS)
              </h1>
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Live Barista & Kitchen Order Execution
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-400">
            <Clock className="h-3.5 w-3.5 inline-block mr-1.5 text-slate-400" />
            {currentTime.toLocaleTimeString()}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-9 rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullscreen}
            className="h-9 rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* 4-Column Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 items-start">
        {KDS_STATUSES.map(({ key, label, color }) => {
          const columnOrders = allOrders.filter((o) => o.status === key);

          return (
            <div
              key={key}
              className="flex flex-col rounded-3xl bg-slate-900/60 border border-slate-800/80 overflow-hidden min-h-[75vh]"
            >
              {/* Column Header */}
              <div
                className={`p-3.5 border-b border-slate-800/80 flex items-center justify-between ${color}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider">
                    {label}
                  </span>
                </div>
                <span className="flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full bg-slate-950 font-mono font-bold text-xs">
                  {columnOrders.length}
                </span>
              </div>

              {/* Ticket Cards List */}
              <div className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
                {columnOrders.length === 0 ? (
                  <div className="py-12 text-center text-slate-600 text-xs font-medium">
                    No orders in this queue
                  </div>
                ) : (
                  columnOrders.map((order) => {
                    const elapsed = getElapsedMinutes(order.createdAt);
                    const isOverdue = elapsed >= 10 && key !== "served";
                    const isUrgent = elapsed >= 15 && key !== "served";

                    return (
                      <div
                        key={order._id}
                        className={`rounded-2xl p-4 border transition-all duration-200 shadow-md ${
                          isUrgent
                            ? "bg-rose-950/20 border-rose-600/70"
                            : isOverdue
                            ? "bg-amber-950/20 border-amber-600/60"
                            : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {/* Header: Order ID, Type/Table & Elapsed Timer */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5 mb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-lg text-white">
                                #{order.orderToken || order.customOrderID?.slice(-4)}
                              </span>
                              {order.source === "qr" ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                  📱 QR Order
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-800 text-slate-400">
                                  POS
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-300 font-bold flex items-center gap-1 mt-1">
                              <span>
                                {order.orderType === "takeaway"
                                  ? "Takeaway 🛍️"
                                  : order.table
                                  ? `Table: ${(order.table as any).name}`
                                  : "Dine-In 🍽️"}
                              </span>
                              {order.guestName && (
                                <span className="text-slate-400 font-normal">
                                  • {order.guestName}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Timer Badge */}
                          <div
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-black ${
                              isUrgent
                                ? "bg-rose-600 text-white animate-pulse"
                                : isOverdue
                                ? "bg-amber-500 text-slate-950"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            {elapsed}m
                          </div>
                        </div>

                        {/* Customer & Server Info */}
                        {order.customer && (
                          <p className="text-[11px] text-amber-400/90 font-semibold mb-2 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {order.customer.name}
                          </p>
                        )}

                        {/* Order Items Breakdown */}
                        <div className="space-y-2 py-1">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-extrabold text-slate-100 leading-snug">
                                  <span className="text-amber-400 mr-1.5 font-black text-sm">
                                    {item.quantity}x
                                  </span>
                                  {item.name || (item.product as any)?.name || "Item"}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                  {item.size}
                                </span>
                              </div>

                              {/* Modifiers List */}
                              {item.selectedModifiers &&
                                item.selectedModifiers.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {item.selectedModifiers.map((m, mIdx) => (
                                      <span
                                        key={mIdx}
                                        className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20"
                                      >
                                        +{m.optionName}
                                      </span>
                                    ))}
                                  </div>
                                )}

                              {/* Item Note */}
                              {item.itemNote && (
                                <p className="text-[11px] text-amber-300 font-bold italic mt-1 bg-amber-950/40 p-1 rounded">
                                  Note: "{item.itemNote}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Order-Level Note */}
                        {order.orderNote && (
                          <div className="mt-2 p-2 rounded-xl bg-purple-950/30 border border-purple-800/50 text-[11px] text-purple-200">
                            <span className="font-bold">Ticket Note:</span>{" "}
                            {order.orderNote}
                          </div>
                        )}

                        {/* Progress Status Button */}
                        {key !== "served" && (
                          <div className="mt-3 pt-2 border-t border-slate-800/80">
                            <Button
                              onClick={() => handleAdvanceStatus(order._id, order.status)}
                              className={`w-full h-10 rounded-xl font-black text-xs shadow-md transition-all active:scale-98 ${
                                key === "pending"
                                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                                  : key === "preparing"
                                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                  : "bg-amber-600 hover:bg-amber-500 text-white"
                              }`}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1.5" />
                              {key === "pending"
                                ? "Start Preparing"
                                : key === "preparing"
                                ? "Mark as Ready"
                                : "Mark as Served"}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KitchenDisplaySystem;
