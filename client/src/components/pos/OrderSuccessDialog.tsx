import React from "react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Printer,
  Coffee,
  Clock,
  ArrowRight,
  Plus,
  ShoppingBag,
  Utensils,
} from "lucide-react";

interface OrderSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any | null;
  onPrintReceipt: () => void;
}

export const OrderSuccessDialog: React.FC<OrderSuccessDialogProps> = ({
  isOpen,
  onClose,
  order,
  onPrintReceipt,
}) => {
  const navigate = useNavigate();

  if (!order) return null;

  const orderNumber = order.orderToken
    ? `#${order.orderToken}`
    : order.customOrderID
    ? `#${order.customOrderID}`
    : `#${order._id?.slice(-4) || "0000"}`;

  const tableName =
    order.orderType === "takeaway"
      ? "Takeaway 🛍️"
      : order.table?.name || (typeof order.table === "string" ? order.table : "Dine-In 🍽️");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6 rounded-3xl border border-border/80 shadow-2xl space-y-4">
        <DialogHeader className="text-center space-y-2">
          {/* Animated Success Badge */}
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto ring-8 ring-emerald-500/10 animate-in zoom-in-50 duration-300">
            <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Order Confirmed & Sent to Kitchen
            </span>
            <DialogTitle className="text-3xl font-black tracking-tight text-foreground mt-0.5">
              {orderNumber}
            </DialogTitle>
          </div>

          <p className="text-xs text-muted-foreground">
            Thank you! The ticket is now active on the Kitchen Display System (KDS).
          </p>
        </DialogHeader>

        {/* Order Details Quick Summary */}
        <div className="rounded-2xl border border-border/80 bg-accent/40 p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between font-bold border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-1.5 text-foreground">
              {order.orderType === "takeaway" ? (
                <ShoppingBag className="h-4 w-4 text-purple-600" />
              ) : (
                <Utensils className="h-4 w-4 text-amber-600" />
              )}
              <span>{tableName}</span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Est. 5–10 mins</span>
            </div>
          </div>

          {/* Items Preview */}
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-muted-foreground">
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span className="font-bold text-foreground">{item.quantity}×</span>
                  <span className="truncate">{item.name || item.product?.name}</span>
                  {item.size && (
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground/80">
                      ({item.size})
                    </span>
                  )}
                </div>
                <span className="font-bold font-tabular text-foreground shrink-0 ml-2">
                  ৳{(item.price + (item.modifiersPrice || 0)) * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Total & Payment */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60 font-black text-sm">
            <span className="text-muted-foreground">Total Paid:</span>
            <span className="text-base font-tabular text-amber-600 dark:text-amber-400">
              ৳{order.totalPrice}
            </span>
          </div>
        </div>

        {/* Live Status Progression Steps */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block text-center">
            Kitchen Preparation Lifecycle
          </span>
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-black">
            <div className="p-1.5 rounded-xl bg-amber-500 text-white shadow-xs">
              ● Received
            </div>
            <div className="p-1.5 rounded-xl bg-muted text-muted-foreground">
              ○ Brewing
            </div>
            <div className="p-1.5 rounded-xl bg-muted text-muted-foreground">
              ○ Ready
            </div>
            <div className="p-1.5 rounded-xl bg-muted text-muted-foreground">
              ○ Completed
            </div>
          </div>
        </div>

        {/* Dialog Actions */}
        <DialogFooter className="flex-col sm:flex-col gap-2 pt-2">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onPrintReceipt}
              className="h-11 rounded-2xl border-border font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Printer className="h-4 w-4 text-amber-600" />
              Print Receipt
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                navigate("/dashboard/orders");
              }}
              className="h-11 rounded-2xl border-border font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <ArrowRight className="h-4 w-4 text-blue-600" />
              View in Orders
            </Button>
          </div>

          <Button
            type="button"
            onClick={onClose}
            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Start New Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
