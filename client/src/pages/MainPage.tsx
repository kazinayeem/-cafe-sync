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

import { ShoppingCart, X, RefreshCcw } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useGetSettingsQuery } from "@/services/SettingsApi";

interface Product {
  _id?: string;
  name?: string;
  price?: number;
  imageUrl?: string;
  [key: string]: any;
}

interface ProductApiResponse {
  data?: Product[];
  [key: string]: any;
}

const getSafeProducts = (
  response: Product[] | ProductApiResponse | undefined,
  prodLoading: boolean
): Product[] => {
  if (prodLoading) return Array(8).fill({});
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
};

const formatAMPM = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

export default function MainPage() {
  const { items } = useSelector((state: RootState) => state.cart);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [isClosed, setIsClosed] = useState(false);
  const [closedMessage, setClosedMessage] = useState("");

  const { data: settingsData, isLoading: settingsLoading } =
    useGetSettingsQuery({});

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

  const products = getSafeProducts(rawProducts, prodLoading);

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
      setClosedMessage(`${businessName} is closed today (${dayName})`);
      return;
    }

    const [openHour, openMinute] = openingTime.split(":").map(Number);
    const [closeHour, closeMinute] = closingTime.split(":").map(Number);

    const openTime = new Date();
    openTime.setHours(openHour, openMinute, 0, 0);

    const closeTime = new Date();
    closeTime.setHours(closeHour, closeMinute, 0, 0);

    if (now < openTime || now > closeTime) {
      setIsClosed(true);
      setClosedMessage(
        `${businessName} is closed now. Open hours: ${formatAMPM(
          openingTime
        )} - ${formatAMPM(closingTime)}`
      );
      return;
    }

    setIsClosed(false);
    setClosedMessage("");
  }, [settingsData]);

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([refetchCategories(), refetchProducts()]);
    setLoading(false);
  };

  // Show loading while settings load
  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-300 px-2 sm:px-4 lg:px-6">
      <div className="flex-1 flex flex-col items-center py-2 px-2 md:px-6 w-full overflow-y-auto">
        {isClosed && (
          <div className="w-full p-4 mb-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-center font-semibold rounded">
            {closedMessage}
          </div>
        )}

        <div className="w-full max-w-3xl mb-4 flex flex-col sm:flex-row items-center gap-3">
          <Button onClick={handleRefresh} disabled={loading}>
            {loading ? (
              <span className="animate-spin">
                <RefreshCcw />
              </span>
            ) : (
              <RefreshCcw />
            )}
          </Button>
          <Input
            placeholder="Search for coffee, food etc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-gray-300 dark:border-gray-700 shadow-sm
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <Categories
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          categories={categories}
          catLoading={catLoading}
        />

        <div className="w-full p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
          {products
            .filter(
              (prod) =>
                !search ||
                prod?.name?.toLowerCase()?.includes(search.toLowerCase())
            )
            .map((prod, idx) => (
              <ProductCard
                key={prod._id ?? idx}
                product={prod}
                disabled={isClosed}
              />
            ))}
        </div>
      </div>

      <div className="hidden md:flex w-full md:w-[380px] lg:w-[420px] flex-col bg-[#f9f9f9] dark:bg-gray-800  border-gray-200 dark:border-gray-700">
        <div className="flex-1 overflow-y-auto">
          <OrderSidebar disabled={isClosed} />
        </div>
      </div>

      <Drawer>
        <DrawerTrigger asChild>
          <button
            className={`md:hidden fixed bottom-5 right-5 p-4 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 ${
              isClosed
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
            disabled={isClosed}
          >
            <span className="text-sm font-bold">{items.length || "0"}</span>
            <ShoppingCart size={24} />
          </button>
        </DrawerTrigger>

        <DrawerContent className="h-full w-[80%] ml-auto rounded-none bg-white dark:bg-gray-800 flex flex-col">
          <DrawerHeader className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <DrawerTitle className="text-lg font-semibold">
              Your Order
            </DrawerTitle>
            <DrawerClose asChild>
              <button>
                <X size={24} className="text-gray-600 dark:text-gray-300" />
              </button>
            </DrawerClose>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto">
            <OrderSidebar disabled={isClosed} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
