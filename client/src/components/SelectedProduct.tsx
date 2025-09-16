import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { ShoppingCart } from "lucide-react";
import { Badge } from "./ui/badge";

type Product = {
  _id?: string;
  name?: string;
  imageUrl?: string;
  available?: boolean;
  sizes?: {
    small?: number;
    large?: number;
    extraLarge?: number;
  };
};

type ProductCardProps = {
  product: Product;
  disabled?: boolean;
};

const ProductCard = ({ product, disabled = false }: ProductCardProps) => {
  const dispatch = useDispatch();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // ✅ map API -> UI labels
  const sizeMapping: Record<string, string> = {
    small: "Tall",
    large: "Grande",
    extraLarge: "Venti",
  };

  const handleAdd = () => {
    if (!selectedSize) return;

    const price = product.sizes?.[selectedSize as keyof typeof product.sizes];
    if (!price) return;

    dispatch(
      addItem({
        productId: product._id!,
        name: product.name!,
        size: sizeMapping[selectedSize],
        price,
        imageUrl: product.imageUrl,
        quantity: 1,
      })
    );
  };

  const isAvailable = product.available ?? true;

  return (
    <div className="relative">
      <Card
        className={`w-full flex flex-col items-center p-3 rounded-xl shadow-md
          hover:shadow-xl transition transform hover:-translate-y-1
          bg-white dark:bg-gray-800 group relative
          ${!isAvailable ? "filter  grayscale pointer-events-none" : ""}`}
      >
        {" "}
        {disabled && (
          <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center text-white font-bold text-center">
            Closed
          </div>
        )}
        {/* Product image */}
        <div className="w-full h-32 sm:h-36 md:h-40 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
          <img
            src={product?.imageUrl ?? "/placeholder-coffee.png"}
            alt={product?.name ?? "product"}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Name */}
        <CardContent className="w-full flex flex-col px-0 py-2">
          <span className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-100 line-clamp-1">
            {product?.name || "Delete Product"}
          </span>

          {/* Sizes */}
          <div className="flex gap-1 mt-3 flex-wrap">
            {Object.entries(product.sizes ?? {})
              .filter(([_, price]) => price > 0)
              .map(([key, price]) => (
                <Badge
                  key={key}
                  variant={selectedSize === key ? "default" : "secondary"}
                  className="p-1 h-auto text-xs"
                  onClick={() => setSelectedSize(key)}
                >
                  {sizeMapping[key]} - {price}
                </Badge>
              ))}
          </div>

          {/* Add to cart */}
          <Button
            onClick={handleAdd}
            disabled={!selectedSize}
            className="mt-3 w-full rounded-lg shadow-md"
          >
            <ShoppingCart className="mr-2" size={16} />
            {selectedSize ? "Add to Cart" : "Select Size"}
          </Button>
        </CardContent>
        {/* Not Available overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-sm font-semibold rounded-xl">
            Not Available
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProductCard;
