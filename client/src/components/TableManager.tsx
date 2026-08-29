import React, { useState, useEffect } from "react";
import {
  useGetTablesQuery,
  useAddTableMutation,
  useUpdateTableMutation,
  useUpdateTableStatusMutation,
  useDeleteTableMutation,
  useRegenerateTableQrMutation,
} from "@/services/tableService";
import type { Table } from "@/services/tableService";
import { socket } from "@/utils/socket";
import {
  Grid3X3,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  QrCode,
  Download,
  Printer,
  RefreshCw,
  Copy,
  ExternalLink,
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
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import Swal from "sweetalert2";

export const TableManager: React.FC = () => {
  const { data: tablesResponse, refetch } = useGetTablesQuery();
  const [addTable, { isLoading: isAdding }] = useAddTableMutation();
  const [updateTable] = useUpdateTableMutation();
  const [updateTableStatus] = useUpdateTableStatusMutation();
  const [deleteTable] = useDeleteTableMutation();
  const [regenerateTableQr, { isLoading: isRegenerating }] = useRegenerateTableQrMutation();

  const [activeSection, setActiveSection] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedQrTable, setSelectedQrTable] = useState<Table | null>(null);
  const [isPrintAllOpen, setIsPrintAllOpen] = useState(false);

  // Form State
  const [tableName, setTableName] = useState("");
  const [tableSeats, setTableSeats] = useState(4);
  const [tableSection, setTableSection] = useState("Main Hall");
  const [tableShape, setTableShape] = useState<"square" | "round" | "rectangle">("square");

  const canvasRef = useRef<HTMLDivElement>(null);

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
          seats: Number(tableSeats),
          section: tableSection,
          shape: tableShape,
        }).unwrap();
        Swal.fire({
          icon: "success",
          title: "Table Updated!",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        await addTable({
          name: tableName,
          seats: Number(tableSeats),
          section: tableSection,
          shape: tableShape,
        }).unwrap();
        Swal.fire({
          icon: "success",
          title: "Table Added!",
          timer: 1200,
          showConfirmButton: false,
        });
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Failed to save table",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const res = await Swal.fire({
      title: `Delete Table ${name}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    });

    if (res.isConfirmed) {
      try {
        await deleteTable(id).unwrap();
        Swal.fire({
          icon: "success",
          title: "Table Deleted",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err?.data?.message || "Failed to delete table",
        });
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateTableStatus({ id, status: newStatus }).unwrap();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Failed to update status",
      });
    }
  };

  const handleRegenerateQr = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Regenerate QR Code?",
      text: "Existing printed QR stickers for this table will become inactive.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Regenerate",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await regenerateTableQr(id).unwrap();
        setSelectedQrTable(res.table);
        Swal.fire({
          icon: "success",
          title: "New QR Token Generated!",
          timer: 1200,
          showConfirmButton: false,
        });
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err?.data?.message || "Failed to regenerate QR",
        });
      }
    }
  };

  const getTableQrUrl = (qrToken?: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/order/${qrToken || "invalid"}`;
  };

  const downloadQrPng = (tableName: string) => {
    const canvas = document.getElementById("single-table-qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR-${tableName.replace(/\s+/g, "_")}.png`;
      a.click();
    }
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Floor Plan & Table QR Management"
        subtitle="Manage dine-in seating, table status, and generate smart QR codes for touchless customer ordering"
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsPrintAllOpen(true)}
            variant="outline"
            className="rounded-xl border-border font-bold text-xs flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            Print All Table QRs
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Table
          </Button>
        </div>
      </PageHeader>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="Total Tables"
          value={totalTables}
          icon={Grid3X3}
          accentColor="slate"
        />
        <StatCard
          title="Available (Free)"
          value={availableTables}
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Occupied"
          value={occupiedTables}
          icon={Users}
          accentColor="rose"
        />
        <StatCard
          title="Reserved"
          value={reservedTables}
          icon={Clock}
          accentColor="amber"
        />
      </div>

      {/* Section Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border/80">
        <button
          onClick={() => setActiveSection("all")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSection === "all"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-card border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          All Sections ({tables.length})
        </button>

        {sections.map((sec) => {
          const count = tables.filter((t) => (t.section || "Main Hall") === sec).length;
          const isSelected = activeSection === sec;

          return (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                isSelected
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

          return (
            <div
              key={table._id}
              className={`relative rounded-3xl border p-5 shadow-xs flex flex-col justify-between gap-4 transition-all duration-200 ${
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
                    <h3 className="text-xl font-black text-foreground tracking-tight">
                      {table.name}
                    </h3>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      • {table.section || "Main Hall"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 mt-0.5">
                    <Users className="h-3.5 w-3.5" />
                    Capacity: {table.seats} Guests ({table.shape || "square"})
                  </p>
                </div>

                <StatusBadge status={table.status} type="table" />
              </div>

              {/* Active Order Pill if Occupied */}
              {table.activeOrder && (
                <div className="p-2.5 rounded-xl bg-accent/60 border border-border/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Active Order:</span>
                    <span className="font-black font-tabular text-amber-600 dark:text-amber-400">
                      ৳{table.activeOrder.totalPrice || 0}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions Toolbar */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                {/* Status Quick Changer */}
                <Select
                  value={table.status}
                  onValueChange={(val) => handleStatusChange(table._id, val)}
                >
                  <SelectTrigger className="h-8 text-xs font-bold rounded-xl border-border/80 bg-background w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs font-semibold">
                    <SelectItem value="free">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1">
                  {/* Smart QR Code button */}
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setSelectedQrTable(table)}
                    className="h-8 w-8 rounded-xl border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    title="View Table QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenEdit(table)}
                    className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                    title="Edit Table"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(table._id, table.name)}
                    className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Delete Table"
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
              {editingTable ? "Edit Table Details" : "Add New Seating Table"}
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
                placeholder="e.g. Table 08, VIP 1, Terrace 3"
                className="rounded-xl mt-1 font-semibold"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Seat Capacity (Guests) *
              </Label>
              <Input
                type="number"
                min={1}
                max={50}
                required
                value={tableSeats}
                onChange={(e) => setTableSeats(Number(e.target.value))}
                className="rounded-xl mt-1 font-tabular font-semibold"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Floor Section
              </Label>
              <Input
                value={tableSection}
                onChange={(e) => setTableSection(e.target.value)}
                placeholder="Main Hall, Terrace, Rooftop, VIP Lounge"
                className="rounded-xl mt-1 font-medium"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Table Shape
              </Label>
              <Select
                value={tableShape}
                onValueChange={(val: any) => setTableShape(val)}
              >
                <SelectTrigger className="rounded-xl mt-1 text-xs font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="round">Round</SelectItem>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Single Table QR Code Dialog */}
      <Dialog
        open={Boolean(selectedQrTable)}
        onOpenChange={(open) => !open && setSelectedQrTable(null)}
      >
        {selectedQrTable && (
          <DialogContent className="sm:max-w-md p-6 rounded-3xl border border-border/80 shadow-2xl text-center space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-foreground">
                Smart QR • {selectedQrTable.name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Section: {selectedQrTable.section} • Capacity: {selectedQrTable.seats} guests
              </p>
            </DialogHeader>

            {/* QR Card Preview */}
            <div className="p-6 rounded-3xl border-2 border-dashed border-amber-500/40 bg-card inline-block mx-auto shadow-inner space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase text-amber-600 dark:text-amber-400">
                <Coffee className="h-4 w-4" />
                Cafe Sync
              </div>

              <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
                <QRCodeSVG
                  value={getTableQrUrl(selectedQrTable.qrToken)}
                  size={180}
                  level="H"
                />
                {/* Hidden canvas for PNG export */}
                <div className="hidden">
                  <QRCodeCanvas
                    id="single-table-qr-canvas"
                    value={getTableQrUrl(selectedQrTable.qrToken)}
                    size={500}
                    level="H"
                  />
                </div>
              </div>

              <div>
                <p className="text-base font-black text-foreground">
                  {selectedQrTable.name}
                </p>
                <p className="text-[11px] text-muted-foreground font-semibold">
                  Scan to browse menu & order
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <Button
                variant="outline"
                onClick={() => downloadQrPng(selectedQrTable.name)}
                className="rounded-xl font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5 text-amber-600" />
                Download PNG
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(getTableQrUrl(selectedQrTable.qrToken));
                  Swal.fire({
                    toast: true,
                    position: "top",
                    icon: "success",
                    title: "QR Order Link Copied!",
                    showConfirmButton: false,
                    timer: 1200,
                  });
                }}
                className="rounded-xl font-bold flex items-center justify-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5 text-blue-600" />
                Copy Link
              </Button>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
              <button
                type="button"
                onClick={() =>
                  window.open(getTableQrUrl(selectedQrTable.qrToken), "_blank")
                }
                className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Test Customer Menu
              </button>

              <button
                type="button"
                disabled={isRegenerating}
                onClick={() => handleRegenerateQr(selectedQrTable._id)}
                className="text-rose-600 font-bold flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate Token
              </button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Bulk Print All QR Sheets Modal */}
      <Dialog open={isPrintAllOpen} onOpenChange={setIsPrintAllOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl border border-border/80 shadow-2xl">
          <DialogHeader className="flex-row items-center justify-between border-b border-border/60 pb-3">
            <div>
              <DialogTitle className="text-xl font-black text-foreground">
                Print Table QR Stickers & Stands
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ready-to-print branded cards for all {tables.length} tables
              </p>
            </div>

            <Button
              onClick={handlePrintAll}
              className="bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md"
            >
              <Printer className="h-4 w-4" />
              Print Sheet Now
            </Button>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
            {tables.map((t) => (
              <div
                key={t._id}
                className="p-4 rounded-2xl border-2 border-dashed border-border bg-card text-center space-y-2 flex flex-col items-center justify-between"
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-black uppercase text-amber-600">
                  <Coffee className="h-3.5 w-3.5" />
                  Cafe Sync
                </div>

                <div className="bg-white p-2 rounded-xl border">
                  <QRCodeSVG value={getTableQrUrl(t.qrToken)} size={120} level="H" />
                </div>

                <div>
                  <h4 className="font-black text-sm text-foreground">{t.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    {t.section} • Scan to Order
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableManager;
