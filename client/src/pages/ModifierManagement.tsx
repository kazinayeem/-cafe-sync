import React, { useState } from "react";
import {
  useGetModifierGroupsQuery,
  useCreateModifierGroupMutation,
  useUpdateModifierGroupMutation,
  useDeleteModifierGroupMutation,
  ModifierGroup,
  ModifierOption,
} from "@/services/modifierApi";
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Coffee,
} from "lucide-react";
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
import { EmptyState } from "@/components/ui/EmptyState";
import Swal from "sweetalert2";

export const ModifierManagement: React.FC = () => {
  const { data: groupsResponse, isLoading } = useGetModifierGroupsQuery();
  const [createGroup, { isLoading: isCreating }] = useCreateModifierGroupMutation();
  const [updateGroup] = useUpdateModifierGroupMutation();
  const [deleteGroup] = useDeleteModifierGroupMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);

  // Form states
  const [groupName, setGroupName] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [minSelection, setMinSelection] = useState(0);
  const [maxSelection, setMaxSelection] = useState(1);
  const [options, setOptions] = useState<ModifierOption[]>([
    { name: "", price: 0 },
  ]);

  const groups = groupsResponse?.data || [];

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setGroupName("");
    setIsRequired(false);
    setMinSelection(0);
    setMaxSelection(1);
    setOptions([
      { name: "Option 1", price: 0 },
      { name: "Option 2", price: 50 },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: ModifierGroup) => {
    setEditingGroup(g);
    setGroupName(g.name);
    setIsRequired(g.required);
    setMinSelection(g.minSelection);
    setMaxSelection(g.maxSelection);
    setOptions(g.options.map((o) => ({ name: o.name, price: o.price })));
    setIsModalOpen(true);
  };

  const handleAddOptionRow = () => {
    setOptions([...options, { name: "", price: 0 }]);
  };

  const handleRemoveOptionRow = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (
    index: number,
    field: "name" | "price",
    value: any
  ) => {
    const updated = [...options];
    updated[index] = {
      ...updated[index],
      [field]: field === "price" ? Number(value) : value,
    };
    setOptions(updated);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || options.length === 0) return;

    const validOptions = options.filter((o) => o.name.trim().length > 0);
    if (validOptions.length === 0) {
      alert("Please add at least one valid modifier option.");
      return;
    }

    try {
      if (editingGroup) {
        await updateGroup({
          id: editingGroup._id,
          name: groupName,
          required: isRequired,
          minSelection,
          maxSelection,
          options: validOptions,
        }).unwrap();
        Swal.fire({ icon: "success", title: "Modifier Group Updated!", timer: 1200, showConfirmButton: false });
      } else {
        await createGroup({
          name: groupName,
          required: isRequired,
          minSelection,
          maxSelection,
          options: validOptions,
        }).unwrap();
        Swal.fire({ icon: "success", title: "Modifier Group Created!", timer: 1200, showConfirmButton: false });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err?.data?.message || "Failed to save modifier group" });
    }
  };

  const handleDeleteGroup = async (id: string) => {
    const res = await Swal.fire({
      title: "Delete Modifier Group?",
      text: "This group will be removed from products.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    });

    if (res.isConfirmed) {
      try {
        await deleteGroup(id).unwrap();
        Swal.fire({ icon: "success", title: "Deleted", timer: 1000, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: "error", title: "Failed to delete" });
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Product Modifiers & Add-ons"
        subtitle="Create reusable modifier groups like Milk Types, Sugar Levels, and Extra Flavors with add-on pricing"
      >
        <Button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Modifier Group
        </Button>
      </PageHeader>

      {/* Modifier Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-card border border-border/60 animate-pulse"
              />
            ))
        ) : groups.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Sliders}
              title="No Modifier Groups"
              description="Create modifier groups to allow drink customizations (e.g. Milk: Oat/Almond, Sugar, Extra Shot)."
              actionLabel="+ Create Modifier Group"
              onAction={handleOpenAdd}
            />
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group._id}
              className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-amber-500/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-border/80 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-foreground">
                    {group.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {group.required ? "Required Selection" : "Optional"} • Max{" "}
                    {group.maxSelection} choices
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenEdit(group)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteGroup(group._id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Options Badges List */}
              <div className="space-y-1.5 py-1">
                {group.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-accent/40 border border-border/60 text-xs"
                  >
                    <span className="font-semibold text-foreground">
                      {opt.name}
                    </span>
                    <span className="font-black font-tabular text-amber-600 dark:text-amber-400">
                      {opt.price > 0 ? `+৳${opt.price}` : "Free"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modifier Group Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingGroup ? "Edit Modifier Group" : "Create Modifier Group"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveGroup} className="space-y-5 py-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Group Name *
              </Label>
              <Input
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Milk Options, Sugar Level, Syrups"
                className="rounded-xl mt-1 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Max Selections
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={maxSelection}
                  onChange={(e) => setMaxSelection(Number(e.target.value))}
                  className="rounded-xl mt-1 font-tabular"
                />
              </div>

              <div className="flex flex-col justify-center pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="h-4 w-4 rounded text-amber-600"
                  />
                  <span>Required Selection</span>
                </label>
              </div>
            </div>

            {/* Options List Builder */}
            <div className="space-y-2.5 border-t border-border/80 pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Modifier Options & Add-on Prices
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddOptionRow}
                  className="h-7 text-xs font-bold rounded-lg"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Option name (e.g. Oat Milk)"
                      value={opt.name}
                      onChange={(e) =>
                        handleOptionChange(idx, "name", e.target.value)
                      }
                      className="rounded-xl flex-1 text-xs"
                    />
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                        ৳
                      </span>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Price"
                        value={opt.price}
                        onChange={(e) =>
                          handleOptionChange(idx, "price", e.target.value)
                        }
                        className="pl-6 rounded-xl text-xs font-tabular font-bold"
                      />
                    </div>
                    {options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOptionRow(idx)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md"
              >
                {editingGroup ? "Save Changes" : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModifierManagement;
