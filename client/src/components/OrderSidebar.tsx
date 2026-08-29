import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  removeItem,
  updateQuantity,
  clearCart,
  setSelectedTable,
  setOrderType,
  setCustomer,
  setDiscountPercent,
  setOrderNote,
} from "@/store/cartSlice";
import { useCreateOrderMutation } from "@/services/orderApi";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useGetTablesQuery } from "@/services/tableService";
import { useGetSettingsQuery } from "@/services/SettingsApi";
import { DiscountDialog } from "./SetDiscount";
import { printReceipt } from "@/utils/printReceipt";
import { CustomerSelectModal } from "./pos/CustomerSelectModal";
import { SplitPaymentModal } from "./pos/SplitPaymentModal";
import {
  User,
  Star,
  Trash2,
  Percent,
  Receipt,
  Utensils,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import Swal from "sweetalert2";

interface OrderSidebarProps {
  disabled?: boolean;
}

export const OrderSidebar: React.FC<OrderSidebarProps> = ({ disabled = false }) => {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);
  const {
    items,
    subtotal,
    totalPrice,
    discountPercent,
    customer,
    selectedTable,
    orderType,
    orderNote,
  } = cart;

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { data: tablesData } = useGetTablesQuery();
  const { data: settingsData } = useGetSettingsQuery({});

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const tables = tablesData?.tables || [];
  const settings = settingsData?.data;
  const taxRate = settings?.taxRate ?? 5;
  const serviceChargeRate = settings?.serviceCharge ?? 0;
  const enableDiscountInput = settings?.enableDiscountInput ?? true;
  const enableLoyalty = settings?.enableLoyalty ?? true;
  const loyaltyRedeemRate = settings?.loyaltyRedeemRate ?? 0.5;

  // Recalculate financial breakdown
  const discountAmount = (subtotal * (discountPercent || 0)) / 100;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = (discountedSubtotal * taxRate) / 100;
  const serviceChargeAmount = (discountedSubtotal * serviceChargeRate) / 100;
  const finalTotal = Number(
    (discountedSubtotal + taxAmount + serviceChargeAmount).toFixed(2)
  );

  const handleCheckoutComplete = async ({
    payments,
    paymentMethod,
    loyaltyPointsUsed,
  }: {
    payments: any[];
    paymentMethod: any;
    loyaltyPointsUsed: number;
  }) => {
    try {
      Swal.fire({
        title: "Submitting Order...",
        text: "Please wait while we record and broadcast the order",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const itemsToPrint = [...items];

      const payload: any = {
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          size: i.size,
          price: i.price,
          selectedModifiers: i.selectedModifiers || [],
          itemNote: i.itemNote || "",
        })),
        orderType,
        orderNote,
        totalPrice: finalTotal,
        discountPercent,
        taxRate,
        serviceChargeRate,
        paymentMethod,
        payments,
        loyaltyPointsUsed,
        customerId: customer?._id || undefined,
        tableId: selectedTable || undefined,
      };

      const res = await createOrder(payload).unwrap();
      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Order Placed Successfully!",
        text: `Order #${res.data?.customOrderID || "Complete"}`,
        timer: 1500,
        showConfirmButton: false,
      });

      // Clear cart
      dispatch(clearCart());

      // Print thermal receipt if print enabled
      if (settings) {
        printReceipt(
          res.data,
          itemsToPrint,
          discountPercent,
          tables,
          selectedTable,
          finalTotal,
          {
            businessName: settings.businessName,
            address: settings.address,
            phone: settings.phone,
            website: settings.website,
            receiptFooter: settings.receiptFooter,
            taxRate: settings.taxRate,
          }
        );
      }
    } catch (err: any) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed to place order",
        text: err?.data?.message || "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="w-full lg:w-96 flex flex-col h-full bg-card border-l border-border/80 text-foreground">
        {/* Header: Order Type & Clear */}
        <div className="p-4 border-b border-border/80 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2">
              <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Active Ticket
            </h2>

            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearCart())}
                className="h-8 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Dine-In vs Takeaway Toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => dispatch(setOrderType("dine_in"))}
              className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                orderType === "dine_in"
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Utensils className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              Dine-In
            </button>
            <button
              type="button"
              onClick={() => dispatch(setOrderType("takeaway"))}
              className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                orderType === "takeaway"
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              Takeaway
            </button>
          </div>

          {/* Customer CRM Selector Pill */}
          <button
            type="button"
            onClick={() => setIsCustomerModalOpen(true)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border/80 hover:bg-accent hover:border-border transition-all text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">
                  {customer ? customer.name : "Walk-in Customer"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {customer
                    ? `${customer.phone} • ${customer.loyaltyPoints} pts`
                    : "Tap to link customer loyalty"}
                </p>
              </div>
            </div>
            {customer && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 shrink-0">
                <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                {customer.loyaltyPoints}
              </span>
            )}
          </button>

          {/* Table Selector (only shown for Dine-In) */}
          {orderType === "dine_in" && (
            <Select
              disabled={disabled}
              value={selectedTable ?? ""}
              onValueChange={(val) => dispatch(setSelectedTable(val || null))}
            >
              <SelectTrigger className="h-9 rounded-xl text-xs font-medium border-border/80">
                <SelectValue placeholder="Assign Table (Optional)" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border/80">
                {tables.map((table) => (
                  <SelectItem
                    key={table._id}
                    value={table._id}
                    disabled={table.status === "occupied"}
                    className="text-xs font-medium"
                  >
                    {table.name} ({table.section || "Main"} • {table.seats} seats • {table.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Order Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[160px]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/80 rounded-2xl bg-muted/20">
              <Receipt className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-bold text-foreground">Ticket is empty</p>
              <p className="text-[11px] text-muted-foreground max-w-[160px] mt-0.5">
                Select items from the menu to start order
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.itemKey}
                className="flex flex-col gap-1.5 p-2.5 rounded-xl border border-border/80 bg-card hover:border-border transition-all shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-foreground truncate">
                        {item.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase shrink-0">
                        {item.size}
                      </span>
                    </div>

                    {/* Modifiers List */}
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.selectedModifiers.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="inline-flex items-center text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 font-medium"
                          >
                            +{m.optionName} {m.price > 0 && `(৳${m.price})`}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Special Kitchen Instruction Note */}
                    {item.itemNote && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium italic mt-0.5 flex items-center gap-1">
                        <Edit3 className="h-2.5 w-2.5" />
                        "{item.itemNote}"
                      </p>
                    )}
                  </div>

                  {/* Line Total Price */}
                  <span className="font-tabular font-extrabold text-xs text-foreground shrink-0">
                    ৳{(item.price + (item.modifiersPrice || 0)) * item.quantity}
                  </span>
                </div>

                {/* Quantity Stepper & Delete */}
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    ৳{item.price + (item.modifiersPrice || 0)} / unit
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        item.quantity > 1
                          ? dispatch(
                              updateQuantity({
                                itemKey: item.itemKey,
                                quantity: item.quantity - 1,
                              })
                            )
                          : dispatch(removeItem({ itemKey: item.itemKey }))
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-card hover:bg-accent text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-extrabold font-tabular">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            itemKey: item.itemKey,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-card hover:bg-accent text-xs font-bold"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch(removeItem({ itemKey: item.itemKey }))}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Financials & Checkout Footer */}
        <div className="p-4 border-t border-border/80 bg-card/60 space-y-3">
          {/* Quick Actions (Discount) */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={!enableDiscountInput || disabled}
              onClick={() => setIsDiscountModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
            >
              <Percent className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              {discountPercent > 0 ? `Discount: ${discountPercent}%` : "Add Discount"}
            </button>

            {discountPercent > 0 && (
              <button
                type="button"
                onClick={() => dispatch(setDiscountPercent(0))}
                className="text-[10px] text-rose-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>

          {/* Breakdown Table */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground font-medium">
              <span>Subtotal</span>
              <span className="font-tabular font-bold text-foreground">
                ৳{subtotal.toFixed(2)}
              </span>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Discount ({discountPercent}%)</span>
                <span className="font-tabular font-bold">
                  -৳{discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {taxRate > 0 && (
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>VAT / Tax ({taxRate}%)</span>
                <span className="font-tabular font-bold text-foreground">
                  ৳{taxAmount.toFixed(2)}
                </span>
              </div>
            )}

            {serviceChargeRate > 0 && (
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Service Charge ({serviceChargeRate}%)</span>
                <span className="font-tabular font-bold text-foreground">
                  ৳{serviceChargeAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-border/80">
              <span className="font-extrabold text-sm text-foreground">
                Total Due
              </span>
              <span className="font-black font-tabular text-2xl text-amber-600 dark:text-amber-400">
                ৳{finalTotal}
              </span>
            </div>
          </div>

          {/* Big Charge Button */}
          <Button
            type="button"
            disabled={items.length === 0 || isLoading || disabled}
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
          >
            <CreditCard className="h-5 w-5" />
            Charge ৳{finalTotal}
          </Button>
        </div>
      </div>

      {/* Customer CRM Selector Modal */}
      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        selectedCustomer={customer}
        onSelectCustomer={(cust) => dispatch(setCustomer(cust))}
      />

      {/* Discount Dialog */}
      <DiscountDialog
        open={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        onApply={(d) => {
          dispatch(setDiscountPercent(d));
          toast.success(`Discount ${d}% applied`);
        }}
      />

      {/* Split Payment Modal */}
      <SplitPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalDue={finalTotal}
        customerLoyaltyPoints={customer?.loyaltyPoints || 0}
        loyaltyRedeemRate={loyaltyRedeemRate}
        onComplete={handleCheckoutComplete}
      />
    </>
  );
};

export default OrderSidebar;
