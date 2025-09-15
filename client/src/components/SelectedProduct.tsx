import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { ShoppingCart } from "lucide-react";

type Product = {
  _id?: string;
  name?: string;
  price?: number;
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
  onAdd?: (product: Product, size: string, price: number) => void;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const handleSelect = (size: string, price: number) => {
    dispatch(
      addItem({
        productId: product._id!,
        name: product.name!,
        size,
        price,
        imageUrl: product.imageUrl,
        quantity: 1,
      })
    );
    setOpen(false);
  };

  const isAvailable = product.available ?? true;

  return (
    <div className="relative">
      <Card
        key={product._id}
        className={`w-full flex flex-col items-center p-5 rounded-xl shadow-md 
          hover:shadow-xl transition transform hover:-translate-y-1 
          bg-white dark:bg-gray-800 group relative
          ${
            !isAvailable ? "filter blur-in grayscale pointer-events-none" : ""
          }`}
      >
        {/* Product image */}
        <div
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 
             bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4 overflow-hidden"
        >
          <img
            src={product?.imageUrl ?? "/placeholder-coffee.png"}
            alt={product?.name ?? "product"}
            className="w-full h-full object-contain"
          />
        </div>
        {/* Name + Price */}
        <CardContent className="w-full flex flex-col items-center px-0 py-2 text-center">
          <span className="font-semibold text-sm sm:text-base md:text-lg text-gray-800 dark:text-gray-100 line-clamp-1">
            {product?.name}
          </span>
          <span className="text-green-600 font-medium text-xs sm:text-sm mt-1 tracking-wide">
            {product?.price && `$${product.price}`}
          </span>
        </CardContent>

        {/* Add button */}
        <Button
          onClick={() => setOpen(true)}
          className="absolute bottom-4 right-4 rounded-full shadow-md 
                   opacity-0 group-hover:opacity-100 transition-opacity"
          size="icon"
          variant="default"
          disabled={!isAvailable}
        >
          <ShoppingCart />
        </Button>

        {/* Optional overlay text for unavailable */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-sm font-semibold rounded-xl">
            Not Available
          </div>
        )}
      </Card>

      {/* Size Selection Dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Select a Size</AlertDialogTitle>
            <AlertDialogDescription>
              Choose the size for <b>{product?.name}</b>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            {product?.sizes?.small !== undefined && (
              <Button
                variant="outline"
                onClick={() => handleSelect("small", product.sizes!.small!)}
              >
                Small – ${product.sizes.small}
              </Button>
            )}
            {product?.sizes?.large !== undefined && (
              <Button
                variant="outline"
                onClick={() => handleSelect("large", product.sizes!.large!)}
              >
                Large – ${product.sizes.large}
              </Button>
            )}
            {product?.sizes?.extraLarge !== undefined && (
              <Button
                variant="outline"
                onClick={() =>
                  handleSelect("extraLarge", product.sizes!.extraLarge!)
                }
              >
                Extra Large – ${product.sizes.extraLarge}
              </Button>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductCard;
