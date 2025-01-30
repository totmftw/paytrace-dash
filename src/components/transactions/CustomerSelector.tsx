import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type CustomerSelectorProps = {
  selectedCustomer: number | null;
  onSelect: (customerId: number) => void;
  loading: boolean;
};

export function CustomerSelector({ selectedCustomer, onSelect, loading }: CustomerSelectorProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customerMaster')
        .select('*')
        .ilike('custBusinessname', `%${query}%`)
        .order('custBusinessname');
      if (error) throw error;
      return data;
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') setIsOpen(true);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Select
      value={selectedCustomer?.toString() || ''}
      onValueChange={onSelect}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select customer..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {isLoading ? (
            <SelectItem value="" disabled>
              Loading...
            </SelectItem>
          ) : (
            customers?.map((customer) => (
              <SelectItem key={customer.id} value={customer.id.toString()} onSelect={() => setIsOpen(false)}>
                {customer.custBusinessname}
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}