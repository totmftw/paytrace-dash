import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="p-6">
      <Outlet />
    </div>
  );
}