import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CustomerSelectorProps {
  customers: Array<{
    id: number;
    custBusinessname: string;
    custWhatsapp: number;
  }>;
  selectedCustomerId: number | null;
  onSelect: (customerId: number) => void;
  isLoading?: boolean;
}

export function CustomerSelector({
  customers = [], // Provide default empty array
  selectedCustomerId,
  onSelect,
  isLoading = false,
}: CustomerSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedCustomer = customers?.find(
    (customer) => customer.id === selectedCustomerId
  );

  if (isLoading) {
    return (
      <Button variant="outline" className="w-[300px] justify-between" disabled>
        Loading customers...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
        >
          {selectedCustomer
            ? selectedCustomer.custBusinessname
            : "Select customer..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search customers..." />
          <CommandEmpty>No customer found.</CommandEmpty>
          <CommandGroup>
            {customers.map((customer) => (
              <CommandItem
                key={customer.id}
                value={customer.custBusinessname}
                onSelect={() => {
                  onSelect(customer.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {customer.custBusinessname}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}