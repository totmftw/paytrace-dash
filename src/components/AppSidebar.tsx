import { NavLink } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  MessageSquare,
  Receipt,
  UserCog
} from "lucide-react";

const sidebarLinks = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Customers",
    icon: Users,
    href: "/customers",
  },
  {
    title: "Invoices & Payments",
    icon: Receipt,
    href: "/invoices",
  },
  {
    title: "Products",
    icon: Package,
    href: "/products",
  },
  {
    title: "WhatsApp Reminders",
    icon: MessageSquare,
    href: "/whatsapp-reminders",
  },
];

const adminLinks = [
  {
    title: "User Management",
    icon: UserCog,
    href: "/user-management",
    roles: ["it_admin", "business_owner"],
  },
];

export function AppSidebar() {
  const { user } = useAuth();

  const isAdmin = user?.role === "it_admin" || user?.role === "business_owner";

  return (
    <aside className="hidden lg:block w-64 bg-dashboard-card border-r border-dashboard-highlight">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-16 items-center border-b border-dashboard-highlight px-6">
          <span className="text-lg font-semibold">BI Suite</span>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-gray-100 ${
                    isActive ? "bg-dashboard-highlight text-gray-100" : "hover:bg-dashboard-highlight/50"
                  }`
                }
              >
                <link.icon className="h-4 w-4" />
                {link.title}
              </NavLink>
            ))}
            
            {isAdmin && adminLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-gray-100 ${
                    isActive ? "bg-dashboard-highlight text-gray-100" : "hover:bg-dashboard-highlight/50"
                  }`
                }
              >
                <link.icon className="h-4 w-4" />
                {link.title}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}