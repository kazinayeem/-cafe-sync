import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCategoriesQuery } from "@/services/categoryApi";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface ProductFormDialogProps {
  isFormDialogOpen: boolean;
  setIsFormDialogOpen: (open: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  handleSubmit: () => void;
  editId: string | null;
  resetForm: () => void;
}

export function ProductFormDialog({
  isFormDialogOpen,
  setIsFormDialogOpen,
  formData,
  setFormData,
  handleSubmit,
  editId,
  resetForm,
}: ProductFormDialogProps) {
  const { data: categories } = useGetCategoriesQuery();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsFormDialogOpen(open);
  };

  return (
    <AlertDialog open={isFormDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" onClick={resetForm} className="mb-4">
          Add Product
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-lg dark:bg-gray-800 dark:text-white">
        <Button
          variant="ghost"
          onClick={() => setIsFormDialogOpen(false)}
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white p-1 rounded-full"
        >
          ✕
        </Button>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {editId ? "Edit Product" : "Add Product"}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-3 mt-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(val) =>
                setFormData({ ...formData, category: val })
              }
            >
              <SelectTrigger
                id="category"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                {categories?.map((cat: any) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <div>
              <Label htmlFor="image">Product Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFormData({
                    ...formData,
                    imageFile: file, // store actual File
                    imageUrl: URL.createObjectURL(file), // preview
                  });
                }}
              />

              {formData.imageUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Image Preview:
                  </p>
                  <img
                    src={formData.imageUrl}
                    alt="Product Preview"
                    className="w-full h-32 object-cover rounded-md mt-1"
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <Label>Sizes</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Small"
                value={formData.sizes.small}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sizes: { ...formData.sizes, small: Number(e.target.value) },
                  })
                }
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <Input
                type="number"
                placeholder="Large"
                value={formData.sizes.large}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sizes: { ...formData.sizes, large: Number(e.target.value) },
                  })
                }
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <Input
                type="number"
                placeholder="XL"
                value={formData.sizes.extraLarge}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sizes: {
                      ...formData.sizes,
                      extraLarge: Number(e.target.value),
                    },
                  })
                }
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
          <Button
            className="w-full mt-2 dark:bg-blue-600 dark:hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {editId ? "Update" : "Create"}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
