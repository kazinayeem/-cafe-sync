import React, { useState, useEffect } from "react";
import {
  useGetOrdersQuery,
  useUpdateOrderMutation,
  useRefundOrderMutation,
  useDeleteOrderMutation,
} from "@/services/orderApi";
import type { Order } from "@/services/orderApi";
import { socket } from "@/utils/socket";
import {
  Search,
  RotateCcw,
  Printer,
  Download,
  Trash2,
  ShoppingBag,
  Utensils,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
  Edit3,
  Clock,
  Eye,
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useGetSettingsQuery } from "@/services/SettingsApi";
import { useGetTablesQuery } from "@/services/tableService";
import { printReceipt, downloadReceiptPDF } from "@/utils/printReceipt";
import Swal from "sweetalert2";

export const OrderList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundOrderTarget, setRefundOrderTarget] = useState<Order | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState("");

  const {
    data: ordersResponse,
    isLoading,
    refetch,
  } = useGetOrdersQuery({
    page,
    limit: 15,
    status: statusFilter,
    paymentStatus: paymentStatusFilter,
    startDate,
    endDate,
    orderId: searchOrderId,
  });

  const { data: settingsData } = useGetSettingsQuery({});
  const { data: tablesData } = useGetTablesQuery();
  const [updateOrder] = useUpdateOrderMutation();
  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  useEffect(() => {
    socket.on("newOrder", () => refetch());
    socket.on("orderStatusUpdated", () => refetch());

    return () => {
      socket.off("newOrder");
      socket.off("orderStatusUpdated");
    };
  }, [refetch]);

  const orders = ordersResponse?.data || [];
  const pagination = ordersResponse?.pagination;
  const settings = settingsData?.data;
  const tables = tablesData?.tables || [];

  const handleOpenRefund = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    setRefundOrderTarget(order);
    setRefundAmount(order.totalPrice);
    setRefundReason("");
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderTarget || refundAmount <= 0 || !refundReason) return;

    try {
      await refundOrder({
        id: refundOrderTarget._id,
        amount: refundAmount,
        reason: refundReason,
      }).unwrap();

      setRefundOrderTarget(null);
      Swal.fire({
        icon: "success",
        title: "Refund Processed!",
        text: `Refund of ৳${refundAmount} recorded.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Refund Failed",
        text: err?.data?.message || "Something went wrong",
      });
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder({
        id: orderId,
        data: { status: newStatus as any },
      }).unwrap();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDelete = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await Swal.fire({
      title: "Cancel & Delete Order?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    });

    if (res.isConfirmed) {
      try {
        await deleteOrder(orderId).unwrap();
        if (selectedOrder?._id === orderId) setSelectedOrder(null);
        Swal.fire({ icon: "success", title: "Order Deleted", timer: 1000, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: "error", title: "Failed to delete" });
      }
    }
  };

  const handlePrint = (order: Order) => {
    printReceipt(
      order,
      settings || {
        businessName: "Cafe Sync",
        address: "Specialty Coffee House",
        phone: "+880 1700-000000",
        website: "https://cafe-sync.vercel.app",
        receiptFooter: "Thank you for your visit! Enjoy your coffee.",
        taxRate: 0,
        currency: "BDT",
      },
      tables
    );
  };

  const handleDownloadPDF = (order: Order) => {
    downloadReceiptPDF(
      order,
      settings || {
        businessName: "Cafe Sync",
        address: "Specialty Coffee House",
        phone: "+880 1700-000000",
        website: "https://cafe-sync.vercel.app",
        receiptFooter: "Thank you for your visit! Enjoy your coffee.",
        taxRate: 0,
        currency: "BDT",
      },
      tables
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Orders & Sales"
        subtitle="Manage orders, payments, refunds, and customer history."
      />

      {/* Multi-Filter Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Order ID Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Order ID / Token..."
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="pl-9 h-9 rounded-xl text-xs font-semibold"
            />
          </div>

          {/* Prep Status Filter */}
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
            <SelectTrigger className="h-9 rounded-xl text-xs font-semibold">
              <SelectValue placeholder="Preparation Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Prep Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="served">Served / Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Status Filter */}
          <Select
            value={paymentStatusFilter}
            onValueChange={(val) => setPaymentStatusFilter(val)}
          >
            <SelectTrigger className="h-9 rounded-xl text-xs font-semibold">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Payment Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 rounded-xl text-xs"
              placeholder="Start"
            />
            <span className="text-muted-foreground text-xs font-bold">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 rounded-xl text-xs"
              placeholder="End"
            />
          </div>
        </div>
      </div>

      {/* Orders View */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/80 font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Type / Table</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Prep Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No orders matching your criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-accent/40 cursor-pointer transition-colors"
                  >
                    {/* Order ID & Source */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-foreground">
                          #{order.orderToken ? `${order.orderToken}` : order.customOrderID?.slice(-6)}
                        </span>
                        {order.source === "qr" ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                            QR
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            POS
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {order.customOrderID}
                      </p>
                    </td>

                    {/* Type / Table */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-foreground">
                        {order.orderType === "takeaway" ? (
                          <ShoppingBag className="h-3.5 w-3.5 text-purple-600" />
                        ) : (
                          <Utensils className="h-3.5 w-3.5 text-amber-600" />
                        )}
                        {order.orderType === "takeaway"
                          ? "Takeaway"
                          : order.table
                          ? (order.table as any).name
                          : "Dine-In"}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 text-muted-foreground font-medium">
                      {order.customer ? (
                        <span className="font-bold text-foreground">
                          {order.customer.name}
                        </span>
                      ) : order.guestName ? (
                        <span className="font-bold text-foreground">
                          {order.guestName}
                        </span>
                      ) : (
                        "Walk-in Guest"
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} type="order" />
                    </td>

                    {/* Payment Status & Method */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <StatusBadge
                        status={order.paymentStatus || "paid"}
                        type="payment"
                      />
                      <p className="text-[10px] uppercase font-bold text-muted-foreground pl-1">
                        {order.paymentMethod}
                      </p>
                    </td>

                    {/* Total Price */}
                    <td className="py-3.5 px-4 font-black font-tabular text-sm text-foreground">
                      ৳{order.totalPrice}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-muted-foreground font-medium">
                      {new Date(order.createdAt).toLocaleDateString()} •{" "}
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrint(order);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Print Receipt"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>

                        {order.paymentStatus !== "refunded" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => handleOpenRefund(order, e)}
                            className="h-8 w-8 text-muted-foreground hover:text-amber-600"
                            title="Refund Order"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleDelete(order._id, e)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Cancel Order"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile / Tablet Order Cards View */}
        <div className="md:hidden divide-y divide-border/60">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              No orders matching your criteria.
            </div>
          ) : (
            orders.map((order) => {
              const orderNumber = order.orderToken
                ? `#${order.orderToken}`
                : `#${order.customOrderID?.slice(-6) || "0000"}`;
              const tableName =
                order.orderType === "takeaway"
                  ? "Takeaway 🛍️"
                  : (order.table as any)?.name || "Dine-In 🍽️";
              const customerName =
                order.customer?.name || order.guestName || "Walk-in Guest";

              return (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className="p-4 space-y-3 hover:bg-accent/40 active:bg-accent/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-foreground">
                          {orderNumber}
                        </span>
                        {order.source === "qr" ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-500/15 text-purple-700 dark:text-purple-300">
                            QR
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600">
                            POS
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                        {tableName} • {customerName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black font-tabular text-amber-600 dark:text-amber-400">
                        ৳{order.totalPrice}
                      </span>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={order.status} type="order" />
                      <StatusBadge status={order.paymentStatus || "paid"} type="payment" />
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      className="h-7 px-2.5 rounded-lg text-xs font-bold text-amber-600"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-3 border-t border-border/80 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 rounded-lg text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 rounded-lg text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Drawer / Modal */}
      <Drawer
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DrawerContent className="max-w-2xl mx-auto h-[85vh] p-6 bg-card rounded-t-3xl border-t border-border/80 flex flex-col">
          {selectedOrder && (
            <>
              <DrawerHeader className="p-0 pb-4 border-b border-border/80 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <DrawerTitle className="text-xl font-black text-foreground">
                      Order #{selectedOrder.orderToken || selectedOrder.customOrderID || selectedOrder._id.slice(-6)}
                    </DrawerTitle>
                    <StatusBadge status={selectedOrder.status} type="order" />
                    <StatusBadge
                      status={selectedOrder.paymentStatus || "paid"}
                      type="payment"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Placed: {new Date(selectedOrder.createdAt).toLocaleString()} •{" "}
                    Cashier: {selectedOrder.cashier?.name || "Staff"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadPDF(selectedOrder)}
                    className="h-8 rounded-xl text-xs font-bold border-border hover:bg-accent flex items-center gap-1"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-600" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handlePrint(selectedOrder)}
                    className="h-8 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-xs flex items-center gap-1"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print Receipt
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto py-4 space-y-5">
                {/* Live Preparation Timeline */}
                <div className="p-4 rounded-2xl bg-accent/40 border border-border/80 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    Order Lifecycle Timeline
                  </h4>

                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-black">
                    <div
                      className={`p-2 rounded-xl border ${
                        ["pending", "preparing", "ready", "served"].includes(selectedOrder.status)
                          ? "bg-emerald-500 text-white border-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      ✓ Placed
                    </div>
                    <div
                      className={`p-2 rounded-xl border ${
                        ["preparing", "ready", "served"].includes(selectedOrder.status)
                          ? "bg-amber-500 text-white border-amber-600 animate-pulse"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      ● Preparing
                    </div>
                    <div
                      className={`p-2 rounded-xl border ${
                        ["ready", "served"].includes(selectedOrder.status)
                          ? "bg-emerald-500 text-white border-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      ○ Ready
                    </div>
                    <div
                      className={`p-2 rounded-xl border ${
                        selectedOrder.status === "served"
                          ? "bg-slate-700 text-white border-slate-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      ○ Completed
                    </div>
                  </div>
                </div>

                {/* Status Quick Advancement Toolbar */}
                <div className="p-3.5 rounded-2xl bg-card border border-border/80 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    Update Prep Status:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {["pending", "preparing", "ready", "served", "cancelled"].map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(selectedOrder._id, st)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold capitalize transition-all ${
                            selectedOrder.status === st
                              ? "bg-amber-500 text-white shadow-xs"
                              : "bg-card border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                    Order Items Breakdown
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between p-3 rounded-xl border border-border/80 bg-card text-xs"
                      >
                        <div>
                          <p className="font-extrabold text-sm text-foreground">
                            <span className="text-amber-600 mr-1.5 font-black">
                              {item.quantity}x
                            </span>
                            {item.name || (item.product as any)?.name || "Item"}
                          </p>
                          <span className="text-[11px] font-bold text-muted-foreground uppercase">
                            Size: {item.size} • ৳{item.price} base
                          </span>

                          {/* Modifiers */}
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedModifiers.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300"
                                >
                                  +{m.optionName} {m.price > 0 && `(৳${m.price})`}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.itemNote && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold italic mt-0.5 flex items-center gap-1">
                              <Edit3 className="h-2.5 w-2.5" />
                              "{item.itemNote}"
                            </p>
                          )}
                        </div>

                        <span className="font-black font-tabular text-sm text-foreground">
                          ৳{(item.price + (item.modifiersPrice || 0)) * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Split Payments & Refunds Section */}
                {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5" />
                      Payment Tenders
                    </h4>
                    <div className="space-y-1.5">
                      {selectedOrder.payments.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-center justify-between p-2.5 rounded-xl border bg-muted/20 text-xs"
                        >
                          <span className="font-bold uppercase">{p.method}</span>
                          <span className="font-black font-tabular">
                            ৳{p.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financial Summary */}
                <div className="p-4 rounded-2xl bg-accent/40 border border-border/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold text-foreground">
                      ৳{selectedOrder.subtotal || selectedOrder.totalPrice}
                    </span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount ({selectedOrder.discountPercent}%)</span>
                      <span className="font-bold">
                        -৳{selectedOrder.discountAmount}
                      </span>
                    </div>
                  )}
                  {selectedOrder.taxAmount > 0 && (
                    <div className="flex justify-between text-muted-foreground font-medium">
                      <span>VAT / Tax ({selectedOrder.taxRate}%)</span>
                      <span className="font-bold text-foreground">
                        ৳{selectedOrder.taxAmount}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t font-black text-sm">
                    <span>Final Total</span>
                    <span className="text-xl font-tabular text-amber-600 dark:text-amber-400">
                      ৳{selectedOrder.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Refund Processing Modal */}
      <Dialog
        open={Boolean(refundOrderTarget)}
        onOpenChange={(open) => !open && setRefundOrderTarget(null)}
      >
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-amber-600" />
              Process Refund
            </DialogTitle>
          </DialogHeader>

          {refundOrderTarget && (
            <form onSubmit={handleProcessRefund} className="space-y-4 py-2">
              <div className="p-3 rounded-xl bg-accent/40 border border-border/80 flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground">
                  Order Balance:
                </span>
                <span className="text-lg font-black font-tabular text-foreground">
                  ৳{refundOrderTarget.totalPrice}
                </span>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Refund Amount (৳) *
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={refundOrderTarget.totalPrice}
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="rounded-xl mt-1 text-xl font-black font-tabular"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Reason for Refund *
                </Label>
                <Input
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Customer cancelled, Wrong drink made, Spillage"
                  className="rounded-xl mt-1"
                />
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRefundOrderTarget(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isRefunding}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
                >
                  {isRefunding ? "Processing..." : "Confirm Refund"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderList;
