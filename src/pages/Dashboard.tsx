import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancialYear } from '@/contexts/FinancialYearContext';
import { InvoiceTable } from '@/components/dashboard/InvoiceTable';
import { SalesVsPaymentsChart } from '@/components/dashboard/SalesVsPaymentsChart';
import { useToast } from '@/hooks/use-toast';
import { FinancialYearSelector } from '@/components/FinancialYearSelector';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { selectedYear } = useFinancialYear();
  const { toast } = useToast();
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center gap-4">
        <FinancialYearSelector />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InvoiceTable year={selectedYear} />
        <SalesVsPaymentsChart year={selectedYear} />
      </div>
    </div>
  );
}