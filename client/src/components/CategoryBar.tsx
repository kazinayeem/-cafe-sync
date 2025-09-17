import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
  return (
    <div className="w-full mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 px-1 pb-2  flex-wrap">
          <Button
            className={`h-10 px-5 rounded-full font-medium flex-shrink-0 text-sm
              ${
                activeCategory === null
                  ? "bg-black text-white dark:bg-black"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          {catLoading
            ? Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0"
                  />
                ))
            : categories.map((cat) => (
                <Button
                  key={cat._id}
                  className={`h-10 px-5 rounded-full font-medium flex-shrink-0 text-sm 
                    ${
                      activeCategory === cat._id
                        ? "bg-black text-white dark:bg-black"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    }`}
                  onClick={() => setActiveCategory(cat._id)}
                >
                  {cat?.name || "N/A"}
                </Button>
              ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden md:flex" />
      </ScrollArea>
    </div>
  );
};

export default Categories;
