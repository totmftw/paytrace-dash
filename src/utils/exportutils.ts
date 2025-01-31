// src/utils/exportUtils.ts
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

interface ExportOptions {
  fileName: string;
  format: 'xlsx' | 'pdf' | 'csv';
  columns?: string[];
  title?: string;
}

export const exportData = <T extends Record<string, any>>(
  data: T[],
  options: ExportOptions
) => {
  switch (options.format) {
    case 'xlsx':
      exportToExcel(data, options);
      break;
    case 'pdf':
      exportToPDF(data, options);
      break;
    case 'csv':
      exportToCSV(data, options);
      break;
  }
};

const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  options: ExportOptions
) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(item => 
      options.columns 
        ? pick(item, options.columns)
        : item
    )
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${options.fileName}.xlsx`);
};

const exportToPDF = <T extends Record<string, any>>(
  data: T[],
  options: ExportOptions
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Add title if provided
  if (options.title) {
    doc.setFontSize(16);
    doc.text(options.title, pageWidth / 2, 20, { align: 'center' });
  }

  // Prepare table data
  const columns = options.columns || Object.keys(data[0] || {});
  const rows = data.map(item => 
    columns.map(col => formatValue(item[col]))
  );

  doc.autoTable({
    startY: options.title ? 30 : 10,
    head: [columns.map(formatColumnHeader)],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] }
  });

  doc.save(`${options.fileName}.pdf`);
};

const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  options: ExportOptions
) => {
  const columns = options.columns || Object.keys(data[0] || {});
  const csvContent = [
    columns.map(formatColumnHeader).join(','),
    ...data.map(item =>
      columns.map(col => 
        JSON.stringify(formatValue(item[col]))
      ).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${options.fileName}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const formatColumnHeader = (header: string) => 
  header.replace(/([A-Z])/g, ' $1').trim();

const formatValue = (value: any) => {
  if (value instanceof Date) {
    return format(value, 'dd/MM/yyyy');
  }
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  return value;
};

const pick = (obj: any, keys: string[]) => 
  keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
