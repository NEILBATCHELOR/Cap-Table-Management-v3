import { signData } from "./crypto";

export interface AuditLog {
  id?: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  status: string;
  signature?: string;
  verified?: boolean;
}

// In-memory storage for audit logs when Supabase is not available
let inMemoryLogs: AuditLog[] = [];

export async function logAction(
  action: string,
  user: string,
  details: string,
  status: string = "Success",
  privateKey?: string,
): Promise<AuditLog> {
  const timestamp = new Date().toISOString();

  const logEntry: AuditLog = {
    id: crypto.randomUUID(),
    timestamp,
    action,
    user,
    details,
    status,
  };

  // Sign the log entry if a private key is provided
  if (privateKey) {
    try {
      const signature = await signData(
        {
          timestamp,
          action,
          user,
          details,
          status,
        },
        privateKey,
      );

      logEntry.signature = signature;
      logEntry.verified = true;
    } catch (error) {
      console.error("Failed to sign audit log:", error);
    }
  }

  // Store in memory since Supabase is not configured
  inMemoryLogs.unshift(logEntry);
  console.log("Audit log created:", logEntry);
  return logEntry;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  // Return in-memory logs since Supabase is not configured
  return inMemoryLogs;
}

export async function exportAuditLogs(format: "csv" | "json"): Promise<string> {
  try {
    const logs = await getAuditLogs();

    if (format === "json") {
      return JSON.stringify(logs, null, 2);
    } else {
      // CSV format
      const headers = "timestamp,action,user,details,status,verified\n";
      const rows = logs
        .map((log) => {
          return `"${log.timestamp}","${log.action}","${log.user}","${log.details}","${log.status}","${log.verified ? "Yes" : "No"}"`;
        })
        .join("\n");

      return headers + rows;
    }
  } catch (error) {
    console.error("Failed to export audit logs:", error);
    throw error;
  }
}
