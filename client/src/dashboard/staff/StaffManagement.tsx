import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";

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

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

const positions = ["Barista", "Manager", "Cashier"];

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

export default function StaffManagement() {
  const { data, refetch } = useGetAllStaffQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const staffs = data?.staffs || [];

  const [addStaff] = useAddStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();
  const [toggleStaffActive] = useToggleStaffActiveMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const { register, reset, handleSubmit, setValue } = useForm<StaffForm>();

  const handleAddStaff = handleSubmit(async (formData) => {
    try {
      await addStaff({ ...formData, role: "staff" }).unwrap();
      toast.success("Staff added successfully!");
      setAddOpen(false);
      reset();
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add staff.");
    }
  });

  const handleEditStaff = handleSubmit(async (formData) => {
    if (!selectedStaff) return;
    try {
      await updateStaff({
        id: selectedStaff._id,
        data: {
          name: formData.name,
          email: formData.email,
          role: formData.position,
          password: formData.password || undefined,
        },
      }).unwrap();
      toast.success("Staff updated successfully!");
      setEditOpen(false);
      setSelectedStaff(null);
      reset();
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update staff.");
    }
  });

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
    try {
      await toggleStaffActive({
        id: staff._id,
        isActive: !staff.active,
      }).unwrap();
      toast.success(
        `Staff ${staff.active ? "deactivated" : "activated"} successfully!`
      );
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to toggle status.");
    }
  };

  const openEditDialog = (staff: Staff) => {
    setSelectedStaff(staff);
    setValue("name", staff.name);
    setValue("email", staff.email);
    setValue("position", staff.position);
    setValue("password", "");
    setEditOpen(true);
  };

  const columns = useMemo<ColumnDef<Staff>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "role", header: "Role" },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.active;
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
          <div className="flex flex-wrap gap-2">
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
              onClick={() => toggleActive(row.original)}
            >
              {row.original.active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: staffs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">👥 Staff Management</h2>
        <AlertDialog open={addOpen} onOpenChange={setAddOpen}>
          <AlertDialogTrigger asChild>
            <Button>Add Staff +</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Add New Staff</AlertDialogTitle>
            </AlertDialogHeader>
            <form
              onSubmit={handleAddStaff}
              className="flex flex-col gap-3 mt-4"
            >
              <Input placeholder="Name" {...register("name")} />
              <Input placeholder="Email" {...register("email")} />
              <Input
                placeholder="Password"
                type="password"
                {...register("password")}
              />
              <Select {...register("position")}>
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
              <AlertDialogFooter className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Staff</Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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

      {/* Edit Dialog */}
      <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Staff</AlertDialogTitle>
          </AlertDialogHeader>
          <form onSubmit={handleEditStaff} className="flex flex-col gap-3 mt-4">
            <Input placeholder="Name" {...register("name")} />
            <Input placeholder="Email" {...register("email")} />
            <Input
              placeholder="Password (optional)"
              type="password"
              {...register("password")}
            />
            <Select {...register("position")}>
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
            <AlertDialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
