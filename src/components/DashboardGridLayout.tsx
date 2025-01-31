import React, { useState } from "react";
import GridLayout from "react-grid-layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface DashboardWidget {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content: JSX.Element;
}

interface DashboardGridLayoutProps {
  widgets: DashboardWidget[];
  onApply?: () => void;
}

export function DashboardGridLayout({ widgets, onApply }: DashboardGridLayoutProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const isITAdmin = user?.role === "it_admin";

  const handleApply = () => {
    if (onApply) {
      onApply();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Layout changes have been saved.",
      });
    }
  };

  return (
    <div>
      {isITAdmin && (
        <div className="mb-4 flex justify-end gap-2">
          <Button 
            variant={isEditing ? "destructive" : "outline"} 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Configure Layout"}
          </Button>
          {isEditing && (
            <Button onClick={handleApply}>
              Apply Changes
            </Button>
          )}
        </div>
      )}
      <GridLayout
        className="layout"
        layout={widgets.map((widget) => ({
          i: widget.id,
          x: widget.x,
          y: widget.y,
          w: widget.w,
          h: widget.h,
        }))}
        cols={12}
        rowHeight={30}
        width={1200}
        margin={[10, 10]}
        compactType="vertical"
        isDraggable={isEditing}
        isResizable={isEditing}
        draggableHandle=".drag-handle"
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="bg-white p-4 rounded-lg border shadow-sm">
            {isEditing && (
              <div className="drag-handle h-2 w-12 mx-auto mb-2 bg-gray-200 rounded cursor-move" />
            )}
            {widget.content}
          </div>
        ))}
      </GridLayout>
    </div>
  );
}