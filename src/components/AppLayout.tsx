import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { SidebarTrigger } from "./ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";

export const AppLayout = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex w-full bg-[#15161B]">
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <div className="flex h-16 items-center justify-between gap-4 border-b border-dashboard-highlight px-6 bg-dashboard-card">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold text-white">BI Suite</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">{user?.full_name}</span>
              <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                {user?.role.replace('_', ' ')}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};