import { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { PaymentMetrics } from "@/components/dashboard/PaymentMetrics";
import { OutstandingPayments } from "@/components/dashboard/OutstandingPayments";
import { PaymentTracking } from "@/components/dashboard/PaymentTracking";
import { PaymentReminders } from "@/components/dashboard/PaymentReminders";
import { PaymentTrends } from "@/components/dashboard/PaymentTrends";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopCustomers } from "@/components/dashboard/TopCustomers";
import { Button } from "@/components/ui/button";
import { PlusCircle, Wrench, Check } from "lucide-react";
import { AddWidgetDialog } from "@/components/dashboard/AddWidgetDialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ResponsiveGridLayout = WidthProvider(Responsive);

const defaultLayout = [
  { i: "payment-metrics", x: 0, y: 0, w: 12, h: 4, minH: 4 },
  { i: "outstanding-payments", x: 0, y: 4, w: 6, h: 6, minH: 4 },
  { i: "payment-tracking", x: 6, y: 4, w: 6, h: 6, minH: 4 },
  { i: "payment-reminders", x: 0, y: 10, w: 12, h: 6, minH: 4 },
  { i: "payment-trends", x: 0, y: 16, w: 6, h: 6, minH: 4 },
  { i: "recent-transactions", x: 6, y: 16, w: 6, h: 6, minH: 4 },
  { i: "revenue-chart", x: 0, y: 22, w: 8, h: 6, minH: 4 },
  { i: "top-customers", x: 8, y: 22, w: 4, h: 6, minH: 4 }
];

const defaultWidgets = [
  { id: "payment-metrics", type: "payment-metrics", title: "Payment Metrics" },
  { id: "outstanding-payments", type: "outstanding-payments", title: "Outstanding Payments" },
  { id: "payment-tracking", type: "payment-tracking", title: "Payment Tracking" },
  { id: "payment-reminders", type: "payment-reminders", title: "Payment Reminders" },
  { id: "payment-trends", type: "payment-trends", title: "Payment Trends" },
  { id: "recent-transactions", type: "recent-transactions", title: "Recent Transactions" },
  { id: "revenue-chart", type: "revenue-chart", title: "Revenue Chart" },
  { id: "top-customers", type: "top-customers", title: "Top Customers" }
];

const Dashboard = () => {
  const [layout, setLayout] = useLocalStorage("dashboard-layout", defaultLayout);
  const [widgets, setWidgets] = useLocalStorage("dashboard-widgets", defaultWidgets);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const { user } = useAuth();

  const handleLayoutChange = (newLayout: any[]) => {
    setLayout(newLayout);
  };

  const handleAddWidget = (widget: any) => {
    const newWidget = {
      ...widget,
      id: `${widget.type}-${Date.now()}`
    };

    const newLayout = [
      ...layout,
      {
        i: newWidget.id,
        x: 0,
        y: Infinity,
        w: 6,
        h: 6,
        minH: 4
      }
    ];

    setWidgets([...widgets, newWidget]);
    setLayout(newLayout);
    setIsAddWidgetOpen(false);
    toast.success("Widget added successfully");
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    setLayout(layout.filter(l => l.i !== widgetId));
    toast.success("Widget removed successfully");
  };

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case "payment-metrics":
        return <PaymentMetrics />;
      case "outstanding-payments":
        return <OutstandingPayments />;
      case "payment-tracking":
        return <PaymentTracking />;
      case "payment-reminders":
        return <PaymentReminders />;
      case "payment-trends":
        return <PaymentTrends />;
      case "recent-transactions":
        return <RecentTransactions />;
      case "revenue-chart":
        return <RevenueChart />;
      case "top-customers":
        return <TopCustomers />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <FinancialYearSelector />
            {user?.role === "IT admin" && (
              <>
                <Button onClick={() => setIsAddWidgetOpen(true)}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
                <Button onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? <Check className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>
        </div>

        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          onLayoutChange={(_, layouts) => handleLayoutChange(layouts.lg)}
          isDraggable={isEditing}
          isResizable={isEditing}
          draggableHandle=".drag-handle"
        >
          {widgets.map((widget) => (
            <div key={widget.id} className="dashboard-card overflow-hidden">
              <div className="drag-handle" title="Drag to move" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{widget.title}</h3>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveWidget(widget.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="overflow-auto h-[calc(100%-4rem)]">
                {renderWidget(widget)}
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>

        <AddWidgetDialog
          open={isAddWidgetOpen}
          onOpenChange={setIsAddWidgetOpen}
          onAdd={handleAddWidget}
        />
      </div>
    </div>
  );
};

export default Dashboard;