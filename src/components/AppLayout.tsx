import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { SidebarTrigger } from "./ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useSidebar } from "./ui/sidebar";

export const AppLayout = () => {
  const { user, signOut } = useAuth();
  const { isTransitioning } = useFinancialYear();
  const { state, open, setOpen } = useSidebar();

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <div className="flex h-16 items-center justify-between gap-4 border-b px-6 bg-card">
          <div className="flex items-center gap-4">
            <SidebarTrigger onClick={toggleSidebar} />
            <h1 className="text-xl font-semibold text-foreground">BI Suite</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{user?.full_name}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          {isTransitioning && (
            <div className="absolute inset-0 bg-background/50 z-50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Updating financial year data...</span>
            </div>
          )}
          <div className="p-6 overflow-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};