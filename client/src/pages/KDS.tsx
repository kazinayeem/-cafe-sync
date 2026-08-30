import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  useGetKdsOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/services/orderApi";
import type { Order } from "@/services/orderApi";
import { socket } from "@/utils/socket";
import { orderAnnouncer, type AnnouncementActiveState } from "@/utils/orderAnnouncer";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Volume1,
  User,
  ShieldAlert,
  Megaphone,
  Radio,
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

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("bornocafe_kds_sound");
    return saved !== null ? saved === "true" : true;
  });
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem("bornocafe_kds_volume");
    return saved !== null ? parseFloat(saved) : 0.85;
  });
  const [showVolumeMenu, setShowVolumeMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [mobileLaneFilter, setMobileLaneFilter] = useState<string>("all");
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementActiveState | null>(null);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(true);

  // Map of known order statuses to detect real transitions without duplicates
  const knownOrdersMap = useRef<Map<string, string>>(new Map());
  const isFirstLoadRef = useRef<boolean>(true);

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync sound settings with announcer
  useEffect(() => {
    orderAnnouncer.setSoundEnabled(soundEnabled);
    localStorage.setItem("bornocafe_kds_sound", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    orderAnnouncer.setVolume(volume);
    localStorage.setItem("bornocafe_kds_volume", volume.toString());
  }, [volume]);

  // Subscribe to announcer active states (for visual order card pulse)
  useEffect(() => {
    const unsubscribe = orderAnnouncer.onActiveChange((state) => {
      setActiveAnnouncement(state);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleUserUnlock = () => {
    orderAnnouncer.unlockAudio();
    setNeedsUserInteraction(false);
  };

  // Real-time Socket.io listeners
  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    const onNewOrder = (data: any) => {
      refetch();
      if (data && data.orderId && data.orderToken) {
        orderAnnouncer.announceNewOrder(data.orderId, data.orderToken, data.table);
      }
    };

    const onStatusUpdate = (data: any) => {
      refetch();
      if (data && data.orderId && data.orderToken) {
        if (data.status === "ready") {
          orderAnnouncer.announceOrderReady(data.orderId, data.orderToken, data.table);
        } else if (data.status === "served" || data.status === "completed") {
          orderAnnouncer.announceOrderCompleted(data.orderId, data.orderToken, data.table);
        }
      }
    };

    socket.on("newOrder", onNewOrder);
    socket.on("orderStatusUpdated", onStatusUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("newOrder", onNewOrder);
      socket.off("orderStatusUpdated", onStatusUpdate);
    };
  }, [refetch]);

  // Diffing query data to detect real new arrivals and status transitions
  useEffect(() => {
    if (!kdsResponse?.data) return;

    const orders: Order[] = kdsResponse.data;

    // On initial load, initialize snapshot so existing orders are NOT re-announced
    if (isFirstLoadRef.current) {
      const allInitial = orders.map((o) => ({ _id: o._id, status: o.status }));
      orderAnnouncer.initializeSnapshot(allInitial);

      orders.forEach((ord) => {
        knownOrdersMap.current.set(ord._id, ord.status);
      });
      isFirstLoadRef.current = false;
      return;
    }

    // Subsequent updates: detect new tickets and status transitions
    orders.forEach((ord) => {
      const prevStatus = knownOrdersMap.current.get(ord._id);
      const token = ord.orderToken || ord.customOrderID?.slice(-4) || "Order";

      if (!prevStatus) {
        // Genuinely new ticket in KDS
        knownOrdersMap.current.set(ord._id, ord.status);
        orderAnnouncer.announceNewOrder(ord._id, token, ord.table?.name);
      } else if (prevStatus !== ord.status) {
        // Status changed
        knownOrdersMap.current.set(ord._id, ord.status);
        if (ord.status === "ready") {
          orderAnnouncer.announceOrderReady(ord._id, token, ord.table?.name);
        } else if (ord.status === "served" || ord.status === "completed") {
          orderAnnouncer.announceOrderCompleted(ord._id, token, ord.table?.name);
        }
      }
    });
  }, [kdsResponse]);

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

  const getTimerBadgeStyle = (mins: number) => {
    if (mins < 10) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    if (mins < 20) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    return "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse";
  };

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
    <div
      onClick={handleUserUnlock}
      className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-5 lg:p-6 flex flex-col gap-4 select-none font-sans"
    >
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Digital Clock */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-400 hidden sm:flex items-center">
            <Clock className="h-3.5 w-3.5 inline-block mr-1.5 text-slate-400" />
            {currentTime.toLocaleTimeString()}
          </div>

          {/* Audio Notifications Status Indicator & Controls */}
          <div className="relative flex items-center gap-1.5">
            {/* Test Notification Sound Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleUserUnlock();
                orderAnnouncer.testNotification("new_order");
              }}
              className="h-9 px-2.5 rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              title="Test Sound: 'New order. Order A106. A106.'"
            >
              <Megaphone className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden md:inline">Test Sound</span>
            </Button>

            {/* Sound On/Off Indicator & Volume Button */}
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVolumeMenu(!showVolumeMenu);
                }}
                className={`h-9 px-2.5 rounded-xl border-slate-800 bg-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  soundEnabled ? "text-emerald-400 hover:text-emerald-300" : "text-slate-500 hover:text-slate-400"
                }`}
                title="Audio Settings"
              >
                {soundEnabled ? (
                  volume > 0.5 ? (
                    <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Volume1 className="h-3.5 w-3.5 text-emerald-400" />
                  )
                ) : (
                  <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                )}
                <span className="hidden sm:inline">
                  {soundEnabled ? "Sound On" : "Sound Off"}
                </span>
              </Button>

              {/* Volume Popover Menu */}
              {showVolumeMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-11 z-50 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-3 min-w-[200px] animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">POS Audio Volume</span>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                    >
                      {soundEnabled ? "Mute" : "Unmute"}
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundEnabled ? volume : 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      if (!soundEnabled && val > 0) setSoundEnabled(true);
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0%</span>
                    <span>{Math.round(volume * 100)}%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
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
      </div>

      {/* Autoplay unlock notice for staff */}
      {needsUserInteraction && soundEnabled && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 animate-pulse text-amber-400" />
            <span className="font-medium">
              Click anywhere on the screen to enable automatic English POS voice notifications.
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleUserUnlock}
            className="h-7 px-3 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950"
          >
            Enable Audio
          </Button>
        </div>
      )}

      {/* Mobile Tab Filter Bar */}
      <div className="flex lg:hidden overflow-x-auto gap-2 pb-1 border-b border-slate-800">
        <button
          onClick={() => setMobileLaneFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            mobileLaneFilter === "all"
              ? "bg-amber-500 text-slate-950"
              : "bg-slate-900 text-slate-400 border border-slate-800"
          }`}
        >
          All Tickets ({allOrders.length})
        </button>
        {KDS_STATUSES.map((lane) => {
          const count = allOrders.filter((o) => o.status === lane.key).length;
          return (
            <button
              key={lane.key}
              onClick={() => setMobileLaneFilter(lane.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                mobileLaneFilter === lane.key
                  ? "bg-slate-100 text-slate-950 font-black"
                  : "bg-slate-900 text-slate-400 border border-slate-800"
              }`}
            >
              <span>{lane.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Multi-Lane Grid Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-start">
        {KDS_STATUSES.map((lane) => {
          if (mobileLaneFilter !== "all" && mobileLaneFilter !== lane.key) {
            return null;
          }

          const laneOrders = allOrders.filter((ord) => ord.status === lane.key);

          return (
            <div
              key={lane.key}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3.5 flex flex-col gap-3 min-h-[500px] max-h-[82vh] overflow-hidden"
            >
              {/* Lane Header */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between font-black text-xs uppercase tracking-wider ${lane.headerColor}`}
              >
                <span>{lane.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black ${lane.badgeColor}`}
                >
                  {laneOrders.length}
                </span>
              </div>

              {/* Order Ticket Cards Column */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {laneOrders.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-slate-600 text-xs font-medium">
                    <p>No orders</p>
                  </div>
                ) : (
                  laneOrders.map((order) => {
                    const elapsed = getElapsedMinutes(order.createdAt);
                    const isAnnounced =
                      activeAnnouncement?.orderId === order._id ||
                      activeAnnouncement?.orderToken === order.orderToken;

                    return (
                      <div
                        key={order._id}
                        className={`rounded-xl border bg-slate-900/90 p-3.5 space-y-3 shadow-lg transition-all duration-300 relative overflow-hidden ${
                          isAnnounced
                            ? "border-amber-400 ring-2 ring-amber-400/40 scale-[1.02] shadow-amber-500/20"
                            : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {/* Top Card Info Bar */}
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-500 block">
                              #{order.orderToken || order.customOrderID?.slice(-4)}
                            </span>
                            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                              {order.table?.name || "Counter Order"}
                            </h3>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black font-mono border ${getTimerBadgeStyle(
                                elapsed
                              )}`}
                            >
                              {elapsed}m ago
                            </span>
                            {order.source === "qr" && (
                              <span className="text-[9px] font-bold uppercase text-amber-400">
                                QR Order
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer Info (if any) */}
                        {order.guestName && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <User className="h-3 w-3" />
                            <span className="font-semibold text-slate-300">
                              {order.guestName}
                            </span>
                            {order.guestPhone && (
                              <span className="text-[10px] text-slate-500">
                                ({order.guestPhone})
                              </span>
                            )}
                          </div>
                        )}

                        {/* Order Items List */}
                        <div className="space-y-1.5 border-t border-b border-slate-800/60 py-2 text-xs">
                          {order.items?.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-start gap-2">
                              <div className="flex items-start gap-1.5 flex-1 min-w-0">
                                <span className="font-black text-amber-400 font-mono shrink-0">
                                  {it.quantity}x
                                </span>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-200 block truncate">
                                    {it.name || it.product?.name}
                                  </span>
                                  {it.size && (
                                    <span className="text-[10px] text-slate-500 block">
                                      Size: {it.size}
                                    </span>
                                  )}
                                  {it.selectedModifiers && it.selectedModifiers.length > 0 && (
                                    <span className="text-[10px] text-amber-300/80 block">
                                      + {it.selectedModifiers.map((m) => m.optionName).join(", ")}
                                    </span>
                                  )}
                                  {it.itemNote && (
                                    <span className="text-[10px] text-rose-300 italic block">
                                      Note: {it.itemNote}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Kitchen / Order Note */}
                        {order.orderNote && (
                          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300">
                            <span className="font-bold">Note: </span>
                            {order.orderNote}
                          </div>
                        )}

                        {/* Action Advance Status Button */}
                        {lane.actionLabel && (
                          <Button
                            onClick={() => handleAdvanceStatus(order._id, order.status)}
                            className={`w-full h-8 text-xs font-black rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 ${lane.actionColor}`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {lane.actionLabel}
                          </Button>
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
