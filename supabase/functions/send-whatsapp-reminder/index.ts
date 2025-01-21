import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppMessage {
  invId: number;
  phone: string;
  message: string;
  reminderNumber: 1 | 2 | 3;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const WHATSAPP_API_KEY = Deno.env.get("WHATSAPP_API_KEY");
    const WHATSAPP_TEMPLATE_NAMESPACE = Deno.env.get("WHATSAPP_TEMPLATE_NAMESPACE");
    const WHATSAPP_TEMPLATE_NAME = Deno.env.get("WHATSAPP_TEMPLATE_NAME");

    if (!WHATSAPP_API_KEY || !WHATSAPP_TEMPLATE_NAMESPACE || !WHATSAPP_TEMPLATE_NAME) {
      throw new Error("Missing WhatsApp configuration");
    }

    const { invId, phone, message, reminderNumber } = await req.json() as WhatsAppMessage;

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Send WhatsApp message using the WhatsApp Business API
    const response = await fetch("https://api.whatsapp.com/v1/messages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phone,
        template: {
          namespace: WHATSAPP_TEMPLATE_NAMESPACE,
          name: WHATSAPP_TEMPLATE_NAME,
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: message,
                },
              ],
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${await response.text()}`);
    }

    // Update the reminder status in the database
    const reminderColumn = `invReminder${reminderNumber}`;
    const messageColumn = `invMessage${reminderNumber}`;
    
    const { error: updateError } = await supabaseClient
      .from('invoiceTable')
      .update({
        [reminderColumn]: true,
        [messageColumn]: message,
      })
      .eq('invId', invId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});