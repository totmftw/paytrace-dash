import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TableNames = keyof (Database['public']['Tables'] & Database['public']['Views']);

export const generateTemplateFromTable = async (tableName: TableNames, exampleData: any = {}) => {
  try {
    // Fetch table structure
    const { data: columns, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) throw error;

    // Create template object with all columns
    const template = {
      ...Object.keys(columns[0] || {}).reduce((acc, key) => ({
        ...acc,
        [key]: exampleData[key] || ''
      }), {})
    };

    // Create workbook
    const ws = XLSX.utils.json_to_sheet([template]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Add column widths
    const columnWidths = Object.keys(template).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = columnWidths;

    // Download file
    XLSX.writeFile(wb, `${tableName}-template.xlsx`);
  } catch (error) {
    console.error('Error generating template:', error);
    throw error;
  }
};