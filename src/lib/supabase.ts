import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get user roles (from Role-Management)
export async function getUserRoles(userId) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

// Function to log audit events (from Role-Management)
export async function logAction(action, user, description, status) {
  const { error } = await supabase
    .from("audit_logs")
    .insert([{ action, user, description, status }]);
  if (error) throw error;
}
