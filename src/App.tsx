import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FinancialYearProvider } from "@/contexts/FinancialYearContext";
import AppRoutes from "./AppRoutes";

const queryClient = new QueryClient();

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <FinancialYearProvider>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppRoutes />
                  <Toaster />
                </div>
              </SidebarProvider>
            </FinancialYearProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}