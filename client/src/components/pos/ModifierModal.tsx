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
import { Product } from "@/services/productApi";
import { SelectedModifier } from "@/store/cartSlice";
import { Plus, Minus, Check, Coffee } from "lucide-react";

interface ModifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (data: {
    size: string;
    price: number;
    selectedModifiers: SelectedModifier[];
    itemNote: string;
    quantity: number;
  }) => void;
}

export const ModifierModal: React.FC<ModifierModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>("small");
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [itemNote, setItemNote] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  // Initialize defaults on product change
  useEffect(() => {
    if (product) {
      // Find first available size
      if (product.sizes?.small !== undefined && product.sizes.small > 0) {
        setSelectedSize("small");
      } else if (product.sizes?.large !== undefined && product.sizes.large > 0) {
        setSelectedSize("large");
      } else if (product.sizes?.extraLarge !== undefined && product.sizes.extraLarge > 0) {
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

  const getUnitPrice = () => getBasePrice() + getModifiersTotal();
  const getTotalPrice = () => getUnitPrice() * quantity;

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

      if (!isMulti) {
        // Single selection group (e.g. Milk choice)
        const filtered = prev.filter((m) => m.groupName !== groupName);
        return [...filtered, { groupName, optionName, price }];
      }

      // Multi selection group (e.g. Extra shots, Syrups)
      return [...prev, { groupName, optionName, price }];
    });
  };

  const isOptionSelected = (groupName: string, optionName: string) => {
    return selectedModifiers.some(
      (m) => m.groupName === groupName && m.optionName === optionName
    );
  };

  const handleConfirm = () => {
    onConfirm({
      size: selectedSize,
      price: getBasePrice(),
      selectedModifiers,
      itemNote,
      quantity,
    });
    onClose();
  };

  // Built-in modifier presets if none assigned in DB
  const defaultModifierGroups = [
    {
      name: "Milk Options",
      maxSelection: 1,
      options: [
        { name: "Whole Milk (Default)", price: 0 },
        { name: "Oat Milk", price: 50 },
        { name: "Almond Milk", price: 60 },
        { name: "Soy Milk", price: 40 },
        { name: "Skimmed Milk", price: 0 },
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
        { name: "Hazelnut Syrup", price: 40 },
      ],
    },
  ];

  const modifierGroups =
    product.modifierGroups && product.modifierGroups.length > 0
      ? product.modifierGroups
      : defaultModifierGroups;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-border/80 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Coffee className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {product.name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize size, modifiers, and kitchen instructions
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-3">
          {/* Size Selector */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2.5">
              Select Size
            </Label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { key: "small", label: "Small / Reg", price: product.sizes?.small },
                { key: "large", label: "Large", price: product.sizes?.large },
                { key: "extraLarge", label: "Extra Large", price: product.sizes?.extraLarge },
              ].map(({ key, label, price }) => {
                const isAvail = price !== undefined && price > 0;
                const isSelected = selectedSize === key;

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!isAvail}
                    onClick={() => setSelectedSize(key)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-100 font-bold shadow-xs"
                        : isAvail
                        ? "border-border hover:border-border/80 hover:bg-accent text-muted-foreground"
                        : "opacity-40 cursor-not-allowed border-dashed bg-muted/30"
                    }`}
                  >
                    <span className="text-xs font-semibold">{label}</span>
                    <span className="text-sm font-extrabold font-tabular mt-0.5">
                      {isAvail ? `৳${price}` : "N/A"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modifier Groups */}
          {modifierGroups.map((group: any) => {
            const isMulti = group.maxSelection > 1;

            return (
              <div key={group.name || group._id} className="border-t border-border/80 pt-4">
                <div className="flex items-center justify-between mb-2.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {group.name}
                  </Label>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {isMulti ? "Select multiple" : "Choose 1"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                            ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-100 font-semibold"
                            : "border-border hover:bg-accent text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
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
                          <span className="font-tabular font-bold text-amber-600 dark:text-amber-400 shrink-0 ml-1">
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
          <div className="border-t border-border/80 pt-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Kitchen Instructions / Special Note
            </Label>
            <Input
              value={itemNote}
              onChange={(e) => setItemNote(e.target.value)}
              placeholder="e.g., Extra hot, Less ice, Serve in mug..."
              className="rounded-xl"
            />
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between border-t border-border/80 pt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quantity
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-accent transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-extrabold font-tabular w-8 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-accent transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/80 pt-4 sm:justify-between gap-3">
          <div className="flex flex-col text-left">
            <span className="text-[11px] text-muted-foreground font-medium">
              Unit: ৳{getUnitPrice()}
            </span>
            <span className="text-xl font-extrabold font-tabular text-amber-600 dark:text-amber-400">
              Total: ৳{getTotalPrice()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 rounded-xl shadow-md"
            >
              Add to Ticket
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
