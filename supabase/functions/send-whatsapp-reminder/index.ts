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
    console.log('Starting WhatsApp reminder process...');
    
    // Create Supabase client with explicit error handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      throw new Error("Server configuration error");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // First, fetch WhatsApp configuration with detailed error logging
    console.log('Fetching WhatsApp configuration...');
    const { data: configs, error: configError } = await supabaseClient
      .from('whatsapp_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (configError) {
      console.error('Database error fetching WhatsApp config:', configError);
      throw new Error("Database error while fetching WhatsApp configuration");
    }

    if (!configs || configs.length === 0) {
      console.error('No WhatsApp configuration found in database');
      throw new Error("WhatsApp configuration not found. Please configure WhatsApp settings first.");
    }

    const whatsappConfig = configs[0];
    console.log('WhatsApp config retrieved:', {
      hasApiKey: !!whatsappConfig.api_key,
      hasTemplateName: !!whatsappConfig.template_name,
      hasPhoneNumberId: !!whatsappConfig.from_phone_number_id
    });

    if (!whatsappConfig.api_key || !whatsappConfig.template_name || !whatsappConfig.from_phone_number_id) {
      console.error('Invalid WhatsApp configuration:', {
        hasApiKey: !!whatsappConfig.api_key,
        hasTemplateName: !!whatsappConfig.template_name,
        hasPhoneNumberId: !!whatsappConfig.from_phone_number_id
      });
      throw new Error("Incomplete WhatsApp configuration. Please ensure all required fields are filled.");
    }

    console.log('WhatsApp config loaded successfully');

    const { invId, phone, message, reminderNumber } = await req.json() as WhatsAppMessage;
    console.log('Processing reminder for invoice:', invId, 'to phone:', phone);

    // Send WhatsApp message using the WhatsApp Business API
    console.log('Sending WhatsApp message...');
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
      console.error('WhatsApp API error response:', errorText);
      throw new Error(`WhatsApp API error: ${errorText}`);
    }

    console.log('WhatsApp message sent successfully');

    // Update the reminder status in the database
    console.log('Updating reminder status in database...');
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

    console.log('Reminder process completed successfully');

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
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});