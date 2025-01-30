import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "./ui/use-toast";

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
      toast({
        title: "Logged out successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error logging out",
      });
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <AppSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <header className="h-16 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 w-full flex items-center justify-end px-6">
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </header>
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}