import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/dashboard/Overview";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancialYear } from "@/contexts/FinancialYearContext";

export default function Dashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { selectedYear } = useFinancialYear();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-stats', selectedYear],
    queryFn: async () => {
      const startDate = new Date(Number(selectedYear), 3, 1); // Financial year starts from April
      const endDate = new Date(Number(selectedYear) + 1, 2, 31); // Ends in March next year

      // Get total revenue
      const { data: invoices } = await supabase
        .from('invoiceTable')
        .select('invTotal')
        .gte('invDate', startDate.toISOString())
        .lte('invDate', endDate.toISOString());

      // Get outstanding amount
      const { data: outstanding } = await supabase
        .from('invoiceTable')
        .select('invBalanceAmount')
        .gt('invBalanceAmount', 0)
        .gte('invDate', startDate.toISOString())
        .lte('invDate', endDate.toISOString());

      // Get active customers
      const { count: activeCustomers } = await supabase
        .from('customerMaster')
        .select('*', { count: 'exact', head: true })
        .eq('custStatus', 'active');

      // Get pending invoices
      const { count: pendingInvoices } = await supabase
        .from('invoiceTable')
        .select('*', { count: 'exact', head: true })
        .gt('invBalanceAmount', 0)
        .gte('invDate', startDate.toISOString())
        .lte('invDate', endDate.toISOString());

      return {
        totalRevenue: invoices?.reduce((sum, inv) => sum + Number(inv.invTotal), 0) || 0,
        outstandingAmount: outstanding?.reduce((sum, inv) => sum + Number(inv.invBalanceAmount), 0) || 0,
        activeCustomers: activeCustomers || 0,
        pendingInvoices: pendingInvoices || 0
      };
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to view the dashboard",
        });
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  return (
    <div className="space-y-6 bg-[#E6EFE9]"> {/* Pastel moss green background */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-[#1B4332]">Dashboard</h2> {/* Dark pastel forest green text */}
        <FinancialYearSelector />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-[#90BE6D]"> {/* Pastel leaf green buttons */}
          <TabsTrigger value="overview" className="text-[#1B4332]">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="text-[#1B4332]">Analytics</TabsTrigger>
          <TabsTrigger value="reports" className="text-[#1B4332]">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : `₹${dashboardData?.totalRevenue.toLocaleString()}`}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Outstanding Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : `₹${dashboardData?.outstandingAmount.toLocaleString()}`}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : dashboardData?.activeCustomers}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : dashboardData?.pendingInvoices}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Analytics dashboard content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Reports and documentation will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
