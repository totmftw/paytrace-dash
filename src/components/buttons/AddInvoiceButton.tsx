import { useState, useEffect, useReducer } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";

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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="invCustid">
                Customer
              </Label>
              <Controller
                name="invCustid"
                control={control}
                render={({ field }) => (
                  <Select {...field}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <span className="text-red-500 text-sm">
                {errors.invCustid?.message}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="invDate">
                Invoice Date
              </Label>
              <Controller
                name="invDate"
                control={control}
                render={({ field }) => (
                  <Input
                    type="date"
                    id="invDate"
                    {...field}
                  />
                )}
              />
              <span className="text-red-500 text-sm">
                {errors.invDate?.message}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="invDuedate">
                Due Date
              </Label>
              <Controller
                name="invDuedate"
                control={control}
                render={({ field }) => (
                  <Input
                    type="date"
                    id="invDuedate"
                    {...field}
                  />
                )}
              />
              <span className="text-red-500 text-sm">
                {errors.invDuedate?.message}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="invValue">
                Value
              </Label>
              <Controller
                name="invValue"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    id="invValue"
                    {...field}
                  />
                )}
              />
              <span className="text-red-500 text-sm">
                {errors.invValue?.message}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="invGst">
                GST
              </Label>
              <Controller
                name="invGst"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    id="invGst"
                    {...field}
                  />
                )}
              />
              <span className="text-red-500 text-sm">
                {errors.invGst?.message}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="invTotal">
                Total
              </Label>
              <Controller
                name="invTotal"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    id="invTotal"
                    {...field}
                  />
                )}
              />
              <span className="text-red-500 text-sm">
                {errors.invTotal?.message}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="invPaymentStatus">
                Payment Status
              </Label>
              <Controller
                name="invPaymentStatus"
                control={control}
                render={({ field }) => (
                  <Select {...field}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <span className="text-red-500 text-sm">
                {errors.invPaymentStatus?.message}
              </span>
            </div>
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
