import { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutContextType {
  saveLayout: (payload: any) => Promise<void>;
  resetLayout: () => Promise<void>;
  undo: () => void;
  redo: () => void;
}

const LayoutContext = createContext<LayoutContextType>({
  saveLayout: async () => {},
  resetLayout: async () => {},
  undo: () => {},
  redo: () => {},
});

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [localLayout, setLocalLayout] = useState<any>([]);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  const saveLayout = async (payload: any) => {
    if (!user) return;

    const { error } = await supabase
      .from("dashboard_layouts")
      .upsert({
        created_by: user.id,
        layout: payload,
        is_active: true,
      });

    if (error) {
      throw error;
    }

    // Add to undo stack
    setUndoStack([...undoStack, payload]);
    setRedoStack([]);
  };

  const resetLayout = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("dashboard_layouts")
      .delete()
      .eq("created_by", user.id);

    if (error) {
      throw error;
    }

    setUndoStack([]);
    setRedoStack([]);
    setLocalLayout([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;

    const newUndoStack = [...undoStack];
    const previousLayout = newUndoStack.pop();

    if (!previousLayout) return;

    setUndoStack(newUndoStack);
    setRedoStack([...redoStack, localLayout]);
    setLocalLayout(previousLayout);
  };

  const redo = () => {
    if (redoStack.length === 0) return;

    const newRedoStack = [...redoStack];
    const nextLayout = newRedoStack.pop();

    if (!nextLayout) return;

    setRedoStack(newRedoStack);
    setUndoStack([...undoStack, localLayout]);
    setLocalLayout(nextLayout);
  };

  return (
    <LayoutContext.Provider value={{ saveLayout, resetLayout, undo, redo }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayouts = () => useContext(LayoutContext);