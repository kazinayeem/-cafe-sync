import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { Sliders, Coffee } from "lucide-react";
import { ModifierModal } from "./pos/ModifierModal";
import type { Product } from "@/services/productApi";

interface ProductCardProps {
  product: Product;
  disabled?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, disabled = false }) => {
  const dispatch = useDispatch();
  const [isModifierOpen, setIsModifierOpen] = useState(false);

  const isAvailable =
    product.available &&
    (!product.trackInventory || product.stockQuantity > 0);

  const isLowStock =
    product.trackInventory &&
    product.stockQuantity > 0 &&
    product.stockQuantity <= product.minStockLevel;

  const handleDirectAdd = (e: React.MouseEvent, sizeKey: "small" | "large" | "extraLarge") => {
    e.stopPropagation();
    if (!isAvailable || disabled) return;

    dispatch(
      addToCart({
        product,
        size: sizeKey,
        quantity: 1,
      })
    );
  };

  const handleCardClick = () => {
    if (!isAvailable || disabled) return;
    setIsModifierOpen(true);
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer ${
          !isAvailable || disabled
            ? "opacity-50 grayscale cursor-not-allowed bg-muted/20 border-dashed"
            : "bg-card hover:border-amber-500/60 hover:shadow-md active:scale-[0.98]"
        }`}
      >
        {/* Product Image Banner */}
        <div className="relative h-32 w-full overflow-hidden bg-muted/40 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Coffee className="h-6 w-6" />
            </div>
          )}

          {/* Stock Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {!isAvailable ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs">
                Low: {product.stockQuantity} {product.unit || "pcs"}
              </span>
            ) : null}
          </div>

          {/* Modifier indicator */}
          {product.modifierGroups && product.modifierGroups.length > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white">
              <Sliders className="h-3 w-3" />
              Customize
            </div>
          )}
        </div>

        {/* Info & Size Buttons */}
        <CardContent className="p-3.5 space-y-2.5">
          <div>
            <h3 className="font-extrabold text-sm text-foreground line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                {product.description}
              </p>
            )}
          </div>

          {/* Direct Size Add Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {(["small", "large", "extraLarge"] as const).map((sizeKey) => {
              const price = product.sizes?.[sizeKey];
              const isSizeAvail = price !== undefined && price > 0;
              const label = sizeKey === "small" ? "Reg" : sizeKey === "large" ? "Lrg" : "XL";

              if (!isSizeAvail) {
                return (
                  <div
                    key={sizeKey}
                    className="h-8 rounded-xl border border-dashed border-border/40 flex items-center justify-center text-[10px] text-muted-foreground/40 font-medium"
                  >
                    —
                  </div>
                );
              }

              return (
                <Button
                  key={sizeKey}
                  size="sm"
                  type="button"
                  disabled={!isAvailable || disabled}
                  onClick={(e) => handleDirectAdd(e, sizeKey)}
                  className="h-8 px-1 rounded-xl bg-accent/60 hover:bg-amber-500 hover:text-white border border-border/80 text-foreground font-bold text-[11px] flex flex-col justify-center leading-tight transition-all shadow-2xs"
                >
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground group-hover:text-white">
                    {label}
                  </span>
                  <span className="font-tabular font-extrabold text-[11px]">
                    ৳{price}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modifier Customization Dialog */}
      <ModifierModal
        isOpen={isModifierOpen}
        onClose={() => setIsModifierOpen(false)}
        product={product}
        onConfirm={(data) => {
          dispatch(
            addToCart({
              product,
              size: data.size as any,
              quantity: data.quantity,
              selectedModifiers: data.selectedModifiers,
              itemNote: data.itemNote,
            })
          );
        }}
      />
    </>
  );
};

export default ProductCard;
