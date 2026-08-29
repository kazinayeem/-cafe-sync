import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, CreditCard, Smartphone, Star, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { PaymentRecordPayload } from "@/services/orderApi";

interface SplitPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalDue: number;
  customerLoyaltyPoints?: number;
  loyaltyRedeemRate?: number;
  onComplete: (data: {
    payments: PaymentRecordPayload[];
    paymentMethod: "cash" | "card" | "online" | "bkash" | "nagad" | "split";
    loyaltyPointsUsed: number;
  }) => void;
}

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  isOpen,
  onClose,
  totalDue,
  customerLoyaltyPoints = 0,
  loyaltyRedeemRate = 0.5,
  onComplete,
}) => {
  const [payments, setPayments] = useState<PaymentRecordPayload[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<"cash" | "card" | "bkash" | "nagad" | "loyalty">("cash");
  const [tenderAmount, setTenderAmount] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState<number>(0);

  // Initialize with exact total due on open
  useEffect(() => {
    if (isOpen) {
      setPayments([
        {
          method: "cash",
          amount: totalDue,
        },
      ]);
      setSelectedMethod("cash");
      setTenderAmount(String(totalDue));
      setTransactionId("");
      setLoyaltyPointsToUse(0);
    }
  }, [isOpen, totalDue]);

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const remainingDue = Math.max(0, totalDue - totalPaid);
  const changeDue = Math.max(0, totalPaid - totalDue);

  const handleAddPayment = () => {
    const amt = Number(tenderAmount);
    if (!amt || amt <= 0) return;

    if (selectedMethod === "loyalty") {
      const maxPts = customerLoyaltyPoints || 0;
      const ptsToUse = Math.min(maxPts, Math.ceil(amt / loyaltyRedeemRate));
      const discount = ptsToUse * loyaltyRedeemRate;
      setLoyaltyPointsToUse(ptsToUse);

      setPayments((prev) => [
        ...prev.filter((p) => p.method !== "loyalty"),
        {
          method: "loyalty",
          amount: discount,
          transactionId: `${ptsToUse} pts`,
        },
      ]);
    } else {
      setPayments((prev) => [
        ...prev,
        {
          method: selectedMethod,
          amount: amt,
          transactionId: transactionId.trim() || undefined,
        },
      ]);
    }

    setTenderAmount("");
    setTransactionId("");
  };

  const handleRemovePayment = (index: number) => {
    const p = payments[index];
    if (p.method === "loyalty") {
      setLoyaltyPointsToUse(0);
    }
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuickCash = (amt: number) => {
    setPayments([
      {
        method: "cash",
        amount: amt,
      },
    ]);
  };

  const handleFinalSubmit = () => {
    if (totalPaid < totalDue) {
      alert(`Payment is incomplete. Remaining due: ৳${remainingDue}`);
      return;
    }

    const isSplit = payments.length > 1;
    const primaryMethod = isSplit
      ? "split"
      : payments[0]?.method === "bkash"
      ? "bkash"
      : payments[0]?.method === "nagad"
      ? "nagad"
      : payments[0]?.method === "card"
      ? "card"
      : "cash";

    onComplete({
      payments,
      paymentMethod: primaryMethod as any,
      loyaltyPointsUsed: loyaltyPointsToUse,
    });
    onClose();
  };

  const paymentMethodIcons = {
    cash: Banknote,
    card: CreditCard,
    bkash: Smartphone,
    nagad: Smartphone,
    loyalty: Star,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-border/80 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Payment & Checkout
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Support split tender, mobile payments & loyalty redemption
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground font-semibold">Total Due</span>
              <p className="text-2xl font-black font-tabular text-foreground">
                ৳{totalDue}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Quick Tender Method Selector */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Payment Method
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { key: "cash", label: "Cash", icon: Banknote },
                  { key: "card", label: "Card / POS", icon: CreditCard },
                  { key: "bkash", label: "bKash", icon: Smartphone },
                  { key: "nagad", label: "Nagad", icon: Smartphone },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedMethod(key);
                    setTenderAmount(String(remainingDue > 0 ? remainingDue : totalDue));
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    selectedMethod === key
                      ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-100 shadow-xs"
                      : "border-border hover:bg-accent text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loyalty Points Redemption Option (if customer has points) */}
          {customerLoyaltyPoints > 0 && (
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Available Loyalty: {customerLoyaltyPoints} Points
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Worth ৳{customerLoyaltyPoints * loyaltyRedeemRate} discount
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedMethod("loyalty");
                  setTenderAmount(
                    String(
                      Math.min(
                        customerLoyaltyPoints * loyaltyRedeemRate,
                        remainingDue > 0 ? remainingDue : totalDue
                      )
                    )
                  );
                }}
                className="text-xs font-bold rounded-lg border-amber-500/40 text-amber-700 dark:text-amber-300"
              >
                Redeem Points
              </Button>
            </div>
          )}

          {/* Tender Input & Quick Preset Buttons */}
          <div className="p-4 rounded-xl bg-card border border-border/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Amount for {selectedMethod.toUpperCase()} (৳)
                </Label>
                <Input
                  type="number"
                  value={tenderAmount}
                  onChange={(e) => setTenderAmount(e.target.value)}
                  placeholder="0.00"
                  className="rounded-xl font-bold font-tabular text-lg mt-1"
                />
              </div>

              {(selectedMethod === "bkash" || selectedMethod === "nagad" || selectedMethod === "card") && (
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Trx ID / Auth Code (Optional)
                  </Label>
                  <Input
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 9J8A7D6"
                    className="rounded-xl mt-1 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Quick Cash Presets */}
            {selectedMethod === "cash" && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground font-semibold self-center mr-1">
                  Quick Cash:
                </span>
                {[
                  totalDue,
                  Math.ceil(totalDue / 100) * 100,
                  500,
                  1000,
                  2000,
                ].map((val, idx) => (
                  <button
                    key={`${val}-${idx}`}
                    type="button"
                    onClick={() => {
                      setTenderAmount(String(val));
                      handleQuickCash(val);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-border bg-muted/50 hover:bg-accent text-xs font-bold font-tabular transition-colors"
                  >
                    ৳{val}
                  </button>
                ))}
              </div>
            )}

            <Button
              type="button"
              onClick={handleAddPayment}
              className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold rounded-xl text-xs py-2"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Payment Tender
            </Button>
          </div>

          {/* Payment Tenders Breakdown Table */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Payment Tenders Breakdown
            </Label>
            <div className="space-y-1.5 border rounded-xl p-3 bg-muted/20">
              {payments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No payment tenders recorded.
                </p>
              ) : (
                payments.map((p, idx) => {
                  const Icon = paymentMethodIcons[p.method as keyof typeof paymentMethodIcons] || Banknote;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-card border text-xs font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-bold capitalize">{p.method}</span>
                        {p.transactionId && (
                          <span className="text-[11px] text-muted-foreground">
                            ({p.transactionId})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold font-tabular text-sm">
                          ৳{p.amount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePayment(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Financial Balance Summary */}
          <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-accent/40 border text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Total Due
              </span>
              <p className="text-sm font-extrabold font-tabular text-foreground">
                ৳{totalDue}
              </p>
            </div>
            <div className="border-x border-border/80">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Total Tendered
              </span>
              <p className="text-sm font-extrabold font-tabular text-emerald-600 dark:text-emerald-400">
                ৳{totalPaid}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                {changeDue > 0 ? "Change Due" : "Remaining"}
              </span>
              <p
                className={`text-sm font-extrabold font-tabular ${
                  changeDue > 0
                    ? "text-blue-600 dark:text-blue-400"
                    : remainingDue > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600"
                }`}
              >
                ৳{changeDue > 0 ? changeDue : remainingDue}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/80 pt-4 sm:justify-between gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>

          <Button
            onClick={handleFinalSubmit}
            disabled={totalPaid < totalDue}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete & Pay ৳{totalDue}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
