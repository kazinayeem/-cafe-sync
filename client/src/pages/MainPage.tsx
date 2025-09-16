import { useState } from "react";
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

// Types
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

// Normalize API response
const getSafeProducts = (
  response: Product[] | ProductApiResponse | undefined,
  prodLoading: boolean
): Product[] => {
  if (prodLoading) return Array(8).fill({});
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
};

export default function MainPage() {
  const { items } = useSelector((state: RootState) => state.cart);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  const {
    data: categories = [],
    isLoading: catLoading,
    refetch: refetchCategories,
  } = useGetCategoriesQuery();

  // Fetch products
  const {
    data: rawProducts,
    isLoading: prodLoading,
    refetch: refetchProducts,
  } = activeCategory
    ? useGetProductsByCategoryQuery(activeCategory)
    : useGetProductsQuery();

  const products = getSafeProducts(rawProducts, prodLoading);

  // Refresh handler
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([refetchCategories(), refetchProducts()]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-300">
      {/* LEFT CONTENT */}
      <div className="flex-1 flex flex-col items-center py-2 px-2 md:px-6 w-full overflow-y-auto">
        {/* Top bar: Refresh + Search */}
        <div className="w-full max-w-3xl mb-4 flex items-center gap-3">
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

        {/* Categories */}
        <Categories
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          categories={categories}
          catLoading={catLoading}
        />

        {/* Products Grid */}
        <div className="w-full p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
          {products
            .filter(
              (prod) =>
                !search ||
                prod?.name?.toLowerCase()?.includes(search.toLowerCase())
            )
            .map((prod, idx) => (
              <ProductCard key={prod._id ?? idx} product={prod} />
            ))}
        </div>
      </div>

      {/* RIGHT CONTENT (Desktop Sidebar) */}
      <div className="hidden md:flex w-full md:w-[380px] lg:w-[420px] flex-col bg-[#f9f9f9] dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        <div className="flex-1 overflow-y-auto">
          <OrderSidebar />
        </div>
      </div>

      {/* MOBILE CART (Drawer) */}
      <Drawer>
        <DrawerTrigger asChild>
          <button className="md:hidden fixed bottom-5 right-5 bg-black text-white p-4 rounded-full shadow-lg z-40 flex items-center gap-2">
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
            <OrderSidebar />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
