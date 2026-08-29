import React, { useState } from "react";
import {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useAdjustLoyaltyPointsMutation,
} from "@/services/customerApi";
import type { Customer } from "@/services/customerApi";
import {
  Users,
  Search,
  UserPlus,
  Star,
  Phone,
  Mail,
  DollarSign,
  Receipt,
  Edit2,
  Trash2,
  X,
  History,
  ChevronLeft,
  ChevronRight,
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
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import Swal from "sweetalert2";

export const CustomerManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isAdjustLoyaltyOpen, setIsAdjustLoyaltyOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [pointsDelta, setPointsDelta] = useState<number>(50);
  const [pointsReason, setPointsReason] = useState("");

  const { data: customerResponse, isLoading } = useGetCustomersQuery({
    search,
    page,
    limit: 20,
  });

  const { data: customerDetailResponse } =
    useGetCustomerByIdQuery(selectedCustomerId || "", {
      skip: !selectedCustomerId,
    });

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();
  const [adjustLoyalty, { isLoading: isAdjusting }] = useAdjustLoyaltyPointsMutation();

  const customers: Customer[] = customerResponse?.data || [];
  const pagination = customerResponse?.pagination;

  // Aggregate stats
  const totalCustomers = pagination?.total || customers.length;
  const totalLoyaltyPoints = customers.reduce(
    (sum: number, c: Customer) => sum + (c.loyaltyPoints || 0),
    0
  );
  const totalSpentByCustomers = customers.reduce(
    (sum: number, c: Customer) => sum + (c.totalSpent || 0),
    0
  );

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || "");
    setNotes(c.notes || "");
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      if (editingCustomer) {
        await updateCustomer({
          id: editingCustomer._id,
          data: { name, phone, email, notes },
        }).unwrap();
        Swal.fire({
          icon: "success",
          title: "Customer Updated!",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        await createCustomer({ name, phone, email, notes }).unwrap();
        Swal.fire({
          icon: "success",
          title: "Customer Added!",
          timer: 1200,
          showConfirmButton: false,
        });
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Failed to save customer",
      });
    }
  };

  const handleDeleteCustomer = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await Swal.fire({
      title: "Delete Customer?",
      text: "This customer profile and points ledger will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    });

    if (res.isConfirmed) {
      try {
        await deleteCustomer(id).unwrap();
        if (selectedCustomerId === id) setSelectedCustomerId(null);
        Swal.fire({
          icon: "success",
          title: "Customer Deleted",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err?.data?.message || "Failed to delete customer",
        });
      }
    }
  };

  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !pointsReason) return;

    try {
      await adjustLoyalty({
        id: selectedCustomerId,
        points: pointsDelta,
        reason: pointsReason,
      }).unwrap();

      setIsAdjustLoyaltyOpen(false);
      setPointsReason("");
      Swal.fire({
        icon: "success",
        title: "Points Adjusted!",
        text: `Updated customer loyalty balance by ${pointsDelta > 0 ? `+${pointsDelta}` : pointsDelta} pts`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Failed to adjust points",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Customer CRM & Loyalty Program"
        subtitle="Manage regular guests, point accrual, lifetime purchase value, and reward redemptions"
      >
        <Button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Customer
        </Button>
      </PageHeader>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Registered Guests"
          value={totalCustomers}
          icon={Users}
          accentColor="amber"
        />
        <StatCard
          title="Total Active Loyalty Points"
          value={totalLoyaltyPoints.toLocaleString()}
          icon={Star}
          accentColor="emerald"
        />
        <StatCard
          title="CRM Lifetime Spend"
          value={`৳${totalSpentByCustomers.toLocaleString()}`}
          icon={DollarSign}
          accentColor="slate"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name, mobile phone number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-background border-border/80 text-xs font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/80 uppercase font-bold text-muted-foreground tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Loyalty Points</th>
                <th className="py-3.5 px-4">Orders & Lifetime Spend</th>
                <th className="py-3.5 px-4">Last Order</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
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
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8">
                    <EmptyState
                      icon={Users}
                      title="No Customers Found"
                      description="Add your first customer to start tracking loyalty points and order history."
                      actionLabel="+ Add Customer"
                      onAction={handleOpenAdd}
                    />
                  </td>
                </tr>
              ) : (
                customers.map((customer: Customer) => (
                  <tr
                    key={customer._id}
                    onClick={() => setSelectedCustomerId(customer._id)}
                    className="hover:bg-accent/40 cursor-pointer transition-colors"
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                          {customer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">
                            {customer.name}
                          </p>
                          {customer.notes && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {customer.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 font-medium text-muted-foreground">
                      <p className="flex items-center gap-1.5 text-foreground font-semibold">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {customer.phone}
                      </p>
                      {customer.email && (
                        <p className="flex items-center gap-1.5 text-[11px]">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {customer.email}
                        </p>
                      )}
                    </td>

                    {/* Points */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        {customer.loyaltyPoints || 0} pts
                      </span>
                    </td>

                    {/* Orders & Spend */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground">
                        {customer.totalOrders || 0} orders
                      </p>
                      <p className="font-tabular text-amber-600 dark:text-amber-400 font-extrabold text-[11px]">
                        ৳{(customer.totalSpent || 0).toLocaleString()}
                      </p>
                    </td>

                    {/* Last Visit */}
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {customer.lastVisit
                        ? new Date(customer.lastVisit).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Never"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleOpenEdit(customer, e)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit Customer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleDeleteCustomer(customer._id, e)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete Customer"
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-3 border-t border-border/80 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
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

      {/* Customer Profile & History Drawer */}
      <Drawer
        open={Boolean(selectedCustomerId)}
        onOpenChange={(open) => !open && setSelectedCustomerId(null)}
      >
        <DrawerContent className="max-w-2xl mx-auto h-[85vh] p-6 bg-card rounded-t-3xl border-t border-border/80 flex flex-col">
          {customerDetailResponse?.data && (
            <>
              <DrawerHeader className="p-0 pb-4 border-b border-border/80 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-lg">
                    {customerDetailResponse.data.customer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <DrawerTitle className="text-xl font-extrabold text-foreground">
                      {customerDetailResponse.data.customer.name}
                    </DrawerTitle>
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-0.5">
                      <span>{customerDetailResponse.data.customer.phone}</span>
                      {customerDetailResponse.data.customer.email && (
                        <span>• {customerDetailResponse.data.customer.email}</span>
                      )}
                    </p>
                  </div>
                </div>

                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto py-4 space-y-6">
                {/* Stats Header */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-accent/40 border border-border/80">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Loyalty Balance
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="text-xl font-black font-tabular text-amber-600 dark:text-amber-400">
                        {customerDetailResponse.data.customer.loyaltyPoints || 0}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Total Orders
                    </span>
                    <p className="text-xl font-black font-tabular text-foreground mt-0.5">
                      {customerDetailResponse.data.customer.totalOrders || 0}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Lifetime Spend
                    </span>
                    <p className="text-xl font-black font-tabular text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ৳{customerDetailResponse.data.customer.totalSpent || 0}
                    </p>
                  </div>
                </div>

                {/* Adjust Points Quick Button */}
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => setIsAdjustLoyaltyOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs"
                  >
                    <Star className="h-3.5 w-3.5 mr-1 fill-white" />
                    Adjust Loyalty Points
                  </Button>
                </div>

                {/* Recent Orders History */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Receipt className="h-4 w-4" />
                    Recent Purchase History
                  </h4>
                  <div className="space-y-2">
                    {customerDetailResponse.data.orders.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No orders recorded yet.
                      </p>
                    ) : (
                      customerDetailResponse.data.orders.map((ord: any) => (
                        <div
                          key={ord._id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card text-xs"
                        >
                          <div>
                            <p className="font-bold text-foreground">
                              #{ord.customOrderID || ord._id.slice(-6)}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {new Date(ord.createdAt).toLocaleString()} •{" "}
                              {ord.items?.length || 0} items
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-sm font-tabular text-amber-600 dark:text-amber-400">
                              ৳{ord.totalPrice}
                            </span>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">
                              {ord.paymentMethod}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Loyalty Point History Ledger */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <History className="h-4 w-4" />
                    Loyalty Points Audit Ledger
                  </h4>
                  <div className="space-y-1.5">
                    {customerDetailResponse.data.loyaltyHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No point transactions yet.
                      </p>
                    ) : (
                      customerDetailResponse.data.loyaltyHistory.map((tx: any) => (
                        <div
                          key={tx._id}
                          className="flex items-center justify-between p-2.5 rounded-xl border bg-muted/20 text-xs"
                        >
                          <div>
                            <p className="font-bold text-foreground capitalize">
                              {tx.type} • {tx.reason || "Order Accrual"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleString()} •{" "}
                              {tx.staff?.name || "System"}
                            </p>
                          </div>
                          <span
                            className={`font-black font-tabular text-sm ${
                              tx.points >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {tx.points >= 0 ? `+${tx.points}` : tx.points} pts
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Add / Edit Customer Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingCustomer ? "Edit Customer Profile" : "Register New Customer"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCustomer} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Full Name *
              </Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Henderson"
                className="rounded-xl mt-1 font-semibold"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Mobile Phone Number *
              </Label>
              <Input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01712345678"
                className="rounded-xl mt-1 font-semibold font-tabular"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email Address (Optional)
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@gmail.com"
                className="rounded-xl mt-1 font-medium"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Customer Notes / Preferences
              </Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Regular oat milk latte drinker, likes window seat"
                className="rounded-xl mt-1"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md"
              >
                {editingCustomer ? "Save Changes" : "Create Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Loyalty Points Modal */}
      <Dialog open={isAdjustLoyaltyOpen} onOpenChange={setIsAdjustLoyaltyOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              Adjust Customer Points
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAdjustPointsSubmit} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Points Adjustment (+ to add, - to deduct) *
              </Label>
              <Input
                type="number"
                required
                value={pointsDelta}
                onChange={(e) => setPointsDelta(Number(e.target.value))}
                placeholder="50"
                className="rounded-xl mt-1 text-2xl font-black font-tabular"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Reason / Audit Note *
              </Label>
              <Input
                required
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                placeholder="e.g. Birthday reward, Service apology, Promo bonus"
                className="rounded-xl mt-1"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdjustLoyaltyOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdjusting}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md"
              >
                Confirm Point Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
