// Dashboard.tsx
import { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { PaymentMetrics } from "@/components/dashboard/PaymentMetrics";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { PaymentTracking } from "@/components/dashboard/PaymentTracking";
import { PaymentReminders } from "@/components/dashboard/PaymentReminders";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddWidgetDialog } from "@/components/dashboard/AddWidgetDialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { FinancialYearProvider, useFinancialYear } from "@/contexts/FinancialYearContext";
import { useAuth } from "@/hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      {user && (
        <div>
          <p>User ID: {user.id}</p>
          <p>User Name: {user.name}</p>
          <p>User Role: {user.role}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
const ResponsiveGridLayout = WidthProvider(Responsive);

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
}

const defaultLayout: LayoutItem[] = [
  { i: "payment-metrics", x: 0, y: 0, w: 12, h: 4, minH: 4 },
  { i: "sales-overview", x: 0, y: 4, w: 8, h: 8, minH: 6 },
  { i: "payment-tracking", x: 8, y: 4, w: 4, h: 8, minH: 6 },
  { i: "payment-reminders", x: 0, y: 12, w: 12, h: 8, minH: 6 }
];

const defaultWidgets: DashboardWidget[] = [
  { id: "payment-metrics", type: "payment-metrics", title: "Metrics" },
  { id: "sales-overview", type: "sales-overview", title: "Sales Overview" },
  { id: "payment-tracking", type: "payment-tracking", title: "Payment Tracking" },
  { id: "payment-reminders", type: "payment-reminders", title: "Payment Reminders" }
];

const Dashboard = () => {
  const [layout, setLayout] = useLocalStorage("dashboard-layout", defaultLayout);
  const [widgets, setWidgets] = useLocalStorage("dashboard-widgets", defaultWidgets);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    setLayout(newLayout);
  };

  const handleAddWidget = (widget: DashboardWidget) => {
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

  const handleApplyChanges = () => {
    setIsEditing(false);
    toast.success("Changes applied successfully");
  };

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case "payment-metrics":
        return <PaymentMetrics />;
      case "sales-overview":
        return <SalesOverview />;
      case "payment-tracking":
        return <PaymentTracking />;
      case "payment-reminders":
        return <PaymentReminders />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <FinancialYearProvider>
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <FinancialYearSelector />
          {user?.role === "IT admin" && (
            <Button onClick={() => setIsAddWidgetOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Widget
            </Button>
          )}
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Apply Changes" : "Edit Layout"}
          </Button>
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
            <div key={widget.id} className="dashboard-card">
              <div className="drag-handle" title="Drag to move" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{widget.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveWidget(widget.id)}
                >
                  Remove
                </Button>
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
    </FinancialYearProvider>
  );
};

export default Dashboard;