import React from "react";
import PolicyVersionHistory from "./PolicyVersionHistory";

export default function PolicyVersionHistoryStory() {
  // Mock data for the story
  const mockVersions = [
    {
      id: "version-1",
      versionNumber: 3,
      timestamp: "2023-07-20T14:30:00Z",
      changedBy: {
        name: "Alex Johnson",
        role: "Compliance Officer",
      },
      changeType: "updated",
      changes: [
        {
          field: "Transfer Limit",
          oldValue: "5000 USD",
          newValue: "10000 USD",
        },
        {
          field: "Approvers",
          oldValue: "2",
          newValue: "3",
        },
      ],
      comment: "Increased transfer limit and added additional approver",
    },
    {
      id: "version-2",
      versionNumber: 2,
      timestamp: "2023-07-15T09:45:00Z",
      changedBy: {
        name: "Morgan Smith",
        role: "Risk Manager",
      },
      changeType: "approved",
      changes: [],
      comment: "Approved after compliance review",
    },
    {
      id: "version-3",
      versionNumber: 1,
      timestamp: "2023-07-10T11:20:00Z",
      changedBy: {
        name: "Jamie Lee",
        role: "Policy Administrator",
      },
      changeType: "created",
      changes: [
        {
          field: "Policy",
          newValue: "Transfer Limit Policy",
        },
        {
          field: "Status",
          newValue: "Draft",
        },
        {
          field: "Rules",
          newValue: "1 rule added",
        },
      ],
    },
  ];

  const handleViewVersion = (versionId: string) => {
    console.log(`Viewing version: ${versionId}`);
  };

  const handleRollbackToVersion = (versionId: string) => {
    console.log(`Rolling back to version: ${versionId}`);
  };

  const handleCompareVersions = (versionId1: string, versionId2: string) => {
    console.log(`Comparing versions: ${versionId1} and ${versionId2}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Policy Version History</h1>
      <PolicyVersionHistory
        policyId="policy-1"
        policyName="Transfer Limit Policy"
        versions={mockVersions}
        currentVersion={3}
        onViewVersion={handleViewVersion}
        onRollbackToVersion={handleRollbackToVersion}
        onCompareVersions={handleCompareVersions}
      />
    </div>
  );
}
