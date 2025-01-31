import { Button } from "@/components/ui/button";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface CustomerMessagePreviewProps {
  customer: any;
  invoices: any[];
  isCustomMessage: boolean;
  value: string;
  onChange: (value: string) => void;
}

export function CustomerMessagePreview({
  customer,
  invoices,
  isCustomMessage,
  value,
  onChange,
}: CustomerMessagePreviewProps) {
  const getTemplateMessage = () => {
    let totalPending = 0;
    const invoiceDetails = invoices.map(invoice => {
      const pending = invoice.invBalanceAmount || 0;
      totalPending += pending;
      return `Invoice ${invoice.invNumber.join("-")} dated ${format(new Date(invoice.invDate), "dd/MM/yyyy")} - Amount Due: ${formatCurrency(pending)}`;
    }).join("\n");

    return `Dear ${customer.custBusinessname},\n\nThis is a reminder for the following pending payment(s):\n\n${invoiceDetails}\n\nTotal Amount Due: ${formatCurrency(totalPending)}\n\nKindly arrange for the payment at your earliest convenience.`;
  };

  const insertField = (field: string) => {
    const insertText = (() => {
      switch(field) {
        case "invoiceNumbers":
          return invoices.map(inv => inv.invNumber.join("-")).join(", ");
        case "invoiceDates":
          return invoices.map(inv => format(new Date(inv.invDate), "dd/MM/yyyy")).join(", ");
        case "amounts":
          return invoices.map(inv => formatCurrency(inv.invBalanceAmount || 0)).join(", ");
        default:
          return "";
      }
    })();
    
    const cursorPosition = document.activeElement instanceof HTMLTextAreaElement 
      ? document.activeElement.selectionStart 
      : value.length;
    
    const newValue = value.slice(0, cursorPosition) + insertText + value.slice(cursorPosition);
    onChange(newValue);
  };

  return (
    <FormItem className="space-y-4 border rounded-md p-4">
      <div className="flex items-center justify-between">
        <FormLabel className="text-lg font-semibold">
          {customer.custBusinessname}
        </FormLabel>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertField("invoiceNumbers")}
          >
            Insert Invoice Numbers
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertField("invoiceDates")}
          >
            Insert Dates
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertField("amounts")}
          >
            Insert Amounts
          </Button>
        </div>
      </div>
      <FormControl>
        <Textarea
          value={isCustomMessage ? value : getTemplateMessage()}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          readOnly={!isCustomMessage}
          className={!isCustomMessage ? "bg-gray-100" : ""}
        />
      </FormControl>
    </FormItem>
  );
}