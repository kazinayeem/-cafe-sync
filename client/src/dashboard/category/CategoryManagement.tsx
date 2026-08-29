import React, { useState } from "react";
import {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  Category,
} from "@/services/categoryApi";
import { FolderTree, Plus, Edit2, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import Swal from "sweetalert2";

export default function CategoryManagement() {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName("");
    setIsOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory._id, name }).unwrap();
        Swal.fire({ icon: "success", title: "Category Updated!", timer: 1200, showConfirmButton: false });
      } else {
        await addCategory({ name }).unwrap();
        Swal.fire({ icon: "success", title: "Category Created!", timer: 1200, showConfirmButton: false });
      }
      setIsOpen(false);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err?.data?.message || "Failed to save category" });
    }
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: "Delete Category?",
      text: "This category will be deleted. Items in this category will become uncategorized.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    });

    if (res.isConfirmed) {
      try {
        await deleteCategory(id).unwrap();
        Swal.fire({ icon: "success", title: "Deleted", timer: 1000, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: "error", title: "Failed to delete" });
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Menu Categories"
        subtitle="Organize drinks, foods, desserts, and retail beans into POS category tabs"
      >
        <Button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Categories"
          value={categories.length}
          icon={FolderTree}
          accentColor="amber"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-card border border-border/60 animate-pulse"
              />
            ))
        ) : categories.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={FolderTree}
              title="No Categories Yet"
              description="Create categories like Espresso, Cold Brew, Bakery, Snacks."
              actionLabel="+ Add Category"
              onAction={handleOpenAdd}
            />
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat._id}
              className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex items-center justify-between gap-3 hover:border-amber-500/50 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-foreground truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {cat.items?.length || 0} products
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleOpenEdit(cat)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(cat._id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category Name *
              </Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hot Coffee, Iced Teas, Pastries"
                className="rounded-xl mt-1 font-semibold"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md"
              >
                {editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
