import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  IndianRupee,
  Package,
  MessageSquare,
  UserCircle
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Invoices & Payments", href: "/invoices-payments", icon: IndianRupee },
  { name: "Products", href: "/products", icon: Package },
  { name: "WhatsApp Reminders", href: "/whatsapp-reminders", icon: MessageSquare },
  { name: "User Management", href: "/user-management", icon: UserCircle },
];

export function AppSidebar() {
  return (
    <div className="flex h-full flex-col gap-y-5 bg-[#1A1F2C] px-6">
      <div className="flex h-16 shrink-0 items-center">
        <img
          className="h-8 w-auto"
          src="/logo.svg"
          alt="Your Company"
        />
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
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6"
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
                        {item.name}
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