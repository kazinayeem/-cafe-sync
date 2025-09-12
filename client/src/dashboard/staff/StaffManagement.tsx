import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useAddStaffMutation,
  useDeleteStaffMutation,
  useGetAllStaffQuery,
  useToggleStaffActiveMutation,
  useUpdateStaffMutation,
} from "@/services/staffService";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface Staff {
  _id: string;
  name: string;
  email: string;
  role: string;
  position: string;
  active: boolean;
}

interface StaffForm {
  name: string;
  email: string;
  position: string;
  password?: string;
}

const positions = ["Barista", "Manager", "Cashier"];

export default function StaffManagement() {
  const { data, refetch } = useGetAllStaffQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [toggleStaffActive] = useToggleStaffActiveMutation();
  const staffs = data?.staffs || [];

  const [addStaff] = useAddStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const [form, setForm] = useState<StaffForm>({
    name: "",
    email: "",
    position: "",
    password: "",
  });

  const openEditDialog = (staff: Staff) => {
    setSelectedStaffId(staff._id);
    setForm({
      name: staff.name,
      email: staff.email,
      position: staff.position,
      password: "",
    });
    setEditOpen(true);
  };

  const handleAddStaff = async () => {
    if (!form.name || !form.email || !form.position || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      await addStaff({ ...form, role: "staff" }).unwrap();
      toast.success("Staff added successfully!");
      setAddOpen(false);
      setForm({ name: "", email: "", position: "", password: "" });
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add staff.");
    }
  };

  const handleEditStaff = async () => {
    if (!selectedStaffId) return;
    try {
      await updateStaff({
        id: selectedStaffId,
        data: {
          name: form.name,
          email: form.email,
          role: form.position,
          password: form.password || undefined,
        },
      }).unwrap();
      toast.success("Staff updated successfully!");
      setEditOpen(false);
      setSelectedStaffId(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update staff.");
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff?")) return;
    try {
      await deleteStaff(id).unwrap();
      toast.success("Staff deleted successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete staff.");
    }
  };

  const toggleActive = async (staff: Staff) => {
    const isActive = staff.active;
    try {
      await updateStaff({
        id: staff._id,
        data: { isActive: !isActive },
      }).unwrap();
      console.log(isActive);

      toast.success(
        `Staff ${staff.active ? "deactivated" : "activated"} successfully!`
      );
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to toggle status.");
    }
  };

  const columns = useMemo<ColumnDef<Staff>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.active; // or row.original.isActive
          return (
            <Badge
              variant="outline"
              className={`px-2 py-1 rounded-full ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button size="sm" onClick={() => openEditDialog(row.original)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteStaff(row.original._id)}
            >
              Delete
            </Button>
            <Button
              size="sm"
              variant={row.original.active ? "destructive" : "outline"}
              onClick={async () => {
                try {
                  await toggleStaffActive({
                    id: row.original._id,
                    isActive: !row.original.active,
                  }).unwrap();
                  toast.success(
                    `Staff ${
                      row.original.active ? "deactivated" : "activated"
                    } successfully!`
                  );
                  refetch(); // refresh to show the latest active state
                } catch (err: any) {
                  toast.error(err?.data?.message || "Failed to toggle status.");
                }
              }}
            >
              {row.original.active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        ),
      },
    ],
    [toggleActive, openEditDialog, handleDeleteStaff]
  );

  const table = useReactTable({
    data: staffs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          👥 Staff Management
        </h2>
        <AlertDialog open={addOpen} onOpenChange={setAddOpen}>
          <AlertDialogTrigger asChild>
            <Button>Add Staff +</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Add New Staff</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="flex flex-col gap-3 mt-4">
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Select
                value={form.position}
                onValueChange={(val) => setForm({ ...form, position: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <AlertDialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStaff}>Add Staff</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No staff found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Staff</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Password (optional)"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Select
              value={form.position}
              onValueChange={(val) => setForm({ ...form, position: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStaff}>Update</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
