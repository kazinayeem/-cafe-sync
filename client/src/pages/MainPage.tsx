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

import { Search, ShoppingBag, X, RefreshCcw, AlertTriangle, Coffee } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useGetSettingsQuery } from "@/services/SettingsApi";

const formatAMPM = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

export default function MainPage() {
  const { items, totalPrice } = useSelector((state: RootState) => state.cart);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const handleRefresh = async () => {
    await Promise.all([refetchCategories(), refetchProducts()]);
  };

  const filteredProducts = products.filter((prod) => {
    if (!search) return true;
    return prod.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-background">
      {/* Center / Catalog Area */}
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

        {/* Top Control Bar: Search & Refresh */}
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
        </div>

        {/* Categories Bar */}
        <div className="px-4 shrink-0">
          <Categories
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            categories={categories}
            catLoading={catLoading}
          />
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-20 lg:pb-6">
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

      {/* Right Column: Order Ticket Sidebar (Desktop) */}
      <div className="hidden lg:flex shrink-0 h-full">
        <OrderSidebar disabled={false} />
      </div>

      {/* Mobile Sticky Order Drawer Trigger */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-2xl active:scale-95 transition-all"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-primary text-[10px] font-black">
                    {items.length}
                  </span>
                )}
              </div>
              <span className="text-sm font-tabular">
                Ticket • ৳{totalPrice.toFixed(2)}
              </span>
            </button>
          </DrawerTrigger>

          <DrawerContent className="h-[85vh] p-0 rounded-t-3xl bg-card border-t border-border/80 flex flex-col">
            <DrawerHeader className="p-3 pb-2 border-b flex items-center justify-between">
              <DrawerTitle className="text-sm font-bold">Active Ticket</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto">
              <OrderSidebar disabled={false} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
