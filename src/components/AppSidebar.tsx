import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  IndianRupee,
  Package,
  MessageSquare,
  UserCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
// src/components/AppSidebar.tsx
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { LayoutDashboard, Users, Package, FileText, CreditCard, Bell, User } from "lucide-react";

export const AppSidebar = () => {
  const navigationItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/customers", icon: Users, label: "Customers" },
    { path: "/products", icon: Package, label: "Products" },
    { path: "/invoices", icon: FileText, label: "Invoices" },
    { path: "/payments", icon: CreditCard, label: "Payments" },
    { path: "/users-profiles", icon: User, label: "Users" },
    { path: "/whatsapp-reminders", icon: Bell, label: "Reminders" },
  ];

  return (
    <div className="w-64 border-r bg-card h-screen p-4">
      <nav className="space-y-1">
        {navigationItems.map((item) => (
          <Button
            key={item.path}
            asChild
            variant="ghost"
            className="w-full justify-start"
          >
            <Link to={item.path}>
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
};
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Invoices & Payments", href: "/invoices-payments", icon: IndianRupee },
  { name: "Products", href: "/products", icon: Package },
  { name: "WhatsApp Reminders", href: "/whatsapp-reminders", icon: MessageSquare },
  { name: "User Management", href: "/user-management", icon: UserCircle },
];

export function AppSidebar({ isCollapsed, toggleSidebar }) {
  return (
    <div className={cn("h-full bg-[#1A1F2C] flex flex-col transition-all duration-300", isCollapsed ? "w-16" : "w-64")}>
      <div className="flex justify-between items-center h-16 px-4">
        {!isCollapsed && <img className="h-8 w-auto" src="/logo.svg" alt="Your Company" />}
        <button onClick={toggleSidebar} className="text-white p-2">
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        isActive
                          ? "bg-[#221F26] text-white"
                          : "text-gray-400 hover:text-white hover:bg-[#221F26]",
                        "group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                            "h-6 w-6 shrink-0"
                          )}
                          aria-hidden="true"
                        />
                        {!isCollapsed && <span>{item.name}</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}
