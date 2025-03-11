import { supabase } from "../supabase";

// Types
export interface OnfidoApplicant {
  first_name: string;
  last_name: string;
  email: string;
  dob?: string;
  country?: string;
}

export interface OnfidoCompany {
  name: string;
  registration_number: string;
  country: string;
}

export interface OnfidoCheck {
  applicant_id: string;
  check_type: string;
  documents?: string[];
}

// Create an Onfido applicant
export const createApplicant = async (
  applicantData: OnfidoApplicant,
  investorId: string,
): Promise<{ applicantId: string }> => {
  try {
    const response = await fetch(
      `${supabase.supabaseUrl}/functions/v1/onfido-create-applicant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabase.supabaseKey}`,
        },
        body: JSON.stringify({
          firstName: applicantData.first_name,
          lastName: applicantData.last_name,
          email: applicantData.email,
          dateOfBirth: applicantData.dob,
          country: applicantData.country || "US",
          investorId,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create applicant");
    }

    const data = await response.json();
    return { applicantId: data.applicantId };
  } catch (error) {
    console.error("Error creating Onfido applicant:", error);
    throw error;
  }
};

// Create an Onfido check
export const createCheck = async (
  checkData: OnfidoCheck,
  investorId: string,
): Promise<{ checkId: string }> => {
  try {
    const response = await fetch(
      `${supabase.supabaseUrl}/functions/v1/onfido-create-check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabase.supabaseKey}`,
        },
        body: JSON.stringify({
          applicantId: checkData.applicant_id,
          checkType: checkData.check_type,
          investorId,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create check");
    }

    const data = await response.json();
    return { checkId: data.checkId };
  } catch (error) {
    console.error("Error creating Onfido check:", error);
    throw error;
  }
};

// Get the status of an Onfido check
export const getCheckStatus = async (
  checkId: string,
): Promise<{ status: string; result?: string }> => {
  try {
    // In a real implementation, you would call the Onfido API
    // For this demo, we'll simulate a check status
    return {
      status: "complete",
      result: Math.random() > 0.2 ? "clear" : "consider",
    };
  } catch (error) {
    console.error("Error getting Onfido check status:", error);
    throw error;
  }
};

// Generate an SDK token for the Onfido SDK
export const generateSdkToken = async (
  applicantId: string,
): Promise<{ token: string }> => {
  try {
    // In a real implementation, you would call your edge function
    // For this demo, we'll simulate a token
    return {
      token: `token-${Math.random().toString(36).substring(2, 15)}`,
    };
  } catch (error) {
    console.error("Error generating Onfido SDK token:", error);
    throw error;
  }
};
