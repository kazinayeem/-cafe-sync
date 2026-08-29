import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  removeFromCart,
  updateItemQuantity,
  clearCart,
  setSelectedTable,
  setOrderType,
  setSelectedCustomer,
  setDiscountPercent,
} from "@/store/cartSlice";
import { useCreateOrderMutation } from "@/services/orderApi";
import { Button } from "@/components/ui/button";
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
import { OrderSuccessDialog } from "./pos/OrderSuccessDialog";
import {
  User,
  Star,
  Trash2,
  Percent,
  Receipt,
  Utensils,
  ShoppingBag,
  CreditCard,
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
    discountPercent,
    selectedCustomer,
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
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tables = tablesData?.tables || [];
  const settings = settingsData?.data;
  const taxRate = settings?.taxRate ?? 5;
  const serviceChargeRate = settings?.serviceCharge ?? 0;
  const enableDiscountInput = settings?.enableDiscountInput ?? true;
  const loyaltyRedeemRate = settings?.loyaltyRedeemRate ?? 0.5;

  // Calculate subtotal from cart items
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

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
    if (isSubmitting || isLoading || items.length === 0) return;

    setIsSubmitting(true);
    const itemsToPrint = [...items];

    try {
      const payload: any = {
        items: items.map((i) => ({
          productId: i.product._id,
          name: i.product.name,
          quantity: i.quantity,
          size: i.size,
          price: i.unitPrice,
          selectedModifiers: (i.selectedModifiers || []).map((m) => ({
            groupName: m.groupName,
            optionName: m.optionName,
            price: m.price,
          })),
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
        customerId: selectedCustomer?._id || undefined,
        tableId: selectedTable || undefined,
      };

      const res = await createOrder(payload).unwrap();

      // Close payment modal
      setIsPaymentModalOpen(false);

      // Save created order & open confirmation dialog
      const orderData = res.data;
      setCreatedOrder(orderData);
      setIsSuccessDialogOpen(true);

      // Clear cart ONLY upon confirmed success
      dispatch(clearCart());

      // Print thermal receipt if print enabled
      if (settings) {
        printReceipt(
          orderData,
          itemsToPrint,
          discountPercent,
          tables,
          selectedTable,
          finalTotal,
          {
            businessName: settings.businessName || "Cafe Sync",
            address: settings.address || "",
            phone: settings.phone || "",
            website: settings.website || "",
            receiptFooter: settings.receiptFooter || "",
            taxRate: settings.taxRate || 0,
          }
        );
      }
    } catch (err: any) {
      setIsPaymentModalOpen(false);
      Swal.fire({
        icon: "error",
        title: "Couldn't place order",
        text:
          err?.data?.message ||
          err?.message ||
          "Something went wrong while submitting the order. Your cart items are preserved. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintCurrentReceipt = () => {
    if (!createdOrder) return;
    if (settings) {
      printReceipt(
        createdOrder,
        createdOrder.items || [],
        createdOrder.discountPercent || 0,
        tables,
        createdOrder.table?._id || createdOrder.table,
        createdOrder.totalPrice,
        {
          businessName: settings.businessName || "Cafe Sync",
          address: settings.address || "",
          phone: settings.phone || "",
          website: settings.website || "",
          receiptFooter: settings.receiptFooter || "",
          taxRate: settings.taxRate || 0,
        }
      );
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
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                orderType === "dine_in"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Utensils className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              Dine-In
            </button>
            <button
              type="button"
              onClick={() => dispatch(setOrderType("takeaway"))}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                orderType === "takeaway"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              Takeaway
            </button>
          </div>

          {/* Table Selector (if Dine-In) */}
          {orderType === "dine_in" && (
            <div className="space-y-1">
              <Select
                value={selectedTable || ""}
                onValueChange={(val) =>
                  dispatch(setSelectedTable(val === "unassigned" ? null : val))
                }
              >
                <SelectTrigger className="h-9 rounded-xl bg-card border-border/80 text-xs font-semibold">
                  <SelectValue placeholder="Select Table (Optional)" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="unassigned">No Table Assigned</SelectItem>
                  {tables.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name} ({t.seats} seats • {t.section})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Attached Customer Pill */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-accent/40 border border-border/60">
            {selectedCustomer ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 font-bold text-xs">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate">
                      {selectedCustomer.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                      {selectedCustomer.loyaltyPoints || 0} Loyalty Pts
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dispatch(setSelectedCustomer(null))}
                  className="h-6 px-2 text-[10px] font-bold text-muted-foreground hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="flex items-center justify-between w-full text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  Attach Customer CRM
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 underline">
                  Select +
                </span>
              </button>
            )}
          </div>
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
                        {item.product.name}
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
                    ৳{item.totalPrice}
                  </span>
                </div>

                {/* Quantity Stepper & Delete */}
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    ৳{item.unitPrice} / unit
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        item.quantity > 1
                          ? dispatch(
                              updateItemQuantity({
                                itemKey: item.itemKey,
                                quantity: item.quantity - 1,
                              })
                            )
                          : dispatch(removeFromCart({ itemKey: item.itemKey }))
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
                          updateItemQuantity({
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
                      onClick={() => dispatch(removeFromCart({ itemKey: item.itemKey }))}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Financial Breakdown */}
        <div className="p-4 border-t border-border/80 bg-accent/20 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground font-medium">
              <span>Subtotal</span>
              <span className="font-bold text-foreground font-tabular">
                ৳{subtotal.toFixed(2)}
              </span>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Discount ({discountPercent}%)</span>
                <span className="font-bold font-tabular">
                  -৳{discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {taxRate > 0 && (
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>VAT / Tax ({taxRate}%)</span>
                <span className="font-bold text-foreground font-tabular">
                  +৳{taxAmount.toFixed(2)}
                </span>
              </div>
            )}

            {serviceChargeRate > 0 && (
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Service Charge ({serviceChargeRate}%)</span>
                <span className="font-bold text-foreground font-tabular">
                  +৳{serviceChargeAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-border/60 font-black">
              <span className="text-sm">Total Due</span>
              <span className="text-2xl font-tabular text-amber-600 dark:text-amber-400">
                ৳{finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {enableDiscountInput && (
              <Button
                variant="outline"
                size="sm"
                disabled={items.length === 0 || disabled}
                onClick={() => setIsDiscountModalOpen(true)}
                className="w-full h-8 rounded-xl border-border/80 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Percent className="h-3.5 w-3.5 text-amber-600" />
                {discountPercent > 0
                  ? `Discount Applied (${discountPercent}%)`
                  : "Apply Order Discount"}
              </Button>
            )}

            {/* Big Primary Payment Button */}
            <Button
              disabled={items.length === 0 || disabled || isLoading}
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm shadow-md shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Pay & Complete ৳{finalTotal.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Select Modal */}
      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={(cust) => dispatch(setSelectedCustomer(cust))}
      />

      {/* Discount Modal */}
      <DiscountDialog
        open={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        onApply={(d: number) => dispatch(setDiscountPercent(d))}
      />

      {/* Split Payment Dialog */}
      <SplitPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalDue={finalTotal}
        customerLoyaltyPoints={selectedCustomer?.loyaltyPoints || 0}
        loyaltyRedeemRate={loyaltyRedeemRate}
        isSubmitting={isSubmitting}
        onComplete={handleCheckoutComplete}
      />

      {/* Order Success Confirmation Dialog */}
      <OrderSuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => {
          setIsSuccessDialogOpen(false);
          setCreatedOrder(null);
        }}
        order={createdOrder}
        onPrintReceipt={handlePrintCurrentReceipt}
      />
    </>
  );
};

export default OrderSidebar;
