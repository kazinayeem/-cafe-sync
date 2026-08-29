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
import { Plus, Minus, Check, Coffee } from "lucide-react";

export interface SelectedModifier {
  groupName: string;
  optionName: string;
  price: number;
}

export interface CustomerCartItem {
  id: string; // unique item id in cart
  productId: string;
  name: string;
  imageUrl?: string;
  size: "small" | "large" | "extraLarge";
  unitPrice: number;
  modifiersPrice: number;
  totalPrice: number;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  itemNote: string;
}

interface CustomerProductSheetProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  onAddToCart: (item: CustomerCartItem) => void;
}

export const CustomerProductSheet: React.FC<CustomerProductSheetProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<"small" | "large" | "extraLarge">("small");
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [itemNote, setItemNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      if (product.sizes?.small && product.sizes.small > 0) {
        setSelectedSize("small");
      } else if (product.sizes?.large && product.sizes.large > 0) {
        setSelectedSize("large");
      } else if (product.sizes?.extraLarge && product.sizes.extraLarge > 0) {
        setSelectedSize("extraLarge");
      } else {
        setSelectedSize("small");
      }
      setSelectedModifiers([]);
      setItemNote("");
      setQuantity(1);
    }
  }, [product, isOpen]);

  if (!product) return null;

  const getBasePrice = () => {
    if (selectedSize === "large") return product.sizes?.large || 0;
    if (selectedSize === "extraLarge") return product.sizes?.extraLarge || 0;
    return product.sizes?.small || 0;
  };

  const getModifiersTotal = () => {
    return selectedModifiers.reduce((sum, m) => sum + (m.price || 0), 0);
  };

  const unitPrice = getBasePrice();
  const modifiersPrice = getModifiersTotal();
  const singleItemTotal = unitPrice + modifiersPrice;
  const lineTotalPrice = singleItemTotal * quantity;

  const handleToggleModifier = (groupName: string, optionName: string, price: number, isMulti: boolean) => {
    setSelectedModifiers((prev) => {
      const exists = prev.some(
        (m) => m.groupName === groupName && m.optionName === optionName
      );

      if (exists) {
        return prev.filter(
          (m) => !(m.groupName === groupName && m.optionName === optionName)
        );
      }

      const newMod: SelectedModifier = { groupName, optionName, price };

      if (!isMulti) {
        // Single selection
        const filtered = prev.filter((m) => m.groupName !== groupName);
        return [...filtered, newMod];
      }

      return [...prev, newMod];
    });
  };

  const isOptionSelected = (groupName: string, optionName: string) => {
    return selectedModifiers.some(
      (m) => m.groupName === groupName && m.optionName === optionName
    );
  };

  const handleAdd = () => {
    const itemKey = `${product._id}_${selectedSize}_${selectedModifiers
      .map((m) => `${m.groupName}:${m.optionName}`)
      .sort()
      .join("|")}_${itemNote.trim()}`;

    onAddToCart({
      id: itemKey,
      productId: product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      size: selectedSize,
      unitPrice,
      modifiersPrice,
      totalPrice: lineTotalPrice,
      quantity,
      selectedModifiers,
      itemNote,
    });
    onClose();
  };

  const defaultModifierGroups = [
    {
      name: "Milk Preference",
      maxSelection: 1,
      options: [
        { name: "Whole Milk (Default)", price: 0 },
        { name: "Oat Milk", price: 50 },
        { name: "Almond Milk", price: 60 },
        { name: "Soy Milk", price: 40 },
      ],
    },
    {
      name: "Sweetness / Sugar",
      maxSelection: 1,
      options: [
        { name: "Regular Sugar", price: 0 },
        { name: "Less Sugar (50%)", price: 0 },
        { name: "No Sugar (0%)", price: 0 },
        { name: "Honey", price: 30 },
      ],
    },
    {
      name: "Add-ons & Extras",
      maxSelection: 5,
      options: [
        { name: "Extra Espresso Shot", price: 60 },
        { name: "Vanilla Syrup", price: 40 },
        { name: "Caramel Drizzle", price: 40 },
        { name: "Whipped Cream", price: 50 },
      ],
    },
  ];

  const modifierGroups =
    product.modifierGroups && product.modifierGroups.length > 0
      ? product.modifierGroups
      : defaultModifierGroups;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-5 rounded-3xl border border-border/80 shadow-2xl">
        <DialogHeader className="text-left space-y-2">
          {product.imageUrl ? (
            <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-muted/40 mb-2">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-28 w-full flex items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-2">
              <Coffee className="h-10 w-10" />
            </div>
          )}

          <div>
            <DialogTitle className="text-xl font-black text-foreground">
              {product.name}
            </DialogTitle>
            {product.description && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Size Choice */}
          <div>
            <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-2">
              1. Choose Size
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "small" as const, label: "Regular", price: product.sizes?.small },
                { key: "large" as const, label: "Large", price: product.sizes?.large },
                { key: "extraLarge" as const, label: "Extra Large", price: product.sizes?.extraLarge },
              ].map(({ key, label, price }) => {
                const isAvail = price !== undefined && price > 0;
                const isSelected = selectedSize === key;

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!isAvail}
                    onClick={() => setSelectedSize(key)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-100 font-bold shadow-xs"
                        : isAvail
                        ? "border-border hover:bg-accent text-foreground"
                        : "opacity-40 cursor-not-allowed border-dashed bg-muted/30"
                    }`}
                  >
                    <span className="text-xs font-semibold">{label}</span>
                    <span className="text-sm font-black font-tabular mt-0.5">
                      {isAvail ? `৳${price}` : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modifier Options */}
          {modifierGroups.map((group: any) => {
            const isMulti = group.maxSelection > 1;

            return (
              <div key={group.name || group._id} className="border-t border-border/60 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-black uppercase tracking-wider text-foreground">
                    {group.name}
                  </Label>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {isMulti ? "Select multiple" : "Choose 1"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.options.map((opt: any) => {
                    const selected = isOptionSelected(group.name, opt.name);

                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() =>
                          handleToggleModifier(group.name, opt.name, opt.price, isMulti)
                        }
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all ${
                          selected
                            ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-100 font-bold"
                            : "border-border hover:bg-accent text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                              selected
                                ? "bg-amber-500 border-amber-500 text-white"
                                : "border-border"
                            }`}
                          >
                            {selected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{opt.name}</span>
                        </div>
                        {opt.price > 0 && (
                          <span className="font-tabular font-extrabold text-amber-600 dark:text-amber-400 shrink-0 ml-1">
                            +৳{opt.price}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Kitchen Special Note */}
          <div className="border-t border-border/60 pt-4">
            <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-2">
              Special Instructions
            </Label>
            <Input
              value={itemNote}
              onChange={(e) => setItemNote(e.target.value)}
              placeholder="e.g. Less ice, extra hot, serve in ceramic cup..."
              className="rounded-xl h-10 text-xs"
            />
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Quantity
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-accent font-bold"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-black font-tabular w-8 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-accent font-bold"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 pt-4 flex-row items-center justify-between gap-3 sm:justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">
              Item Price
            </span>
            <p className="text-xl font-black font-tabular text-amber-600 dark:text-amber-400">
              ৳{lineTotalPrice}
            </p>
          </div>

          <Button
            onClick={handleAdd}
            className="h-11 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm shadow-md"
          >
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
