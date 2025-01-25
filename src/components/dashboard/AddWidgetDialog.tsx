import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (widget: { type: string; title: string }) => void;
}

const availableWidgets = [
  { type: "payment-metrics", title: "Payment Metrics" },
  { type: "sales-overview", title: "Sales Overview" },
  { type: "payment-tracking", title: "Payment Tracking" },
  { type: "payment-reminders", title: "Payment Reminders" }
];

export function AddWidgetDialog({ open, onOpenChange, onAdd }: AddWidgetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid gap-4">
            {availableWidgets.map((widget) => (
              <Button
                key={widget.type}
                variant="outline"
                className="w-full justify-start"
                onClick={() => onAdd(widget)}
              >
                {widget.title}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}