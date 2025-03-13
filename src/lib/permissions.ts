import { supabase } from "./supabase";
import { Permission, PermissionUpdate } from "@/types/permissions";

export async function savePermissions(
  permissions: Permission[],
  userId: string,
): Promise<void> {
  const update: PermissionUpdate = {
    permissions,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  };

  const { error } = await supabase.from("permissions").upsert({ data: update });

  if (error) throw error;
}

export async function loadPermissions(): Promise<Permission[]> {
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .order("updatedAt", { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data?.data?.permissions || [];
}
