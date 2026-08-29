import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  useAddStaffMutation,
  useDeleteStaffMutation,
  useGetAllStaffQuery,
  useToggleStaffActiveMutation,
  useUpdateStaffMutation,
} from "@/services/staffService";
import type { Staff } from "@/services/staffService";
import {
  UserCheck,
  UserPlus,
  Shield,
  Trash2,
  Edit2,
  CheckCircle2,
  Mail,
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
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Swal from "sweetalert2";

export const StaffManagement: React.FC = () => {
  const { data, refetch, isLoading } = useGetAllStaffQuery();
  const staffs: Staff[] = data?.staffs || [];

  const [addStaff, { isLoading: isAdding }] = useAddStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();
  const [toggleStaffActive] = useToggleStaffActiveMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("cashier");
  const [password, setPassword] = useState("");

  const totalStaff = staffs.length;
  const activeStaff = staffs.filter((s) => s.active).length;
  const baristas = staffs.filter((s) => s.role === "barista" || s.position === "barista").length;
  const cashiers = staffs.filter((s) => s.role === "cashier" || s.position === "cashier").length;

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName("");
    setEmail("");
    setRole("cashier");
    setPassword("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Staff) => {
    setEditingStaff(s);
    setName(s.name);
    setEmail(s.email);
    setRole(s.role || s.position || "cashier");
    setPassword("");
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      if (editingStaff) {
        await updateStaff({
          id: editingStaff._id,
          data: {
            name,
            email,
            role,
            position: role as any,
            password: password ? password : undefined,
          },
        }).unwrap();
        Swal.fire({ icon: "success", title: "Staff Member Updated!", timer: 1200, showConfirmButton: false });
      } else {
        if (!password) {
          alert("Password is required for new staff accounts.");
          return;
        }
        await addStaff({
          name,
          email,
          role,
          position: role,
          password,
        }).unwrap();
        Swal.fire({ icon: "success", title: "Staff Member Added!", timer: 1200, showConfirmButton: false });
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err?.data?.message || "Failed to save staff" });
    }
  };

  const handleToggleStatus = async (staff: Staff) => {
    try {
      await toggleStaffActive({ id: staff._id, isActive: !staff.active }).unwrap();
      refetch();
      toast.success(`Staff account ${staff.active ? "deactivated" : "activated"}`);
    } catch (err) {
      toast.error("Failed to update staff status");
    }
  };

  const handleDeleteStaff = async (id: string) => {
    const res = await Swal.fire({
      title: "Remove Staff Member?",
      text: "This staff member will lose system access.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Remove",
    });

    if (res.isConfirmed) {
      try {
        await deleteStaff(id).unwrap();
        refetch();
        Swal.fire({ icon: "success", title: "Removed", timer: 1000, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: "error", title: "Failed to remove staff" });
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Staff Directory & Permissions"
        subtitle="Manage employee accounts, roles (Cashier, Barista, Manager), active shift privileges, and access credentials"
      >
        <Button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Staff Member
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard title="Total Staff" value={totalStaff} icon={UserCheck} accentColor="slate" />
        <StatCard title="Active Members" value={activeStaff} icon={CheckCircle2} accentColor="emerald" />
        <StatCard title="Cashiers" value={cashiers} icon={Shield} accentColor="amber" />
        <StatCard title="Baristas" value={baristas} icon={Shield} accentColor="blue" />
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/80 uppercase font-bold text-muted-foreground tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array(4)
                  .fill(0)
                  .map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td colSpan={5} className="py-4 px-4 bg-muted/20" />
                    </tr>
                  ))
              ) : staffs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No staff members registered.
                  </td>
                </tr>
              ) : (
                staffs.map((staff) => (
                  <tr key={staff._id} className="hover:bg-accent/40 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                          {staff.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">
                            {staff.name}
                          </p>
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {staff.role || "Staff"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-muted-foreground font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {staff.email}
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase bg-accent text-foreground border border-border/80">
                        <Shield className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        {staff.role || staff.position || "Cashier"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={staff.active ? "active" : "inactive"}
                        type="general"
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {staff.role === "admin" ? (
                        <span className="text-xs text-muted-foreground font-bold italic">
                          Super Admin
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(staff)}
                            className="h-8 text-[11px] font-bold rounded-lg"
                          >
                            {staff.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenEdit(staff)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteStaff(staff._id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingStaff ? "Edit Staff Account" : "Add New Staff Member"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveStaff} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Full Name *
              </Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Henderson"
                className="rounded-xl mt-1 font-semibold"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email Address *
              </Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@cafesync.com"
                className="rounded-xl mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Assigned System Role
              </Label>
              <Select value={role} onValueChange={(val) => setRole(val)}>
                <SelectTrigger className="rounded-xl mt-1 text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="manager">Manager (Full Access)</SelectItem>
                  <SelectItem value="cashier">Cashier (POS & Shifts)</SelectItem>
                  <SelectItem value="barista">Barista (KDS & Prep)</SelectItem>
                  <SelectItem value="staff">Staff Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {editingStaff ? "New Password (Leave blank to keep current)" : "Password *"}
              </Label>
              <Input
                type="password"
                required={!editingStaff}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl mt-1"
              />
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
                disabled={isAdding}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md"
              >
                {editingStaff ? "Save Changes" : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;
