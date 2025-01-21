import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { apiKey, templateNamespace, templateName, fromPhoneNumberId } = await req.json();

    // Store the configuration in Supabase Edge Function secrets
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update the secrets
    await Promise.all([
      Deno.env.set("WHATSAPP_API_KEY", apiKey),
      Deno.env.set("WHATSAPP_TEMPLATE_NAMESPACE", templateNamespace),
      Deno.env.set("WHATSAPP_TEMPLATE_NAME", templateName),
      Deno.env.set("WHATSAPP_FROM_PHONE_NUMBER_ID", fromPhoneNumberId),
    ]);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in update-whatsapp-config:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});