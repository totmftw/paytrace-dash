import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="container mx-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}