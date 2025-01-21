import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LucideIcon, LayoutDashboard, Users, Package, LogOut } from "lucide-react";

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: Package, label: "Products", path: "/products" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold">BI Suite</h1>
        </div>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-gray-800 mt-auto"
            onClick={() => navigate("/login")}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;