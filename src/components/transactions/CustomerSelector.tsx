import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type CustomerSelectorProps = {
  selectedCustomer: number | null;
  onSelect: (customerId: number) => void;
  loading?: boolean;
};

export function CustomerSelector({ selectedCustomer, onSelect, loading }: CustomerSelectorProps) {
  const [query, setQuery] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customerMaster')
        .select('*')
        .ilike('custBusinessname', `%${query}%`)
        .order('custBusinessname');
      if (error) throw error;
      return data;
    }
  });

  return (
    <Select
      value={selectedCustomer?.toString()}
      onValueChange={(value) => onSelect(Number(value))}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select customer..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {(isLoading || loading) ? (
            <SelectItem value="" disabled>
              Loading...
            </SelectItem>
          ) : (
            customers?.map((customer) => (
              <SelectItem 
                key={customer.id} 
                value={customer.id.toString()}
              >
                {customer.custBusinessname}
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}