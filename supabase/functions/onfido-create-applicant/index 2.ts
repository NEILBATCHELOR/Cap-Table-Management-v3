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
    const { firstName, lastName, email, dateOfBirth, country, investorId } =
      await req.json();

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !dateOfBirth ||
      !country ||
      !investorId
    ) {
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
    // For this demo, we'll simulate creating an applicant
    const applicantId = `applicant-${Math.random().toString(36).substring(2, 10)}`;

    // Update the investor record with the applicant ID
    const { error } = await supabase
      .from("investors")
      .update({
        verification_details: {
          method: "onfido",
          applicant_id: applicantId,
          created_at: new Date().toISOString(),
          status: "created",
        },
        kyc_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("investor_id", investorId);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        applicantId,
        message: "Applicant created successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error creating applicant:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
