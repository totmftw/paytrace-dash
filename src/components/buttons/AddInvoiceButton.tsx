import { useState, useEffect, useReducer } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const schema = z.object({
  invNumber: z.string().min(1, "Invoice number is required"),
  invCustid: z.string().min(1, "Customer is required"),
  invDate: z.string().min(1, "Date is required"),
  invDuedate: z.string().min(1, "Due date is required"),
  invValue: z.string().regex(/^-?\d+(?:\.\d{0,2})?$/, "Invalid amount"),
  invGst: z.string().regex(/^-?\d+(?:\.\d{0,2})?$/, "Invalid GST"),
  invTotal: z.string().regex(/^-?\d+(?:\.\d{0,2})?$/, "Invalid total"),
  invPaymentStatus: z.enum(["pending", "paid", "partial"]).default("pending"),
});

type FormData = z.infer<typeof schema>;

type FormState = {
  draft: FormData | null;
  saved: FormData | null;
};

type ToggleAction = {
  type: "save" | "newDraft";
  payload: FormData;
};

const formReducer = (state: FormState, action: ToggleAction): FormState => {
  switch (action.type) {
    case "save":
      return {
        ...state,
        draft: action.payload,
        saved: state.saved || action.payload,
      };
    case "newDraft":
      return {
        draft: { ...action.payload, invNumber: "" },
        saved: state.saved,
      };
    default:
      return state;
  }
};

export function AddInvoiceButton() {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, dispatch] = useReducer(formReducer, { draft: null, saved: null });

  const defaultValues: FormData = {
    invNumber: "",
    invCustid: "",
    invDate: new Date().toISOString().split("T")[0],
    invDuedate: new Date().toISOString().split("T")[0],
    invValue: "0.00",
    invGst: "0.00",
    invTotal: "0.00",
    invPaymentStatus: "pending",
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: formState.draft || formState.saved || defaultValues,
  });

  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase.from("customerMaster").select("id, custBusinessname");
        if (error) throw error;
        setCustomers(data || []);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };

    fetchCustomers();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);

    try {
      await supabase.from("invoiceTable").insert({
        ...data,
        invDate: new Date(data.invDate),
        invDuedate: new Date(data.invDuedate),
      });

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      setIsSaving(false);
      setOpen(false);
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create invoice",
      });
      dispatch({ type: "save", payload: data });
      setIsSaving(false);
    }
  };

  const saveDraft = () => {
    dispatch({ type: "save", payload: getValues() });
    toast({
      title: "Draft Saved",
      description: "Your draft has been saved",
    });
  };

  const newDraft = () => {
    dispatch({ type: "newDraft", payload: defaultValues });
    toast({
      title: "New Draft",
      description: "You're working on a new draft",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) reset(formState.draft || formState.saved || defaultValues);
    }}>
      <Button onClick={() => setOpen(true)}>Add Invoice</Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
          {formState.saved && (
            <DialogDescription>
              <strong>Saved:</strong> Invoice #{formState.saved.invNumber}
            </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="invNumber">
                Invoice Number
              </Label>
              <Controller
                name="invNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    id="invNumber"
                    placeholder="INV2023/001"
                    {...field}
                  />
                )}
              />
              <span className="text-red-500 text-sm">
                {errors.invNumber?.message}
              </span>
            </div>
            {/* Repeat similar blocks for all fields */}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center">
                  Saving <LoadingSpinner />
                </span>
              ) : (
                "Save"
              )}
            </Button>
            {formState.draft && (
              <Button variant="outline" onClick={saveDraft}>
                Save Draft
              </Button>
            )}
            <Button variant="outline" onClick={newDraft}>
              New Draft
            </Button>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}