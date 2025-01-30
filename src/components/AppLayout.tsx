import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

export function AppLayout() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}