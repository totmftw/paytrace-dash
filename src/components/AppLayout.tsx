import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { SidebarTrigger } from "./ui/sidebar";

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex w-full bg-[#15161B]">
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <div className="flex h-16 items-center gap-4 border-b border-dashboard-highlight px-6 bg-dashboard-card">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold text-white">BI Suite</h1>
        </div>
        <div className="p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};