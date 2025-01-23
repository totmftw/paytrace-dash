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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    const { invId, phone, message, reminderNumber } = await req.json() as WhatsAppMessage;

    // Fetch WhatsApp configuration
    const { data: configs, error: configError } = await supabaseClient
      .from('whatsapp_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (configError) {
      console.error("Error fetching WhatsApp config:", configError);
      throw new Error("Failed to fetch WhatsApp configuration");
    }

    if (!configs || configs.length === 0) {
      console.error("No WhatsApp configuration found");
      throw new Error("WhatsApp configuration not found. Please configure WhatsApp settings first.");
    }

    const config = configs[0];

    // Validate each required field individually for better error messages
    if (!config.api_key) {
      throw new Error("WhatsApp API Key is missing. Please configure it in WhatsApp settings.");
    }
    if (!config.from_phone_number_id) {
      throw new Error("WhatsApp Phone Number ID is missing. Please configure it in WhatsApp settings.");
    }
    if (!config.template_name) {
      throw new Error("WhatsApp Template Name is missing. Please configure it in WhatsApp settings.");
    }

    console.log("Sending WhatsApp message to:", phone);

    // Send WhatsApp message
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${config.from_phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: config.template_name,
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
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WhatsApp API error:", errorText);
      throw new Error(`WhatsApp API error: ${errorText}`);
    }

    // Update reminder status
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
      console.error("Error updating invoice:", updateError);
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
    console.error("Error in send-whatsapp-reminder:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});