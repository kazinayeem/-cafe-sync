import React, { useState } from "react";
import {
  useGetCurrentShiftQuery,
  useOpenShiftMutation,
  useLogCashMovementMutation,
  useCloseShiftMutation,
  useGetShiftHistoryQuery,
  Shift,
} from "@/services/shiftApi";
import {
  Clock,
  Banknote,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  History,
  Receipt,
  FileText,
  User,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Swal from "sweetalert2";

export const ShiftManagement: React.FC = () => {
  const { data: currentShiftResponse, isLoading, refetch } = useGetCurrentShiftQuery();
  const { data: shiftHistoryResponse } = useGetShiftHistoryQuery({ limit: 20 });

  const [openShift, { isLoading: isOpening }] = useOpenShiftMutation();
  const [logCashMovement, { isLoading: isLoggingCash }] = useLogCashMovementMutation();
  const [closeShift, { isLoading: isClosing }] = useCloseShiftMutation();

  const [isOpenShiftModal, setIsOpenShiftModal] = useState(false);
  const [isCashMovementModal, setIsCashMovementModal] = useState(false);
  const [isCloseShiftModal, setIsCloseShiftModal] = useState(false);

  // Form states
  const [openingFloat, setOpeningFloat] = useState<number>(5000);
  const [movementType, setMovementType] = useState<"cash_in" | "cash_out" | "cash_drop">("cash_drop");
  const [movementAmount, setMovementAmount] = useState<number>(1000);
  const [movementReason, setMovementReason] = useState("");
  const [actualCashCount, setActualCashCount] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState("");

  const currentShift: Shift | null = currentShiftResponse?.data || null;
  const shiftHistory = shiftHistoryResponse?.data || [];

  const handleStartShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await openShift({ openingFloat }).unwrap();
      setIsOpenShiftModal(false);
      Swal.fire({
        icon: "success",
        title: "Shift Started!",
        text: `Opening float ৳${openingFloat} recorded.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to Open Shift",
        text: err?.data?.message || "Something went wrong",
      });
    }
  };

  const handleCashMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementAmount || !movementReason) return;

    try {
      await logCashMovement({
        shiftId: currentShift?._id,
        type: movementType,
        amount: movementAmount,
        reason: movementReason,
      }).unwrap();
      setIsCashMovementModal(false);
      setMovementReason("");
      Swal.fire({
        icon: "success",
        title: "Cash Movement Recorded!",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Failed to record cash movement",
      });
    }
  };

  const handleCloseShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShift) return;

    try {
      const res = await closeShift({
        shiftId: currentShift._id,
        actualCash: actualCashCount,
        closingNotes,
      }).unwrap();

      setIsCloseShiftModal(false);
      const diff = res.data.cashDifference || 0;

      Swal.fire({
        icon: diff === 0 ? "success" : "warning",
        title: "Shift Closed & Reconciled",
        html: `
          <div class="text-left text-sm space-y-1">
            <p><strong>Total Sales:</strong> ৳${res.data.totalSales}</p>
            <p><strong>Expected Cash:</strong> ৳${res.data.expectedCash}</p>
            <p><strong>Actual Counted:</strong> ৳${actualCashCount}</p>
            <p><strong>Difference:</strong> <span style="color:${
              diff === 0 ? "green" : diff > 0 ? "blue" : "red"
            }">৳${diff}</span></p>
          </div>
        `,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error Closing Shift",
        text: err?.data?.message || "Something went wrong",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Cashier Shifts & Cash Drawer"
        subtitle="Manage cashier opening floats, cash drops, petty cash payouts, and end-of-shift cash drawer balancing"
      >
        {currentShift ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCashMovementModal(true)}
              variant="outline"
              className="rounded-xl border-border font-bold text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Cash In / Drop / Out
            </Button>
            <Button
              onClick={() => {
                setActualCashCount(currentShift.expectedCash || 0);
                setIsCloseShiftModal(true);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md text-xs"
            >
              <Lock className="h-3.5 w-3.5 mr-1" />
              Close Shift & Balance
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsOpenShiftModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md flex items-center gap-2"
          >
            <Unlock className="h-4 w-4" />
            Open Cashier Shift
          </Button>
        )}
      </PageHeader>

      {/* Active Shift Overview Banner */}
      {currentShift ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md">
                <Banknote className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-foreground">
                    Active Cashier Shift
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-white animate-pulse">
                    OPEN
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                  <User className="h-3.5 w-3.5" />
                  Cashier: {currentShift.cashier?.name || "Logged-in Staff"} • Started:{" "}
                  {new Date(currentShift.openingTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase font-bold text-muted-foreground">
                Estimated Cash in Drawer
              </span>
              <p className="text-3xl font-black font-tabular text-emerald-600 dark:text-emerald-400">
                ৳{currentShift.expectedCash || currentShift.openingFloat}
              </p>
            </div>
          </div>

          {/* Metrics Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-card border border-border/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Opening Cash Float
              </span>
              <p className="text-lg font-black font-tabular text-foreground mt-0.5">
                ৳{currentShift.openingFloat}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Cash Sales
              </span>
              <p className="text-lg font-black font-tabular text-emerald-600 dark:text-emerald-400 mt-0.5">
                ৳{currentShift.cashSales || 0}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Card & Mobile (bKash/Nagad)
              </span>
              <p className="text-lg font-black font-tabular text-blue-600 dark:text-blue-400 mt-0.5">
                ৳{(currentShift.cardSales || 0) + (currentShift.mobileSales || 0)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Orders Processed
              </span>
              <p className="text-lg font-black font-tabular text-amber-600 dark:text-amber-400 mt-0.5">
                {currentShift.totalOrders || 0}
              </p>
            </div>
          </div>

          {/* Drawer Logs in Active Shift */}
          {currentShift.cashDrawerLogs && currentShift.cashDrawerLogs.length > 0 && (
            <div className="border-t border-border/60 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                Cash Drawer Logs This Shift
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {currentShift.cashDrawerLogs.map((log: any) => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-card border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {log.type === "cash_in" ? (
                        <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                      ) : log.type === "cash_drop" ? (
                        <Lock className="h-4 w-4 text-purple-500" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-rose-500" />
                      )}
                      <span className="font-bold uppercase text-[10px] px-1.5 py-0.2 rounded bg-muted">
                        {log.type.replace("_", " ")}
                      </span>
                      <span className="font-medium text-muted-foreground">
                        {log.reason}
                      </span>
                    </div>

                    <span className="font-black font-tabular text-foreground">
                      ৳{log.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No active shift state */
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-8 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mx-auto">
            <Lock className="h-7 w-7" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-foreground">
              No Active Shift for Cashier
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Start your shift by recording the opening cash float in the drawer to begin processing orders.
            </p>
          </div>
          <Button
            onClick={() => setIsOpenShiftModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 rounded-xl shadow-md"
          >
            Start Shift Now
          </Button>
        </div>
      )}

      {/* Shift History Table (Audit) */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
            <History className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Shift Reconciliation History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/80 uppercase font-bold text-muted-foreground tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Cashier</th>
                <th className="py-3.5 px-4">Opening Float</th>
                <th className="py-3.5 px-4">Total Sales</th>
                <th className="py-3.5 px-4">Expected Cash</th>
                <th className="py-3.5 px-4">Actual Counted</th>
                <th className="py-3.5 px-4">Difference</th>
                <th className="py-3.5 px-4">Timing</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {shiftHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No past shifts found.
                  </td>
                </tr>
              ) : (
                shiftHistory.map((s) => (
                  <tr key={s._id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {s.cashier?.name || "Staff"}
                    </td>
                    <td className="py-3.5 px-4 font-tabular font-bold">
                      ৳{s.openingFloat}
                    </td>
                    <td className="py-3.5 px-4 font-tabular font-extrabold text-amber-600 dark:text-amber-400">
                      ৳{s.totalSales || 0}
                    </td>
                    <td className="py-3.5 px-4 font-tabular font-medium">
                      ৳{s.expectedCash || 0}
                    </td>
                    <td className="py-3.5 px-4 font-tabular font-bold text-foreground">
                      {s.actualCash !== undefined ? `৳${s.actualCash}` : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-tabular font-extrabold">
                      {s.cashDifference !== undefined ? (
                        <span
                          className={
                            s.cashDifference === 0
                              ? "text-emerald-600"
                              : s.cashDifference > 0
                              ? "text-blue-600"
                              : "text-rose-600"
                          }
                        >
                          {s.cashDifference > 0
                            ? `+৳${s.cashDifference}`
                            : `৳${s.cashDifference}`}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {new Date(s.openingTime).toLocaleDateString()} •{" "}
                      {new Date(s.openingTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          s.status === "open"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Shift Modal */}
      <Dialog open={isOpenShiftModal} onOpenChange={setIsOpenShiftModal}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Open Cashier Shift
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleStartShift} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Opening Cash Float (৳) *
              </Label>
              <Input
                type="number"
                min={0}
                required
                value={openingFloat}
                onChange={(e) => setOpeningFloat(Number(e.target.value))}
                placeholder="5000"
                className="rounded-xl mt-1 text-2xl font-black font-tabular"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Count the starting bills & coins present in the physical register.
              </p>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpenShiftModal(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isOpening}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md"
              >
                {isOpening ? "Opening..." : "Confirm & Start Shift"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cash Movement (In / Out / Drop) Modal */}
      <Dialog open={isCashMovementModal} onOpenChange={setIsCashMovementModal}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Record Cash Drawer Movement
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCashMovementSubmit} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Movement Type
              </Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                  { key: "cash_drop", label: "Cash Drop (Safe)" },
                  { key: "cash_out", label: "Cash Out (Petty)" },
                  { key: "cash_in", label: "Cash In (Add Float)" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMovementType(key as any)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      movementType === key
                        ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-100 shadow-xs"
                        : "border-border hover:bg-accent text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Amount (৳) *
              </Label>
              <Input
                type="number"
                min={1}
                required
                value={movementAmount}
                onChange={(e) => setMovementAmount(Number(e.target.value))}
                placeholder="1000"
                className="rounded-xl mt-1 text-xl font-black font-tabular"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Reason / Note *
              </Label>
              <Input
                required
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                placeholder="e.g., Safe transfer, Buying coffee beans, Float addition"
                className="rounded-xl mt-1"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCashMovementModal(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoggingCash}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md"
              >
                Save Movement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Close Shift Reconciliation Modal */}
      <Dialog open={isCloseShiftModal} onOpenChange={setIsCloseShiftModal}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Close Shift & Balance Drawer
            </DialogTitle>
          </DialogHeader>

          {currentShift && (
            <form onSubmit={handleCloseShiftSubmit} className="space-y-4 py-2">
              <div className="p-3.5 rounded-xl bg-accent/40 border border-border/80 flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">
                  Expected Cash in Drawer:
                </span>
                <span className="text-xl font-black font-tabular text-emerald-600 dark:text-emerald-400">
                  ৳{currentShift.expectedCash}
                </span>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Actual Counted Cash in Register (৳) *
                </Label>
                <Input
                  type="number"
                  min={0}
                  required
                  value={actualCashCount}
                  onChange={(e) => setActualCashCount(Number(e.target.value))}
                  placeholder="Counted cash"
                  className="rounded-xl mt-1 text-2xl font-black font-tabular"
                />
              </div>

              {/* Difference preview */}
              <div className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold">
                <span>Calculated Discrepancy:</span>
                <span
                  className={
                    actualCashCount - currentShift.expectedCash === 0
                      ? "text-emerald-600 font-extrabold"
                      : actualCashCount - currentShift.expectedCash > 0
                      ? "text-blue-600 font-extrabold"
                      : "text-rose-600 font-extrabold"
                  }
                >
                  {actualCashCount - currentShift.expectedCash === 0
                    ? "Balanced (৳0)"
                    : actualCashCount - currentShift.expectedCash > 0
                    ? `Over (+৳${actualCashCount - currentShift.expectedCash})`
                    : `Short (-৳${Math.abs(
                        actualCashCount - currentShift.expectedCash
                      )})`}
                </span>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Closing Notes (Optional)
                </Label>
                <Input
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="e.g. End of evening shift notes"
                  className="rounded-xl mt-1"
                />
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCloseShiftModal(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isClosing}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
                >
                  {isClosing ? "Reconciling..." : "Reconcile & Close Shift"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftManagement;
