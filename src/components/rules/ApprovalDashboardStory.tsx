import React, { useState } from "react";
import ApprovalDashboard from "./ApprovalDashboard";

export default function ApprovalDashboardStory() {
  // Mock data for the story
  const currentUser = {
    id: "user-1",
    name: "Alex Johnson",
    email: "alex.j@example.com",
    role: "Compliance Officer",
    avatarUrl:
      "https://api.dicebear.com/7.x/initials/svg?seed=AJ&backgroundColor=4F46E5",
  };

  const [policies, setPolicies] = useState([
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
      description: "Updated KYC verification requirements for new users",
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
    {
      id: "policy-3",
      name: "Restricted Assets Policy",
      description:
        "Policy for handling restricted digital assets across jurisdictions",
      status: "approved",
      createdAt: "2023-07-05",
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
          status: "approved",
          comment: "Approved with standard conditions",
          timestamp: "2023-07-06T09:20:00Z",
        },
        {
          id: "user-3",
          name: "Taylor Wong",
          email: "taylor.w@example.com",
          role: "Executive",
          avatarUrl:
            "https://api.dicebear.com/7.x/initials/svg?seed=TW&backgroundColor=4F46E5",
          status: "approved",
          comment: "Looks good",
          timestamp: "2023-07-07T11:45:00Z",
        },
      ],
      threshold: "all",
    },
    {
      id: "policy-4",
      name: "Dormant Account Policy",
      description: "Policy for handling dormant accounts with digital assets",
      status: "rejected",
      createdAt: "2023-06-28",
      createdBy: {
        name: "Jordan Rivera",
        role: "Compliance Manager",
      },
      approvers: [
        {
          id: "user-2",
          name: "Jamie Lee",
          email: "jamie.l@example.com",
          role: "Legal Advisor",
          avatarUrl:
            "https://api.dicebear.com/7.x/initials/svg?seed=JL&backgroundColor=4F46E5",
          status: "approved",
          comment: "Approved from legal perspective",
          timestamp: "2023-06-29T15:10:00Z",
        },
        {
          id: "user-3",
          name: "Taylor Wong",
          email: "taylor.w@example.com",
          role: "Executive",
          avatarUrl:
            "https://api.dicebear.com/7.x/initials/svg?seed=TW&backgroundColor=4F46E5",
          status: "rejected",
          comment: "Needs revision to align with business goals",
          timestamp: "2023-06-30T14:25:00Z",
        },
      ],
      threshold: "all",
    },
  ]);

  const [notifications, setNotifications] = useState([
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
    {
      id: "notif-3",
      policyId: "policy-3",
      policyName: "Restricted Assets Policy",
      type: "approval_complete",
      timestamp: "2023-07-07T11:45:00Z",
      read: true,
    },
    {
      id: "notif-4",
      policyId: "policy-4",
      policyName: "Dormant Account Policy",
      type: "approval_rejected",
      timestamp: "2023-06-30T14:25:00Z",
      read: false,
    },
  ]);

  const handleApprove = (policyId: string, comment: string) => {
    console.log(`Approved policy ${policyId} with comment: ${comment}`);

    // Update the policy status in our mock data
    setPolicies(
      policies.map((policy) => {
        if (policy.id === policyId) {
          // Update the current user's approval status
          const updatedApprovers = policy.approvers.map((approver) => {
            if (approver.id === currentUser.id) {
              return {
                ...approver,
                status: "approved",
                comment,
                timestamp: new Date().toISOString(),
              };
            }
            return approver;
          });

          // Check if we've reached the threshold for approval
          const approvedCount = updatedApprovers.filter(
            (a) => a.status === "approved",
          ).length;
          let newStatus = policy.status;

          if (
            policy.threshold === "any" ||
            (policy.threshold === "majority" &&
              approvedCount >= Math.ceil(policy.approvers.length / 2)) ||
            (policy.threshold === "all" &&
              approvedCount === policy.approvers.length)
          ) {
            newStatus = "approved";
          } else if (approvedCount > 0) {
            newStatus = "in_progress";
          }

          return {
            ...policy,
            status: newStatus,
            approvers: updatedApprovers,
          };
        }
        return policy;
      }),
    );

    // Add a notification
    if (
      !notifications.some(
        (n) => n.policyId === policyId && n.type === "approval_complete",
      )
    ) {
      const policyName = policies.find((p) => p.id === policyId)?.name || "";
      setNotifications([
        ...notifications,
        {
          id: `notif-${Date.now()}`,
          policyId,
          policyName,
          type: "approval_complete",
          timestamp: new Date().toISOString(),
          read: false,
        },
      ]);
    }
  };

  const handleReject = (policyId: string, comment: string) => {
    console.log(`Rejected policy ${policyId} with comment: ${comment}`);

    // Update the policy status in our mock data
    setPolicies(
      policies.map((policy) => {
        if (policy.id === policyId) {
          // Update the current user's approval status
          const updatedApprovers = policy.approvers.map((approver) => {
            if (approver.id === currentUser.id) {
              return {
                ...approver,
                status: "rejected",
                comment,
                timestamp: new Date().toISOString(),
              };
            }
            return approver;
          });

          return {
            ...policy,
            status: "rejected",
            approvers: updatedApprovers,
          };
        }
        return policy;
      }),
    );

    // Add a notification
    if (
      !notifications.some(
        (n) => n.policyId === policyId && n.type === "approval_rejected",
      )
    ) {
      const policyName = policies.find((p) => p.id === policyId)?.name || "";
      setNotifications([
        ...notifications,
        {
          id: `notif-${Date.now()}`,
          policyId,
          policyName,
          type: "approval_rejected",
          timestamp: new Date().toISOString(),
          read: false,
        },
      ]);
    }
  };

  const handleViewPolicy = (policyId: string) => {
    console.log(`Viewing policy details for ${policyId}`);
    // In a real app, this would navigate to the policy details view
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Policy Approval Workflow</h1>
      <ApprovalDashboard
        policies={policies}
        notifications={notifications}
        currentUser={currentUser}
        onApprove={handleApprove}
        onReject={handleReject}
        onViewPolicy={handleViewPolicy}
      />
    </div>
  );
}
