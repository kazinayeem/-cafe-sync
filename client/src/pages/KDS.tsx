import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  useGetKdsOrdersQuery,
  useUpdateOrderStatusMutation,
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
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const KDS_STATUSES = [
  {
    key: "pending",
    label: "New Ticket",
    headerColor: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    badgeColor: "bg-blue-500 text-slate-950",
    actionLabel: "Start Preparing",
    actionColor: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  {
    key: "preparing",
    label: "In Preparation",
    headerColor: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    badgeColor: "bg-amber-500 text-slate-950",
    actionLabel: "Mark Ready",
    actionColor: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  {
    key: "ready",
    label: "Ready to Serve",
    headerColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    badgeColor: "bg-emerald-500 text-slate-950",
    actionLabel: "Complete & Serve",
    actionColor: "bg-slate-700 hover:bg-slate-600 text-white",
  },
  {
    key: "served",
    label: "Completed / Served",
    headerColor: "bg-slate-800/80 border-slate-700 text-slate-400",
    badgeColor: "bg-slate-700 text-slate-200",
    actionLabel: "",
    actionColor: "",
  },
];

interface KDSProps {
  isStandalone?: boolean;
}

export const KitchenDisplaySystem: React.FC<KDSProps> = () => {
  const navigate = useNavigate();
  const { data: kdsResponse, error: kdsError, refetch } = useGetKdsOrdersQuery(
    undefined,
    { pollingInterval: 10000 }
  );
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [mobileLaneFilter, setMobileLaneFilter] = useState<string>("all");

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
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    const onNewOrder = () => {
      refetch();
      playChime();
    };

    const onStatusUpdate = () => {
      refetch();
    };

    socket.on("newOrder", onNewOrder);
    socket.on("orderStatusUpdated", onStatusUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("newOrder", onNewOrder);
      socket.off("orderStatusUpdated", onStatusUpdate);
    };
  }, [refetch, soundEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = "preparing";
    if (currentStatus === "pending") nextStatus = "preparing";
    else if (currentStatus === "preparing") nextStatus = "ready";
    else if (currentStatus === "ready") nextStatus = "served";

    try {
      await updateOrderStatus({
        id: orderId,
        status: nextStatus,
      }).unwrap();
    } catch (err) {
      console.error("Failed to advance order status", err);
    }
  };

  const allOrders: Order[] = kdsResponse?.data || [];

  const getElapsedMinutes = (dateStr: string) => {
    const elapsedMs = currentTime.getTime() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(elapsedMs / 60000));
  };

  const filteredStatuses =
    mobileLaneFilter === "all"
      ? KDS_STATUSES
      : KDS_STATUSES.filter((s) => s.key === mobileLaneFilter);

  // Permission Restriction State
  if (kdsError) {
    const isForbidden = (kdsError as any)?.status === 403;
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/15 text-rose-500 mx-auto border border-rose-500/30">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-white">
              {isForbidden ? "Access Restricted: Kitchen Display" : "Unable to Connect to KDS"}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isForbidden
                ? "Your current account role does not have the required [view_kds] permission. Please ask your administrator to grant Kitchen Display access in Settings."
                : (kdsError as any)?.data?.message || "Failed to load active kitchen tickets. Please check your network connection."}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              onClick={() => refetch()}
              className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Retry Connection
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="w-full h-11 rounded-xl border-slate-800 text-slate-300 hover:text-white text-xs font-bold"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-5 lg:p-6 flex flex-col gap-4 select-none font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Kitchen Display System (KDS)
              </h1>

              {/* Connection Status Badge */}
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isConnected
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
                }`}
              >
                {isConnected ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Live Sync
                  </>
                ) : (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Reconnecting...
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Live Barista & Kitchen Order Execution Queue
            </p>
          </div>
        </div>

        {/* Action Controls & Digital Clock */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-400">
            <Clock className="h-3.5 w-3.5 inline-block mr-1.5 text-slate-400" />
            {currentTime.toLocaleTimeString()}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-9 w-9 p-0 rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
            title={soundEnabled ? "Mute Chime" : "Enable Chime"}
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
            className="h-9 w-9 p-0 rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile/Tablet Lane Filter Tabs */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setMobileLaneFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
            mobileLaneFilter === "all"
              ? "bg-amber-500 text-slate-950"
              : "bg-slate-900 text-slate-400 border border-slate-800"
          }`}
        >
          All Queues ({allOrders.length})
        </button>

        {KDS_STATUSES.map((st) => {
          const count = allOrders.filter((o) => o.status === st.key).length;
          const isSelected = mobileLaneFilter === st.key;

          return (
            <button
              key={st.key}
              onClick={() => setMobileLaneFilter(st.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-900 text-slate-400 border border-slate-800"
              }`}
            >
              <span>{st.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/40">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main 4-Column Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 items-start">
        {filteredStatuses.map((statusConfig) => {
          const { key, label, headerColor, badgeColor, actionLabel, actionColor } = statusConfig;
          const columnOrders = allOrders.filter((o) => o.status === key);

          return (
            <div
              key={key}
              className="flex flex-col rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden min-h-[75vh]"
            >
              {/* Column Header */}
              <div
                className={`p-3.5 border-b flex items-center justify-between ${headerColor}`}
              >
                <span className="text-xs font-black uppercase tracking-wider">
                  {label}
                </span>
                <span
                  className={`flex h-6 min-w-6 px-2 items-center justify-center rounded-full font-mono font-black text-xs ${badgeColor}`}
                >
                  {columnOrders.length}
                </span>
              </div>

              {/* Ticket Cards List */}
              <div className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-210px)]">
                {columnOrders.length === 0 ? (
                  <div className="py-16 text-center space-y-1.5 text-slate-500">
                    <CheckCircle2 className="h-7 w-7 mx-auto opacity-30 text-emerald-500" />
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Queue Clear
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      No orders in this queue right now.
                    </p>
                  </div>
                ) : (
                  columnOrders.map((order) => {
                    const elapsed = getElapsedMinutes(order.createdAt);
                    const isOverdue = elapsed >= 10 && key !== "served";
                    const isUrgent = elapsed >= 15 && key !== "served";

                    const orderNumber = order.orderToken
                      ? `#${order.orderToken}`
                      : `#${order.customOrderID || order._id.slice(-4)}`;

                    const tableName =
                      order.orderType === "takeaway"
                        ? "Takeaway 🛍️"
                        : order.table
                        ? `Table: ${(order.table as any).name}`
                        : "Dine-In 🍽️";

                    return (
                      <div
                        key={order._id}
                        className={`rounded-2xl p-4 border transition-all duration-200 shadow-md ${
                          isUrgent
                            ? "bg-rose-950/20 border-rose-600/80"
                            : isOverdue
                            ? "bg-amber-950/20 border-amber-600/70"
                            : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {/* Header: Token, Source, Table & Elapsed Timer */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-2xl text-white tracking-tight">
                                {orderNumber}
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
                              <span>{tableName}</span>
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

                        {/* Customer Info */}
                        {order.customer && (
                          <p className="text-[11px] text-amber-400 font-semibold mb-2 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {order.customer.name}
                          </p>
                        )}

                        {/* Order Items Breakdown */}
                        <div className="space-y-2 py-1">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-extrabold text-slate-100 leading-snug">
                                  <span className="text-amber-400 mr-1.5 font-black text-sm">
                                    {item.quantity}×
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

                              {/* Item Kitchen Note */}
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

                        {/* Progress Status Action Button */}
                        {key !== "served" && actionLabel && (
                          <div className="mt-3 pt-2 border-t border-slate-800">
                            <Button
                              onClick={() => handleAdvanceStatus(order._id, order.status)}
                              className={`w-full h-11 rounded-xl font-black text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${actionColor}`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {actionLabel}
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
