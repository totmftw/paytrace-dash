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
        title: "Error logging out",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex h-screen">
      <AppSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 overflow-auto transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="sticky top-0 z-10 bg-background border-b p-4 flex justify-end">
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}