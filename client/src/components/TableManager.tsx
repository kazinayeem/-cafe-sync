import React, { useState, useEffect } from "react";
import {
  useGetTablesQuery,
  useAddTableMutation,
  useUpdateTableMutation,
  useUpdateTableStatusMutation,
  useDeleteTableMutation,
  Table,
} from "@/services/tableService";
import { socket } from "@/utils/socket";
import {
  Grid3X3,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  Edit2,
  Receipt,
  RotateCcw,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "./ui/PageHeader";
import { StatCard } from "./ui/StatCard";
import { StatusBadge } from "./ui/StatusBadge";
import Swal from "sweetalert2";

export const TableManager: React.FC = () => {
  const { data: tablesResponse, isLoading, refetch } = useGetTablesQuery();
  const [addTable, { isLoading: isAdding }] = useAddTableMutation();
  const [updateTable] = useUpdateTableMutation();
  const [updateTableStatus] = useUpdateTableStatusMutation();
  const [deleteTable] = useDeleteTableMutation();

  const [activeSection, setActiveSection] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  // Form State
  const [tableName, setTableName] = useState("");
  const [tableSeats, setTableSeats] = useState(4);
  const [tableSection, setTableSection] = useState("Main Hall");
  const [tableShape, setTableShape] = useState<"square" | "round" | "rectangle">("square");

  // Real-time socket listeners
  useEffect(() => {
    socket.on("tableAdded", () => refetch());
    socket.on("tableUpdated", () => refetch());
    socket.on("tableDeleted", () => refetch());
    socket.on("tableStatusUpdated", () => refetch());

    return () => {
      socket.off("tableAdded");
      socket.off("tableUpdated");
      socket.off("tableDeleted");
      socket.off("tableStatusUpdated");
    };
  }, [refetch]);

  const tables: Table[] = tablesResponse?.tables || [];

  // Extract unique sections
  const sections = Array.from(
    new Set(tables.map((t) => t.section || "Main Hall"))
  );

  const filteredTables = tables.filter((t) => {
    if (activeSection === "all") return true;
    return (t.section || "Main Hall") === activeSection;
  });

  const totalTables = tables.length;
  const availableTables = tables.filter((t) => t.status === "free").length;
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const reservedTables = tables.filter((t) => t.status === "reserved").length;

  const handleOpenAdd = () => {
    setEditingTable(null);
    setTableName(`T-${tables.length + 1}`);
    setTableSeats(4);
    setTableSection("Main Hall");
    setTableShape("square");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (t: Table) => {
    setEditingTable(t);
    setTableName(t.name);
    setTableSeats(t.seats);
    setTableSection(t.section || "Main Hall");
    setTableShape(t.shape || "square");
    setIsAddModalOpen(true);
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName) return;

    try {
      if (editingTable) {
        await updateTable({
          id: editingTable._id,
          name: tableName,
          seats: tableSeats,
          section: tableSection,
          shape: tableShape,
        }).unwrap();
        Swal.fire({ icon: "success", title: "Table Updated!", timer: 1200, showConfirmButton: false });
      } else {
        await addTable({
          name: tableName,
          seats: tableSeats,
          section: tableSection,
          shape: tableShape,
        }).unwrap();
        Swal.fire({ icon: "success", title: "Table Added!", timer: 1200, showConfirmButton: false });
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err?.data?.message || "Failed to save table" });
    }
  };

  const handleStatusChange = async (t: Table, newStatus: string) => {
    try {
      await updateTableStatus({ id: t._id, status: newStatus }).unwrap();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err?.data?.message || "Failed to update status" });
    }
  };

  const handleDeleteTable = async (id: string) => {
    const res = await Swal.fire({
      title: "Delete Table?",
      text: "This table will be removed from the floor plan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    });

    if (res.isConfirmed) {
      try {
        await deleteTable(id).unwrap();
        Swal.fire({ icon: "success", title: "Deleted", timer: 1000, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: "error", title: "Failed to delete" });
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Table & Floor Plan"
        subtitle="Manage dining sections, table capacities, reservations, and real-time occupancy"
      >
        <Button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Table
        </Button>
      </PageHeader>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard title="Total Tables" value={totalTables} icon={Grid3X3} accentColor="slate" />
        <StatCard title="Available" value={availableTables} icon={CheckCircle2} accentColor="emerald" />
        <StatCard title="Occupied" value={occupiedTables} icon={Users} accentColor="rose" />
        <StatCard title="Reserved" value={reservedTables} icon={Clock} accentColor="amber" />
      </div>

      {/* Section Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSection("all")}
          className={`h-9 px-4 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSection === "all"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-card border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          All Sections ({totalTables})
        </button>
        {sections.map((sec) => {
          const count = tables.filter((t) => (t.section || "Main Hall") === sec).length;
          return (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeSection === sec
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-card border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {sec} ({count})
            </button>
          );
        })}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const isFree = table.status === "free";
          const isOccupied = table.status === "occupied";
          const isReserved = table.status === "reserved";
          const isCleaning = table.status === "cleaning";

          return (
            <div
              key={table._id}
              className={`relative rounded-2xl border p-4 shadow-sm flex flex-col justify-between gap-4 transition-all duration-200 ${
                isFree
                  ? "bg-card border-emerald-500/30 hover:border-emerald-500"
                  : isOccupied
                  ? "bg-rose-500/5 border-rose-500/30 hover:border-rose-500"
                  : isReserved
                  ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500"
                  : "bg-blue-500/5 border-blue-500/30 hover:border-blue-500"
              }`}
            >
              {/* Top Row: Name, Section & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-foreground tracking-tight">
                      {table.name}
                    </h3>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      • {table.section || "Main Hall"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                    <Users className="h-3 w-3" />
                    {table.seats} Seats ({table.shape || "Square"})
                  </p>
                </div>

                <StatusBadge status={table.status} type="table" />
              </div>

              {/* Middle: Active Order details if occupied */}
              {isOccupied && table.activeOrder && (
                <div className="p-2.5 rounded-xl bg-card border border-border/80 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-muted-foreground">Order:</span>
                    <span>#{table.activeOrder.customOrderID || "Active"}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-amber-600 dark:text-amber-400 font-tabular">
                    <span>Total Bill:</span>
                    <span>৳{table.activeOrder.totalPrice || 0}</span>
                  </div>
                </div>
              )}

              {/* Bottom Quick Status Actions & Edit */}
              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-border/60">
                <div className="flex items-center gap-1">
                  {isFree ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(table, "occupied")}
                      className="h-8 text-[11px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                    >
                      Seat Table
                    </Button>
                  ) : isOccupied ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(table, "cleaning")}
                      className="h-8 text-[11px] font-bold text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                    >
                      Mark Cleaning
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(table, "free")}
                      className="h-8 text-[11px] font-bold text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                    >
                      Mark Free
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenEdit(table)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteTable(table._id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Table Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingTable ? "Edit Table" : "Add New Table"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveTable} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Table Name / Number *
              </Label>
              <Input
                required
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="e.g. T-1, Patio-4, VIP-1"
                className="rounded-xl mt-1 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Seating Capacity
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={tableSeats}
                  onChange={(e) => setTableSeats(Number(e.target.value))}
                  className="rounded-xl mt-1 font-tabular"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Shape
                </Label>
                <Select
                  value={tableShape}
                  onValueChange={(val: any) => setTableShape(val)}
                >
                  <SelectTrigger className="rounded-xl mt-1 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="round">Round</SelectItem>
                    <SelectItem value="rectangle">Rectangle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Floor Section
              </Label>
              <Input
                value={tableSection}
                onChange={(e) => setTableSection(e.target.value)}
                placeholder="e.g. Main Hall, Patio, 2nd Floor"
                className="rounded-xl mt-1"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md"
              >
                {editingTable ? "Save Changes" : "Create Table"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableManager;
