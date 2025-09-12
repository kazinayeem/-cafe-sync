import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useGetCategoriesQuery } from "@/services/categoryApi";
import {
  useGetProductsByCategoryQuery,
  useGetProductsQuery,
} from "@/services/productApi";

// Utility function: normalize product data response
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
  const { data: categories = [], isLoading: catLoading } =
    useGetCategoriesQuery();

  const { data: rawProducts, isLoading: prodLoading } = activeCategory
    ? useGetProductsByCategoryQuery(activeCategory)
    : useGetProductsQuery();

  const products = getSafeProducts(rawProducts, prodLoading);

  return (
    <div className="min-h-screen bg-[#f6f5ef] flex flex-col items-center py-6 px-3 md:px-8">
      {/* Search Bar */}
      <div className="w-full max-w-4xl flex gap-3 mb-6">
        <Input
          className="flex-1"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="outline" className="rounded-full px-4">
          <span className="material-icons">search</span>
        </Button>
      </div>

      {/* Categories */}
      <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
        {catLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-gray-200 animate-pulse"
                />
              ))
          : categories.map((cat) => (
              <Button
                key={cat._id}
                className={`h-20 flex flex-col justify-center items-start p-3 text-left rounded-xl shadow-md border transition-all
                ${
                  activeCategory === cat._id
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-green-600 border-gray-200 hover:bg-green-50"
                }`}
                onClick={() =>
                  setActiveCategory(activeCategory === cat._id ? null : cat._id)
                }
              >
                <span className="font-semibold text-lg">{cat.name}</span>
                {Array.isArray(cat.items) && (
                  <span className="text-xs mt-1">{cat.items.length} Items</span>
                )}
                {cat.name === "Snack" && (
                  <span className="text-xs text-red-500 font-medium mt-1">
                    Need to re-stock
                  </span>
                )}
              </Button>
            ))}
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products
          .filter(
            (prod) =>
              !search ||
              prod?.name?.toLowerCase()?.includes(search.toLowerCase())
          )
          .map((prod, idx) => (
            <Card
              key={prod._id ?? idx}
              className="flex flex-col items-center p-4 rounded-xl shadow hover:shadow-lg transition-shadow relative group min-h-[300px]"
            >
              {/* Product image */}
              <img
                src={prod?.imageUrl ?? "/placeholder-coffee.png"}
                alt={prod?.name ?? "product"}
                className="w-32 h-36 object-contain mb-3"
              />
              {/* Name + Price */}
              <CardContent className="w-full flex flex-col items-center px-0 py-2 text-center">
                <span className="font-semibold text-lg text-gray-800 dark:text-white">
                  {prod?.name ?? (
                    <span className="bg-gray-200 w-24 h-5 rounded animate-pulse" />
                  )}
                </span>
                <span className="text-gray-500 text-sm mt-1">
                  {prod?.price ? (
                    `$${prod.price}`
                  ) : (
                    <span className="bg-gray-100 w-16 h-4 rounded animate-pulse" />
                  )}
                </span>
              </CardContent>
              {/* Add button */}
              <Button
                className="absolute bottom-4 right-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                size="icon"
                variant="outline"
              >
                <span className="material-icons">add</span>
              </Button>
            </Card>
          ))}
      </div>
    </div>
  );
}
