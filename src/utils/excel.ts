// src/utils/excel.ts
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient';
import { Invoice } from '@/types';

const INVOICE_COLUMNS = [
  { key: 'invCustid', header: 'Customer ID', required: true },
  { key: 'invDate', header: 'Invoice Date', required: true },
  { key: 'invDuedate', header: 'Due Date', required: true },
  { key: 'invAmount', header: 'Amount', required: true },
  { key: 'invGst', header: 'GST', required: true },
  { key: 'invAddamount', header: 'Additional Amount' },
  { key: 'invMessage1', header: 'Message 1' },
  { key: 'invMessage2', header: 'Message 2' },
  { key: 'invAlert', header: 'Alert' },
  { key: 'invMarkcleared', header: 'Cleared', type: 'boolean' }
];

export const downloadTemplate = () => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    INVOICE_COLUMNS.map(col => col.header),
    INVOICE_COLUMNS.map(col => 
      col.required ? `(Required) ${col.type || 'text'}` : `(Optional) ${col.type || 'text'}`
    )
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice Template');
  XLSX.writeFile(workbook, 'invoice-template.xlsx');
};

export const handleExcelUpload = async (file: File, year: string) => {
  return new Promise<{ duplicates: Invoice[] }>(async (resolve, reject) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      // Validate data
      const errors = validateExcelData(rows);
      if (errors.length > 0) {
        throw new Error(`Validation errors:\n${errors.join('\n')}`);
      }

      // Check for duplicates
      const duplicates = await checkDuplicates(rows, year);
      if (duplicates.length > 0) {
        return resolve({ duplicates });
      }

      // Transform data to match database schema
      const transformedRows = rows.map(row => transformRow(row, year));

      // Insert data
      const { error } = await supabase
        .from('invoices')
        .insert(transformedRows);

      if (error) throw error;
      resolve({ duplicates: [] });
    } catch (error) {
      reject(error);
    }
  });
};

const validateExcelData = (rows: any[]) => {
  const errors: string[] = [];

  rows.forEach((row, index) => {
    INVOICE_COLUMNS.forEach(col => {
      if (col.required && !row[col.header]) {
        errors.push(`Row ${index + 1}: Missing required field ${col.header}`);
      }
    });
  });

  return errors;
};

const checkDuplicates = async (rows: any[], year: string) => {
  const { data: existingInvoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('fy', year);

  return rows.filter(row =>
    existingInvoices?.some(existing =>
      existing.invCustid === row['Customer ID'] &&
      existing.invDate === row['Invoice Date'] &&
      existing.invAmount === row['Amount']
    )
  );
};

const transformRow = (row: any, year: string) => {
  return {
    invCustid: row['Customer ID'],
    invDate: row['Invoice Date'],
    invDuedate: row['Due Date'],
    invAmount: row['Amount'],
    invGst: row['GST'],
    invAddamount: row['Additional Amount'] || 0,
    invMessage1: row['Message 1'] || '',
    invMessage2: row['Message 2'] || '',
    invAlert: row['Alert'] || '',
    invMarkcleared: row['Cleared'] || false,
    fy: year
  };
};
