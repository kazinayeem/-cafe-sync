import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Categories from "@/components/CategoryBar";
import ProductCard from "@/components/SelectedProduct";
import OrderSidebar from "@/components/OrderSidebar";

import { useGetCategoriesQuery } from "@/services/categoryApi";
import {
  useGetProductsByCategoryQuery,
  useGetProductsQuery,
} from "@/services/productApi";
import type { Product } from "@/services/productApi";

import { useNavigate } from "react-router";
import { socket } from "@/utils/socket";
import { orderAnnouncer } from "@/utils/orderAnnouncer";
import {
  Search,
  ShoppingBag,
  X,
  RefreshCcw,
  AlertTriangle,
  Coffee,
  Smartphone,
  Eye,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGetSettingsQuery } from "@/services/SettingsApi";

const formatAMPM = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

interface SelfOrderToast {
  orderId: string;
  orderToken: string;
  tableName: string;
  totalPrice: number;
  itemsSummary: string;
  guestName?: string;
}

export default function MainPage() {
  const navigate = useNavigate();
  const { items } = useSelector((state: RootState) => state.cart);
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [incomingOrderAlert, setIncomingOrderAlert] = useState<SelfOrderToast | null>(null);

  const [isClosed, setIsClosed] = useState(false);
  const [closedMessage, setClosedMessage] = useState("");

  const { data: settingsData } = useGetSettingsQuery({});

  // Fetch categories
  const {
    data: categories = [],
    isLoading: catLoading,
    refetch: refetchCategories,
  } = useGetCategoriesQuery();

  const {
    data: rawProducts,
    isLoading: prodLoading,
    refetch: refetchProducts,
  } = activeCategory
    ? useGetProductsByCategoryQuery(activeCategory)
    : useGetProductsQuery();

  const products: Product[] = Array.isArray(rawProducts)
    ? rawProducts
    : (rawProducts as any)?.data || [];

  useEffect(() => {
    if (!settingsData?.data) return;

    const {
      offDays = [],
      openingTime,
      closingTime,
      businessName,
    } = settingsData.data;

    const now = new Date();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });

    // Off day check
    if (offDays.includes(dayName)) {
      setIsClosed(true);
      setClosedMessage(`${businessName} is scheduled closed today (${dayName})`);
      return;
    }

    if (openingTime && closingTime) {
      const [openHour, openMinute] = openingTime.split(":").map(Number);
      const [closeHour, closeMinute] = closingTime.split(":").map(Number);

      const openTime = new Date();
      openTime.setHours(openHour, openMinute, 0, 0);

      const closeTime = new Date();
      closeTime.setHours(closeHour, closeMinute, 0, 0);

      if (now < openTime || now > closeTime) {
        setIsClosed(true);
        setClosedMessage(
          `${businessName} is outside regular operating hours (${formatAMPM(
            openingTime
          )} - ${formatAMPM(closingTime)})`
        );
        return;
      }
    }

    setIsClosed(false);
    setClosedMessage("");
  }, [settingsData]);

  useEffect(() => {
    const handleNewCustomerOrder = (data: any) => {
      const order = data.order || data;
      if (order?.source === "qr" || order?.source === "online" || data?.tableName) {
        const orderId = order?._id || data?.orderId || "";
        const orderToken = order?.orderToken || data?.orderToken || "New";
        const tableName = order?.table?.name || data?.table || data?.tableName || "Mobile Guest";
        const totalPrice = order?.totalPrice || data?.totalPrice || 0;
        const itemsSummary =
          data?.itemsSummary ||
          (order?.items || [])
            .map((it: any) => `${it.quantity} × ${it.name || it.product?.name || "Item"}`)
            .join(", ");

        // Trigger POS audio announcement chime
        orderAnnouncer.announceNewOrder(orderId, orderToken, tableName);

        // Display on-screen alert banner
        setIncomingOrderAlert({
          orderId,
          orderToken,
          tableName,
          totalPrice,
          itemsSummary,
          guestName: order?.guestName || data?.guestName,
        });

        // Auto dismiss after 15 seconds
        setTimeout(() => {
          setIncomingOrderAlert((prev) => (prev?.orderId === orderId ? null : prev));
        }, 15000);
      }
    };

    socket.on("newCustomerSelfOrder", handleNewCustomerOrder);
    socket.on("newOrder", handleNewCustomerOrder);

    return () => {
      socket.off("newCustomerSelfOrder", handleNewCustomerOrder);
      socket.off("newOrder", handleNewCustomerOrder);
    };
  }, []);

  const handleRefresh = async () => {
    await Promise.all([refetchCategories(), refetchProducts()]);
  };

  const filteredProducts = products.filter((prod) => {
    if (!search) return true;
    return prod.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-background">
      {/* Center / Catalog Area (Fixed header & categories, scrollable product grid) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Operating Warning Banner if outside hours */}
        {isClosed && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{closedMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsClosed(false)}
              className="text-[11px] underline font-bold hover:text-amber-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Control Bar: Search, Refresh, & Mobile Ticket Button */}
        <div className="p-4 pb-2 flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coffee, drinks, bakery items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-10 rounded-xl bg-card border-border/80 text-xs font-medium shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh Menu"
            className="h-10 w-10 rounded-xl border-border/80 shrink-0"
          >
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* Quick Ticket Drawer Trigger for Tablets / Mobile */}
          <Button
            variant="outline"
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden h-10 px-3 rounded-xl border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold text-xs flex items-center gap-2 shrink-0 shadow-xs active:scale-95 transition-all"
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-600 text-white text-[9px] font-black">
                  {items.length}
                </span>
              )}
            </div>
            <span className="font-tabular font-bold">
              {totalPrice > 0 ? `৳${totalPrice.toFixed(0)}` : "Ticket"}
            </span>
          </Button>
        </div>

        {/* Fixed Categories Bar */}
        <div className="px-4 shrink-0">
          <Categories
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            categories={categories}
            catLoading={catLoading}
          />
        </div>

        {/* Independently Scrollable Product Cards Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-20 lg:pb-6 pt-1 select-none scroll-smooth">
          {prodLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 pt-1">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-56 rounded-2xl bg-card border border-border/60 animate-pulse"
                  />
                ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 border border-dashed border-border/80 rounded-2xl bg-card/40 my-4">
              <Coffee className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-bold text-foreground">No menu items found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Try searching with a different keyword or category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 pt-1">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Order Ticket Sidebar (Desktop: Fixed 3-column, independent scroll) */}
      <div className="hidden lg:flex shrink-0 h-full w-80 xl:w-96 border-l border-border/80 bg-card overflow-hidden">
        <OrderSidebar disabled={false} />
      </div>

      {/* Mobile / Tablet Floating Order Trigger */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-2xl active:scale-95 transition-all"
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-primary text-[10px] font-black shadow-sm">
                {items.length}
              </span>
            )}
          </div>
          <span className="text-sm font-tabular">
            Ticket • ৳{totalPrice.toFixed(2)}
          </span>
        </Button>
      </div>

      {/* Slide-over Right Drawer for Tablets & Mobile */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 h-full flex flex-col bg-card border-l border-border/80"
        >
          <SheetTitle className="sr-only">Active Ticket</SheetTitle>
          <OrderSidebar disabled={false} onClose={() => setIsDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Real-time Customer Mobile Self-Order Alert Toast */}
      {incomingOrderAlert && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl border border-amber-500/40 shadow-2xl p-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black animate-pulse shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  NEW CUSTOMER ORDER
                </span>
                <h4 className="text-xs font-black text-white truncate">
                  Order #{incomingOrderAlert.orderToken} • {incomingOrderAlert.tableName}
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIncomingOrderAlert(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="py-2.5 space-y-1">
            <p className="text-xs text-slate-300 font-medium line-clamp-2">
              {incomingOrderAlert.itemsSummary}
            </p>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
              <span className="text-slate-400 font-medium">
                {incomingOrderAlert.guestName
                  ? `Guest: ${incomingOrderAlert.guestName}`
                  : "Customer Mobile"}
              </span>
              <span className="font-extrabold text-amber-400 font-tabular text-sm">
                ৳{incomingOrderAlert.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={() => {
                setIncomingOrderAlert(null);
                navigate("/dashboard/orders");
              }}
              className="flex-1 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              View Order
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIncomingOrderAlert(null);
                navigate("/dashboard/kitchen");
              }}
              className="h-8 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold"
            >
              KDS
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
