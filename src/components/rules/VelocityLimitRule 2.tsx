import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Info, AlertCircle, Check } from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

interface InvestorTier {
  id: string;
  name: string;
}

interface VelocityLimitRuleProps {
  onSave?: (ruleData: any) => void;
  initialData?: any;
}

const VelocityLimitRule = ({
  onSave = () => {},
  initialData,
}: VelocityLimitRuleProps) => {
  const [limitAmount, setLimitAmount] = useState<string>(
    initialData?.limitAmount || "",
  );
  const [timePeriod, setTimePeriod] = useState<string>(
    initialData?.timePeriod || "",
  );
  const [transactionType, setTransactionType] = useState<string>(
    initialData?.transactionType || "",
  );
  const [selectedTiers, setSelectedTiers] = useState<string[]>(
    initialData?.selectedTiers || [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Available investor tiers
  const investorTiers: InvestorTier[] = [
    { id: "tier-1", name: "Tier 1" },
    { id: "tier-2", name: "Tier 2" },
    { id: "tier-3", name: "Tier 3" },
  ];

  // Validate form on input changes
  useEffect(() => {
    validateForm();
  }, [limitAmount, timePeriod, transactionType]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let valid = true;

    // Limit Amount validation
    if (!limitAmount) {
      newErrors.limitAmount = "Limit amount is required";
      valid = false;
    } else if (isNaN(Number(limitAmount)) || Number(limitAmount) <= 0) {
      newErrors.limitAmount = "Limit amount must be a positive number";
      valid = false;
    }

    // Time Period validation
    if (!timePeriod) {
      newErrors.timePeriod = "Time period is required";
      valid = false;
    }

    // Transaction Type validation
    if (!transactionType) {
      newErrors.transactionType = "Transaction type is required";
      valid = false;
    }

    setErrors(newErrors);
    setIsFormValid(valid);
    return valid;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        type: "velocity_limit",
        limitAmount: Number(limitAmount),
        timePeriod,
        transactionType,
        selectedTiers,
      });
    }
  };

  const toggleTier = (tierId: string) => {
    setSelectedTiers((prev) =>
      prev.includes(tierId)
        ? prev.filter((id) => id !== tierId)
        : [...prev, tierId],
    );
  };

  return (
    <Card className="w-full bg-white border-blue-200">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg font-medium flex items-center">
          Velocity Limits
          <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
            Transaction Rule
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        {/* Limit Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="limitAmount" className="text-sm font-medium">
              Limit Amount
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Info className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-xs">
                    Maximum cumulative transaction amount within the selected
                    time period.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="limitAmount"
            type="number"
            placeholder="e.g., 10000"
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            className={errors.limitAmount ? "border-red-500" : ""}
          />
          {errors.limitAmount && (
            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.limitAmount}
            </p>
          )}
        </div>

        {/* Time Period */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="timePeriod" className="text-sm font-medium">
              Time Period
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Info className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-xs">
                    Set the time frame for this limit.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger
              className={errors.timePeriod ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="per_day">Per Day</SelectItem>
              <SelectItem value="per_week">Per Week</SelectItem>
              <SelectItem value="per_month">Per Month</SelectItem>
            </SelectContent>
          </Select>
          {errors.timePeriod && (
            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.timePeriod}
            </p>
          )}
        </div>

        {/* Transaction Type */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="transactionType" className="text-sm font-medium">
              Transaction Type
            </Label>
          </div>
          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger
              className={errors.transactionType ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subscribe">Subscribe</SelectItem>
              <SelectItem value="redeem">Redeem</SelectItem>
              <SelectItem value="both">Both</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          {errors.transactionType && (
            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.transactionType}
            </p>
          )}
        </div>

        {/* Investor Tiers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Investor Tier (Optional)
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Info className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-xs">
                    Apply this limit to specific investor tiers (leave blank for
                    all).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-col space-y-2">
            {investorTiers.map((tier) => (
              <div key={tier.id} className="flex items-center space-x-2">
                <Switch
                  id={`tier-${tier.id}`}
                  checked={selectedTiers.includes(tier.id)}
                  onCheckedChange={() => toggleTier(tier.id)}
                />
                <Label htmlFor={`tier-${tier.id}`}>{tier.name}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedTiers.length === 0
              ? "No tiers selected. Rule will apply to all investors."
              : `Rule will apply to ${selectedTiers.length} selected tier(s).`}
          </p>
        </div>

        <Separator />

        {/* Consensus Approval Settings */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Consensus Approval Settings</h3>
          <div className="bg-gray-50 p-3 rounded-md space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Required Approvers:</span>
              <span className="font-medium">2/3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Permissions:</span>
              <span className="font-medium">
                Compliance Officer, Operations Manager
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Auto-approval:</span>
              <span className="font-medium">Changes &lt; 10%</span>
            </div>
          </div>
        </div>

        {/* Rule Behavior */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Rule Behavior</h3>
          <div className="bg-blue-50 p-3 rounded-md space-y-2 text-sm text-blue-800">
            <p>
              This rule will restrict the total{" "}
              {transactionType || "transaction"} volume to {limitAmount || "X"}{" "}
              {timePeriod ? timePeriod.replace("_", " ") : "per period"}.
            </p>
            <p>
              Transactions will be blocked if they would cause the user to
              exceed their cumulative limit within the period.
            </p>
            <p className="text-xs text-blue-600">
              Note: Limit resets at the end of each period. May override
              transaction limits if stricter.
            </p>
          </div>
        </div>

        {/* Error Handling */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Error Handling</h3>
          <div className="bg-gray-50 p-3 rounded-md space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Creation:</p>
                <p>"Time period required." – Select a period.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Amendment:</p>
                <p>"Cannot amend mid-period." – Wait for reset.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Execution:</p>
                <p>"Transaction history unavailable." – Retry later.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Removal:</p>
                <p>"Mandatory rule." – Cannot remove.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={!isFormValid}
            className="w-full bg-[#0f172b] hover:bg-[#0f172b]/90"
          >
            <Check className="mr-2 h-4 w-4" />
            Save Rule
          </Button>
          {!isFormValid && (
            <p className="text-xs text-center text-gray-500 mt-2">
              Please fill in all required fields to save this rule.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VelocityLimitRule;
