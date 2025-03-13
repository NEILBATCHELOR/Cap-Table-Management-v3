import React, { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import PolicyList from "./PolicyList";
import PolicyCreationModal from "./PolicyCreationModal";
import PolicyDetailsPanel from "./PolicyDetailsPanel";
import PolicyAnalytics from "./PolicyAnalytics";
import DeletePolicyDialog from "./DeletePolicyDialog";
import ApprovalDashboard from "./ApprovalDashboard";
import PolicyTemplatesTab from "./PolicyTemplatesTab";

interface Policy {
  id: string;
  name: string;
  status: "active" | "inactive" | "draft" | "pending";
  createdAt: string;
  modifiedAt: string;
  description: string;
  type: string;
  jurisdiction: string;
  effectiveDate: string;
  expirationDate?: string;
  tags: string[];
  rules: any[];
  approvers: any[];
  approvalHistory: any[];
  reviewFrequency?: string;
  isActive?: boolean;
}

const RuleManagementDashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showApprovals, setShowApprovals] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [policyTemplates, setPolicyTemplates] = useState<any[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: "policy-1",
      name: "Transfer Limit Policy",
      status: "active",
      createdAt: "2023-06-15",
      modifiedAt: "2023-07-20",
      description:
        "Enforces limits on digital asset transfers based on user tier and asset type.",
      type: "transfer_limit",
      jurisdiction: "global",
      effectiveDate: "2023-06-15",
      expirationDate: "",
      tags: ["high-value", "compliance", "tier-1"],
      rules: [
        {
          id: "rule-1",
          name: "High Value Transfer",
          type: "transaction",
          condition: {
            field: "amount",
            operator: "greater_than",
            value: "10000",
          },
          action: {
            type: "require_approval",
            params: {
              level: "compliance",
              threshold: "all",
            },
          },
          priority: "high",
          enabled: true,
        },
      ],
      approvers: [
        {
          id: "1",
          name: "Alex Johnson",
          email: "alex.j@example.com",
          role: "Compliance Officer",
          avatarUrl:
            "https://api.dicebear.com/7.x/initials/svg?seed=AJ&backgroundColor=4F46E5",
        },
      ],
      approvalHistory: [],
      reviewFrequency: "quarterly",
      isActive: true,
    },
    {
      id: "policy-2",
      name: "KYC Verification Policy",
      status: "active",
      createdAt: "2023-05-10",
      modifiedAt: "2023-07-15",
      description:
        "Requires KYC verification for transactions above certain thresholds.",
      type: "kyc_verification",
      jurisdiction: "us",
      effectiveDate: "2023-05-10",
      expirationDate: "",
      tags: ["kyc", "verification", "regulatory"],
      rules: [
        {
          id: "rule-2",
          name: "Unverified User Limit",
          type: "user",
          condition: {
            field: "user_verification",
            operator: "equals",
            value: "unverified",
          },
          action: {
            type: "limit_amount",
            params: {
              max_amount: "1000",
              currency: "USD",
            },
          },
          priority: "medium",
          enabled: true,
        },
      ],
      approvers: [],
      approvalHistory: [],
      reviewFrequency: "monthly",
      isActive: true,
    },
    {
      id: "policy-3",
      name: "Restricted Assets Policy",
      status: "draft",
      createdAt: "2023-07-01",
      modifiedAt: "2023-07-22",
      description:
        "Defines rules for handling restricted digital assets across different jurisdictions.",
      type: "restricted_assets",
      jurisdiction: "global",
      effectiveDate: "2023-08-01",
      expirationDate: "",
      tags: ["restricted", "compliance", "regulatory"],
      rules: [
        {
          id: "rule-3",
          name: "Restricted Asset Transfer",
          type: "asset",
          condition: {
            field: "asset_type",
            operator: "equals",
            value: "restricted",
          },
          action: {
            type: "block_transaction",
            params: {},
          },
          priority: "high",
          enabled: true,
        },
      ],
      approvers: [],
      approvalHistory: [],
      reviewFrequency: "quarterly",
      isActive: false,
    },
    {
      id: "policy-4",
      name: "Multi-Signature Approval",
      status: "pending",
      createdAt: "2023-07-05",
      modifiedAt: "2023-07-18",
      description:
        "Requires multiple approvals for high-value transfers or sensitive operations.",
      type: "multi_signature",
      jurisdiction: "global",
      effectiveDate: "2023-07-15",
      expirationDate: "",
      tags: ["multi-sig", "high-security", "executive"],
      rules: [],
      approvers: [],
      approvalHistory: [],
      reviewFrequency: "quarterly",
      isActive: true,
    },
    {
      id: "policy-5",
      name: "Dormant Account Policy",
      status: "inactive",
      createdAt: "2023-04-20",
      modifiedAt: "2023-06-30",
      description:
        "Handles compliance requirements for dormant accounts with digital assets.",
      type: "dormant_account",
      jurisdiction: "eu",
      effectiveDate: "2023-05-01",
      expirationDate: "2023-12-31",
      tags: ["dormant", "inactive", "monitoring"],
      rules: [],
      approvers: [],
      approvalHistory: [],
      reviewFrequency: "biannually",
      isActive: false,
    },
  ]);

  const handleCreatePolicy = () => {
    setSelectedPolicy(null);
    setShowCreateModal(true);
  };

  const handleSaveAsTemplate = (templateData: any) => {
    const newTemplate = {
      ...templateData,
      id: `template-${policyTemplates.length + 1}`,
    };
    setPolicyTemplates([...policyTemplates, newTemplate]);
  };

  const handleUseTemplate = (template: any) => {
    // Create a new policy from the template
    setSelectedPolicy(null);
    const templateToUse = {
      ...template,
      name: `${template.name.replace(" Template", "")}`,
      isTemplate: false,
      status: "draft",
      effectiveDate: new Date().toISOString().split("T")[0],
      modifiedAt: new Date().toISOString().split("T")[0],
    };
    setShowCreateModal(true);
    setShowTemplates(false);
    // Pass the template data as initialData to the creation modal
    setSelectedPolicy(templateToUse);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setPolicyTemplates(
      policyTemplates.filter((template) => template.id !== templateId),
    );
  };

  const handleSavePolicy = (policyData: any) => {
    const currentDate = new Date().toISOString().split("T")[0];

    if (selectedPolicy) {
      // Editing existing policy
      const updatedPolicies = policies.map((policy) => {
        if (policy.id === selectedPolicy.id) {
          return {
            ...policy,
            name: policyData.name,
            description: policyData.description,
            type: policyData.type,
            jurisdiction: policyData.jurisdiction,
            effectiveDate: policyData.effectiveDate,
            expirationDate: policyData.expirationDate,
            tags: policyData.tags,
            rules: policyData.rules || [],
            approvers: policyData.approvers || [],
            reviewFrequency: policyData.reviewFrequency,
            isActive: policyData.isActive,
            status: policyData.isActive ? "active" : "inactive",
            modifiedAt: currentDate,
          };
        }
        return policy;
      });

      setPolicies(updatedPolicies);
    } else {
      // Creating new policy
      const newPolicy = {
        id: `policy-${policies.length + 1}`,
        name: policyData.name,
        description: policyData.description,
        type: policyData.type,
        jurisdiction: policyData.jurisdiction,
        effectiveDate: policyData.effectiveDate,
        expirationDate: policyData.expirationDate,
        tags: policyData.tags,
        status: policyData.isActive ? "active" : "draft",
        createdAt: currentDate,
        modifiedAt: currentDate,
        rules: policyData.rules || [],
        approvers: policyData.approvers || [],
        approvalHistory: [],
        reviewFrequency: policyData.reviewFrequency,
        isActive: policyData.isActive,
      };

      setPolicies([...policies, newPolicy]);
    }

    setShowCreateModal(false);
    setSelectedPolicy(null);
  };

  const handleEditPolicy = (id: string) => {
    const policyToEdit = policies.find((policy) => policy.id === id);
    if (policyToEdit) {
      setSelectedPolicy(policyToEdit);
      setShowCreateModal(true);
    }
  };

  const handleDeletePolicy = (id: string) => {
    const policyToDelete = policies.find((policy) => policy.id === id);
    if (policyToDelete) {
      setPolicyToDelete(policyToDelete);
      setShowDeleteDialog(true);
    }
  };

  const confirmDeletePolicy = () => {
    if (policyToDelete) {
      setPolicies(policies.filter((policy) => policy.id !== policyToDelete.id));
      setPolicyToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const cancelDeletePolicy = () => {
    setPolicyToDelete(null);
    setShowDeleteDialog(false);
  };

  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
    if (showApprovals) setShowApprovals(false);
    if (showTemplates) setShowTemplates(false);
  };

  const toggleApprovals = () => {
    setShowApprovals(!showApprovals);
    if (showAnalytics) setShowAnalytics(false);
    if (showTemplates) setShowTemplates(false);
  };

  const toggleTemplates = () => {
    setShowTemplates(!showTemplates);
    if (showAnalytics) setShowAnalytics(false);
    if (showApprovals) setShowApprovals(false);
  };

  const handleViewPolicy = (id: string) => {
    const policyToView = policies.find((policy) => policy.id === id);
    if (policyToView) {
      setSelectedPolicy(policyToView);
      setShowDetailsPanel(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardHeader
        onCreatePolicy={handleCreatePolicy}
        onSettingsClick={toggleAnalytics}
        onNotificationsClick={toggleApprovals}
        onTemplatesClick={toggleTemplates}
        onSearch={setSearchTerm}
      />

      <main className="flex-1 container mx-auto px-4 py-6">
        {showAnalytics ? (
          <PolicyAnalytics policies={policies} />
        ) : showTemplates ? (
          <PolicyTemplatesTab
            templates={policyTemplates}
            onUseTemplate={handleUseTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        ) : showApprovals ? (
          <ApprovalDashboard
            policies={[
              {
                id: "policy-1",
                name: "High Value Transfer Policy",
                description:
                  "Policy for transfers exceeding $10,000 requiring multi-signature approval",
                status: "pending",
                createdAt: "2023-07-15",
                createdBy: {
                  name: "Morgan Smith",
                  role: "Risk Manager",
                },
                approvers: [
                  {
                    id: "user-1",
                    name: "Alex Johnson",
                    email: "alex.j@example.com",
                    role: "Compliance Officer",
                    avatarUrl:
                      "https://api.dicebear.com/7.x/initials/svg?seed=AJ&backgroundColor=4F46E5",
                    status: "pending",
                  },
                  {
                    id: "user-2",
                    name: "Jamie Lee",
                    email: "jamie.l@example.com",
                    role: "Legal Advisor",
                    avatarUrl:
                      "https://api.dicebear.com/7.x/initials/svg?seed=JL&backgroundColor=4F46E5",
                    status: "approved",
                    comment: "Looks good to me",
                    timestamp: "2023-07-16T14:30:00Z",
                  },
                  {
                    id: "user-3",
                    name: "Taylor Wong",
                    email: "taylor.w@example.com",
                    role: "Executive",
                    avatarUrl:
                      "https://api.dicebear.com/7.x/initials/svg?seed=TW&backgroundColor=4F46E5",
                    status: "pending",
                  },
                ],
                threshold: "majority",
              },
              {
                id: "policy-2",
                name: "KYC Verification Policy",
                description:
                  "Updated KYC verification requirements for new users",
                status: "in_progress",
                createdAt: "2023-07-10",
                createdBy: {
                  name: "Jordan Rivera",
                  role: "Compliance Manager",
                },
                approvers: [
                  {
                    id: "user-1",
                    name: "Alex Johnson",
                    email: "alex.j@example.com",
                    role: "Compliance Officer",
                    avatarUrl:
                      "https://api.dicebear.com/7.x/initials/svg?seed=AJ&backgroundColor=4F46E5",
                    status: "approved",
                    comment: "Complies with new regulations",
                    timestamp: "2023-07-11T10:15:00Z",
                  },
                  {
                    id: "user-2",
                    name: "Jamie Lee",
                    email: "jamie.l@example.com",
                    role: "Legal Advisor",
                    avatarUrl:
                      "https://api.dicebear.com/7.x/initials/svg?seed=JL&backgroundColor=4F46E5",
                    status: "pending",
                  },
                ],
                threshold: "all",
              },
            ]}
            notifications={[
              {
                id: "notif-1",
                policyId: "policy-1",
                policyName: "High Value Transfer Policy",
                type: "approval_request",
                timestamp: "2023-07-15T10:30:00Z",
                read: false,
              },
              {
                id: "notif-2",
                policyId: "policy-2",
                policyName: "KYC Verification Policy",
                type: "approval_complete",
                timestamp: "2023-07-11T10:15:00Z",
                read: true,
              },
            ]}
            currentUser={{
              id: "user-1",
              name: "Alex Johnson",
              email: "alex.j@example.com",
              role: "Compliance Officer",
              avatarUrl:
                "https://api.dicebear.com/7.x/initials/svg?seed=AJ&backgroundColor=4F46E5",
            }}
            onApprove={(policyId, comment) =>
              console.log(`Approved policy ${policyId}: ${comment}`)
            }
            onReject={(policyId, comment) =>
              console.log(`Rejected policy ${policyId}: ${comment}`)
            }
            onViewPolicy={handleViewPolicy}
          />
        ) : (
          <PolicyList
            policies={policies}
            searchTerm={searchTerm}
            onCreatePolicy={handleCreatePolicy}
            onEditPolicy={handleEditPolicy}
            onDeletePolicy={handleDeletePolicy}
            onViewPolicy={handleViewPolicy}
          />
        )}
      </main>

      {showCreateModal && (
        <PolicyCreationModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSave={handleSavePolicy}
          initialData={selectedPolicy || undefined}
          onCancel={() => {
            setShowCreateModal(false);
            setSelectedPolicy(null);
          }}
          onSaveAsTemplate={handleSaveAsTemplate}
        />
      )}

      {showDetailsPanel && selectedPolicy && (
        <PolicyDetailsPanel
          open={showDetailsPanel}
          onOpenChange={setShowDetailsPanel}
          policy={selectedPolicy}
        />
      )}

      {showDeleteDialog && policyToDelete && (
        <DeletePolicyDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          policyName={policyToDelete.name}
          onConfirm={confirmDeletePolicy}
          onCancel={cancelDeletePolicy}
        />
      )}
    </div>
  );
};

export default RuleManagementDashboard;
