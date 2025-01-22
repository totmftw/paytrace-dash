import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LucideIcon, LayoutDashboard, Users, Package, LogOut, Menu, FileText, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: FileText, label: "Invoices", path: "/invoices" },
  { icon: CreditCard, label: "Payments", path: "/payments" },
  { icon: Package, label: "Products", path: "/products" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-gray-900 text-white transition-all duration-300 fixed h-full z-50",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn(
            "flex items-center p-4",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && <h1 className="text-xl font-bold">BI Suite</h1>}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="flex-1 space-y-2 p-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:bg-gray-800",
                  isCollapsed && "justify-center px-2"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className={cn(
                  "h-4 w-4",
                  !isCollapsed && "mr-2"
                )} />
                {!isCollapsed && item.label}
              </Button>
            ))}
          </nav>

          <div className="p-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-white hover:bg-gray-800",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => navigate("/login")}
            >
              <LogOut className={cn(
                "h-4 w-4",
                !isCollapsed && "mr-2"
              )} />
              {!isCollapsed && "Logout"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn(
        "flex-1 bg-gray-50 min-h-screen transition-all duration-300",
        isCollapsed ? "ml-16" : "ml-64"
      )}>
        <div className="p-8">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;