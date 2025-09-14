import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "@/services/userApi";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ProfilePage: React.FC = () => {
  const { data, isLoading, error, refetch } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // prefill once user data is fetched
  React.useEffect(() => {
    if (data?.user) {
      setForm({ name: data.user.name, email: data.user.email, password: "" });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(form).unwrap();
      toast.success("Profile updated successfully ✅");
      refetch();
      setForm((prev) => ({ ...prev, password: "" })); // clear password
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile ❌");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin w-6 h-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-6">
        Failed to load profile.
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="text-center text-gray-500 mt-6">
        No profile data found.
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-10 px-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            👤 Edit Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-semibold">Name</label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="font-semibold">Email</label>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your email"
              />
            </div>
            <div>
              <label className="font-semibold">New Password</label>
              <Input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
