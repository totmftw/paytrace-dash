import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { CustomerSelector } from "./CustomerSelector";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./table-columns";

export default function LedgerTab() {
  const { selectedYear, getFYDates } = useFinancialYear();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  
  return (
    <div className="space-y-4">
      <CustomerSelector
        customers={[]}
        selectedCustomerId={selectedCustomerId}
        onSelect={setSelectedCustomerId}
      />
      
      <DataTable
        columns={columns}
        data={[]}
      />
    </div>
  );
}