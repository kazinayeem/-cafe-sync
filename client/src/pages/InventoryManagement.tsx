import React, { useState, useEffect } from "react";
import {
  useGetInventoryQuery,
  useAdjustStockMutation,
  useGetInventoryHistoryQuery,
  InventoryItem,
} from "@/services/inventoryApi";
import { socket } from "@/utils/socket";
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  RotateCcw,
  Search,
  History,
  TrendingDown,
  Layers,
  Edit2,
  X,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Swal from "sweetalert2";

export const InventoryManagement: React.FC = () => {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"inventory" | "history">("inventory");

  // Adjustment Modal State
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<"in" | "out" | "adjustment" | "waste">("in");
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [newStockLevel, setNewStockLevel] = useState<number>(0);
  const [minStockLevel, setMinStockLevel] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState("");

  const {
    data: inventoryResponse,
    isLoading,
    refetch: refetchInventory,
  } = useGetInventoryQuery({ filter, search });

  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useGetInventoryHistoryQuery({ limit: 50 });

  const [adjustStock, { isLoading: isAdjusting }] = useAdjustStockMutation();

  // Listen for socket stock updates
  useEffect(() => {
    socket.on("stockUpdated", () => {
      refetchInventory();
      refetchHistory();
    });

    return () => {
      socket.off("stockUpdated");
    };
  }, [refetchInventory, refetchHistory]);

  const summary = inventoryResponse?.data?.summary || {
    totalSKUs: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  };

  const items = inventoryResponse?.data?.items || [];
  const historyLogs = historyResponse?.data || [];

  const handleOpenAdjust = (prod: InventoryItem) => {
    setSelectedProduct(prod);
    setAdjustType("in");
    setAdjustQuantity(10);
    setNewStockLevel(prod.stockQuantity);
    setMinStockLevel(prod.minStockLevel || 10);
    setAdjustReason("");
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await adjustStock({
        productId: selectedProduct._id,
        type: adjustType,
        quantity: adjustQuantity,
        newStockLevel: adjustType === "adjustment" ? newStockLevel : undefined,
        minStockLevel,
        reason: adjustReason || `Stock ${adjustType} adjustment`,
      }).unwrap();

      setSelectedProduct(null);
      Swal.fire({
        icon: "success",
        title: "Stock Updated!",
        text: `Updated stock level for ${selectedProduct.name}`,
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Failed to adjust stock",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Inventory & Stock Management"
        subtitle="Track ingredient & product stocks, minimum alert levels, wastage, and automatic order deductions"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === "inventory"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-card border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Boxes className="h-3.5 w-3.5 mr-1.5 inline-block" />
            Stock Inventory
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === "history"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-card border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <History className="h-3.5 w-3.5 mr-1.5 inline-block" />
            Movement Log
          </button>
        </div>
      </PageHeader>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard title="Total SKUs" value={summary.totalSKUs} icon={Layers} accentColor="slate" />
        <StatCard title="In Stock" value={summary.inStockCount} icon={CheckCircle2} accentColor="emerald" />
        <StatCard title="Low Stock Alerts" value={summary.lowStockCount} icon={AlertTriangle} accentColor="amber" />
        <StatCard title="Out of Stock" value={summary.outOfStockCount} icon={XCircle} accentColor="rose" />
      </div>

      {activeTab === "inventory" ? (
        <>
          {/* Controls: Search & Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
              {[
                { key: "all", label: "All Items" },
                { key: "low_stock", label: "Low Stock ⚠️" },
                { key: "out_of_stock", label: "Out of Stock ❌" },
                { key: "in_stock", label: "Adequate Stock ✅" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    filter === key
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-card border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory SKUs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 rounded-xl bg-card border-border/80 text-xs font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Stock Inventory Table */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border/80 uppercase font-bold text-muted-foreground tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Item SKU</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Current Stock</th>
                    <th className="py-3.5 px-4">Min Alert Level</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Stock Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isLoading ? (
                    Array(5)
                      .fill(0)
                      .map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td colSpan={6} className="py-4 px-4 bg-muted/20" />
                        </tr>
                      ))
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No inventory items matching filter.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const isLow =
                        item.stockQuantity > 0 &&
                        item.stockQuantity <= item.minStockLevel;
                      const isOut = item.stockQuantity <= 0;

                      return (
                        <tr
                          key={item._id}
                          className="hover:bg-accent/40 transition-colors"
                        >
                          {/* Item SKU & Image */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted overflow-hidden">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Boxes className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-foreground">
                                  {item.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  Track Inventory: {item.trackInventory ? "Yes" : "No"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4 font-medium text-muted-foreground">
                            {item.category?.name || "General"}
                          </td>

                          {/* Current Stock */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-base font-black font-tabular ${
                                isOut
                                  ? "text-rose-600 dark:text-rose-400"
                                  : isLow
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-foreground"
                              }`}
                            >
                              {item.stockQuantity} {item.unit || "pcs"}
                            </span>
                          </td>

                          {/* Min Alert Level */}
                          <td className="py-3.5 px-4 font-medium text-muted-foreground">
                            {item.minStockLevel} {item.unit || "pcs"}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            <StatusBadge
                              status={
                                isOut
                                  ? "out_of_stock"
                                  : isLow
                                  ? "low_stock"
                                  : "in_stock"
                              }
                              type="inventory"
                            />
                          </td>

                          {/* Quick Adjust Button */}
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              size="sm"
                              onClick={() => handleOpenAdjust(item)}
                              className="h-8 px-3 rounded-xl bg-secondary hover:bg-amber-500 hover:text-white text-secondary-foreground font-bold text-xs shadow-2xs"
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-1" />
                              Adjust Stock
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Inventory Movement Audit Log Table */
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border/80 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-foreground">
              Recent Inventory Stock Movements
            </h3>
            <span className="text-xs text-muted-foreground">
              Showing last {historyLogs.length} logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/80 uppercase font-bold text-muted-foreground tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Movement Type</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Previous → New</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4">Staff</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isHistoryLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td colSpan={7} className="py-4 px-4 bg-muted/20" />
                      </tr>
                    ))
                ) : historyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No stock movement history recorded.
                    </td>
                  </tr>
                ) : (
                  historyLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-accent/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {log.product?.name || "Product"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            log.type === "in"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : log.type === "order"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                              : log.type === "waste"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black font-tabular">
                        <span
                          className={
                            log.quantity > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }
                        >
                          {log.quantity > 0 ? `+${log.quantity}` : log.quantity}{" "}
                          {log.product?.unit || "pcs"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium font-tabular text-muted-foreground">
                        {log.previousStock} →{" "}
                        <span className="font-bold text-foreground">{log.newStock}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {log.reason || "Manual update"}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-medium">
                        {log.staff?.name || "System"}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Dialog */}
      <Dialog
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Adjust Stock: {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <form onSubmit={handleSaveAdjustment} className="space-y-4 py-2">
              <div className="p-3 rounded-xl bg-accent/40 border border-border/80 flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">
                  Current Stock Level:
                </span>
                <span className="text-lg font-black font-tabular text-amber-600 dark:text-amber-400">
                  {selectedProduct.stockQuantity} {selectedProduct.unit || "pcs"}
                </span>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Adjustment Operation
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { key: "in", label: "Add Stock (+)" },
                    { key: "out", label: "Deduct Stock (-)" },
                    { key: "waste", label: "Record Waste (🗑️)" },
                    { key: "adjustment", label: "Set Exact Count" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAdjustType(key as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        adjustType === key
                          ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-100 shadow-xs"
                          : "border-border hover:bg-accent text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {adjustType === "adjustment" ? (
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    New Exact Stock Count
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    required
                    value={newStockLevel}
                    onChange={(e) => setNewStockLevel(Number(e.target.value))}
                    className="rounded-xl mt-1 text-lg font-bold font-tabular"
                  />
                </div>
              ) : (
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Quantity to {adjustType.toUpperCase()}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    required
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                    className="rounded-xl mt-1 text-lg font-bold font-tabular"
                  />
                </div>
              )}

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Minimum Stock Alert Threshold
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={minStockLevel}
                  onChange={(e) => setMinStockLevel(Number(e.target.value))}
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Reason / Audit Log Note *
                </Label>
                <Input
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. New delivery from supplier, Expired milk, Count correction"
                  className="rounded-xl mt-1"
                />
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAdjusting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md"
                >
                  {isAdjusting ? "Updating..." : "Save Stock Adjustment"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
