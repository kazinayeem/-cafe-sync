import { useEffect, useState } from "react";
import { socket } from "../utils/socket";

import {
  getTables,
  addTable,
  updateTableStatus,
  updateTable,
  deleteTable,
} from "../services/tableService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Loader } from "lucide-react";

interface Table {
  _id: string;
  name: string;
  seats: number;
  status: "occupied" | "free";
}

export default function TableManager() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isUpdatingTable, setIsUpdatingTable] = useState(false);
  const [tableName, setTableName] = useState("");
  const [tableSeats, setTableSeats] = useState<number | "">("");

  useEffect(() => {
    getTables().then((data) => setTables(data.tables));
  }, []);

 
  useEffect(() => {
    socket.on("tableAdded", (newTable: Table) =>
      setTables((prev) => [...prev, newTable])
    );
    socket.on("tableUpdated", (updatedTable: Table) =>
      setTables((prev) =>
        prev.map((t) => (t._id === updatedTable._id ? updatedTable : t))
      )
    );
    socket.on("tableDeleted", (deletedId: string) =>
      setTables((prev) => prev.filter((t) => t._id !== deletedId))
    );
    socket.on("tableStatusUpdated", (data: { id: string; status: string }) =>
      setTables((prev) =>
        prev.map((t) =>
          t._id === data.id
            ? { ...t, status: data.status as "free" | "occupied" }
            : t
        )
      )
    );
    return () => {
      socket.off("tableAdded");
      socket.off("tableUpdated");
      socket.off("tableDeleted");
      socket.off("tableStatusUpdated");
    };
  }, []);

  const confirmToggleStatus = async (table: Table) => {
    const newStatus = table.status === "free" ? "occupied" : "free";

    const result = await Swal.fire({
      title: `${newStatus === "occupied" ? "Book" : "Unbook"} Table "${
        table.name
      }"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: newStatus === "occupied" ? "Book" : "Unbook",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await updateTableStatus(table._id, newStatus);
      Swal.fire(
        "Success!",
        `Table "${table.name}" is now ${newStatus.toUpperCase()}.`,
        "success"
      );
    }
  };

  const toggleStatus = async () => {
    if (!selectedTable) return;
    const newStatus = selectedTable.status === "free" ? "occupied" : "free";
    await updateTableStatus(selectedTable._id, newStatus);
    setStatusDialogOpen(false);
    setSelectedTable(null);
  };

  const openEditDialog = (table: Table) => {
    setSelectedTable(table);
    setTableName(table.name);
    setTableSeats(table.seats);
    setEditDialogOpen(true);
  };

  const handleEditTable = async () => {
    if (!selectedTable || !tableName || tableSeats === "") return;

    try {
      setIsUpdatingTable(true); // ✅ start loading
      await updateTable(selectedTable._id, tableName, Number(tableSeats));
      setEditDialogOpen(false);
      setSelectedTable(null);
      Swal.fire(
        "Success!",
        `Table "${tableName}" updated successfully.`,
        "success"
      );
    } catch (error) {
      Swal.fire("Error!", "Failed to update table.", "error");
    } finally {
      setIsUpdatingTable(false);
    }
  };

  const handleDeleteTable = async (table: Table) => {
    const result = await Swal.fire({
      title: `Delete "${table.name}"?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await deleteTable(table._id);
      Swal.fire(
        "Deleted!",
        `Table "${table.name}" has been deleted.`,
        "success"
      );
    }
  };

  const handleAddTable = async () => {
    if (!tableName || tableSeats === "") return;
    await addTable(tableName, Number(tableSeats));
    setTableName("");
    setTableSeats("");
    setAddDialogOpen(false);
  };

  return (
    <div className="p-4  mx-auto">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          🍽️ Table Manager
        </h2>
        <AlertDialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600">
              Add Table +
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Add New Table</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="flex flex-col gap-3 mt-4">
              <Input
                placeholder="Table Name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Seats"
                value={tableSeats}
                onChange={(e) => setTableSeats(Number(e.target.value))}
              />
            </div>
            <AlertDialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTable}>Add Table</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((table) => (
          <Card
            key={table._id}
            className={`border rounded-lg shadow-sm cursor-pointer hover:shadow-lg transition-transform transform hover:scale-105
              border-gray-200 dark:border-gray-700
              ${
                table.status === "free"
                  ? "bg-white dark:bg-green-900/20"
                  : "bg-white dark:bg-red-900/20"
              }
            `}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-center text-gray-900 dark:text-gray-100">
                {table.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-800 dark:text-gray-200">
              <p className="text-sm">Seats: {table.seats}</p>
              <p
                className={`mt-1 font-medium ${
                  table.status === "free"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {table.status.toUpperCase()}
              </p>
            </CardContent>
            <div className="flex justify-center gap-2 mb-2">
              <Button size="sm" onClick={() => openEditDialog(table)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteTable(table)}
              >
                Delete
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => confirmToggleStatus(table)}
              >
                {table.status === "free" ? "Book" : "Unbook"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Table Dialog */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Table</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Input
              placeholder="Table Name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Seats"
              value={tableSeats}
              onChange={(e) => setTableSeats(Number(e.target.value))}
            />
          </div>
          <AlertDialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTable} disabled={isUpdatingTable}>
              {isUpdatingTable ? (
                <Loader className="animate-spin w-4 h-4 mr-2 inline-block" />
              ) : null}
              {isUpdatingTable ? "Updating..." : "Update"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent className="sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedTable?.status === "free"
                ? "Book Table?"
                : "Unbook Table?"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p className="my-4 text-center text-gray-800 dark:text-gray-200">
            Are you sure you want to{" "}
            {selectedTable?.status === "free" ? "book" : "unbook"} table "
            {selectedTable?.name}"?
          </p>
          <AlertDialogFooter className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={toggleStatus}>
              {selectedTable?.status === "free" ? "Book" : "Unbook"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
