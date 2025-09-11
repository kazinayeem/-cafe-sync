import {
  Coffee,
  Calendar,
  Home,
  Search,
  Settings,
  Users,
  FileText,
  CreditCard,
  ShoppingCart,
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

import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export function AppSidebar() {
  const { role } = useSelector((state: RootState) => state.user);

  const baseItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Orders", url: "/orders", icon: ShoppingCart },
    { title: "Calendar", url: "/calendar", icon: Calendar },
    { title: "Search", url: "/search", icon: Search },
  ];

  const adminItems = [
    { title: "Staff", url: "/staff", icon: Users },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Payments", url: "/payments", icon: CreditCard },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const items = role === "admin" ? [...baseItems, ...adminItems] : baseItems;

  return (
    <Sidebar className="">
      <SidebarContent className="bg-gray-50 dark:bg-gray-900">
        {/* Branding */}
        <div className="flex items-center gap-3 px-6 py-5 h-20 border-b dark:border-gray-800">
          <Coffee className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="font-extrabold text-2xl text-gray-900 dark:text-gray-100 tracking-wide">
            CAFE SYNC
          </span>
        </div>

        {/* Navigation */}
        <SidebarGroup className="p-4">
          <SidebarGroupLabel className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 text-lg hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
