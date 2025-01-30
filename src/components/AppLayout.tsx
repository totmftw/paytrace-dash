import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar"; // Keep only the orange sidebar

export function AppLayout() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}
