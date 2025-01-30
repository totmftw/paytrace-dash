import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get customer WhatsApp number
    const { data: customer, error: customerError } = await supabase
      .from('customerMaster')
      .select('custWhatsapp, custBusinessname')
      .eq('id', customerId)
      .single();

    if (customerError) throw customerError;

    // Get WhatsApp config
    const { data: whatsappConfig, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError) throw configError;

    // Generate and upload PDF
    const pdfResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-ledger-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId, entries, year }),
    });

    if (!pdfResponse.ok) {
      throw new Error('Failed to generate PDF');
    }

    const { url: pdfUrl } = await pdfResponse.json();

    // Send WhatsApp message
    const message = `Dear ${customer.custBusinessname},\n\nPlease find your ledger statement for FY ${year} at: ${pdfUrl}`;

    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v17.0/${whatsappConfig.from_phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappConfig.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: customer.custWhatsapp.toString(),
          type: 'text',
          text: { body: message }
        }),
      }
    );

    if (!whatsappResponse.ok) {
      throw new Error('Failed to send WhatsApp message');
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending ledger:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});