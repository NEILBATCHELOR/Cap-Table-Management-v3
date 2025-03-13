import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

// Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "completed" | "archived";
  project_type: "equity" | "token" | "hybrid";
  token_symbol: string;
  target_raise: number;
  authorized_shares: number;
  share_price: number;
  company_valuation?: number;
  funding_round?: string;
  legal_entity?: string;
  jurisdiction?: string;
  tax_id?: string;
  created_at?: string;
  updated_at?: string;
  subscription_id?: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  projectType: string;
  tokenSymbol: string;
  targetRaise: string;
  authorizedShares: string;
  sharePrice: string;
  fundingRound?: string;
  legalEntity?: string;
  jurisdiction?: string;
  taxId?: string;
}

// Fetch all projects
export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*, subscriptions(id, status, plan_id, subscription_plans(name))")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }

  // Transform the data to match the UI format
  return data.map((project) => ({
    ...project,
    subscription: project.subscriptions
      ? {
          id: project.subscriptions.id,
          status: project.subscriptions.status,
          planId: project.subscriptions.plan_id,
          planName: project.subscriptions.subscription_plans?.name || "",
        }
      : undefined,
  }));
};

// Fetch a specific project
export const getProject = async (id: string): Promise<Project | null> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*, subscriptions(id, status, plan_id, subscription_plans(name))")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching project with ID ${id}:`, error);
    throw error;
  }

  if (!data) return null;

  // Transform the data to match the UI format
  return {
    ...data,
    subscription: data.subscriptions
      ? {
          id: data.subscriptions.id,
          status: data.subscriptions.status,
          planId: data.subscriptions.plan_id,
          planName: data.subscriptions.subscription_plans?.name || "",
        }
      : undefined,
  };
};

// Create a new project
export const createProject = async (
  projectData: ProjectFormData,
): Promise<Project> => {
  const id = uuidv4();
  const now = new Date().toISOString();

  // Transform form data to database format
  const dbProject = {
    id,
    name: projectData.name,
    description: projectData.description,
    status: projectData.status,
    project_type: projectData.projectType,
    token_symbol: projectData.tokenSymbol,
    target_raise: parseFloat(projectData.targetRaise) || 0,
    authorized_shares: parseInt(projectData.authorizedShares) || 0,
    share_price: parseFloat(projectData.sharePrice) || 0,
    funding_round: projectData.fundingRound,
    legal_entity: projectData.legalEntity,
    jurisdiction: projectData.jurisdiction,
    tax_id: projectData.taxId,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(dbProject)
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    throw error;
  }

  return data;
};

// Update an existing project
export const updateProject = async (
  id: string,
  projectData: ProjectFormData,
): Promise<Project> => {
  const now = new Date().toISOString();

  // Transform form data to database format
  const dbProject = {
    name: projectData.name,
    description: projectData.description,
    status: projectData.status,
    project_type: projectData.projectType,
    token_symbol: projectData.tokenSymbol,
    target_raise: parseFloat(projectData.targetRaise) || 0,
    authorized_shares: parseInt(projectData.authorizedShares) || 0,
    share_price: parseFloat(projectData.sharePrice) || 0,
    funding_round: projectData.fundingRound,
    legal_entity: projectData.legalEntity,
    jurisdiction: projectData.jurisdiction,
    tax_id: projectData.taxId,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("projects")
    .update(dbProject)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating project with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Delete a project
export const deleteProject = async (id: string): Promise<void> => {
  // First check if there are any cap tables associated with this project
  const { data: capTables, error: capTablesError } = await supabase
    .from("cap_tables")
    .select("id")
    .eq("project_id", id);

  if (capTablesError) {
    console.error(
      `Error checking cap tables for project ${id}:`,
      capTablesError,
    );
    throw capTablesError;
  }

  // If there are cap tables, delete them first
  if (capTables && capTables.length > 0) {
    const capTableIds = capTables.map((ct) => ct.id);

    // Delete cap table investors
    const { error: investorsError } = await supabase
      .from("cap_table_investors")
      .delete()
      .in("cap_table_id", capTableIds);

    if (investorsError) {
      console.error(
        `Error deleting cap table investors for project ${id}:`,
        investorsError,
      );
      throw investorsError;
    }

    // Delete cap tables
    const { error: deleteCapTablesError } = await supabase
      .from("cap_tables")
      .delete()
      .eq("project_id", id);

    if (deleteCapTablesError) {
      console.error(
        `Error deleting cap tables for project ${id}:`,
        deleteCapTablesError,
      );
      throw deleteCapTablesError;
    }
  }

  // Check for subscriptions
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("project_id", id);

  if (subscriptionsError) {
    console.error(
      `Error checking subscriptions for project ${id}:`,
      subscriptionsError,
    );
    throw subscriptionsError;
  }

  // If there are subscriptions, delete them
  if (subscriptions && subscriptions.length > 0) {
    const subscriptionIds = subscriptions.map((s) => s.id);

    // Delete subscription invoices
    const { error: invoicesError } = await supabase
      .from("subscription_invoices")
      .delete()
      .in("subscription_id", subscriptionIds);

    if (invoicesError) {
      console.error(
        `Error deleting subscription invoices for project ${id}:`,
        invoicesError,
      );
      throw invoicesError;
    }

    // Delete subscription events
    const { error: eventsError } = await supabase
      .from("subscription_events")
      .delete()
      .in("subscription_id", subscriptionIds);

    if (eventsError) {
      console.error(
        `Error deleting subscription events for project ${id}:`,
        eventsError,
      );
      throw eventsError;
    }

    // Delete subscriptions
    const { error: deleteSubscriptionsError } = await supabase
      .from("subscriptions")
      .delete()
      .eq("project_id", id);

    if (deleteSubscriptionsError) {
      console.error(
        `Error deleting subscriptions for project ${id}:`,
        deleteSubscriptionsError,
      );
      throw deleteSubscriptionsError;
    }
  }

  // Finally, delete the project
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting project with ID ${id}:`, error);
    throw error;
  }
};

// Get project statistics
export const getProjectStatistics = async (id: string) => {
  // Get cap table data
  const { data: capTable, error: capTableError } = await supabase
    .from("cap_tables")
    .select("id")
    .eq("project_id", id)
    .single();

  if (capTableError && capTableError.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error(`Error fetching cap table for project ${id}:`, capTableError);
    throw capTableError;
  }

  let investorCount = 0;
  let totalAllocation = 0;

  if (capTable) {
    // Get investor count
    const { count: invCount, error: countError } = await supabase
      .from("cap_table_investors")
      .select("id", { count: "exact" })
      .eq("cap_table_id", capTable.id);

    if (countError) {
      console.error(`Error counting investors for project ${id}:`, countError);
      throw countError;
    }

    investorCount = invCount || 0;

    // Get total allocation
    const { data: investors, error: investorsError } = await supabase
      .from("cap_table_investors")
      .select("investor_id, investors(subscription_amount)")
      .eq("cap_table_id", capTable.id);

    if (investorsError) {
      console.error(
        `Error fetching investors for project ${id}:`,
        investorsError,
      );
      throw investorsError;
    }

    totalAllocation = investors.reduce((sum, inv) => {
      return sum + (inv.investors?.subscription_amount || 0);
    }, 0);
  }

  return {
    investorCount,
    totalAllocation,
  };
};
