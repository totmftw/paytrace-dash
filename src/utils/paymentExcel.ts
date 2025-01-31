// src/utils/paymentExcel.ts
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient';
import { PaymentTransaction } from '@/types';

const PAYMENT_COLUMNS = [
  { key: 'invId', header: 'Invoice ID', required: true },
  { key: 'amount', header: 'Amount', required: true },
  { key: 'paymentDate', header: 'Payment Date', required: true },
  { key: 'paymentMode', header: 'Payment Mode', required: true },
  { key: 'referenceNumber', header: 'Reference Number' },
  { key: 'notes', header: 'Notes' }
];

export const downloadTemplate = () => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    PAYMENT_COLUMNS.map(col => col.header),
    PAYMENT_COLUMNS.map(col => 
      col.required ? '(Required)' : '(Optional)'
    )
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Template');
  XLSX.writeFile(workbook, 'payment-template.xlsx');
};

export const handleExcelUpload = async (file: File, year: string) => {
  return new Promise<{ duplicates: PaymentTransaction[] }>(async (resolve, reject) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      // Validate data
      const errors = validatePaymentData(rows);
      if (errors.length > 0) {
        throw new Error(`Validation errors:\n${errors.join('\n')}`);
      }

      // Check for duplicates
      const duplicates = await checkDuplicatePayments(rows, year);
      if (duplicates.length > 0) {
        return resolve({ duplicates });
      }

      // Transform and validate invoice IDs
      const transformedRows = await transformPaymentData(rows, year);

      // Insert data
      const { error } = await supabase
        .from('payment_transactions')
        .insert(transformedRows);

      if (error) throw error;
      resolve({ duplicates: [] });
    } catch (error) {
      reject(error);
    }
  });
};

const validatePaymentData = (rows: any[]) => {
  const errors: string[] = [];

  rows.forEach((row, index) => {
    PAYMENT_COLUMNS.forEach(col => {
      if (col.required && !row[col.header]) {
        errors.push(`Row ${index + 1}: Missing required field ${col.header}`);
      }
    });

    // Validate amount
    if (isNaN(Number(row['Amount'])) || Number(row['Amount']) <= 0) {
      errors.push(`Row ${index + 1}: Invalid amount`);
    }

    // Validate date
    if (isNaN(Date.parse(row['Payment Date']))) {
      errors.push(`Row ${index + 1}: Invalid payment date`);
    }
  });

  return errors;
};

const checkDuplicatePayments = async (rows: any[], year: string) => {
  const { data: existingPayments } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('fy', year);

  return rows.filter(row =>
    existingPayments?.some(existing =>
      existing.invId === row['Invoice ID'] &&
      existing.amount === Number(row['Amount']) &&
      existing.paymentDate === row['Payment Date']
    )
  );
};

const transformPaymentData = async (rows: any[], year: string) => {
  // Get all valid invoice IDs for the year
  const { data: validInvoices } = await supabase
    .from('invoices')
    .select('invId')
    .eq('fy', year);

  const validInvoiceIds = new Set(validInvoices?.map(inv => inv.invId));

  return rows.map(row => {
    const invId = Number(row['Invoice ID']);
    if (!validInvoiceIds.has(invId)) {
      throw new Error(`Invalid Invoice ID: ${invId}`);
    }

    return {
      invId,
      amount: Number(row['Amount']),
      paymentDate: row['Payment Date'],
      paymentMode: row['Payment Mode'],
      referenceNumber: row['Reference Number'] || null,
      notes: row['Notes'] || null,
      fy: year
    };
  });
};
