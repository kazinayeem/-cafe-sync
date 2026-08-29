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
import { useGetModifierGroupsQuery } from "@/services/modifierApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Coffee, Check } from "lucide-react";

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
  const { data: modifierGroupsResponse } = useGetModifierGroupsQuery();
  const modifierGroups = modifierGroupsResponse?.data || [];

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    setIsFormDialogOpen(open);
  };

  const handleToggleModifierGroup = (groupId: string) => {
    const currentGroups = formData.modifierGroups || [];
    if (currentGroups.includes(groupId)) {
      setFormData({
        ...formData,
        modifierGroups: currentGroups.filter((id: string) => id !== groupId),
      });
    } else {
      setFormData({
        ...formData,
        modifierGroups: [...currentGroups, groupId],
      });
    }
  };

  return (
    <Dialog open={isFormDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-border/80 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            {editId ? "Edit Menu Product" : "Add New Menu Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Product Name *
              </Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Vanilla Iced Latte"
                className="rounded-xl mt-1 font-semibold"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger className="rounded-xl mt-1 text-xs font-medium">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description (Optional)
            </Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="e.g. Fresh espresso with velvety steamed milk & pure vanilla"
              className="rounded-xl mt-1"
            />
          </div>

          {/* Sizes & Pricing */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Size Pricing (৳ BDT)
            </Label>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  Regular / Small
                </span>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.sizes.small}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sizes: { ...formData.sizes, small: Number(e.target.value) },
                    })
                  }
                  className="rounded-xl mt-1 font-bold font-tabular"
                />
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  Large
                </span>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.sizes.large}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sizes: { ...formData.sizes, large: Number(e.target.value) },
                    })
                  }
                  className="rounded-xl mt-1 font-bold font-tabular"
                />
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  Extra Large (XL)
                </span>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.sizes.extraLarge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sizes: { ...formData.sizes, extraLarge: Number(e.target.value) },
                    })
                  }
                  className="rounded-xl mt-1 font-bold font-tabular"
                />
              </div>
            </div>
          </div>

          {/* Inventory Tracking & Stock */}
          <div className="p-3.5 rounded-2xl bg-accent/40 border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Inventory Stock Control
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={formData.trackInventory ?? true}
                  onChange={(e) =>
                    setFormData({ ...formData, trackInventory: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-amber-600"
                />
                <span>Track Stock Quantity</span>
              </label>
            </div>

            {formData.trackInventory && (
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    Current Stock
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={formData.stockQuantity ?? 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockQuantity: Number(e.target.value),
                      })
                    }
                    className="rounded-xl mt-1 font-bold font-tabular"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    Low Stock Alert
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={formData.minStockLevel ?? 10}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minStockLevel: Number(e.target.value),
                      })
                    }
                    className="rounded-xl mt-1 font-bold font-tabular"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    Unit (pcs/cups)
                  </span>
                  <Input
                    value={formData.unit || "pcs"}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="rounded-xl mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modifier Groups Assignment */}
          {modifierGroups.length > 0 && (
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Attached Modifier Groups
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {modifierGroups.map((g) => {
                  const isSelected = (formData.modifierGroups || []).includes(g._id);

                  return (
                    <button
                      key={g._id}
                      type="button"
                      onClick={() => handleToggleModifierGroup(g._id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-100 shadow-xs"
                          : "border-border hover:bg-accent text-foreground"
                      }`}
                    >
                      <span className="truncate">{g.name}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-amber-600 shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Product Image
            </Label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    alert("File size must be less than 2MB");
                    return;
                  }
                  setFormData({
                    ...formData,
                    imageFile: file,
                    imageUrl: URL.createObjectURL(file),
                  });
                }}
                className="rounded-xl text-xs"
              />
              {formData.imageUrl && (
                <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-border">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 gap-2 border-t border-border/80">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFormDialogOpen(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 rounded-xl shadow-md"
          >
            {editId ? "Update Product" : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
