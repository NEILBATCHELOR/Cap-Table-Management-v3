import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

// Types matching the SQL schema
export interface Subscription {
  id: string;
  project_id: string | null;
  investor_id: string;
  subscription_id: string;
  currency: string;
  fiat_amount: number;
  subscription_date: string;
  confirmed: boolean;
  allocated: boolean;
  allocation_confirmed?: boolean; // Not in SQL, keeping for backward compatibility
  distributed: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithInvestor extends Subscription {
  investor: {
    name: string;
    email: string;
    wallet_address?: string | null;
    type: string;
    kyc_status: string;
  };
}

export interface Invoice {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  issued_date: string;
  paid: boolean;
  payment_date?: string;
  due_date: string;
  invoice_number: string;
  created_at: string;
  updated_at: string;
}

// Get all subscriptions for a project
export const getProjectSubscriptions = async (
  projectId: string,
): Promise<SubscriptionWithInvestor[]> => {
  try {
    console.log("getProjectSubscriptions called with projectId:", projectId);

    // First check if the project exists
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("id, name")
      .eq("id", projectId)
      .single();

    if (projectError) {
      console.error("Project not found:", projectError);
      // If the project doesn't exist, return empty array instead of throwing
      if (projectError.code === "PGRST116") {
        console.log("No project found with ID:", projectId);
        return [];
      }
      throw projectError;
    }

    console.log("Found project:", projectData);

    // Now fetch subscriptions
    const { data, error } = await supabase
      .from("subscriptions")
      .select(
        `
        id,
        project_id,
        investor_id,
        subscription_id,
        currency,
        fiat_amount,
        subscription_date,
        confirmed,
        allocated,
        distributed,
        notes,
        created_at,
        updated_at,
        investors!inner(name, email, wallet_address, type, kyc_status)
      `,
      )
      .eq("project_id", projectId);

    if (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }

    console.log(
      `Found ${data?.length || 0} subscriptions for project ${projectData.name}`,
    );

    return (
      data?.map((subscription) => ({
        ...subscription,
        investor: {
          name: subscription.investors.name,
          email: subscription.investors.email,
          wallet_address: subscription.investors.wallet_address,
          type: subscription.investors.type,
          kyc_status: subscription.investors.kyc_status,
        },
      })) || []
    );
  } catch (error) {
    console.error("Error fetching project subscriptions:", error);
    throw error;
  }
};

// Create a new subscription
export const createSubscription = async (
  subscriptionData: Omit<Subscription, "id" | "created_at" | "updated_at"> & {
    investor_name?: string;
    investor_email?: string;
  },
): Promise<Subscription> => {
  try {
    const now = new Date().toISOString();
    let investorId = subscriptionData.investor_id;

    // Validate that project_id is provided
    if (!subscriptionData.project_id) {
      throw new Error("Project ID is required for creating a subscription");
    }

    if (!investorId && subscriptionData.investor_email) {
      const { data: existingInvestor, error: lookupError } = await supabase
        .from("investors")
        .select("investor_id")
        .eq("email", subscriptionData.investor_email)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (existingInvestor) {
        investorId = existingInvestor.investor_id;
      } else if (subscriptionData.investor_name) {
        const { data: newInvestor, error: createError } = await supabase
          .from("investors")
          .insert({
            name: subscriptionData.investor_name,
            email: subscriptionData.investor_email,
            type: "hnwi",
            kyc_status: "not_started",
            created_at: now,
            updated_at: now,
          })
          .select("investor_id")
          .single();

        if (createError) throw createError;
        investorId = newInvestor.investor_id;
      } else {
        throw new Error("Missing investor information");
      }
    }

    // Remove non-schema fields before inserting
    const { investor_name, investor_email, ...cleanData } = subscriptionData;

    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        ...cleanData,
        investor_id: investorId,
        project_id: subscriptionData.project_id, // Ensure project_id is set
        subscription_id: subscriptionData.subscription_id || `SUB-${uuidv4()}`,
        subscription_date: subscriptionData.subscription_date || now,
        confirmed: subscriptionData.confirmed ?? false,
        allocated: subscriptionData.allocated ?? false,
        distributed: subscriptionData.distributed ?? false,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

// Update a subscription
export const updateSubscription = async (
  id: string,
  updates: Partial<Omit<Subscription, "id" | "created_at" | "updated_at">>,
): Promise<Subscription> => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
};

// Delete a subscription
export const deleteSubscription = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", id);
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting subscription:", error);
    throw error;
  }
};

// Confirm multiple subscriptions
export const confirmSubscriptions = async (
  ids: string[],
  projectId: string,
): Promise<void> => {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("subscriptions")
      .update({
        confirmed: true,
        updated_at: now,
      })
      .in("id", ids);

    if (error) throw error;

    await supabase.from("audit_logs").insert({
      project_id: projectId,
      action: "subscription_confirmed",
      user_id: "current-user", // Replace with actual user ID in production
      user_email: "admin@example.com", // Replace with actual user email
      details: `Confirmed ${ids.length} subscription(s)`,
      entity_id: ids.join(","),
      entity_type: "subscription",
      timestamp: now,
    });
  } catch (error) {
    console.error("Error confirming subscriptions:", error);
    throw error;
  }
};

// Get subscription statistics
export const getSubscriptionStats = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("id, confirmed, allocated, distributed, fiat_amount")
      .eq("project_id", projectId);

    if (error) throw error;

    const totalCount = data?.length || 0;
    const confirmedCount = data?.filter((sub) => sub.confirmed).length || 0;
    const allocatedCount = data?.filter((sub) => sub.allocated).length || 0;
    const distributedCount = data?.filter((sub) => sub.distributed).length || 0;
    const totalAmount =
      data?.reduce((sum, sub) => sum + (sub.fiat_amount || 0), 0) || 0;

    return {
      totalCount,
      confirmedCount,
      allocatedCount,
      distributedCount,
      totalAmount,
      confirmedPercentage:
        totalCount > 0 ? (confirmedCount / totalCount) * 100 : 0,
      allocatedPercentage:
        totalCount > 0 ? (allocatedCount / totalCount) * 100 : 0,
      distributedPercentage:
        totalCount > 0 ? (distributedCount / totalCount) * 100 : 0,
    };
  } catch (error) {
    console.error("Error getting subscription stats:", error);
    throw error;
  }
};

// Get invoice for a subscription
export const getInvoice = async (
  subscriptionId: string,
): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        id,
        subscription_id,
        amount,
        currency,
        issued_date,
        paid,
        payment_date,
        due_date,
        invoice_number,
        created_at,
        updated_at
      `,
      )
      .eq("subscription_id", subscriptionId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw error;
  }
};

// Generate invoice for a subscription
export const generateInvoice = async (
  subscriptionId: string,
): Promise<Invoice> => {
  try {
    // First get the subscription details
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*, investors!inner(name, email)")
      .eq("id", subscriptionId)
      .single();

    if (subError) throw subError;

    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + 30); // Due in 30 days

    // Generate invoice number with format INV-YYYY-MM-XXXXX
    const invoiceNumber = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(10000 + Math.random() * 90000)}`;

    // Create the invoice
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        subscription_id: subscriptionId,
        amount: subscription.fiat_amount,
        currency: subscription.currency,
        issued_date: now.toISOString(),
        due_date: dueDate.toISOString(),
        paid: false,
        invoice_number: invoiceNumber,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw error;
  }
};

// Process payment for an invoice
export const processPayment = async (
  invoiceId: string,
  paymentDetails: {
    amount: number;
    paymentMethod: string;
    paymentDate?: string;
    transactionId?: string;
    notes?: string;
  },
): Promise<Invoice> => {
  try {
    const now = new Date().toISOString();

    // Get the invoice first
    const { data: invoice, error: fetchError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (fetchError) throw fetchError;

    // Update the invoice to mark as paid
    const { data, error } = await supabase
      .from("invoices")
      .update({
        paid: true,
        payment_date: paymentDetails.paymentDate || now,
        updated_at: now,
        metadata: {
          payment_method: paymentDetails.paymentMethod,
          transaction_id: paymentDetails.transactionId,
          notes: paymentDetails.notes,
          processed_by: "admin@example.com", // In a real app, this would be the current user
        },
      })
      .eq("id", invoiceId)
      .select()
      .single();

    if (error) throw error;

    // Log the payment in audit logs
    await supabase.from("audit_logs").insert({
      project_id: "project-id", // This should be fetched from the subscription
      action: "invoice_payment_processed",
      user_id: "current-user",
      user_email: "admin@example.com",
      details: `Payment processed for invoice ${invoice.invoice_number}`,
      entity_id: invoiceId,
      entity_type: "invoice",
      timestamp: now,
      metadata: {
        amount: paymentDetails.amount,
        payment_method: paymentDetails.paymentMethod,
        transaction_id: paymentDetails.transactionId,
      },
    });

    return data;
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};
