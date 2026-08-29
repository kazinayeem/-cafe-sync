import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useTrackOrderQuery } from "@/services/publicMenuApi";
import { socket } from "@/utils/socket";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Coffee,
  Sparkles,
  ArrowLeft,
  Utensils,
  Receipt,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

const ORDER_STEPS = [
  { key: "pending", label: "Order Received", desc: "Sent to kitchen queue" },
  { key: "confirmed", label: "Order Confirmed", desc: "Kitchen accepted ticket" },
  { key: "preparing", label: "Preparing in Kitchen", desc: "Barista is crafting your items" },
  { key: "ready", label: "Ready for Pickup", desc: "Please collect your order" },
  { key: "completed", label: "Completed", desc: "Thank you for dining with us" },
];

export const CustomerOrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: trackData, isLoading, refetch } = useTrackOrderQuery(orderId || "", {
    skip: !orderId,
  });

  const [currentStatus, setCurrentStatus] = useState<string>("pending");
  const [orderToken, setOrderToken] = useState<string>("");

  const order = trackData?.data?.order;
  const business = trackData?.data?.business || { name: "Cafe Sync" };

  // Set initial status from query
  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
      setOrderToken(order.orderToken || order.customOrderID?.slice(-4) || "—");
    }
  }, [order]);

  // Real-time Socket.io status updates
  useEffect(() => {
    const handleStatusUpdate = (data: any) => {
      if (
        data &&
        (data.orderId === orderId ||
          data.customOrderID === orderId ||
          data.orderToken === orderId)
      ) {
        setCurrentStatus(data.status);
        refetch();

        // Celebration on Ready
        if (data.status === "ready") {
          try {
            // Subtle vibration on mobile
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          } catch {
            // Ignore
          }

          Swal.fire({
            icon: "success",
            title: "🎉 Your Order is Ready!",
            text: `Order #${data.orderToken || orderToken} is ready for pickup/serving.`,
            confirmButtonText: "Awesome!",
            confirmButtonColor: "#f59e0b",
          });
        }
      }
    };

    socket.on("orderStatusUpdated", handleStatusUpdate);
    socket.on("orderUpdated", () => refetch());

    return () => {
      socket.off("orderStatusUpdated", handleStatusUpdate);
      socket.off("orderUpdated");
    };
  }, [orderId, orderToken, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 animate-pulse">
          <Coffee className="h-7 w-7" />
        </div>
        <p className="text-sm font-bold text-muted-foreground animate-pulse">
          Loading order status...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600">
          <Receipt className="h-8 w-8" />
        </div>
        <div className="max-w-xs space-y-1.5">
          <h2 className="text-xl font-black text-foreground">Order Not Found</h2>
          <p className="text-xs text-muted-foreground">
            We couldn't locate this order tracking token. Please verify with cafe staff.
          </p>
        </div>
        <Button
          onClick={() => navigate("/menu")}
          variant="outline"
          className="rounded-2xl text-xs font-bold"
        >
          Return to Menu
        </Button>
      </div>
    );
  }

  const getStepIndex = (status: string) => {
    const idx = ORDER_STEPS.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = getStepIndex(currentStatus);
  const isCancelled = currentStatus === "cancelled";
  const isReady = currentStatus === "ready";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground pb-12 select-none">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border/80 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">
              <Coffee className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-black text-foreground truncate">
              {business.name || "Cafe Sync"}
            </h1>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            {(order.table as any)?.name || "Dine-In"}
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-5">
        {/* Token Hero Banner */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent p-6 text-center space-y-3 shadow-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Live Order Status
          </div>

          <div>
            <span className="text-xs uppercase font-bold text-muted-foreground block">
              Your Order Token
            </span>
            <p className="text-5xl sm:text-6xl font-black font-tabular tracking-tight text-foreground mt-1">
              #{order.orderToken || order.customOrderID?.slice(-4)}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
            <span>{(order.table as any)?.name || "Table"}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              Est. 10–15 mins
            </span>
          </div>

          {isReady && (
            <div className="p-3 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 animate-bounce shadow-lg">
              <PartyPopper className="h-5 w-5" />
              Order Ready for Pickup!
            </div>
          )}

          <p className="text-[11px] text-muted-foreground font-medium">
            Please keep this page open. Your screen updates automatically in real-time.
          </p>
        </div>

        {/* Live Timeline Tracker */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ChefHat className="h-4 w-4 text-amber-500" />
            Kitchen Progress
          </h2>

          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-center space-y-1">
              <p className="font-black text-sm">Order Cancelled</p>
              <p className="text-xs text-muted-foreground">
                This order was cancelled by cafe staff. Please see the counter for help.
              </p>
            </div>
          ) : (
            <div className="space-y-4 relative pl-2">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step.key} className="flex items-start gap-3 relative">
                    {/* Vertical Connecting Line */}
                    {idx < ORDER_STEPS.length - 1 && (
                      <div
                        className={`absolute left-[11px] top-6 bottom-[-16px] w-0.5 transition-colors duration-500 ${
                          currentStepIdx > idx
                            ? "bg-amber-500"
                            : "bg-muted border-l border-dashed"
                        }`}
                      />
                    )}

                    {/* Step Icon */}
                    <div
                      className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black transition-all ${
                        isCurrent
                          ? "bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse"
                          : isPassed
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    {/* Label & Description */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-black ${
                          isCurrent
                            ? "text-amber-600 dark:text-amber-400 text-sm"
                            : isPassed
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Items & Receipt Summary */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Utensils className="h-4 w-4 text-amber-500" />
              Order Items ({order.items.length})
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                order.paymentStatus === "paid"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
              }`}
            >
              {order.paymentStatus === "paid" ? "Paid" : "Pay at Counter"}
            </span>
          </div>

          <div className="space-y-2 divide-y divide-border/40">
            {order.items.map((item, idx) => (
              <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-foreground">
                    {item.quantity} × {item.name || item.product?.name}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                    Size: {item.size}
                  </span>

                  {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {item.selectedModifiers.map((m, mIdx) => (
                        <span
                          key={mIdx}
                          className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-medium"
                        >
                          +{m.optionName} {m.price > 0 && `(৳${m.price})`}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.itemNote && (
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 italic mt-0.5">
                      "{item.itemNote}"
                    </p>
                  )}
                </div>

                <span className="font-black font-tabular text-foreground shrink-0">
                  ৳{(item.price + (item.modifiersPrice || 0)) * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-border/60 pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground font-semibold">
              <span>Subtotal</span>
              <span className="font-bold text-foreground font-tabular">
                ৳{order.subtotal.toFixed(2)}
              </span>
            </div>
            {order.taxRate > 0 && (
              <div className="flex justify-between text-muted-foreground font-semibold">
                <span>VAT / Tax ({order.taxRate}%)</span>
                <span className="font-bold font-tabular">
                  +৳{order.taxAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-1.5 border-t border-border/40 font-black">
              <span className="text-sm">Total Amount</span>
              <span className="text-xl font-tabular text-amber-600 dark:text-amber-400">
                ৳{order.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Back / Additional Action */}
        <div className="text-center pt-2">
          <Button
            onClick={() => navigate("/menu")}
            variant="outline"
            className="rounded-2xl border-border/80 text-xs font-bold w-full h-11"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Browse Cafe Menu
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CustomerOrderTracking;
