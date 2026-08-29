import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  useGetTableByQrTokenQuery,
  useCreateQrOrderMutation,
} from "@/services/publicMenuApi";
import { socket } from "@/utils/socket";
import {
  Coffee,
  Search,
  ShoppingBag,
  Sliders,
  AlertCircle,
  WifiOff,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerProductSheet } from "@/components/qr/CustomerProductSheet";
import type { CustomerCartItem } from "@/components/qr/CustomerProductSheet";
import { CustomerCartSheet } from "@/components/qr/CustomerCartSheet";
import Swal from "sweetalert2";

export const CustomerOrderPage: React.FC = () => {
  const { qrToken } = useParams<{ qrToken: string }>();
  const navigate = useNavigate();

  const {
    data: tableResponse,
    isLoading,
    isError,
    error,
  } = useGetTableByQrTokenQuery(qrToken || "", {
    skip: !qrToken,
  });

  const [createQrOrder, { isLoading: isSubmitting }] = useCreateQrOrderMutation();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CustomerCartItem[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  // Restore cart from localStorage per table
  useEffect(() => {
    if (qrToken) {
      const saved = localStorage.getItem(`cafe_qr_cart_${qrToken}`);
      if (saved) {
        try {
          setCartItems(JSON.parse(saved));
        } catch {
          // Ignore
        }
      }
    }
  }, [qrToken]);

  // Sync cart to localStorage
  useEffect(() => {
    if (qrToken) {
      localStorage.setItem(`cafe_qr_cart_${qrToken}`, JSON.stringify(cartItems));
    }
  }, [cartItems, qrToken]);

  // Socket online status
  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const tableData = tableResponse?.data?.table;
  const business = tableResponse?.data?.business || { name: "BornoCafe" };
  const categories = tableResponse?.data?.categories || [];
  const products = tableResponse?.data?.products || [];

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const matchesCat =
        activeCategory === "all" ||
        p.category?._id === activeCategory ||
        p.category === activeCategory;

      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [products, activeCategory, search]);

  const totalCartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalCartAmount = cartItems.reduce((sum, i) => sum + i.totalPrice, 0);

  const handleAddToCart = (newItem: CustomerCartItem) => {
    setCartItems((prev) => {
      const index = prev.findIndex((i) => i.id === newItem.id);
      if (index > -1) {
        const updated = [...prev];
        const current = updated[index];
        const newQty = current.quantity + newItem.quantity;
        const newTotal = (current.unitPrice + current.modifiersPrice) * newQty;
        updated[index] = { ...current, quantity: newQty, totalPrice: newTotal };
        return updated;
      }
      return [...prev, newItem];
    });

    Swal.fire({
      toast: true,
      position: "top",
      icon: "success",
      title: `${newItem.name} added to cart!`,
      showConfirmButton: false,
      timer: 1200,
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: (item.unitPrice + item.modifiersPrice) * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CustomerCartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
    if (qrToken) {
      localStorage.removeItem(`cafe_qr_cart_${qrToken}`);
    }
  };

  const handleSubmitOrder = async (guestData: {
    guestName: string;
    guestPhone: string;
    orderNote: string;
  }) => {
    if (!qrToken || cartItems.length === 0 || isSubmitting) return;

    try {
      const payload = {
        qrToken,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          selectedModifiers: item.selectedModifiers,
          itemNote: item.itemNote,
        })),
        guestName: guestData.guestName,
        guestPhone: guestData.guestPhone,
        orderNote: guestData.orderNote,
      };

      const res = await createQrOrder(payload).unwrap();
      handleClearCart();
      setIsCartSheetOpen(false);

      const orderId = res.data?._id || res.data?.customOrderID;
      navigate(`/track/${orderId}`);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: err?.data?.message || "Unable to place order. Please try again.",
      });
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 animate-pulse">
          <Coffee className="h-7 w-7" />
        </div>
        <p className="text-sm font-bold text-muted-foreground animate-pulse">
          Connecting to table menu...
        </p>
      </div>
    );
  }

  // Error / Invalid QR State
  if (isError || !tableData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="max-w-xs space-y-1.5">
          <h2 className="text-xl font-black text-foreground">
            Invalid Table QR Code
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {(error as any)?.data?.message ||
              "This table QR code is no longer active or could not be verified. Please ask a cafe staff member for assistance."}
          </p>
        </div>
        <Button
          onClick={() => navigate("/menu")}
          variant="outline"
          className="rounded-2xl text-xs font-bold"
        >
          View General Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground pb-24 select-none">
      {/* Network Reconnection Warning */}
      {!isConnected && (
        <div className="bg-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-1.5 sticky top-0 z-50">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Reconnecting to live menu...</span>
        </div>
      )}

      {/* Header Banner */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/80 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white font-black shadow-md shadow-amber-500/20 shrink-0">
              <Coffee className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-black text-foreground truncate leading-tight">
                {business.name || "BornoCafe"}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {tableData.name}
                </span>
                {tableData.section && (
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    • {tableData.section}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Cart Button */}
          {totalCartCount > 0 && (
            <Button
              onClick={() => setIsCartSheetOpen(true)}
              className="h-9 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md flex items-center gap-1.5"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{totalCartCount}</span>
            </Button>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="max-w-md mx-auto mt-2.5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coffee, tea, pastries, snacks..."
            className="pl-10 h-10 rounded-2xl bg-muted/40 border-border/80 text-xs font-semibold"
          />
        </div>

        {/* Category Horizontal Scroll Pills */}
        <div className="max-w-md mx-auto mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
              activeCategory === "all"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            All Items
          </button>

          {categories.map((cat: any) => {
            const isSelected = activeCategory === cat._id;
            return (
              <button
                key={cat._id}
                type="button"
                onClick={() => setActiveCategory(cat._id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                  isSelected
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Product Catalog */}
      <main className="max-w-md mx-auto p-4 space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Coffee className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm font-bold text-foreground">No menu items found</p>
            <p className="text-xs text-muted-foreground">
              Try selecting another category or clear your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product: any) => {
              const basePrice =
                product.sizes?.small || product.sizes?.large || product.price || 0;

              return (
                <div
                  key={product._id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsProductSheetOpen(true);
                  }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  {/* Photo Banner */}
                  <div className="relative h-28 w-full bg-muted/40 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                        <Coffee className="h-6 w-6" />
                      </div>
                    )}

                    {product.modifierGroups && product.modifierGroups.length > 0 && (
                      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white">
                        <Sliders className="h-2.5 w-2.5" />
                        Options
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                    <div>
                      <h3 className="font-black text-xs text-foreground line-clamp-1 group-hover:text-amber-600 transition-colors">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <span className="font-black font-tabular text-xs text-amber-600 dark:text-amber-400">
                        ৳{basePrice}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-accent text-[10px] font-black text-foreground">
                        + Add
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-3 left-4 right-4 z-40 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setIsCartSheetOpen(true)}
            className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white px-4 flex items-center justify-between shadow-xl shadow-amber-500/30 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 font-black text-xs">
                {totalCartCount}
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-amber-100">
                  {tableData.name} • View Order
                </span>
                <p className="text-base font-black font-tabular leading-tight">
                  ৳{totalCartAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 font-black text-xs bg-white/20 px-3 py-1.5 rounded-xl">
              <span>Checkout</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      {/* Product Customization Sheet */}
      <CustomerProductSheet
        isOpen={isProductSheetOpen}
        onClose={() => setIsProductSheetOpen(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />

      {/* Customer Cart Sheet */}
      <CustomerCartSheet
        isOpen={isCartSheetOpen}
        onClose={() => setIsCartSheetOpen(false)}
        items={cartItems}
        table={tableData}
        business={business}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CustomerOrderPage;
