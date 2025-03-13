import React from "react";
import VolumeSupplyLimitRule from "./VolumeSupplyLimitRule";

export default function VolumeSupplyLimitRuleStory() {
  const handleSave = (ruleData: any) => {
    console.log("Rule saved:", ruleData);
    // In a real app, this would save to your state management or backend
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Volume/Supply Limit Rule</h1>
      <VolumeSupplyLimitRule onSave={handleSave} />
    </div>
  );
}
