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

    console.log("Fetching WhatsApp configuration...");
    const { data: configs, error: configError } = await supabaseClient
      .from('whatsapp_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError) {
      console.error("Error fetching WhatsApp config:", configError);
      throw new Error("Failed to fetch WhatsApp configuration");
    }

    if (!configs) {
      console.error("No active WhatsApp configuration found");
      throw new Error("WhatsApp configuration not found. Please configure WhatsApp settings first.");
    }

    // Format the phone number
    let formattedPhone = phone.replace(/\s+/g, ''); // Remove all spaces
    formattedPhone = formattedPhone.replace(/^\+/, ''); // Remove leading +
    
    // Ensure the number starts with a country code
    if (!formattedPhone.match(/^\d{1,3}\d+$/)) {
      throw new Error("Invalid phone number format. Must include country code.");
    }

    console.log("Sending WhatsApp message to:", formattedPhone);
    console.log("Using template:", configs.template_name);
    console.log("Phone Number ID:", configs.from_phone_number_id);

    // Send WhatsApp message
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${configs.from_phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${configs.api_key.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "text",
          text: {
            body: message
          }
        }),
      }
    );

    const responseData = await response.text();
    console.log("WhatsApp API raw response:", responseData);

    if (!response.ok) {
      console.error("WhatsApp API error response:", responseData);
      throw new Error(`WhatsApp API error: ${responseData}`);
    }

    const whatsappResponse = JSON.parse(responseData);
    console.log("WhatsApp API parsed response:", whatsappResponse);

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
      JSON.stringify({ success: true, data: whatsappResponse }),
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