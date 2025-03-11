import { supabase } from "./supabase";

// Types
export interface AuditLog {
  id: string;
  project_id: string;
  timestamp: string;
  action: string;
  user_id: string;
  user_email: string;
  details: string;
  entity_id?: string;
  entity_type?: string;
  ip_address?: string;
  metadata?: any;
}

export interface ComplianceCheck {
  id: string;
  investor_id: string;
  project_id: string;
  risk_level: "low" | "medium" | "high";
  risk_reason: string;
  status: "pending_approval" | "approved" | "rejected";
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

// Create an audit log entry
export const createAuditLog = async (logData: {
  project_id: string;
  action: string;
  user_id: string;
  user_email: string;
  details: string;
  entity_id?: string;
  entity_type?: string;
  metadata?: any;
}): Promise<AuditLog> => {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        project_id: logData.project_id,
        timestamp: new Date().toISOString(),
        action: logData.action,
        user_id: logData.user_id,
        user_email: logData.user_email,
        details: logData.details,
        entity_id: logData.entity_id,
        entity_type: logData.entity_type,
        ip_address: "127.0.0.1", // In a real app, this would be the actual IP
        metadata: logData.metadata,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating audit log:", error);
    throw error;
  }
};

// Get audit logs for a project
export const getAuditLogs = async (
  projectId: string,
  options?: {
    limit?: number;
    offset?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
  },
): Promise<AuditLog[]> => {
  try {
    let query = supabase
      .from("audit_logs")
      .select("*")
      .eq("project_id", projectId)
      .order("timestamp", { ascending: false });

    if (options?.action) {
      query = query.eq("action", options.action);
    }

    if (options?.startDate) {
      query = query.gte("timestamp", options.startDate);
    }

    if (options?.endDate) {
      query = query.lte("timestamp", options.endDate);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1,
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
};

// Create a compliance check for an investor
export const createComplianceCheck = async (checkData: {
  investor_id: string;
  project_id: string;
  risk_level: "low" | "medium" | "high";
  risk_reason: string;
}): Promise<ComplianceCheck> => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("compliance_checks")
      .insert({
        investor_id: checkData.investor_id,
        project_id: checkData.project_id,
        risk_level: checkData.risk_level,
        risk_reason: checkData.risk_reason,
        status:
          checkData.risk_level === "high" ? "pending_approval" : "approved",
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating compliance check:", error);
    throw error;
  }
};

// Get high-risk investors for a project
export const getHighRiskInvestors = async (
  projectId: string,
): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("compliance_checks")
      .select(
        `
        id,
        investor_id,
        risk_level,
        risk_reason,
        status,
        reviewed_by,
        reviewed_at,
        investors!inner(name, email),
        subscriptions(id, fiat_amount)
      `,
      )
      .eq("project_id", projectId)
      .eq("risk_level", "high");

    if (error) throw error;

    // Transform data for the UI
    const transformedData =
      data?.map((check) => ({
        id: check.id,
        investor_id: check.investor_id,
        name: check.investors.name,
        email: check.investors.email,
        risk_level: check.risk_level,
        risk_reason: check.risk_reason,
        status: check.status,
        reviewed_by: check.reviewed_by,
        reviewed_at: check.reviewed_at,
        subscription_id: check.subscriptions?.[0]?.id,
        amount: check.subscriptions?.[0]?.fiat_amount || 0,
      })) || [];

    return transformedData;
  } catch (error) {
    console.error("Error fetching high-risk investors:", error);
    throw error;
  }
};

// Update compliance check status
export const updateComplianceCheckStatus = async (
  checkId: string,
  status: "approved" | "rejected",
  userId: string,
): Promise<ComplianceCheck> => {
  try {
    const { data, error } = await supabase
      .from("compliance_checks")
      .update({
        status,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", checkId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating compliance check status:", error);
    throw error;
  }
};

// Check if a user has compliance officer role
export const isComplianceOfficer = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "compliance_officer")
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "no rows returned"
    return !!data;
  } catch (error) {
    console.error("Error checking compliance officer role:", error);
    return false;
  }
};
