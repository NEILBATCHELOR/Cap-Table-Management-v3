import React from "react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import UserTable from "./UserTable";
import PermissionMatrix from "./PermissionMatrix";
import MultiSigModal from "./MultiSigModal";
import PolicyRules from "./PolicyRules";
import AuditLogs from "./AuditLogs";

const RoleManagementDashboard = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("users");
  const [showMultiSigModal, setShowMultiSigModal] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<{
    type: string;
    userId?: string;
  } | null>(null);

  const handleUserAction = async (action: string, userId: string) => {
    setPendingAction({ type: action, userId });
    setShowMultiSigModal(true);

    // Log the action to audit logs
    try {
      const { logAction } = await import("@/lib/auditLogger");
      await logAction(
        `User ${action}`,
        "current-user@example.com", // In a real app, this would be the current user
        `Initiated ${action} action for user ${userId}`,
        "Pending Approval",
      );
    } catch (error) {
      console.error(`Failed to log ${action} action:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <Card className="max-w-[1512px] mx-auto bg-white">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Role Management</h1>
            <p className="text-gray-500 mt-2">
              Manage user roles and permissions for the Chain Capital platform
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UserTable onUserAction={handleUserAction} />
            </TabsContent>

            <TabsContent value="permissions">
              <PermissionMatrix />
            </TabsContent>

            <TabsContent value="policies">
              <PolicyRules
                onSave={(policies) => {
                  console.log("Saving policies:", policies);
                  setPendingAction({ type: "update_policies" });
                  setShowMultiSigModal(true);
                }}
              />
            </TabsContent>

            <TabsContent value="audit">
              <AuditLogs />
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      <MultiSigModal
        open={showMultiSigModal}
        onClose={() => {
          setShowMultiSigModal(false);
          setPendingAction(null);
        }}
        title={`Approve ${pendingAction?.type} Action`}
        description={`This ${pendingAction?.type} action requires multi-signature approval to proceed`}
        requiredSignatures={3}
        onApprove={async () => {
          console.log("Action approved:", pendingAction);

          // Log the approval to audit logs
          try {
            const { logAction } = await import("@/lib/auditLogger");
            await logAction(
              `${pendingAction?.type || "Unknown"} Approval`,
              "current-user@example.com", // In a real app, this would be the current user
              `Approved ${pendingAction?.type || "unknown"} action${pendingAction?.userId ? ` for user ${pendingAction.userId}` : ""}`,
              "Success",
            );
          } catch (error) {
            console.error("Failed to log approval:", error);
          }

          setShowMultiSigModal(false);
          setPendingAction(null);
        }}
      />
    </div>
  );
};

export default RoleManagementDashboard;
