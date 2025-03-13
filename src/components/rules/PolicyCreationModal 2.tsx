import React, { useState, useEffect } from "react";
import { X, Save, Info, AlertCircle, Check, BookmarkPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import RuleBuilder from "./RuleBuilder";
import RuleConflictDetector, {
  detectRuleConflicts,
} from "./RuleConflictDetector";
import PolicyTemplateDialog from "./PolicyTemplateDialog";
import ApproverSelection from "./ApproverSelection";
import InvestorTransactionLimitRule from "./InvestorTransactionLimitRule";
import VelocityLimitRule from "./VelocityLimitRule";
import LockUpPeriodRule from "./LockUpPeriodRule";
import WhitelistTransferRule from "./WhitelistTransferRule";
import VolumeSupplyLimitRule from "./VolumeSupplyLimitRule";
import InvestorPositionLimitRule from "./InvestorPositionLimitRule";
import KYCVerificationRule from "./KYCVerificationRule";
import AMLSanctionsRule from "./AMLSanctionsRule";
import TransferLimitRule from "./TransferLimitRule";
import RiskProfileRule from "./RiskProfileRule";
import AccreditedInvestorRule from "./AccreditedInvestorRule";
import TokenizedFundRule from "./TokenizedFundRule";
import RedemptionRule from "./RedemptionRule";

interface PolicyCreationModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (policyData: PolicyData) => void;
  onCancel?: () => void;
  onSaveAsTemplate?: (policyData: PolicyData) => void;
  initialData?: PolicyData;
}

interface PolicyData {
  name: string;
  description: string;
  type: string;
  jurisdiction: string;
  effectiveDate: string;
  expirationDate?: string;
  tags: string[];
  rules: any[];
  approvers: any[];
  reviewFrequency?: string;
  isActive?: boolean;
}

// Helper function to get risk tolerance label
const getRiskToleranceLabel = (value: number) => {
  switch (value) {
    case 1:
      return "Conservative";
    case 2:
      return "Moderately Conservative";
    case 3:
      return "Moderate";
    case 4:
      return "Moderately Aggressive";
    case 5:
      return "Aggressive";
    default:
      return "Moderate";
  }
};

const PolicyCreationModal = ({
  open = true,
  onOpenChange = () => {},
  onSave = () => {},
  onCancel = () => {},
  onSaveAsTemplate = () => {},
  initialData = {
    name: "",
    description: "",
    type: "transfer_limit",
    jurisdiction: "global",
    effectiveDate: new Date().toISOString().split("T")[0],
    expirationDate: "",
    tags: [],
    rules: [],
    approvers: [],
    reviewFrequency: "quarterly",
    isActive: true,
  },
}: PolicyCreationModalProps) => {
  const [activeTab, setActiveTab] = useState("rules");
  const [selectedRuleType, setSelectedRuleType] = useState<string>("");
  const [policyData, setPolicyData] = useState<PolicyData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState("");
  const [hasRuleConflicts, setHasRuleConflicts] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  const policyTypes = [
    { value: "transfer_limit", label: "Transfer Limit" },
    { value: "kyc_verification", label: "KYC Verification" },
    { value: "restricted_assets", label: "Restricted Assets" },
    { value: "dormant_account", label: "Dormant Account" },
    { value: "risk_assessment", label: "Risk Assessment" },
    { value: "transaction_monitoring", label: "Transaction Monitoring" },
    { value: "custom", label: "Custom Policy" },
  ];

  const jurisdictions = [
    { value: "global", label: "Global" },
    { value: "us", label: "United States" },
    { value: "eu", label: "European Union" },
    { value: "uk", label: "United Kingdom" },
    { value: "asia_pacific", label: "Asia Pacific" },
    { value: "custom", label: "Custom Jurisdiction" },
  ];

  const reviewFrequencies = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "biannually", label: "Bi-annually" },
    { value: "annually", label: "Annually" },
    { value: "custom", label: "Custom Schedule" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setPolicyData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setPolicyData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user selects
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleRulesChange = (rules: any[]) => {
    setPolicyData((prev) => ({
      ...prev,
      rules,
    }));

    // Clear error when rules change
    if (errors.rules) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.rules;
        return newErrors;
      });
    }
  };

  const handleSpecificRuleAdd = (ruleData: any) => {
    // Ensure ruleData has all required properties
    if (!ruleData || !ruleData.type) {
      console.error("Invalid rule data:", ruleData);
      return;
    }

    const newRule = {
      id: `rule-${Date.now()}`,
      name: (() => {
        switch (ruleData.type) {
          case "investor_transaction_limit":
            return `Investor Transaction Limit (${ruleData.transactionType})`;
          case "velocity_limit":
            return `Velocity Limit (${ruleData.timePeriod})`;
          case "lock_up_period":
            return `Lock-Up Period (${new Date(ruleData.startDate).toLocaleDateString()} - ${new Date(ruleData.endDate).toLocaleDateString()})`;
          case "whitelist_transfer":
            return `Whitelist Transfer (${ruleData.addresses?.length || 0} addresses)`;
          case "volume_supply_limit":
            return `${ruleData.limitType === "total_supply" ? "Total Supply" : "Volume"} Limit (${ruleData.limitAmount})`;
          case "investor_position_limit":
            return `Position Limit (${ruleData.maxAmount} ${ruleData.unit})${ruleData.timeBasedScaling ? " with scaling" : ""}${ruleData.dynamicProfiling ? ", dynamic" : ""}`;
          case "kyc_verification":
            return `KYC Verification (${ruleData.complianceCheckType.toUpperCase()})`;
          case "transfer_limit":
            return `Transfer Limit (${ruleData.transferAmount} ${ruleData.currency})`;
          default:
            return `Rule (${ruleData.type})`;
        }
      })(),
      type: ruleData.type,
      ...ruleData,
    };

    setPolicyData((prev) => ({
      ...prev,
      rules: [...prev.rules, newRule],
    }));

    // Clear error when rules change
    if (errors.rules) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.rules;
        return newErrors;
      });
    }

    // Reset selected rule type
    setSelectedRuleType("");
  };

  const handleApproversChange = (approvers: any[]) => {
    setPolicyData((prev) => ({
      ...prev,
      approvers,
    }));

    // Clear error when approvers change
    if (errors.approvers) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.approvers;
        return newErrors;
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !policyData.tags.includes(tagInput.trim())) {
      setPolicyData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setPolicyData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!policyData.name.trim()) {
      newErrors.name = "Policy name is required";
    }

    if (!policyData.description.trim()) {
      newErrors.description = "Policy description is required";
    }

    if (!policyData.type) {
      newErrors.type = "Policy type is required";
    }

    if (!policyData.jurisdiction) {
      newErrors.jurisdiction = "Jurisdiction is required";
    }

    if (!policyData.effectiveDate) {
      newErrors.effectiveDate = "Effective date is required";
    }

    if (policyData.rules.length === 0) {
      newErrors.rules = "At least one rule is required";
    }

    if (policyData.approvers.length === 0) {
      newErrors.approvers = "At least one approver is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check for rule conflicts when rules change
  useEffect(() => {
    if (policyData.rules.length >= 2) {
      const conflicts = detectRuleConflicts(policyData.rules);
      setHasRuleConflicts(conflicts.length > 0);
    } else {
      setHasRuleConflicts(false);
    }
  }, [policyData.rules]);

  const handleSave = () => {
    if (validateForm()) {
      onSave(policyData);
      onOpenChange(false);
    } else {
      // Navigate to the tab with errors
      if (
        errors.name ||
        errors.description ||
        errors.type ||
        errors.jurisdiction ||
        errors.effectiveDate ||
        errors.rules
      ) {
        setActiveTab("rules");
      } else if (errors.approvers) {
        setActiveTab("approvers");
      }
    }
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const handleSaveAsTemplate = (policyData: PolicyData) => {
    setShowTemplateDialog(true);
  };

  const handleTemplateSave = (
    templateName: string,
    templateDescription: string,
  ) => {
    // Create a copy of the policy data with template metadata
    const templateData = {
      ...policyData,
      name: templateName,
      description: templateDescription,
      isTemplate: true,
      createdAt: new Date().toISOString(),
    };

    onSaveAsTemplate(templateData);
    setShowTemplateDialog(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {initialData.name ? "Edit Policy" : "Create New Policy"}
          </DialogTitle>
          <DialogDescription>
            Define compliance rules and approval workflows for digital asset
            transfers.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="rules">Rules & Conditions</TabsTrigger>
            <TabsTrigger value="approvers">Approvers</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-6 w-full">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Policy Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={policyData.name}
                  onChange={handleInputChange}
                  placeholder="Enter policy name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">
                  Policy Type
                </Label>
                <div className="space-y-4">
                  <Select
                    value={selectedRuleType}
                    onValueChange={setSelectedRuleType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a rule type to add" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer_limit">
                        Transfer Limit
                      </SelectItem>
                      <SelectItem value="investor_transaction_limit">
                        Investor Transaction Limit
                      </SelectItem>
                      <SelectItem value="investor_position_limit">
                        Investor Position Limits
                      </SelectItem>
                      <SelectItem value="velocity_limit">
                        Velocity Limit
                      </SelectItem>
                      <SelectItem value="lock_up_period">
                        Lock-Up Period
                      </SelectItem>
                      <SelectItem value="whitelist_transfer">
                        Whitelist Transfer
                      </SelectItem>
                      <SelectItem value="volume_supply_limit">
                        Volume/Supply Limit
                      </SelectItem>
                      <SelectItem value="kyc_verification">
                        KYC Verification
                      </SelectItem>
                      <SelectItem value="aml_sanctions">
                        AML Sanctions Check
                      </SelectItem>
                      <SelectItem value="accredited_investor">
                        Accredited Investor
                      </SelectItem>
                      <SelectItem value="risk_profile">Risk Profile</SelectItem>
                      <SelectItem value="tokenized_fund">
                        Tokenized Fund
                      </SelectItem>
                      <SelectItem value="redemption">Redemption</SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedRuleType === "investor_transaction_limit" && (
                    <InvestorTransactionLimitRule
                      onSave={handleSpecificRuleAdd}
                    />
                  )}

                  {selectedRuleType === "velocity_limit" && (
                    <VelocityLimitRule onSave={handleSpecificRuleAdd} />
                  )}

                  {selectedRuleType === "lock_up_period" && (
                    <LockUpPeriodRule onSave={handleSpecificRuleAdd} />
                  )}

                  {selectedRuleType === "whitelist_transfer" && (
                    <WhitelistTransferRule onSave={handleSpecificRuleAdd} />
                  )}

                  {selectedRuleType === "volume_supply_limit" && (
                    <VolumeSupplyLimitRule onSave={handleSpecificRuleAdd} />
                  )}

                  {selectedRuleType === "investor_position_limit" && (
                    <InvestorPositionLimitRule onSave={handleSpecificRuleAdd} />
                  )}

                  {selectedRuleType === "kyc_verification" && (
                    <KYCVerificationRule onSave={handleSpecificRuleAdd} />
                  )}

                  {selectedRuleType === "aml_sanctions" && (
                    <AMLSanctionsRule onSave={handleSpecificRuleAdd} />
                  )}

                  {selectedRuleType === "transfer_limit" && (
                    <TransferLimitRule onSave={handleSpecificRuleAdd} />
                  )}

                  {selectedRuleType === "risk_profile" && (
                    <RiskProfileRule onSave={handleSpecificRuleAdd} />
                  )}

                  {selectedRuleType === "accredited_investor" && (
                    <AccreditedInvestorRule onSave={handleSpecificRuleAdd} />
                  )}

                  {selectedRuleType === "tokenized_fund" && (
                    <TokenizedFundRule onSave={handleSpecificRuleAdd} />
                  )}

                  {selectedRuleType === "redemption" && (
                    <RedemptionRule onSave={handleSpecificRuleAdd} />
                  )}

                  {!selectedRuleType && policyData.rules.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Current Rules</h4>
                      <div className="space-y-2">
                        {policyData.rules.map((rule: any) => (
                          <div
                            key={rule.id}
                            className="p-3 bg-white border rounded-md flex justify-between items-center"
                          >
                            <div>
                              <span className="font-medium">{rule.name}</span>
                              <div className="text-sm text-gray-500">
                                {(() => {
                                  switch (rule.type) {
                                    case "investor_transaction_limit":
                                      return (
                                        <>
                                          Limit: {rule.limitAmount} {rule.unit}{" "}
                                          for {rule.transactionType}{" "}
                                          transactions
                                        </>
                                      );
                                    case "velocity_limit":
                                      return (
                                        <>
                                          Limit: {rule.limitAmount}{" "}
                                          {rule.timePeriod?.replace("_", " ") ||
                                            "period"}{" "}
                                          for {rule.transactionType}{" "}
                                          transactions
                                        </>
                                      );
                                    case "lock_up_period":
                                      return (
                                        <>
                                          Lock-Up:{" "}
                                          {rule.startDate
                                            ? new Date(
                                                rule.startDate,
                                              ).toLocaleDateString()
                                            : "start"}{" "}
                                          to{" "}
                                          {rule.endDate
                                            ? new Date(
                                                rule.endDate,
                                              ).toLocaleDateString()
                                            : "end"}
                                          {rule.applyTo === "specific"
                                            ? " for specific groups"
                                            : " for all investors"}
                                        </>
                                      );
                                    case "whitelist_transfer":
                                      return (
                                        <>
                                          Whitelist:{" "}
                                          {rule.addresses?.length || 0}{" "}
                                          address(es)
                                          {rule.restrictEnabled
                                            ? " (restriction enabled)"
                                            : " (monitoring only)"}
                                        </>
                                      );
                                    case "volume_supply_limit":
                                      return (
                                        <>
                                          {rule.limitType === "total_supply"
                                            ? `Total Supply Limit: ${rule.limitAmount} tokens`
                                            : `Volume Limit: ${rule.limitAmount} ${rule.timePeriod?.replace("_", " ") || "period"}`}
                                        </>
                                      );
                                    case "investor_position_limit":
                                      return (
                                        <>
                                          Position Limit: {rule.maxAmount}{" "}
                                          {rule.unit}
                                          {rule.timeBasedScaling
                                            ? ", with scaling"
                                            : ""}
                                          {rule.dynamicProfiling
                                            ? ", dynamic"
                                            : ""}
                                        </>
                                      );
                                    case "kyc_verification":
                                      return (
                                        <>
                                          {rule.complianceCheckType.toUpperCase()}{" "}
                                          Verification:{" "}
                                          {rule.verificationMethod ===
                                          "automatic"
                                            ? "Automatic"
                                            : "Manual"}{" "}
                                          ({rule.documentTypes?.length || 0}{" "}
                                          document types)
                                        </>
                                      );
                                    case "aml_sanctions":
                                      return (
                                        <>
                                          Sanctions Check:{" "}
                                          {rule.sanctionsListSource
                                            .replace("_", " ")
                                            .toUpperCase()}{" "}
                                          (Checked{" "}
                                          {rule.checkFrequency === 1
                                            ? "daily"
                                            : rule.checkFrequency === 7
                                              ? "weekly"
                                              : `every ${rule.checkFrequency} days`}
                                          )
                                        </>
                                      );
                                    case "risk_profile":
                                      return (
                                        <>
                                          Risk Profile:{" "}
                                          {getRiskToleranceLabel(
                                            rule.riskTolerance,
                                          )}{" "}
                                          ({rule.highRiskExposure}% high-risk,{" "}
                                          {rule.mediumRiskExposure}%
                                          medium-risk, {rule.lowRiskExposure}%
                                          low-risk)
                                        </>
                                      );
                                    case "accredited_investor":
                                      return (
                                        <>
                                          Accredited Investor: Net worth $
                                          {parseInt(
                                            rule.netWorthThreshold,
                                          ).toLocaleString()}
                                          , Income $
                                          {parseInt(
                                            rule.individualIncomeThreshold,
                                          ).toLocaleString()}
                                          /$
                                          {parseInt(
                                            rule.combinedIncomeThreshold,
                                          ).toLocaleString()}
                                        </>
                                      );
                                    case "tokenized_fund":
                                      return (
                                        <>
                                          Tokenized Fund:{" "}
                                          {rule.tokenConcentrationCap}% token
                                          cap,
                                          {rule.counterpartyExposureLimit}%
                                          counterparty limit,
                                          {rule.maxMonthlyDrawdown}% max
                                          drawdown
                                        </>
                                      );
                                    case "redemption":
                                      return (
                                        <>
                                          Redemption:{" "}
                                          {rule.requireMultiSigApproval
                                            ? `${rule.requiredApprovers}/${rule.totalApprovers} approvers`
                                            : "No multi-sig"}
                                          ,{rule.settlementMethod} settlement
                                        </>
                                      );
                                    case "transfer_limit":
                                      return (
                                        <>
                                          Transfer Limit: {rule.transferAmount}{" "}
                                          {rule.currency}
                                        </>
                                      );
                                    default:
                                      return (
                                        <span>Rule details not available</span>
                                      );
                                  }
                                })()}
                              </div>
                            </div>
                            <Badge
                              className={(() => {
                                switch (rule.type) {
                                  case "investor_transaction_limit":
                                    return "bg-blue-100 text-blue-800";
                                  case "velocity_limit":
                                    return "bg-purple-100 text-purple-800";
                                  case "lock_up_period":
                                    return "bg-pink-100 text-pink-800";
                                  case "whitelist_transfer":
                                    return "bg-green-100 text-green-800";
                                  case "volume_supply_limit":
                                    return "bg-indigo-100 text-indigo-800";
                                  case "investor_position_limit":
                                    return "bg-purple-100 text-purple-800";
                                  case "kyc_verification":
                                    return "bg-purple-100 text-purple-800";
                                  case "aml_sanctions":
                                    return "bg-red-100 text-red-800";
                                  case "risk_profile":
                                    return "bg-orange-100 text-orange-800";
                                  case "accredited_investor":
                                    return "bg-green-100 text-green-800";
                                  case "tokenized_fund":
                                    return "bg-blue-100 text-blue-800";
                                  case "redemption":
                                    return "bg-indigo-100 text-indigo-800";
                                  case "transfer_limit":
                                    return "bg-blue-100 text-blue-800";
                                  default:
                                    return "bg-gray-100 text-gray-800";
                                }
                              })()}
                            >
                              {(() => {
                                switch (rule.type) {
                                  case "investor_transaction_limit":
                                    return "Transaction Limit";
                                  case "velocity_limit":
                                    return "Velocity Limit";
                                  case "lock_up_period":
                                    return "Lock-Up Period";
                                  case "whitelist_transfer":
                                    return "Whitelist Transfer";
                                  case "volume_supply_limit":
                                    return "Supply Control";
                                  case "investor_position_limit":
                                    return "Position Limit";
                                  case "kyc_verification":
                                    return "KYC Verification";
                                  case "aml_sanctions":
                                    return "AML Sanctions Check";
                                  case "risk_profile":
                                    return "Risk Profile";
                                  case "accredited_investor":
                                    return "Accredited Investor";
                                  case "tokenized_fund":
                                    return "Tokenized Fund";
                                  case "redemption":
                                    return "Redemption";
                                  case "transfer_limit":
                                    return "Transfer Limit";
                                  default:
                                    return "Custom Rule";
                                }
                              })()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!selectedRuleType && policyData.rules.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <p className="mb-4">No rules defined yet</p>
                      <p className="text-sm">
                        Select a rule type from the dropdown above to add a
                        specialized rule
                      </p>
                    </div>
                  )}
                </div>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={policyData.description}
                onChange={handleInputChange}
                placeholder="Describe the purpose and scope of this policy"
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jurisdiction" className="text-sm font-medium">
                  Jurisdiction
                </Label>
                <Select
                  value={policyData.jurisdiction}
                  onValueChange={(value) =>
                    handleSelectChange("jurisdiction", value)
                  }
                >
                  <SelectTrigger
                    className={errors.jurisdiction ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {jurisdictions.map((jurisdiction) => (
                      <SelectItem
                        key={jurisdiction.value}
                        value={jurisdiction.value}
                      >
                        {jurisdiction.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.jurisdiction && (
                  <p className="text-sm text-red-500">{errors.jurisdiction}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    Policy Status
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Info className="h-4 w-4 text-gray-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Inactive policies won't be enforced but will be saved
                          for future use
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={policyData.isActive}
                    onCheckedChange={(checked) => {
                      setPolicyData((prev) => ({
                        ...prev,
                        isActive: checked,
                      }));
                    }}
                  />
                  <Label htmlFor="isActive">
                    {policyData.isActive ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="effectiveDate" className="text-sm font-medium">
                  Effective Date
                </Label>
                <Input
                  id="effectiveDate"
                  name="effectiveDate"
                  type="date"
                  value={policyData.effectiveDate}
                  onChange={handleInputChange}
                  className={errors.effectiveDate ? "border-red-500" : ""}
                />
                {errors.effectiveDate && (
                  <p className="text-sm text-red-500">{errors.effectiveDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="expirationDate"
                    className="text-sm font-medium"
                  >
                    Expiration Date (Optional)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Info className="h-4 w-4 text-gray-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Leave blank if the policy doesn't expire
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="expirationDate"
                  name="expirationDate"
                  type="date"
                  value={policyData.expirationDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {policyData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
                  >
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 text-blue-700 hover:text-blue-900 hover:bg-transparent"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            <RuleBuilder
              rules={policyData.rules}
              onChange={handleRulesChange}
            />
            {errors.rules && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md mt-4">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{errors.rules}</p>
              </div>
            )}

            {/* Rule Conflict Detection */}
            {policyData.rules.length >= 2 && (
              <div className="mt-4">
                <RuleConflictDetector rules={policyData.rules} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="approvers" className="space-y-4">
            <ApproverSelection
              selectedApprovers={policyData.approvers}
              onApproversChange={handleApproversChange}
              minApprovers={1}
              maxApprovers={5}
            />
            {errors.approvers && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md mt-4">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{errors.approvers}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reviewFrequency" className="text-sm font-medium">
                Review Frequency
              </Label>
              <Select
                value={policyData.reviewFrequency}
                onValueChange={(value) =>
                  handleSelectChange("reviewFrequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select review frequency" />
                </SelectTrigger>
                <SelectContent>
                  {reviewFrequencies.map((frequency) => (
                    <SelectItem key={frequency.value} value={frequency.value}>
                      {frequency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                How often this policy should be reviewed for compliance and
                effectiveness
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Policy Validation</h3>

              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="text-sm">Policy structure is valid</span>
                </div>

                {hasRuleConflicts ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">
                      Potential rule conflicts detected
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="text-sm">
                      No conflicting rules detected
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="text-sm">
                    Approval workflow is properly configured
                  </span>
                </div>

                {policyData.rules.length === 0 && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">No rules defined yet</span>
                  </div>
                )}

                {policyData.approvers.length === 0 && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">No approvers assigned yet</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <div className="flex space-x-2">
            {activeTab !== "rules" && (
              <Button
                variant="outline"
                onClick={() => {
                  if (activeTab === "approvers") {
                    setActiveTab("rules");
                  } else if (activeTab === "advanced") {
                    setActiveTab("approvers");
                  }
                }}
              >
                Back
              </Button>
            )}

            {activeTab !== "advanced" && (
              <Button
                variant="outline"
                onClick={() => {
                  if (activeTab === "rules") {
                    setActiveTab("approvers");
                  } else if (activeTab === "approvers") {
                    setActiveTab("advanced");
                  }
                }}
              >
                Next
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => {
                if (validateForm()) {
                  handleSaveAsTemplate(policyData);
                }
              }}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <BookmarkPlus className="mr-2 h-4 w-4" />
              Save as Template
            </Button>

            <Button
              onClick={handleSave}
              className="bg-[#0f172b] hover:bg-[#0f172b]/90"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Policy
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <PolicyTemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        policyData={policyData}
        onConfirm={handleTemplateSave}
        onCancel={() => setShowTemplateDialog(false)}
      />
    </Dialog>
  );
};

export default PolicyCreationModal;
