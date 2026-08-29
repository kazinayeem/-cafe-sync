import React, { useState, useEffect } from "react";
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "@/services/userApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/PageHeader";
import Swal from "sweetalert2";

export const ProfilePage: React.FC = () => {
  const { data, refetch } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name || "");
      setEmail(data.user.email || "");
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name,
        email,
        password: password ? password : undefined,
      }).unwrap();

      setPassword("");
      refetch();
      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Failed to update profile",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Staff Profile & Security"
        subtitle="Manage your personal account credentials and security password"
      />

      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-4 border-b border-border/80 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xl">
            {name ? name.slice(0, 2).toUpperCase() : "CS"}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-foreground">{name || "Staff Member"}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
              <span>{email}</span>
              <span className="capitalize font-bold text-amber-600 dark:text-amber-400">
                • {data?.user?.role || "Cashier"}
              </span>
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Full Name *
            </Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
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
              placeholder="your.email@cafesync.com"
              className="rounded-xl mt-1 font-semibold"
            />
          </div>

          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              New Password (Leave blank to keep current)
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl mt-1"
            />
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-3 rounded-xl shadow-md"
            >
              {isUpdating ? "Saving Changes..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
