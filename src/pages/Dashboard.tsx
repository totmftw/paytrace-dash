import { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { PaymentMetrics } from "@/components/dashboard/PaymentMetrics";
import SalesOverview from "@/components/dashboard/SalesOverview";
import { PaymentTracking } from "@/components/dashboard/PaymentTracking";
import { PaymentReminders } from "@/components/dashboard/PaymentReminders";
import { Button } from "@/components/ui/button";
import { PlusCircle, Wrench, Check, X } from "lucide-react";
import { AddWidgetDialog } from "@/components/dashboard/AddWidgetDialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { FinancialYearProvider } from "@/contexts/FinancialYearContext";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  { i: "payment-reminders", x: 0, y: 12, w: 12, h: 8, minH: 6 },
];

const defaultWidgets: DashboardWidget[] = [
  { id: "payment-metrics", type: "payment-metrics", title: "Metrics" },
  { id: "sales-overview", type: "sales-overview", title: "Sales Overview" },
  { id: "payment-tracking", type: "payment-tracking", title: "Payment Tracking" },
  { id: "payment-reminders", type: "payment-reminders", title: "Payment Reminders" },
];

const Dashboard = () => {
  const [layout, setLayout] = useLocalStorage("dashboard-layout", defaultLayout);
  const [widgets, setWidgets] = useLocalStorage("dashboard-widgets", defaultWidgets);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [widgetToRemove, setWidgetToRemove] = useState<string | null>(null);
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
    setWidgetToRemove(widgetId);
  };

  const confirmRemoveWidget = () => {
    if (widgetToRemove) {
      setWidgets(widgets.filter(w => w.id !== widgetToRemove));
      setLayout(layout.filter(l => l.i !== widgetToRemove));
      setWidgetToRemove(null);
      toast.success("Widget removed successfully");
    }
  };

  const handleApplyChanges = async () => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const { error } = await supabase.from("dashboard_config").upsert({
        user_id: user.id,
        layout: layout as Json,
        widgets: widgets as Json
      });

      if (error) throw error;

      setIsEditing(false);
      toast.success("Changes applied successfully");
      setIsApplyDialogOpen(true);
    } catch (error) {
      console.error("Error saving dashboard config:", error);
      toast.error("Failed to apply changes");
    }
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
            <div key={widget.id} className="dashboard-card">
              <div className="drag-handle" title="Drag to move" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{widget.title}</h3>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => handleRemoveWidget(widget.id)}
                  >
                    <X className="h-4 w-4" />
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

        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configuration Applied</DialogTitle>
              <DialogDescription>
                The configuration has been applied and will not be editable.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!widgetToRemove} onOpenChange={() => setWidgetToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Widget</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this widget? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRemoveWidget}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </FinancialYearProvider>
  );
};

export default Dashboard;