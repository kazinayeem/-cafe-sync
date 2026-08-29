import React, { useState } from "react";
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
import { Trash2, ShoppingBag, Plus, Minus, Coffee, Sparkles } from "lucide-react";
import type { CustomerCartItem } from "./CustomerProductSheet";

interface CustomerCartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CustomerCartItem[];
  table: { name: string; section?: string };
  business: { taxRate?: number; serviceCharge?: number };
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onSubmitOrder: (data: {
    guestName: string;
    guestPhone: string;
    orderNote: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const CustomerCartSheet: React.FC<CustomerCartSheetProps> = ({
  isOpen,
  onClose,
  items,
  table,
  business,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
  isSubmitting,
}) => {
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = business.taxRate ?? 5;
  const serviceChargeRate = business.serviceCharge ?? 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const serviceChargeAmount = (subtotal * serviceChargeRate) / 100;
  const finalTotal = Number((subtotal + taxAmount + serviceChargeAmount).toFixed(2));

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;

    await onSubmitOrder({
      guestName: guestName.trim() || "Guest Customer",
      guestPhone: guestPhone.trim(),
      orderNote: orderNote.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[92vh] overflow-y-auto p-5 rounded-3xl border border-border/80 shadow-2xl flex flex-col justify-between">
        <div>
          <DialogHeader className="border-b border-border/60 pb-3 flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-foreground">
                  Your Order Cart
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground font-semibold">
                  {table.name} {table.section ? `• ${table.section}` : ""}
                </p>
              </div>
            </div>

            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearCart}
                className="h-8 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Clear
              </Button>
            )}
          </DialogHeader>

          {/* Cart Items List */}
          <div className="py-3 space-y-2.5">
            {items.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="text-sm font-bold text-foreground">Cart is empty</p>
                <p className="text-xs text-muted-foreground">
                  Browse the menu and add items to place your order.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl border border-border/80 bg-card space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-10 w-10 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0">
                          <Coffee className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-foreground truncate">
                            {item.name}
                          </p>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-muted text-muted-foreground">
                            {item.size}
                          </span>
                        </div>

                        {/* Modifiers List */}
                        {item.selectedModifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.selectedModifiers.map((m, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 font-medium"
                              >
                                +{m.optionName} {m.price > 0 && `(৳${m.price})`}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Note */}
                        {item.itemNote && (
                          <p className="text-[10px] text-amber-700 dark:text-amber-400 italic mt-0.5">
                            "{item.itemNote}"
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="font-black font-tabular text-sm text-foreground shrink-0">
                      ৳{item.totalPrice}
                    </span>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                    <span className="text-[11px] text-muted-foreground font-semibold">
                      ৳{item.unitPrice + item.modifiersPrice} each
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-accent font-bold"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center font-black font-tabular">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-accent font-bold"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Guest Info (Optional) */}
          {items.length > 0 && (
            <div className="border-t border-border/60 pt-3 space-y-2.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Customer Info (Optional)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground">
                    Your Name
                  </Label>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="rounded-xl h-9 text-xs mt-0.5"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground">
                    Mobile Phone
                  </Label>
                  <Input
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="01712345678"
                    className="rounded-xl h-9 text-xs mt-0.5 font-tabular"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-bold text-muted-foreground">
                  Order Note / Request
                </Label>
                <Input
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="e.g. Please bring water glasses"
                  className="rounded-xl h-9 text-xs mt-0.5"
                />
              </div>
            </div>
          )}
        </div>

        {/* Breakdown & Submit Button */}
        {items.length > 0 && (
          <DialogFooter className="border-t border-border/60 pt-3 space-y-2 sm:space-y-0 sm:flex-col">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground font-semibold">
                <span>Subtotal</span>
                <span className="font-bold text-foreground font-tabular">
                  ৳{subtotal.toFixed(2)}
                </span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-muted-foreground font-semibold">
                  <span>VAT / Tax ({taxRate}%)</span>
                  <span className="font-bold font-tabular">
                    +৳{taxAmount.toFixed(2)}
                  </span>
                </div>
              )}
              {serviceChargeRate > 0 && (
                <div className="flex justify-between text-muted-foreground font-semibold">
                  <span>Service Charge ({serviceChargeRate}%)</span>
                  <span className="font-bold font-tabular">
                    +৳{serviceChargeAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-1.5 border-t border-border/40 font-black">
                <span className="text-sm">Total Due</span>
                <span className="text-xl font-tabular text-amber-600 dark:text-amber-400">
                  ৳{finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                "Submitting Order..."
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Place Order — ৳{finalTotal.toFixed(2)}
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
