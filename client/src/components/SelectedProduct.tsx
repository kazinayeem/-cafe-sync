import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { Plus, Sliders, Coffee } from "lucide-react";
import { ModifierModal } from "./pos/ModifierModal";
import { Product } from "@/services/productApi";

interface ProductCardProps {
  product: Product;
  disabled?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, disabled = false }) => {
  const dispatch = useDispatch();
  const [isModifierOpen, setIsModifierOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("small");

  const isAvailable =
    product.available &&
    (!product.trackInventory || product.stockQuantity > 0);

  const isLowStock =
    product.trackInventory &&
    product.stockQuantity > 0 &&
    product.stockQuantity <= product.minStockLevel;

  const sizeMapping: Record<string, string> = {
    small: "Reg",
    large: "Lrg",
    extraLarge: "XL",
  };

  const getLowestPrice = () => {
    const prices = Object.values(product.sizes || {}).filter(
      (p) => typeof p === "number" && p > 0
    ) as number[];
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const handleDirectAdd = (e: React.MouseEvent, sizeKey: string, price: number) => {
    e.stopPropagation();
    if (!isAvailable || disabled) return;

    dispatch(
      addItem({
        productId: product._id,
        name: product.name,
        size: sizeMapping[sizeKey] || sizeKey,
        price,
        imageUrl: product.imageUrl,
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
        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-3.5 transition-all duration-200 cursor-pointer ${
          isAvailable && !disabled
            ? "hover:border-amber-500/60 hover:shadow-lg active:scale-[0.98]"
            : "opacity-60 grayscale cursor-not-allowed"
        }`}
      >
        {/* Top Badges (Stock / Availability) */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1 items-end">
          {!isAvailable ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs animate-pulse">
              Low: {product.stockQuantity} {product.unit || "left"}
            </span>
          ) : null}
        </div>

        {/* Product Image */}
        <div className="relative w-full aspect-4/3 rounded-xl bg-muted/50 overflow-hidden mb-3 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              loading="lazy"
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-amber-500/5 text-amber-600/40">
              <Coffee className="h-10 w-10 stroke-[1.5]" />
            </div>
          )}

          {/* Quick Modifier Overlay Badge */}
          {product.modifierGroups && product.modifierGroups.length > 0 && (
            <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
              <Sliders className="h-2.5 w-2.5" />
              Customizable
            </span>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-0 flex flex-col flex-1 justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {product.name}
            </h3>
            {product.category && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 font-medium">
                {(product.category as any)?.name || "Beverage"}
              </p>
            )}
          </div>

          {/* Size Quick Select Buttons */}
          <div className="space-y-2 pt-1 border-t border-border/60">
            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.entries(product.sizes || {})
                .filter(([_, price]) => typeof price === "number" && price > 0)
                .map(([sizeKey, price]) => (
                  <button
                    key={sizeKey}
                    type="button"
                    onClick={(e) => handleDirectAdd(e, sizeKey, price as number)}
                    title={`Add ${sizeMapping[sizeKey]} (৳${price})`}
                    className="flex-1 min-w-[54px] flex items-center justify-between px-2 py-1.5 rounded-lg border border-border/80 bg-background hover:bg-amber-500 hover:border-amber-500 hover:text-white text-foreground transition-all text-xs"
                  >
                    <span className="text-[10px] font-bold uppercase">
                      {sizeMapping[sizeKey]}
                    </span>
                    <span className="font-tabular font-extrabold text-[11px]">
                      ৳{price}
                    </span>
                  </button>
                ))}
            </div>

            {/* Customize / Add Action Button */}
            <Button
              type="button"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsModifierOpen(true);
              }}
              className="w-full h-8 rounded-xl bg-secondary hover:bg-amber-500 hover:text-white text-secondary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Customize & Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modifier Configurator Modal */}
      {isModifierOpen && (
        <ModifierModal
          isOpen={isModifierOpen}
          onClose={() => setIsModifierOpen(false)}
          product={product}
          onConfirm={({ size, price, selectedModifiers, itemNote, quantity }) => {
            dispatch(
              addItem({
                productId: product._id,
                name: product.name,
                size: sizeMapping[size] || size,
                price,
                imageUrl: product.imageUrl,
                selectedModifiers,
                itemNote,
                quantity,
              })
            );
          }}
        />
      )}
    </>
  );
};

export default ProductCard;
