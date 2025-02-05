import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Customer {
  id: number;
  custBusinessname: string;
  custWhatsapp: number;
}

export interface CustomerSelectorProps {
  selectedCustomerId: number | null;
  onSelect: (customerId: number) => void;
  customers?: Customer[];
  isLoading?: boolean;
}

export function CustomerSelector({ 
  selectedCustomerId, 
  onSelect,
  customers: propCustomers,
  isLoading: propIsLoading 
}: CustomerSelectorProps) {
  const { data: fetchedCustomers, isLoading: queryIsLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customerMaster')
        .select('id, custBusinessname');
      if (error) throw error;
      return data;
    },
    enabled: !propCustomers // Only fetch if customers aren't provided as props
  });

  const customers = propCustomers || fetchedCustomers;
  const isLoading = propIsLoading || queryIsLoading;

  if (isLoading) return <div>Loading...</div>;

  return (
    <Select
      value={selectedCustomerId?.toString()}
      onValueChange={(value) => onSelect(parseInt(value))}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a customer" />
      </SelectTrigger>
      <SelectContent>
        {customers?.map((customer) => (
          <SelectItem key={customer.id} value={customer.id.toString()}>
            {customer.custBusinessname}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}