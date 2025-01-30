// src/pages/Transactions/CustomerSelector.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CustomerSelectorProps {
  selectedCustomerId: number | null;
  onSelect: (customerId: number) => void;
}

export function CustomerSelector({ selectedCustomerId, onSelect }: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers", searchQuery],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customerMaster")
        .select("*")
        .ilike("custBusinessname", `%${searchQuery}%`)
        .order("custBusinessname");
      if (error) throw error;
      return data || [];
    },
    keepPreviousData: true,
  });

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Search for a business name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Select
        onOpenChange={(open) => open && setSearchQuery("")}
        onValueChange={(value) => {
          onSelect(Number(value));
          setIsDropdownOpen(false);
        }}
        value={String(selectedCustomerId)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a customer" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem disabled>Loading...</SelectItem>
          ) : (
            customers.map((customer) => (
              <SelectItem key={customer.id} value={String(customer.id)}>
                <Check className="mr-2 h-4 w-4 opacity-0" />
                {`${customer.custBusinessname} (${customer.custOwnername})`}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}