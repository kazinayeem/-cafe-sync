import React, { useState } from "react";
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
  Download,
  Clock,
  ArrowRight,
  Plus,
  ShoppingBag,
  Utensils,
  Receipt,
} from "lucide-react";
import {
  printReceipt,
  downloadReceiptPDF,
  extractReceiptData,
} from "@/utils/printReceipt";

interface OrderSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any | null;
  settings?: any;
  tables?: any[];
  onPrintReceipt?: () => void;
}

export const OrderSuccessDialog: React.FC<OrderSuccessDialogProps> = ({
  isOpen,
  onClose,
  order,
  settings,
  tables = [],
  onPrintReceipt,
}) => {
  const navigate = useNavigate();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showThermalPreview, setShowThermalPreview] = useState(false);

  if (!order) return null;

  const receiptSettings = {
    businessName: settings?.businessName || "Cafe Sync",
    address: settings?.address || "Specialty Coffee House",
    phone: settings?.phone || "+880 1700-000000",
    website: settings?.website || "https://cafe-sync.vercel.app",
    receiptFooter:
      settings?.receiptFooter ||
      "Thank you for your visit! Enjoy your coffee.",
    taxRate: settings?.taxRate || 0,
    serviceCharge: settings?.serviceCharge || 0,
    currency: settings?.currency || "BDT",
  };

  const receiptData = extractReceiptData(order, receiptSettings, tables);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      if (onPrintReceipt) {
        onPrintReceipt();
      } else {
        await printReceipt(order, receiptSettings, tables);
      }
    } catch (err) {
      console.error("Failed to print receipt:", err);
    } finally {
      setTimeout(() => setIsPrinting(false), 600);
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      downloadReceiptPDF(order, receiptSettings, tables);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-6 rounded-3xl border border-border/80 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
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
              {receiptData.orderNumber}
            </DialogTitle>
          </div>

          <p className="text-xs text-muted-foreground">
            Thank you! Ticket has been broadcasted to the Kitchen Display System (KDS).
          </p>
        </DialogHeader>

        {/* Toggle between Summary View and Thermal Receipt Preview */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setShowThermalPreview(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !showThermalPreview
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Utensils className="h-3.5 w-3.5 inline mr-1" />
            Order Summary
          </button>

          <button
            type="button"
            onClick={() => setShowThermalPreview(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              showThermalPreview
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="h-3.5 w-3.5 inline mr-1" />
            Thermal Receipt Preview
          </button>
        </div>

        {/* 1. ORDER SUMMARY CARD */}
        {!showThermalPreview ? (
          <div className="rounded-2xl border border-border/80 bg-accent/40 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-1.5 text-foreground">
                {receiptData.orderType.includes("Takeaway") ? (
                  <ShoppingBag className="h-4 w-4 text-purple-600" />
                ) : (
                  <Utensils className="h-4 w-4 text-amber-600" />
                )}
                <span>{receiptData.tableName}</span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Est. 5–10 mins</span>
              </div>
            </div>

            {/* Items Preview */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {receiptData.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-start text-muted-foreground"
                >
                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">
                        {item.quantity}×
                      </span>
                      <span className="truncate text-foreground font-semibold">
                        {item.name}
                      </span>
                      {item.size && item.size !== "Regular" && (
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground/80">
                          ({item.size})
                        </span>
                      )}
                    </div>
                    {item.modifiers?.length > 0 && (
                      <div className="text-[10px] text-muted-foreground pl-5">
                        {item.modifiers.map((m: any) => `+ ${m.name}`).join(", ")}
                      </div>
                    )}
                    {item.note && (
                      <div className="text-[10px] italic text-amber-600 pl-5">
                        "{item.note}"
                      </div>
                    )}
                  </div>
                  <span className="font-bold font-tabular text-foreground shrink-0 ml-2">
                    {receiptData.currency}
                    {item.lineTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Total & Payment */}
            <div className="space-y-1 pt-2 border-t border-border/60">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-tabular font-semibold">
                  {receiptData.currency}
                  {receiptData.subtotal.toFixed(2)}
                </span>
              </div>

              {receiptData.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({receiptData.discountPercent}%):</span>
                  <span className="font-tabular">
                    -{receiptData.currency}
                    {receiptData.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {receiptData.taxAmount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT / Tax ({receiptData.taxRate}%):</span>
                  <span className="font-tabular">
                    +{receiptData.currency}
                    {receiptData.taxAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-border/60 font-black text-sm">
                <span className="text-foreground">Total Paid:</span>
                <span className="text-base font-tabular text-amber-600 dark:text-amber-400">
                  {receiptData.currency}
                  {receiptData.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* 2. THERMAL RECEIPT REALISTIC PREVIEW */
          <div className="rounded-2xl border border-border/80 bg-white text-black p-4 font-mono text-[11px] space-y-2 shadow-inner max-h-56 overflow-y-auto">
            <div className="text-center">
              <div className="font-black text-sm">{receiptData.businessName}</div>
              <div className="text-[9px] uppercase text-gray-600">
                Specialty Coffee House
              </div>
              <div className="text-[9px] text-gray-600">{receiptData.address}</div>
            </div>

            <div className="border-t border-dashed border-black/40 my-1" />

            <div className="flex justify-between text-[10px]">
              <span className="font-bold">ORDER: {receiptData.orderNumber}</span>
              <span>{receiptData.orderType}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>{receiptData.dateStr} {receiptData.timeStr}</span>
              <span>Table: {receiptData.tableName}</span>
            </div>

            <div className="border-t border-dashed border-black/40 my-1" />

            <div className="space-y-1">
              {receiptData.items.map((it: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {it.name} {it.size !== "Regular" ? `(${it.size})` : ""} ×{it.quantity}
                  </span>
                  <span className="font-bold">
                    {receiptData.currency}{it.lineTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-black/40 my-1" />

            <div className="flex justify-between text-xs font-black">
              <span>TOTAL PAID</span>
              <span>
                {receiptData.currency}{receiptData.totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>Payment Tender:</span>
              <span className="font-bold uppercase">{receiptData.paymentMethod}</span>
            </div>

            <div className="border-t border-dashed border-black/40 my-1" />
            <div className="text-center text-[9px] text-gray-600">
              {receiptData.receiptFooter}
            </div>
          </div>
        )}

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
              disabled={isPrinting}
              onClick={handlePrint}
              className="h-11 rounded-2xl border-border font-bold text-xs flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/30 shadow-xs"
            >
              <Printer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              {isPrinting ? "Preparing..." : "Print Receipt"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isDownloading}
              onClick={handleDownload}
              className="h-11 rounded-2xl border-border font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-accent"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              {isDownloading ? "Saving..." : "Download PDF"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
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

            <Button
              type="button"
              onClick={onClose}
              className="h-11 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
