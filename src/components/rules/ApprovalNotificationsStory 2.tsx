import React from "react";
import ApprovalNotifications from "./ApprovalNotifications";

export default function ApprovalNotificationsStory() {
  const notifications = [
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
  ];

  const handleViewPolicy = (policyId: string) => {
    console.log(`Viewing policy details for ${policyId}`);
  };

  const handleMarkAsRead = (notificationId: string) => {
    console.log(`Marking notification ${notificationId} as read`);
  };

  const handleMarkAllAsRead = () => {
    console.log("Marking all notifications as read");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Approval Notifications</h1>
      <ApprovalNotifications
        notifications={notifications}
        onViewPolicy={handleViewPolicy}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
}
