import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useGetCategoriesQuery } from "@/services/categoryApi";
import {
  useGetProductsByCategoryQuery,
  useGetProductsQuery,
} from "@/services/productApi";
import Categories from "@/components/CategoryBar";
import ProductCard from "@/components/SelectedProduct";
import OrderSidebar from "@/components/OrderSidebar";

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
function getSafeProducts(
  response: Product[] | ProductApiResponse | undefined,
  prodLoading: boolean
): Product[] {
  if (prodLoading) return Array(8).fill({});
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
}

export default function MainPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Fetch categories & products
  const { data: categories = [], isLoading: catLoading } =
    useGetCategoriesQuery();

  const { data: rawProducts, isLoading: prodLoading } = activeCategory
    ? useGetProductsByCategoryQuery(activeCategory)
    : useGetProductsQuery();

  const products = getSafeProducts(rawProducts, prodLoading);

  return (
    <div className="min-h-screen bg-[#f6f5ef] dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-300">
      {/* LEFT CONTENT (Products Area) */}
      <div className="md:flex-[2] flex flex-col items-center py-6 px-3 md:px-8 w-full">
        {/* Search Bar */}
        <div className="w-full max-w-3xl mb-6">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm 
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
        <div className="w-full p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mt-8">
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
                onAdd={() => {
                  console.log("Add clicked:", prod);
                }}
              />
            ))}
        </div>
      </div>

      <div className="flex-1">
        <OrderSidebar />
      </div>
    </div>
  );
}
