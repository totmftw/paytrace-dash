import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  IndianRupee,
  Package,
  MessageSquare,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  CreditCard,
  Bell
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const getBaseNavigation = () => [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Transactions", href: "/transactions", icon: IndianRupee },
  { name: "WhatsApp Reminders", href: "/whatsapp-reminders", icon: Bell },
  { name: "User Management", href: "/user-management", icon: UserCircle },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setColumnConfigOpen?: (open: boolean) => void;
}

export function AppSidebar({ isCollapsed, toggleSidebar, setColumnConfigOpen }: AppSidebarProps) {
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      const { data } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      return data;
    }
  });

  const isAdmin = userProfile?.role === 'it_admin';

  const navigation = [
    ...getBaseNavigation(),
    ...(isAdmin ? [
      { name: "Products", href: "/products", icon: Package },
      { name: "Invoices", href: "/invoices", icon: FileText },
      { name: "Payments", href: "/payments", icon: CreditCard },
    ] : [])
  ];

  return (
    <div className={cn(
      "h-full bg-sidebar flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex justify-between items-center h-16 px-4">
        {!isCollapsed && <img className="h-8 w-auto" src="/logo.svg" alt="Your Company" />}
        <button onClick={toggleSidebar} className="text-gray-800 p-2 hover:bg-white/10 rounded-lg">
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
                          ? "bg-white/20 text-gray-900"
                          : "text-gray-700 hover:text-gray-900 hover:bg-white/10",
                        "group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            isActive ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900",
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
          {isAdmin && setColumnConfigOpen && (
            <li className="px-2">
              <Button variant="ghost" onClick={() => setColumnConfigOpen(true)}>
                Configure Columns
              </Button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}