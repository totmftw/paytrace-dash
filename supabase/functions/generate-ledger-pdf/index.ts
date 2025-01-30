import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import * as puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { customerId, entries, year } = await req.json();

    // Generate HTML content for PDF
    const html = generateLedgerHTML(entries, year);

    // Launch browser and create PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();

    // Upload PDF to Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const fileName = `ledger-${customerId}-${year}.pdf`;
    const { data, error } = await supabase.storage
      .from('ledgers')
      .upload(fileName, pdf, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('ledgers')
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ url: publicUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateLedgerHTML(entries: any[], year: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; border: 1px solid #ddd; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>Ledger Statement - FY ${year}</h1>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Invoice Number</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${entries.map(entry => `
              <tr>
                <td>${new Date(entry.createdAt).toLocaleDateString()}</td>
                <td>${entry.description || entry.transactionType}</td>
                <td>${entry.invoiceTable?.invNumber || '-'}</td>
                <td>${entry.transactionType === 'invoice' ? entry.amount.toFixed(2) : '-'}</td>
                <td>${entry.transactionType === 'payment' ? entry.amount.toFixed(2) : '-'}</td>
                <td>${entry.runningBalance.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
}