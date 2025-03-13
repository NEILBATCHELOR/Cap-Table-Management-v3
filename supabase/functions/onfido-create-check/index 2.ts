import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get request data
    const { applicantId, checkType, investorId } = await req.json();

    // Validate required fields
    if (!applicantId || !checkType || !investorId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // In a real implementation, you would call the Onfido API here
    // For this demo, we'll simulate creating a check
    const checkId = `check-${Math.random().toString(36).substring(2, 10)}`;

    // Get the current verification details
    const { data: investor, error: fetchError } = await supabase
      .from("investors")
      .select("verification_details")
      .eq("investor_id", investorId)
      .single();

    if (fetchError) throw fetchError;

    // Update the verification details with the check information
    const verificationDetails = {
      ...investor.verification_details,
      check_id: checkId,
      check_type: checkType,
      check_created_at: new Date().toISOString(),
      status: "in_progress",
    };

    // Update the investor record
    const { error } = await supabase
      .from("investors")
      .update({
        verification_details: verificationDetails,
        updated_at: new Date().toISOString(),
      })
      .eq("investor_id", investorId);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        checkId,
        message: "Check created successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error creating check:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
