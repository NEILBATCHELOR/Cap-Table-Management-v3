import React from "react";
import VelocityLimitRule from "./VelocityLimitRule";

export default function VelocityLimitRuleStory() {
  const handleSave = (ruleData: any) => {
    console.log("Rule saved:", ruleData);
    // In a real app, this would save to your state management or backend
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Velocity Limit Rule</h1>
      <VelocityLimitRule onSave={handleSave} />
    </div>
  );
}
