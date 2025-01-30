// utils/financialYear.ts
export const getFYFromDate = (date: Date | string): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    return d.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };
  
  // When creating/updating invoices
  const createInvoice = async (invoiceData: Invoice) => {
    const { data, error } = await supabase
      .from('invoiceTable')
      .insert({
        ...invoiceData,
        fy: getFYFromDate(invoiceData.invDate)
      });
  
    if (error) throw error;
    return data;
  };