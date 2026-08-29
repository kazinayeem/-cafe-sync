import React, { useState, useEffect } from "react";
import { useGetDisplayOrdersQuery } from "@/services/publicMenuApi";
import { socket } from "@/utils/socket";
import {
  Coffee,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
  ChefHat,
  BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const CustomerDisplayScreen: React.FC = () => {
  const { data: displayData, refetch } = useGetDisplayOrdersQuery();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [highlightedToken, setHighlightedToken] = useState<string | null>(null);

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Socket.io listener
  useEffect(() => {
    const handleDisplayUpdate = () => {
      refetch();
    };

    const handleStatusUpdate = (data: any) => {
      refetch();
      if (data && data.status === "ready" && data.orderToken) {
        setHighlightedToken(data.orderToken);

        if (soundEnabled) {
          try {
            const audioCtx = new (window.AudioContext ||
              (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.6);
          } catch {
            // Ignore audio context error
          }
        }

        setTimeout(() => setHighlightedToken(null), 8000);
      }
    };

    socket.on("displayUpdate", handleDisplayUpdate);
    socket.on("orderStatusUpdated", handleStatusUpdate);
    socket.on("newOrder", handleDisplayUpdate);

    return () => {
      socket.off("displayUpdate", handleDisplayUpdate);
      socket.off("orderStatusUpdated", handleStatusUpdate);
      socket.off("newOrder", handleDisplayUpdate);
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

  const preparingOrders = displayData?.data?.preparing || [];
  const readyOrders = displayData?.data?.ready || [];
  const recentCompleted = displayData?.data?.recentCompleted || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none font-sans overflow-hidden">
      {/* Top Header Banner */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black shadow-xl shadow-amber-500/20">
            <Coffee className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Cafe Sync
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Live Order Display
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Watch your token number below • Collect when Ready
            </p>
          </div>
        </div>

        {/* Clock & Screen Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-right">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-xl font-black font-tabular text-slate-200">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-10 w-10 rounded-xl bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
              title={soundEnabled ? "Mute Chime" : "Enable Chime"}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-amber-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </Button>

            <Button
              size="icon"
              variant="outline"
              onClick={toggleFullscreen}
              className="h-10 w-10 rounded-xl bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
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
      </header>

      {/* Main Status Board Split (Preparing vs Ready) */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6 flex-1">
        {/* Preparing Column */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                  <ChefHat className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wide uppercase">
                    Now Preparing
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Orders currently brewing in the kitchen
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {preparingOrders.length} In Progress
              </span>
            </div>

            {/* Token Numbers Grid */}
            {preparingOrders.length === 0 ? (
              <div className="py-20 text-center space-y-2 text-slate-500">
                <ChefHat className="h-12 w-12 mx-auto opacity-30" />
                <p className="text-sm font-bold">No orders currently preparing</p>
                <p className="text-xs text-slate-600">New orders will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {preparingOrders.map((ord) => (
                  <div
                    key={ord._id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1 shadow-inner hover:border-amber-500/50 transition-colors"
                  >
                    <p className="text-3xl sm:text-4xl font-black font-tabular tracking-tight text-white">
                      #{ord.orderToken}
                    </p>
                    <span className="text-[11px] font-bold text-slate-400 block truncate">
                      {ord.table}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ready for Pickup Column */}
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-black">
                  <BellRing className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-emerald-400 tracking-wide uppercase">
                    Ready for Pickup
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Please present your token at the counter
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 animate-pulse shadow-md">
                {readyOrders.length} Ready
              </span>
            </div>

            {/* Token Numbers Grid */}
            {readyOrders.length === 0 ? (
              <div className="py-20 text-center space-y-2 text-slate-500">
                <BellRing className="h-12 w-12 mx-auto opacity-30" />
                <p className="text-sm font-bold">All ready orders collected</p>
                <p className="text-xs text-slate-600">Completed items will flash here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {readyOrders.map((ord) => {
                  const isHighlighted = highlightedToken === ord.orderToken;

                  return (
                    <div
                      key={ord._id}
                      className={`p-4 rounded-2xl text-center space-y-1 transition-all duration-500 ${
                        isHighlighted
                          ? "bg-emerald-500 text-slate-950 border-2 border-white scale-105 shadow-2xl shadow-emerald-500/50 animate-bounce"
                          : "bg-emerald-950/40 border border-emerald-500/50 text-white shadow-lg"
                      }`}
                    >
                      <p
                        className={`text-3xl sm:text-4xl font-black font-tabular tracking-tight ${
                          isHighlighted ? "text-slate-950" : "text-emerald-300"
                        }`}
                      >
                        #{ord.orderToken}
                      </p>
                      <span
                        className={`text-[11px] font-black block truncate ${
                          isHighlighted ? "text-slate-900" : "text-emerald-400"
                        }`}
                      >
                        {ord.table}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Footer: Recently Completed Tokens & Branding */}
      <footer className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-[11px] font-black uppercase text-slate-500 shrink-0">
            Recently Completed:
          </span>
          {recentCompleted.length === 0 ? (
            <span className="text-slate-600 font-medium">None in past 10 min</span>
          ) : (
            recentCompleted.map((ord) => (
              <span
                key={ord._id}
                className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-black font-tabular shrink-0"
              >
                #{ord.orderToken}
              </span>
            ))
          )}
        </div>

        <div className="text-slate-500 text-[11px] font-semibold flex items-center gap-2 shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Real-time Live Sync • Powered by Cafe Sync POS</span>
        </div>
      </footer>
    </div>
  );
};

export default CustomerDisplayScreen;
