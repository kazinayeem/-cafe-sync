import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  useGetTableByQrTokenQuery,
  useGetPublicMenuQuery,
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
  Plus,
  Minus,
  Trash2,
  Receipt,
  Sparkles,
  MapPin,
  Clock,
  Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerProductSheet } from "@/components/qr/CustomerProductSheet";
import type { CustomerCartItem } from "@/components/qr/CustomerProductSheet";
import { CustomerCartSheet } from "@/components/qr/CustomerCartSheet";
import Swal from "sweetalert2";

export const CustomerOrderPage: React.FC = () => {
  const { qrToken, tableId } = useParams<{ qrToken?: string; tableId?: string }>();
  const [searchParams] = useSearchParams();
  const queryTable = searchParams.get("table") || searchParams.get("qr") || searchParams.get("tableId") || "";
  const effectiveQrToken = qrToken || tableId || queryTable;

  const navigate = useNavigate();

  // Query table specific info if token exists
  const {
    data: tableResponse,
    isLoading: tableLoading,
    isError: tableError,
  } = useGetTableByQrTokenQuery(effectiveQrToken, {
    skip: !effectiveQrToken,
  });

  // Fallback public menu query if no table token is provided (e.g. general /menu)
  const {
    data: publicMenuResponse,
    isLoading: publicMenuLoading,
  } = useGetPublicMenuQuery(undefined, {
    skip: !!effectiveQrToken,
  });

  const [createQrOrder, { isLoading: isSubmitting }] = useCreateQrOrderMutation();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CustomerCartItem[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  // Guest fields for desktop checkout panel
  const [desktopGuestName, setDesktopGuestName] = useState("");
  const [desktopGuestPhone, setDesktopGuestPhone] = useState("");
  const [desktopOrderNote, setDesktopOrderNote] = useState("");

  const cartStorageKey = effectiveQrToken
    ? `cafe_qr_cart_${effectiveQrToken}`
    : "cafe_qr_cart_general";

  // Restore cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(cartStorageKey);
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch {
        // Ignore
      }
    }
  }, [cartStorageKey]);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems, cartStorageKey]);

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

  const rawBusiness =
    tableResponse?.data?.business ||
    publicMenuResponse?.data?.business || {
      name: "BornoCafe",
      address: "Mirpur, Dhaka - 1206",
      phone: "012-345-6789",
      website: "https://bornocafe.vercel.app",
      currency: "BDT",
      openingTime: "09:00",
      closingTime: "23:00",
      taxRate: 5,
      serviceCharge: 0,
      enableCustomerSelfOrdering: true,
    };

  const business = rawBusiness;
  const categories =
    tableResponse?.data?.categories || publicMenuResponse?.data?.categories || [];
  const products =
    tableResponse?.data?.products || publicMenuResponse?.data?.products || [];

  const tableData =
    tableResponse?.data?.table || {
      _id: "",
      name: effectiveQrToken ? `Table ${effectiveQrToken}` : "Dine-In / Counter",
      section: effectiveQrToken ? "Dine-In" : "Self-Order",
    };

  const isLoading = effectiveQrToken ? tableLoading : publicMenuLoading;

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const matchesCat =
        activeCategory === "all" ||
        p.category?._id === activeCategory ||
        p.category === activeCategory;

      const matchesSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [products, activeCategory, search]);

  const totalCartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cartItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const taxRate = business.taxRate ?? 5;
  const serviceChargeRate = business.serviceCharge ?? 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const serviceChargeAmount = (subtotal * serviceChargeRate) / 100;
  const finalTotal = Number((subtotal + taxAmount + serviceChargeAmount).toFixed(2));

  const isSelfOrderingEnabled = business.enableCustomerSelfOrdering !== false;

  const handleAddToCart = (newItem: CustomerCartItem) => {
    if (!isSelfOrderingEnabled) {
      Swal.fire({
        icon: "info",
        title: "Ordering Unavailable",
        text: "Customer self-ordering is currently paused. Please order directly with our barista or cashier at the counter.",
      });
      return;
    }

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
      title: `${newItem.name} added to order!`,
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
    localStorage.removeItem(cartStorageKey);
  };

  const handleSubmitOrder = async (guestData: {
    guestName: string;
    guestPhone: string;
    orderNote: string;
  }) => {
    if (cartItems.length === 0 || isSubmitting) return;

    if (!isSelfOrderingEnabled) {
      Swal.fire({
        icon: "warning",
        title: "Ordering Unavailable",
        text: "Customer self-ordering is currently paused by store management. Please order directly at the counter.",
      });
      return;
    }

    try {
      const payload = {
        qrToken: effectiveQrToken || "counter",
        tableId: effectiveQrToken || "counter",
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

  const handleDesktopPlaceOrder = () => {
    handleSubmitOrder({
      guestName: desktopGuestName.trim() || "Guest Customer",
      guestPhone: desktopGuestPhone.trim(),
      orderNote: desktopOrderNote.trim(),
    });
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 animate-pulse">
          <Coffee className="h-7 w-7" />
        </div>
        <p className="text-sm font-bold text-muted-foreground animate-pulse">
          Connecting to cafe self-order menu...
        </p>
      </div>
    );
  }

  // Error / Invalid QR State (only if explicitly had token and failed)
  if (effectiveQrToken && tableError && !tableResponse?.data) {
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
            This table QR code could not be verified. You can still order from our general menu below.
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground pb-24 lg:pb-8 select-none">
      {/* Network Reconnection Warning */}
      {!isConnected && (
        <div className="bg-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-1.5 sticky top-0 z-50">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Reconnecting to live cafe menu...</span>
        </div>
      )}

      {/* Self Ordering Disabled Notice */}
      {!isSelfOrderingEnabled && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs font-semibold py-2.5 px-4 sticky top-0 z-45">
          <div className="max-w-6xl mx-auto flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-xs">Online Ordering Currently Unavailable</p>
              <p className="opacity-90 text-[11px] mt-0.5 leading-relaxed">
                Customer mobile self-ordering is currently paused by store management. You can browse our menu, and please order directly with the cashier at the counter.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Brand Hero Header */}
      <header className="bg-gradient-to-b from-amber-600 to-amber-700 text-white py-4 sm:py-6 px-4 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {business.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs border border-white/30">
                  {tableData.name}
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                Touchless Digital Self-Ordering POS
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-amber-100">
            {business.address && (
              <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-xs">
                <MapPin className="h-3 w-3" />
                {business.address}
              </span>
            )}
            {business.openingTime && (
              <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-xs">
                <Clock className="h-3 w-3" />
                {business.openingTime} - {business.closingTime}
              </span>
            )}
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-1 bg-black/20 hover:bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-xs transition-colors"
              >
                <Phone className="h-3 w-3" />
                {business.phone}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main 2-Column Responsive Layout (Catalog on Left/Center, Desktop Order Ticket on Right) */}
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col lg:flex-row gap-6">
        {/* Left / Center Catalog Column */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search handcrafted coffee, drinks, bakery items..."
              className="pl-10 h-11 rounded-2xl bg-card border-border/80 text-xs font-medium shadow-xs"
            />
          </div>

          {/* Category Horizontal Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                activeCategory === "all"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-card border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
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
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-card border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center space-y-2 border border-dashed border-border/80 rounded-3xl bg-card/40">
              <Coffee className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm font-bold text-foreground">No menu items found</p>
              <p className="text-xs text-muted-foreground">
                Try selecting another category or clear your search keyword.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3.5">
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
                    className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs hover:shadow-md hover:border-amber-500/50 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {/* Photo Banner */}
                    <div className="relative h-32 w-full bg-muted/40 overflow-hidden flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                          <Coffee className="h-6 w-6" />
                        </div>
                      )}

                      {product.modifierGroups && product.modifierGroups.length > 0 && (
                        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-[9px] font-bold text-white">
                          <Sliders className="h-2.5 w-2.5" />
                          Customizable
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-3 flex flex-col justify-between flex-1 space-y-2.5">
                      <div>
                        <h3 className="font-black text-xs sm:text-sm text-foreground line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-border/40">
                        <span className="font-black font-tabular text-sm text-amber-600 dark:text-amber-400">
                          ৳{basePrice}
                        </span>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                            setIsProductSheetOpen(true);
                          }}
                          className="h-7 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-2xs"
                        >
                          <Plus className="h-3 w-3 mr-0.5" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Right Active Ticket / Order Panel */}
        <div className="hidden lg:flex flex-col w-88 xl:w-96 shrink-0 rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-4 h-fit sticky top-6">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-amber-600" />
              <div>
                <h2 className="font-extrabold text-sm text-foreground">Your Order Ticket</h2>
                <p className="text-[11px] text-muted-foreground">
                  {tableData.name}
                </p>
              </div>
            </div>
            {cartItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                className="h-7 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Desktop Items List */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {cartItems.length === 0 ? (
              <div className="py-8 text-center space-y-1.5 border border-dashed border-border/80 rounded-2xl bg-muted/20">
                <Receipt className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-bold text-foreground">Your order is empty</p>
                <p className="text-[11px] text-muted-foreground">
                  Select items from the menu to build your order
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-border/80 bg-accent/20 space-y-1.5 text-xs"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{item.name}</p>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        Size: {item.size}
                      </span>

                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {item.selectedModifiers.map((m, mIdx) => (
                            <span
                              key={mIdx}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 font-medium"
                            >
                              +{m.optionName} {m.price > 0 && `(৳${m.price})`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-bold font-tabular text-foreground shrink-0">
                      ৳{item.totalPrice}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      ৳{item.unitPrice + item.modifiersPrice} / unit
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="h-6 w-6 flex items-center justify-center rounded-md border border-border bg-card hover:bg-accent font-bold"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-bold font-tabular text-xs w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="h-6 w-6 flex items-center justify-center rounded-md border border-border bg-card hover:bg-accent font-bold"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Guest Info Inputs */}
          {cartItems.length > 0 && (
            <div className="border-t border-border/60 pt-3 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Guest Details (Optional)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={desktopGuestName}
                  onChange={(e) => setDesktopGuestName(e.target.value)}
                  placeholder="Your Name"
                  className="rounded-xl h-8 text-xs font-medium"
                />
                <Input
                  value={desktopGuestPhone}
                  onChange={(e) => setDesktopGuestPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="rounded-xl h-8 text-xs font-medium font-tabular"
                />
              </div>
              <Input
                value={desktopOrderNote}
                onChange={(e) => setDesktopOrderNote(e.target.value)}
                placeholder="Kitchen note (e.g. extra napkins)..."
                className="rounded-xl h-8 text-xs font-medium"
              />
            </div>
          )}

          {/* Desktop Payment Method Info */}
          {cartItems.length > 0 && (
            <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/30 space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase">
                  Cash — Pay When You Receive
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Please pay in cash when you receive your order. Your coffee will be brewed first.
              </p>
            </div>
          )}

          {/* Desktop Financial Breakdown */}
          {cartItems.length > 0 && (
            <div className="border-t border-border/80 pt-3 space-y-2">
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
                onClick={handleDesktopPlaceOrder}
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 mt-2 active:scale-98 transition-all"
              >
                {isSubmitting ? (
                  "Placing Your Order..."
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Place Order — ৳{finalTotal.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile / Tablet Floating Bottom Cart Bar */}
      {totalCartCount > 0 && (
        <div className="lg:hidden fixed bottom-3 left-4 right-4 z-40 max-w-md mx-auto">
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
                  ৳{finalTotal.toFixed(2)}
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

      {/* Mobile Customer Cart Sheet */}
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
