import React, { useState, useEffect, useRef, useMemo } from "react";
import { useGetDisplayOrdersQuery, type DisplayOrderToken } from "@/services/publicMenuApi";
import { socket } from "@/utils/socket";
import { orderAnnouncer, type AnnouncementActiveState } from "@/utils/orderAnnouncer";
import {
  Coffee,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
  ChefHat,
  BellRing,
  Radio,
  CheckCircle2,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const CustomerDisplayScreen: React.FC = () => {
  const { data: displayData, refetch } = useGetDisplayOrdersQuery(undefined, {
    pollingInterval: 10000, // Background fallback polling
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("bornocafe_tv_sound");
    return saved !== null ? saved === "true" : true;
  });
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem("bornocafe_tv_volume");
    return saved !== null ? parseFloat(saved) : 0.85;
  });
  const [showVolumeMenu, setShowVolumeMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementActiveState | null>(null);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

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
    localStorage.setItem("bornocafe_tv_sound", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    orderAnnouncer.setVolume(volume);
    localStorage.setItem("bornocafe_tv_volume", volume.toString());
  }, [volume]);

  // Subscribe to announcer active states (for UI visual pulse and highlight)
  useEffect(() => {
    const unsubscribe = orderAnnouncer.onActiveChange((state) => {
      setActiveAnnouncement(state);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Unlock browser audio on first user click anywhere
  const handleUserUnlock = () => {
    orderAnnouncer.unlockAudio();
    setNeedsUserInteraction(false);
  };

  // Socket connection listeners
  useEffect(() => {
    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    const handleDisplayUpdate = () => {
      refetch();
    };

    const handleStatusUpdate = (data: any) => {
      refetch();
      if (data && data.orderId && data.orderToken) {
        if (data.status === "ready") {
          orderAnnouncer.announceOrderReady(data.orderId, data.orderToken, data.table);
        } else if (data.status === "preparing" || data.status === "placed") {
          orderAnnouncer.announceNewOrder(data.orderId, data.orderToken, data.table);
        }
      }
    };

    socket.on("displayUpdate", handleDisplayUpdate);
    socket.on("orderStatusUpdated", handleStatusUpdate);
    socket.on("newOrder", (data: any) => {
      refetch();
      if (data && data.orderId && data.orderToken) {
        orderAnnouncer.announceNewOrder(data.orderId, data.orderToken, data.table);
      }
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("displayUpdate", handleDisplayUpdate);
      socket.off("orderStatusUpdated", handleStatusUpdate);
      socket.off("newOrder");
    };
  }, [refetch]);

  // Diffing query data to detect new arrivals and ready status transitions
  useEffect(() => {
    if (!displayData?.data) return;

    const preparingList: DisplayOrderToken[] = displayData.data.preparing || [];
    const readyList: DisplayOrderToken[] = displayData.data.ready || [];
    const completedList: DisplayOrderToken[] = displayData.data.recentCompleted || [];

    // On first load, seed the known map so existing orders are NOT re-announced
    if (isFirstLoadRef.current) {
      const allInitial = [
        ...preparingList.map((o) => ({ _id: o._id, status: "preparing" })),
        ...readyList.map((o) => ({ _id: o._id, status: "ready" })),
        ...completedList.map((o) => ({ _id: o._id, status: "completed" })),
      ];
      orderAnnouncer.initializeSnapshot(allInitial);

      allInitial.forEach((ord) => {
        knownOrdersMap.current.set(ord._id, ord.status);
      });
      isFirstLoadRef.current = false;
      return;
    }

    // Process PREPARING orders (detect genuinely new arrivals)
    preparingList.forEach((ord) => {
      const prevStatus = knownOrdersMap.current.get(ord._id);
      if (!prevStatus) {
        // Genuinely new order
        knownOrdersMap.current.set(ord._id, "preparing");
        orderAnnouncer.announceNewOrder(ord._id, ord.orderToken, ord.table);
      } else {
        knownOrdersMap.current.set(ord._id, "preparing");
      }
    });

    // Process READY orders (detect transitions from preparing -> ready)
    readyList.forEach((ord) => {
      const prevStatus = knownOrdersMap.current.get(ord._id);
      if (prevStatus !== "ready") {
        knownOrdersMap.current.set(ord._id, "ready");
        orderAnnouncer.announceOrderReady(ord._id, ord.orderToken, ord.table);
      }
    });

    // Process COMPLETED orders
    completedList.forEach((ord) => {
      knownOrdersMap.current.set(ord._id, "completed");
    });
  }, [displayData]);

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

  const preparingOrders = useMemo(
    () => displayData?.data?.preparing || [],
    [displayData]
  );
  const readyOrders = useMemo(
    () => displayData?.data?.ready || [],
    [displayData]
  );
  const recentCompleted = useMemo(
    () => displayData?.data?.recentCompleted || [],
    [displayData]
  );

  return (
    <div
      onClick={handleUserUnlock}
      className="min-h-screen bg-[#0F0A06] text-[#FAF4ED] flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none font-bangla-sans overflow-hidden relative"
    >
      {/* Background ambient café glow */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-[#C4611B]/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[130px] pointer-events-none -z-10" />

      {/* ================================================================= */}
      {/* 1. TOP HEADER BANNER                                              */}
      {/* ================================================================= */}
      <header className="flex flex-wrap items-center justify-between border-b border-[#2C1C13] pb-4 gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-white shadow-xl"
            style={{
              background: "#C4611B",
              boxShadow: "0 6px 20px 0 rgba(196,97,27,0.35)",
            }}
          >
            <Coffee className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-bangla-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                BornoCafe
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#C4611B]/20 text-[#E8925A] border border-[#C4611B]/40">
                লাইভ অর্ডার ডিসপ্লে
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isSocketConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                {isSocketConnected ? "রিয়েলটাইম সিঙ্ক" : "কানেক্টিং..."}
              </span>
            </div>
            <p className="text-xs text-[#A89684] font-medium mt-0.5">
              আপনার টোকেন নম্বর লক্ষ্য রাখুন • প্রস্তুত হলে কাউন্টার থেকে সংগ্রহ করুন
            </p>
          </div>
        </div>

        {/* Live Clock & Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Digital Clock */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A110A] border border-[#2C1C13] shadow-xs">
            <Clock className="h-4 w-4 text-[#C4611B]" />
            <span className="text-lg sm:text-xl font-bold font-tabular text-[#FAF4ED]">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>

          {/* Audio Controls */}
          <div className="relative flex items-center gap-2">
            {/* Test Voice Announcement Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleUserUnlock();
                orderAnnouncer.testNotification("new_order");
              }}
              className="h-10 px-3 rounded-xl bg-[#1A110A] border-[#2C1C13] hover:bg-[#25170F] text-[#FAF4ED] text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              title="Test English Voice Announcement"
            >
              <Megaphone className="h-3.5 w-3.5 text-[#C4611B]" />
              <span className="hidden md:inline">Test Sound</span>
            </Button>

            {/* Volume Control Toggle & Slider */}
            <div className="relative">
              <Button
                size="icon"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVolumeMenu(!showVolumeMenu);
                }}
                className={`h-10 w-10 rounded-xl bg-[#1A110A] border-[#2C1C13] shadow-xs transition-colors ${
                  soundEnabled ? "text-[#C4611B]" : "text-[#705E51]"
                }`}
                title={soundEnabled ? "সাউন্ড মিউট করুন" : "সাউন্ড চালু করুন"}
              >
                {soundEnabled ? (
                  volume > 0.5 ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <Volume1 className="h-4 w-4" />
                  )
                ) : (
                  <VolumeX className="h-4 w-4 text-rose-400" />
                )}
              </Button>

              {/* Volume Popover */}
              {showVolumeMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-12 z-50 p-4 rounded-2xl bg-[#1D130C] border border-[#3D2619] shadow-2xl space-y-3 min-w-[200px] animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FAF4ED]">ভলিউম সেটিংস</span>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="text-[11px] font-bold text-[#C4611B] hover:underline cursor-pointer"
                    >
                      {soundEnabled ? "মিউট" : "চালু"}
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
                    className="w-full accent-[#C4611B] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#A89684] font-tabular">
                    <span>০%</span>
                    <span>{Math.round(volume * 100)}%</span>
                    <span>১০০%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="h-10 w-10 rounded-xl bg-[#1A110A] border-[#2C1C13] text-[#FAF4ED] hover:bg-[#25170F] shadow-xs"
              title="ফুলস্ক্রিন টগল"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* ================================================================= */}
      {/* 2. REAL-TIME ANNOUNCEMENT TOAST / BANNER                          */}
      {/* ================================================================= */}
      {activeAnnouncement && (
        <div className="my-2 p-4 rounded-2xl bg-gradient-to-r from-[#1E120A] via-[#2A180E] to-[#1E120A] border-2 border-[#C4611B] shadow-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md ${
                activeAnnouncement.type === "order_ready"
                  ? "bg-emerald-500 text-slate-950 animate-bounce"
                  : "bg-[#C4611B] animate-pulse"
              }`}
            >
              {activeAnnouncement.type === "order_ready" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <BellRing className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bangla-serif font-bold text-lg text-white">
                  {activeAnnouncement.type === "order_ready"
                    ? "✓ অর্ডার প্রস্তুত!"
                    : "🔔 নতুন অর্ডার এসেছে"}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-lg text-sm font-black font-tabular text-white"
                  style={{ background: "#C4611B" }}
                >
                  #{activeAnnouncement.orderToken}
                </span>
              </div>
              <p className="text-xs text-[#D8C7B5] font-medium">
                {activeAnnouncement.type === "order_ready"
                  ? "আপনার টোকেন নিয়ে অনুগ্রহ করে কাউন্টারে আসুন"
                  : "অর্ডারটি কিচেনে প্রস্তুত করা হচ্ছে"}
                {activeAnnouncement.table ? ` • ${activeAnnouncement.table}` : ""}
              </p>
            </div>
          </div>

          {/* Soundwave animation indicator */}
          <div className="flex items-center gap-1 pr-2">
            <span className="w-1 h-3 bg-[#C4611B] rounded-full animate-pulse" />
            <span className="w-1 h-6 bg-[#C4611B] rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-8 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
            <span className="w-1 h-5 bg-[#C4611B] rounded-full animate-pulse" style={{ animationDelay: "450ms" }} />
            <span className="w-1 h-2 bg-[#C4611B] rounded-full animate-pulse" style={{ animationDelay: "600ms" }} />
          </div>
        </div>
      )}

      {/* Autoplay unlock prompt (dismisses on first click) */}
      {needsUserInteraction && soundEnabled && (
        <div className="my-2 p-2.5 rounded-xl bg-[#C4611B]/15 border border-[#C4611B]/30 flex items-center justify-between text-xs text-[#E8925A]">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 animate-pulse text-[#C4611B]" />
            <span className="font-semibold">
              স্বয়ংক্রিয় ভয়েস অ্যানাউন্সমেন্ট সক্রিয় করতে স্ক্রিনের যেকোনো স্থানে একবার ক্লিক করুন।
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleUserUnlock}
            className="h-7 px-3 text-[11px] font-bold rounded-lg text-white"
            style={{ background: "#C4611B" }}
          >
            সাউন্ড চালু করুন
          </Button>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. MAIN SPLIT BOARD (Now Preparing vs Ready for Pickup)           */}
      {/* ================================================================= */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-4 flex-1">
        {/* Preparing Column */}
        <div className="rounded-3xl border border-[#2C1C13] bg-[#140D08]/90 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between border-b border-[#2C1C13] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C4611B]/15 text-[#C4611B]">
                  <ChefHat className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bangla-serif text-xl sm:text-2xl font-bold text-[#E8925A] tracking-wide">
                    এখন তৈরি হচ্ছে
                  </h2>
                  <p className="text-xs text-[#A89684] font-medium">
                    Now Preparing • কিচেনে কফি ও খাবার তৈরি হচ্ছে
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#C4611B]/20 text-[#E8925A] border border-[#C4611B]/30">
                {preparingOrders.length} টি অর্ডারে কাজ চলছে
              </span>
            </div>

            {/* Preparing Tokens Grid */}
            {preparingOrders.length === 0 ? (
              <div className="py-24 text-center space-y-2.5 text-[#705E51]">
                <ChefHat className="h-12 w-12 mx-auto opacity-30" />
                <p className="text-sm font-bold text-[#A89684]">বর্তমানে কোনো পেন্ডিং অর্ডার নেই</p>
                <p className="text-xs text-[#705E51]">নতুন অর্ডার আসলে এখানে স্বয়ংক্রিয়ভাবে দেখাবে</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[58vh] overflow-y-auto no-scrollbar pr-1">
                {preparingOrders.map((ord) => {
                  const isAnnounced =
                    activeAnnouncement?.orderToken === ord.orderToken &&
                    activeAnnouncement?.type === "new_order";

                  return (
                    <div
                      key={ord._id}
                      className={`p-4 rounded-2xl text-center space-y-1.5 transition-all duration-300 relative overflow-hidden ${
                        isAnnounced
                          ? "bg-[#25150B] border-2 border-[#C4611B] scale-105 shadow-xl shadow-[#C4611B]/20"
                          : "bg-[#1A110A] border border-[#2C1C13] hover:border-[#C4611B]/40 shadow-xs"
                      }`}
                    >
                      {isAnnounced && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C4611B] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C4611B]" />
                        </span>
                      )}
                      <p className="text-3xl sm:text-4xl font-bold font-tabular tracking-tight text-white">
                        #{ord.orderToken}
                      </p>
                      <span className="text-xs font-semibold text-[#A89684] block truncate">
                        {ord.table || "টেবিল"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Ready for Pickup Column */}
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/15 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                  <BellRing className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bangla-serif text-xl sm:text-2xl font-bold text-emerald-400 tracking-wide">
                    সংগ্রহের জন্য প্রস্তুত
                  </h2>
                  <p className="text-xs text-emerald-300/80 font-medium">
                    Ready for Pickup • কাউন্টারে টোকেন দেখিয়ে সংগ্রহ করুন
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 animate-pulse shadow-md">
                {readyOrders.length} টি প্রস্তুত
              </span>
            </div>

            {/* Ready Tokens Grid */}
            {readyOrders.length === 0 ? (
              <div className="py-24 text-center space-y-2.5 text-[#705E51]">
                <BellRing className="h-12 w-12 mx-auto opacity-30 text-emerald-500/30" />
                <p className="text-sm font-bold text-emerald-400/80">সব প্রস্তুতকৃত অর্ডার ডেলিভারি সম্পন্ন</p>
                <p className="text-xs text-[#705E51]">প্রস্তুত হওয়া মাত্রই এখানে নাম্বারের ঘোষণা শোনা যাবে</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[58vh] overflow-y-auto no-scrollbar pr-1">
                {readyOrders.map((ord) => {
                  const isAnnounced =
                    activeAnnouncement?.orderToken === ord.orderToken &&
                    activeAnnouncement?.type === "order_ready";

                  return (
                    <div
                      key={ord._id}
                      className={`p-4 sm:p-5 rounded-2xl text-center space-y-1.5 transition-all duration-400 relative overflow-hidden ${
                        isAnnounced
                          ? "bg-emerald-500 text-slate-950 border-2 border-white scale-105 shadow-2xl shadow-emerald-500/60 animate-bounce"
                          : "bg-emerald-950/40 border border-emerald-500/50 text-white shadow-lg hover:border-emerald-400"
                      }`}
                    >
                      <p
                        className={`text-3xl sm:text-5xl font-black font-tabular tracking-tight ${
                          isAnnounced ? "text-slate-950" : "text-emerald-300"
                        }`}
                      >
                        #{ord.orderToken}
                      </p>
                      <span
                        className={`text-xs font-bold block truncate ${
                          isAnnounced ? "text-slate-900 font-extrabold" : "text-emerald-400"
                        }`}
                      >
                        {ord.table || "টেবিল"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ================================================================= */}
      {/* 4. BOTTOM FOOTER (Recently Completed & Branding)                  */}
      {/* ================================================================= */}
      <footer className="rounded-2xl border border-[#2C1C13] bg-[#140D08]/80 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <span className="text-[11px] font-bold uppercase text-[#A89684] shrink-0">
            সর্বশেষ পরিবেশিত:
          </span>
          {recentCompleted.length === 0 ? (
            <span className="text-[#705E51] font-medium">গত ১০ মিনিটে কোনো রেকর্ড নেই</span>
          ) : (
            recentCompleted.map((ord) => (
              <span
                key={ord._id}
                className="px-2.5 py-0.5 rounded-lg bg-[#1F140D] border border-[#2C1C13] text-[#A89684] font-bold font-tabular shrink-0"
              >
                #{ord.orderToken}
              </span>
            ))
          )}
        </div>

        <div className="text-[#A89684] text-[11px] font-semibold flex items-center gap-2 shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-[#C4611B]" />
          <span>Real-time Live Sync • Powered by BornoCafe POS</span>
        </div>
      </footer>
    </div>
  );
};

export default CustomerDisplayScreen;
