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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First, fetch WhatsApp configuration
    const { data: whatsappConfig, error: configError } = await supabaseClient
      .from('whatsapp_config')
      .select('*')
      .single();

    if (configError || !whatsappConfig) {
      console.error('Error fetching WhatsApp config:', configError);
      throw new Error("Missing WhatsApp configuration");
    }

    console.log('WhatsApp config loaded:', {
      templateName: whatsappConfig.template_name,
      templateNamespace: whatsappConfig.template_namespace,
      fromPhoneNumberId: whatsappConfig.from_phone_number_id
    });

    const { invId, phone, message, reminderNumber } = await req.json() as WhatsAppMessage;

    // Send WhatsApp message using the WhatsApp Business API
    const response = await fetch(`https://graph.facebook.com/v17.0/${whatsappConfig.from_phone_number_id}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${whatsappConfig.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: whatsappConfig.template_name,
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
      const errorText = await response.text();
      console.error('WhatsApp API error:', errorText);
      throw new Error(`WhatsApp API error: ${errorText}`);
    }

    console.log('WhatsApp message sent successfully');

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

    if (updateError) {
      console.error('Error updating invoice:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-whatsapp-reminder:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});