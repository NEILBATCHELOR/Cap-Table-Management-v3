import React from "react";
import InvestorTransactionLimitRule from "./InvestorTransactionLimitRule";

export default function InvestorTransactionLimitRuleStory() {
  const handleSave = (ruleData: any) => {
    console.log("Rule saved:", ruleData);
    // In a real app, this would save to your state management or backend
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Investor Transaction Limit Rule
      </h1>
      <InvestorTransactionLimitRule onSave={handleSave} />
    </div>
  );
}
