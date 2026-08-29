import React, { useState } from "react";
import { useGetPublicMenuQuery } from "@/services/publicMenuApi";
import {
  Coffee,
  Search,
  Phone,
  MapPin,
  Clock,
  Utensils,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export const QRMenu: React.FC = () => {
  const { data: menuResponse, isLoading } = useGetPublicMenuQuery();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const business = menuResponse?.data?.business || {
    name: "Cafe Sync",
    address: "Mirpur, Dhaka - 1206",
    phone: "012-345-6789",
    website: "https://cafe-sync.vercel.app",
    currency: "BDT",
    openingTime: "09:00",
    closingTime: "23:00",
    offDays: [],
  };

  const categories = menuResponse?.data?.categories || [];
  const products = menuResponse?.data?.products || [];

  const filteredProducts = products.filter((p: any) => {
    const matchesCategory =
      activeCategory === null ||
      (p.category && (p.category._id === activeCategory || p.category === activeCategory));
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center">
      {/* Brand Hero Header */}
      <div className="w-full bg-gradient-to-b from-amber-600 to-amber-700 text-white p-6 sm:p-10 shadow-lg">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
            <Coffee className="h-8 w-8 text-white" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {business.name}
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 font-medium mt-1">
              Digital Menu & Coffee Catalog
            </p>
          </div>

          {/* Quick Info Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-medium text-amber-100">
            <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-xs">
              <MapPin className="h-3.5 w-3.5" />
              {business.address}
            </span>
            <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-xs">
              <Clock className="h-3.5 w-3.5" />
              {business.openingTime} - {business.closingTime}
            </span>
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-1 bg-black/20 hover:bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-xs transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              {business.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main Catalog Body */}
      <div className="w-full max-w-3xl px-4 py-6 space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search our handcrafted drinks & snacks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm font-medium shadow-sm"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          <button
            onClick={() => setActiveCategory(null)}
            className={`h-10 px-4 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeCategory === null
                ? "bg-amber-600 text-white shadow-md"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            }`}
          >
            <Utensils className="h-3.5 w-3.5" />
            All Catalog
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`h-10 px-4 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeCategory === cat._id
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {isLoading ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
                />
              ))
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-3xl bg-white/50 dark:bg-slate-900/50">
              <Coffee className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                No items found
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Try searching for another drink or clear category filter.
              </p>
            </div>
          ) : (
            filteredProducts.map((product: any) => (
              <div
                key={product._id}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/50 transition-all"
              >
                {/* Product Image */}
                <div className="w-full sm:w-28 h-28 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Coffee className="h-8 w-8 text-slate-400" />
                  )}
                </div>

                {/* Info & Sizes */}
                <div className="flex-1 min-w-0 space-y-2 w-full">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Sizes Pricing Breakdown */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {product.sizes && (
                      <>
                        {product.sizes.small > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                            <span className="text-slate-500 text-[10px] uppercase">
                              Regular:
                            </span>
                            <span className="font-black font-tabular text-amber-600 dark:text-amber-400">
                              ৳{product.sizes.small}
                            </span>
                          </span>
                        )}
                        {product.sizes.large > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                            <span className="text-slate-500 text-[10px] uppercase">
                              Large:
                            </span>
                            <span className="font-black font-tabular text-amber-600 dark:text-amber-400">
                              ৳{product.sizes.large}
                            </span>
                          </span>
                        )}
                        {product.sizes.extraLarge > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                            <span className="text-slate-500 text-[10px] uppercase">
                              XL:
                            </span>
                            <span className="font-black font-tabular text-amber-600 dark:text-amber-400">
                              ৳{product.sizes.extraLarge}
                            </span>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-xs text-slate-400 space-y-1 border-t border-slate-200 dark:border-slate-800">
          <p className="font-bold text-slate-600 dark:text-slate-400">
            Powered by Cafe Sync POS
          </p>
          <p>Please place your order at the counter with our barista.</p>
        </div>
      </div>
    </div>
  );
};

export default QRMenu;
