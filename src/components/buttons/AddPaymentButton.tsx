import { useState, useEffect, useReducer } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  invId: z.string().min(1, "Invoice ID is required"),
  transactionId: z.string().min(1, "Transaction ID is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  amount: z.string().regex(/^-?\d+(?:\.\d{0,2})?$/, "Invalid amount"),
  paymentMode: z.enum(["cash", "cheque", "online"]).default("cash"),
  remarks: z.string().max(200, "Max 200 characters"),
  chequeNumber: z.string().optional(),
  bankName: z.string().optional(),
});

type PaymentFormData = z.infer<typeof schema>;

type FormState = {
  draft: PaymentFormData | null;
  saved: PaymentFormData | null;
};

type ToggleAction = {
  type: "save" | "newDraft";
  payload: PaymentFormData;
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
        draft: { ...action.payload, transactionId: "", paymentMode: "cash" },
        saved: state.saved,
      };
    default:
      return state;
  }
};

export function AddPaymentButton() {
  const [open, setOpen] = useState(false);
  const [invoices, setInvoices] = useState<{ id: string; number: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, dispatch] = useReducer(formReducer, { draft: null, saved: null });

  const defaultValues: PaymentFormData = {
    invId: "",
    transactionId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "0.00",
    paymentMode: "cash",
    remarks: "",
    chequeNumber: "",
    bankName: "",
  };

  const methods = useForm<PaymentFormData>({
    resolver: zodResolver(schema),
    defaultValues: formState.draft || formState.saved || defaultValues,
  });

  const { handleSubmit, reset, control, formState: { errors } } = methods;

  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data, error } = await supabase.from("invoiceTable").select("id, invNumber");
        if (error) throw error;
        setInvoices(data || []);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      }
    };

    fetchInvoices();
  }, []);

  const onSubmit = async (data: PaymentFormData) => {
    setIsSaving(true);

    try {
      await supabase.from("paymentTransactions").insert([
        {
          invId: parseInt(data.invId),
          transactionId: data.transactionId,
          paymentDate: new Date(data.paymentDate),
          amount: parseFloat(data.amount),
          paymentMode: data.paymentMode,
          remarks: data.remarks,
          chequeNumber: data.paymentMode === "cheque" ? data.chequeNumber : null,
          bankName: data.paymentMode === "cheque" ? data.bankName : null,
        },
      ]);

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      setIsSaving(false);
      setOpen(false);
    } catch (error) {
      console.error("Error saving payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record payment",
      });
      dispatch({ type: "save", payload: data });
      setIsSaving(false);
    }
  };

  const saveDraft = () => {
    dispatch({ type: "save", payload: methods.getValues() });
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
      <Button onClick={() => setOpen(true)}>Add Payment</Button>
      <DialogContent>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>New Payment</DialogTitle>
              {formState.saved && (
                <DialogDescription>
                  <strong>Saved:</strong> Payment #{formState.saved.transactionId}
                </DialogDescription>
              )}
            </DialogHeader>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right" htmlFor="invId">
                  Invoice
                </Label>
                <Controller
                  name="invId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {invoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <span className="text-red-500 text-sm">
                  {errors.invId?.message}
                </span>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right" htmlFor="transactionId">
                  Transaction ID
                </Label>
                <Controller
                  name="transactionId"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="transactionId"
                      placeholder="PAYM2023/001"
                      {...field}
                    />
                  )}
                />
                <span className="text-red-500 text-sm">
                  {errors.transactionId?.message}
                </span>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right" htmlFor="paymentDate">
                  Date
                </Label>
                <Controller
                  name="paymentDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="paymentDate"
                      type="date"
                      {...field}
                    />
                  )}
                />
                <span className="text-red-500 text-sm">
                  {errors.paymentDate?.message}
                </span>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right" htmlFor="amount">
                  Amount
                </Label>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      {...field}
                    />
                  )}
                />
                <span className="text-red-500 text-sm">
                  {errors.amount?.message}
                </span>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right" htmlFor="paymentMode">
                  Payment Mode
                </Label>
                <Controller
                  name="paymentMode"
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <span className="text-red-500 text-sm">
                  {errors.paymentMode?.message}
                </span>
              </div>

              {methods.watch("paymentMode") === "cheque" && (
                <>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-right" htmlFor="chequeNumber">
                      Cheque Number
                    </Label>
                    <Controller
                      name="chequeNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="chequeNumber"
                          placeholder="123456"
                          {...field}
                        />
                      )}
                    />
                    <span className="text-red-500 text-sm">
                      {errors.chequeNumber?.message}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-right" htmlFor="bankName">
                      Bank Name
                    </Label>
                    <Controller
                      name="bankName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="bankName"
                          placeholder="ICICI Bank"
                          {...field}
                        />
                      )}
                    />
                    <span className="text-red-500 text-sm">
                      {errors.bankName?.message}
                    </span>
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right" htmlFor="remarks">
                  Remarks
                </Label>
                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="remarks"
                      {...field}
                    />
                  )}
                />
                <span className="text-red-500 text-sm">
                  {errors.remarks?.message}
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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
