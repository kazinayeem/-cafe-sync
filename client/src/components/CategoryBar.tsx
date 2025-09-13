import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const Categories = ({
  categories,
  activeCategory,
  setActiveCategory,
  catLoading,
}: CategoriesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // check scroll state
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 250; // scroll step
      scrollRef.current.scrollBy({
        left: dir === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full mb-8">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10
            bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border rounded-full p-2 shadow hover:bg-white dark:hover:bg-gray-700"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-4"
      >
        {catLoading
          ? Array(8)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-28 sm:w-32 md:w-36 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0"
                />
              ))
          : categories.map((cat) => (
              <Button
                key={cat._id}
                className={`h-20 w-28 sm:w-32 md:w-36 flex-shrink-0 flex flex-col justify-center items-start p-3 text-left  border shadow-sm transition-all
                ${
                  activeCategory === cat._id
                    ? "bg-green-600 text-white border-green-600 shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-green-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                }`}
                onClick={() =>
                  setActiveCategory(activeCategory === cat._id ? null : cat._id)
                }
              >
                <span className="font-semibold text-wrap text-xs sm:text-sm truncate">
                  {cat?.name}
                </span>
                {Array.isArray(cat.items) && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {cat.items.length} Items
                  </span>
                )}
                {cat.name === "Snack" && (
                  <span className="text-xs text-red-500 font-medium mt-0.5">
                    Need to re-stock
                  </span>
                )}
              </Button>
            ))}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10
            bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border rounded-full p-2 shadow hover:bg-white dark:hover:bg-gray-700"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

export default Categories;
