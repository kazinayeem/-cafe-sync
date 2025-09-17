import { Outlet } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  return (
    <SidebarProvider className="min-w-full bg-gray-100 dark:bg-gray-900">
      <div className="flex h-screen min-w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1  overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
