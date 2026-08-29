import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Utensils } from "lucide-react";

type Category = {
  _id: string;
  name: string;
  items?: any[];
};

type CategoriesProps = {
  categories: Category[];
  activeCategory: string | null;
  setActiveCategory: (id: string | null) => void;
  catLoading: boolean;
};

const Categories: React.FC<CategoriesProps> = ({
  categories,
  activeCategory,
  setActiveCategory,
  catLoading,
}) => {
  return (
    <div className="w-full mb-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-1.5 flex-nowrap items-center">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`h-9 px-4 rounded-xl font-bold flex items-center gap-2 flex-shrink-0 text-xs transition-all ${
              activeCategory === null
                ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/20"
                : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Utensils className="h-3.5 w-3.5" />
            <span>All Items</span>
          </button>

          {catLoading
            ? Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-24 rounded-xl bg-muted animate-pulse flex-shrink-0"
                  />
                ))
            : categories.map((cat) => {
                const isActive = activeCategory === cat._id;
                const count = cat.items?.length;

                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setActiveCategory(cat._id)}
                    className={`h-9 px-4 rounded-xl font-bold flex items-center gap-2 flex-shrink-0 text-xs transition-all ${
                      isActive
                        ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/20"
                        : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {count !== undefined && count > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
        </div>
        <ScrollBar orientation="horizontal" className="hidden sm:flex" />
      </ScrollArea>
    </div>
  );
};

export default Categories;
