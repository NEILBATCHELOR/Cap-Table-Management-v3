import React, { useState } from "react";
import ApprovalWorkflow from "./ApprovalWorkflow";

export default function ApprovalWorkflowStory() {
  const [status, setStatus] = useState("pending");
  const [approvers, setApprovers] = useState([
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
  ]);

  const handleApprove = (policyId: string, comment: string) => {
    console.log(`Approved policy ${policyId} with comment: ${comment}`);

    // Update the current user's approval status
    setApprovers(
      approvers.map((approver) => {
        if (approver.id === "user-1") {
          // Assuming user-1 is the current user
          return {
            ...approver,
            status: "approved",
            comment,
            timestamp: new Date().toISOString(),
          };
        }
        return approver;
      }),
    );

    // Update the overall status
    setStatus("in_progress");
  };

  const handleReject = (policyId: string, comment: string) => {
    console.log(`Rejected policy ${policyId} with comment: ${comment}`);

    // Update the current user's approval status
    setApprovers(
      approvers.map((approver) => {
        if (approver.id === "user-1") {
          // Assuming user-1 is the current user
          return {
            ...approver,
            status: "rejected",
            comment,
            timestamp: new Date().toISOString(),
          };
        }
        return approver;
      }),
    );

    // Update the overall status
    setStatus("rejected");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Policy Approval Workflow</h1>
      <ApprovalWorkflow
        policyId="policy-1"
        policyName="High Value Transfer Policy"
        approvers={approvers}
        threshold="majority"
        status={status}
        currentUser={{
          id: "user-1",
          name: "Alex Johnson",
          email: "alex.j@example.com",
          role: "Compliance Officer",
          avatarUrl:
            "https://api.dicebear.com/7.x/initials/svg?seed=AJ&backgroundColor=4F46E5",
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
