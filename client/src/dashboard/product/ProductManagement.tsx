import React, { useState } from "react";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
  Product,
} from "@/services/productApi";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Coffee,
  Sliders,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductFormDialog } from "@/components/ProductFormDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Swal from "sweetalert2";

export default function ProductManagement() {
  const { data: productsResponse, isLoading } = useGetProductsQuery();
  const [addProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const products: Product[] = Array.isArray(productsResponse)
    ? productsResponse
    : (productsResponse as any)?.data || [];

  const [search, setSearch] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    name: "",
    category: "",
    description: "",
    imageUrl: "",
    available: true,
    stockQuantity: 100,
    minStockLevel: 10,
    trackInventory: true,
    unit: "pcs",
    sizes: { small: 0, large: 0, extraLarge: 0 },
    modifierGroups: [],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      imageUrl: "",
      available: true,
      stockQuantity: 100,
      minStockLevel: 10,
      trackInventory: true,
      unit: "pcs",
      sizes: { small: 0, large: 0, extraLarge: 0 },
      modifierGroups: [],
    });
    setEditId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category?._id || product.category || "",
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      available: product.available,
      stockQuantity: product.stockQuantity || 100,
      minStockLevel: product.minStockLevel || 10,
      trackInventory: product.trackInventory ?? true,
      unit: product.unit || "pcs",
      sizes: product.sizes || { small: 0, large: 0, extraLarge: 0 },
      modifierGroups: (product.modifierGroups || []).map((g: any) =>
        typeof g === "string" ? g : g._id
      ),
    });
    setEditId(product._id);
    setIsFormDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      Swal.fire({
        title: editId ? "Updating product..." : "Adding product...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const form = new FormData();
      form.append("name", formData.name);
      form.append("category", formData.category);
      form.append("description", formData.description || "");
      form.append("available", String(formData.available));
      form.append("stockQuantity", String(formData.stockQuantity));
      form.append("minStockLevel", String(formData.minStockLevel));
      form.append("trackInventory", String(formData.trackInventory));
      form.append("unit", formData.unit || "pcs");
      form.append("sizes[small]", String(formData.sizes.small || 0));
      form.append("sizes[large]", String(formData.sizes.large || 0));
      form.append("sizes[extraLarge]", String(formData.sizes.extraLarge || 0));
      form.append("modifierGroups", JSON.stringify(formData.modifierGroups || []));

      if (formData.imageFile) {
        form.append("image", formData.imageFile);
      }

      if (editId) {
        await updateProduct({ id: editId, body: form }).unwrap();
        Swal.fire({ icon: "success", title: "Product Updated!", timer: 1200, showConfirmButton: false });
      } else {
        await addProduct(form).unwrap();
        Swal.fire({ icon: "success", title: "Product Created!", timer: 1200, showConfirmButton: false });
      }

      setIsFormDialogOpen(false);
      resetForm();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err?.data?.message || "Failed to save product" });
    }
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: "Delete Product?",
      text: "This menu item will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    });

    if (res.isConfirmed) {
      try {
        await deleteProduct(id).unwrap();
        Swal.fire({ icon: "success", title: "Deleted", timer: 1000, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: "error", title: "Failed to delete" });
      }
    }
  };

  const handleToggleAvailable = async (product: Product) => {
    try {
      await updateProduct({
        id: product._id,
        body: { available: !product.available },
      }).unwrap();
    } catch (err) {
      console.error("Failed to toggle availability", err);
    }
  };

  const filteredProducts = products.filter((p) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSKUs = products.length;
  const availableSKUs = products.filter((p) => p.available).length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Menu & Product Catalog"
        subtitle="Manage drink items, food recipes, size pricing, modifier attachments, and ingredient inventory tracking"
      >
        <Button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Menu Item
        </Button>
      </PageHeader>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total Menu Items" value={totalSKUs} icon={Package} accentColor="slate" />
        <StatCard title="Active & Available on POS" value={availableSKUs} icon={CheckCircle2} accentColor="emerald" />
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 rounded-xl bg-card border-border/80 text-xs font-semibold shadow-xs"
        />
      </div>

      {/* Product Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/80 uppercase font-bold text-muted-foreground tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Size Pricing</th>
                <th className="py-3.5 px-4">Modifiers</th>
                <th className="py-3.5 px-4">Inventory Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td colSpan={7} className="py-4 px-4 bg-muted/20" />
                    </tr>
                  ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No products found. Add your first item!
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-accent/40 transition-colors">
                    {/* Item */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted overflow-hidden border">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Coffee className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">
                            {product.name}
                          </p>
                          {product.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-semibold text-muted-foreground">
                      {(product.category as any)?.name || "General"}
                    </td>

                    {/* Sizes */}
                    <td className="py-3.5 px-4 font-tabular">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {product.sizes?.small ? (
                          <span className="px-1.5 py-0.5 rounded bg-muted font-bold text-[10px]">
                            Reg: ৳{product.sizes.small}
                          </span>
                        ) : null}
                        {product.sizes?.large ? (
                          <span className="px-1.5 py-0.5 rounded bg-muted font-bold text-[10px]">
                            Lrg: ৳{product.sizes.large}
                          </span>
                        ) : null}
                        {product.sizes?.extraLarge ? (
                          <span className="px-1.5 py-0.5 rounded bg-muted font-bold text-[10px]">
                            XL: ৳{product.sizes.extraLarge}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Modifiers */}
                    <td className="py-3.5 px-4">
                      {product.modifierGroups && product.modifierGroups.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-800 dark:text-amber-300">
                          <Sliders className="h-3 w-3" />
                          {product.modifierGroups.length} Groups
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">None</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4 font-black font-tabular">
                      {product.trackInventory ? (
                        <span
                          className={
                            product.stockQuantity <= product.minStockLevel
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-foreground"
                          }
                        >
                          {product.stockQuantity} {product.unit || "pcs"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Untracked</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailable(product)}
                        className="cursor-pointer"
                        title="Click to toggle availability"
                      >
                        <StatusBadge
                          status={product.available ? "active" : "inactive"}
                          type="general"
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(product)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit Product"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(product._id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Dialog */}
      <ProductFormDialog
        isFormDialogOpen={isFormDialogOpen}
        setIsFormDialogOpen={setIsFormDialogOpen}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        editId={editId}
        resetForm={resetForm}
      />
    </div>
  );
}
