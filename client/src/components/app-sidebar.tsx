import {
  Coffee,
  Home,
  Users,
  FileText,
  ShoppingCart,
  Tag,
  Box,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { useGetSettingsQuery } from "@/services/SettingsApi";

export function AppSidebar() {
  const { role } = useSelector((state: RootState) => state.user);

  const baseItems = [
    { title: "Home", url: "/dashboard", icon: Home },
    { title: "Tables", url: "/dashboard/tables", icon: Users },
    { title: "Orders", url: "/dashboard/orders", icon: ShoppingCart },
  ];

  const adminItems = [
    { title: "Menu Items", url: "/dashboard/menu", icon: Box },
    { title: "Categories", url: "/dashboard/categories", icon: Tag },
    { title: "Staff", url: "/dashboard/staff", icon: Users },
    { title: "Reports", url: "/dashboard/reports", icon: FileText },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ];

  const items = role === "admin" ? [...baseItems, ...adminItems] : baseItems;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading } = useGetSettingsQuery({});
  const businessName = data?.data?.businessName || "CAFE";

  const handleLogout = () => {
    dispatch({ type: "user/logout" });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  if (isLoading) {
    return (
      <Sidebar>
        <SidebarContent className="bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-3 px-6 py-5 h-20 border-b dark:border-gray-800">
            <Coffee className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="font-extrabold text-2xl text-gray-900 dark:text-gray-100 tracking-wide">
              Loading...
            </span>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }
  return (
    <Sidebar>
      <SidebarContent className="bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3 px-6 py-5 h-20 border-b dark:border-gray-800">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="Cafe Logo"
            className="w-40 h-30 rounded-full"
          />
          {/* Business Name */}
          <span className="font-extrabold text-2xl text-gray-900 dark:text-gray-100 tracking-wide">
            {businessName || "CAFE"}
          </span>
        </div>

        <SidebarGroup className="p-4">
          <SidebarGroupLabel className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 text-lg hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>

          <Button
            className="mt-5"
            onClick={handleLogout}
            variant={"destructive"}
          >
            Logout
          </Button>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
