import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "@/services/productApi";
import { Pencil, Trash2 } from "lucide-react";
import { ProductFormDialog } from "@/components/ProductFormDialog";

export default function ProductManagement() {
  const { data: productsResponse, isLoading } = useGetProductsQuery();
  const [addProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const products = Array.isArray(productsResponse)
    ? productsResponse
    : productsResponse && "data" in productsResponse
    ? (productsResponse as { data: any[] }).data
    : [];

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    category: "",
    description: "",
    imageUrl: "",
    available: true,
    sizes: { small: 0, large: 0, extraLarge: 0 },
  });
  const [editId, setEditId] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      imageUrl: "",
      available: true,
      sizes: { small: 0, large: 0, extraLarge: 0 },
    });
    setEditId(null);
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await updateProduct({ id: editId, body: formData }).unwrap();
      } else {
        await addProduct(formData).unwrap();
      }
      setIsFormDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleEdit = (product: any) => {
    const { _id, __v, createdAt, updatedAt, ...rest } = product;
    setFormData(rest);
    setEditId(product._id);
    setIsFormDialogOpen(true);
  };

  const handleDelete = async () => {
    if (confirmDeleteId) {
      try {
        await deleteProduct(confirmDeleteId).unwrap();
      } catch (err) {
        console.error("Delete failed:", err);
      }
      setConfirmDeleteId(null);
    }
  };

  if (isLoading)
    return <p className="text-center dark:text-white">Loading products...</p>;

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Product Management
      </h1>

      {/* Product Form Dialog (Add/Edit) */}
      <ProductFormDialog
        isFormDialogOpen={isFormDialogOpen}
        setIsFormDialogOpen={setIsFormDialogOpen}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        editId={editId}
        resetForm={resetForm}
      />

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {products.length === 0 ? (
          <p className="col-span-full text-center text-gray-600 dark:text-gray-400">
            No products found. Add your first product!
          </p>
        ) : (
          products.map((product: any) => (
            <Card
              key={product._id}
              className="relative dark:bg-gray-800 dark:text-white dark:border-gray-700 overflow-hidden"
            >
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-md"
                />
              )}
              <CardHeader className="pb-2">
                <CardTitle>{product.name}</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  {product.category.name || "Uncategorized"}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm dark:text-gray-300">
                <p className="mb-2 line-clamp-2">{product.description}</p>
                <p>Available: {product.available ? "✅ Yes" : "❌ No"}</p>
                <p>
                  Sizes: S:{product.sizes.small || 0} | L:
                  {product.sizes.large || 0} | XL:
                  {product.sizes.extraLarge || 0}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0 absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(product)}
                  className="dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmDeleteId(product._id)}
                  className="dark:text-red-400 dark:hover:bg-gray-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={() => setConfirmDeleteId(null)}
      >
        <AlertDialogContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              This action cannot be undone. This will permanently delete the
              product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
