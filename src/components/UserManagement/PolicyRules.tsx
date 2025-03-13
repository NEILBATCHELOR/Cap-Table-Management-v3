import React from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
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

interface PolicyRulesProps {
  onSave?: (policies: PolicyConfig) => void;
}

interface PolicyConfig {
  consensusType: "2of3" | "3of4" | "3of5" | "4of5";
  selectedSigners: string[];
  autoApproveLimit: number;
  enableAutoApprove: boolean;
  keyRotationDays: number;
  requireMultiSig: boolean;
  enforceKeyRotation: boolean;
}

interface Signer {
  id: string;
  name: string;
  role: string;
}

const PolicyRules = ({
  onSave = async (policies) => {
    try {
      const { logAction } = await import("@/lib/auditLogger");
      await logAction(
        "Policy Update",
        "current-user@example.com", // In a real app, this would be the current user
        `Updated system policy rules: ${policies.consensusType} consensus, ${policies.selectedSigners.length} signers`,
        "Success",
      );
    } catch (error) {
      console.error("Failed to log policy update:", error);
    }
  },
}: PolicyRulesProps) => {
  const [policies, setPolicies] = React.useState<PolicyConfig>({
    consensusType: "2of3",
    selectedSigners: [],
    autoApproveLimit: 100000,
    enableAutoApprove: true,
    keyRotationDays: 180,
    requireMultiSig: true,
    enforceKeyRotation: true,
  });

  const availableSigners: Signer[] = [
    { id: "1", name: "John Doe", role: "Super Admin" },
    { id: "2", name: "Jane Smith", role: "Owner" },
    { id: "3", name: "Bob Johnson", role: "Compliance Manager" },
    { id: "4", name: "Alice Brown", role: "Compliance Officer" },
    { id: "5", name: "Charlie Wilson", role: "Owner" },
  ];

  const consensusOptions = [
    { value: "2of3", label: "2 of 3 Consensus", required: 3 },
    { value: "3of4", label: "3 of 4 Consensus", required: 4 },
    { value: "3of5", label: "3 of 5 Consensus", required: 5 },
    { value: "4of5", label: "4 of 5 Consensus", required: 5 },
  ];

  const currentConsensusOption = consensusOptions.find(
    (opt) => opt.value === policies.consensusType,
  );

  return (
    <Card className="p-6 space-y-6 bg-white">
      <div>
        <h2 className="text-2xl font-semibold">Policy Rules</h2>
        <p className="text-gray-500">Configure system-wide security policies</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-0.5 cursor-help">
                  <Label>Require Multi-Signature</Label>
                  <p className="text-sm text-gray-500">
                    Enable multi-sig approval workflow
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Enables cryptographic signing for sensitive actions requiring
                  multiple approvers
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Switch
            checked={policies.requireMultiSig}
            onCheckedChange={(checked) =>
              setPolicies({ ...policies, requireMultiSig: checked })
            }
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="cursor-help">Consensus Type</Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Select the required consensus type for multi-signature
                    actions
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={policies.consensusType}
              onValueChange={(value: "2of3" | "3of4" | "3of5" | "4of5") => {
                setPolicies({
                  ...policies,
                  consensusType: value,
                  selectedSigners: [], // Reset selected signers when consensus type changes
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select consensus type" />
              </SelectTrigger>
              <SelectContent>
                {consensusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="cursor-help">
                    Required Signers ({policies.selectedSigners.length}/
                    {currentConsensusOption?.required})
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Select the required number of signers based on the consensus
                    type
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="grid grid-cols-4 gap-6 border rounded-md p-4">
              {/* Super Admin Column */}
              <div>
                <h3 className="font-medium mb-3">Super Admin Users</h3>
                <div className="space-y-3">
                  {availableSigners
                    .filter((signer) => signer.role === "Super Admin")
                    .map((signer) => (
                      <div
                        key={signer.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={signer.id}
                          checked={policies.selectedSigners.includes(signer.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              if (
                                policies.selectedSigners.length <
                                (currentConsensusOption?.required || 0)
                              ) {
                                setPolicies({
                                  ...policies,
                                  selectedSigners: [
                                    ...policies.selectedSigners,
                                    signer.id,
                                  ],
                                });
                              }
                            } else {
                              setPolicies({
                                ...policies,
                                selectedSigners:
                                  policies.selectedSigners.filter(
                                    (id) => id !== signer.id,
                                  ),
                              });
                            }
                          }}
                          disabled={
                            !policies.selectedSigners.includes(signer.id) &&
                            policies.selectedSigners.length >=
                              (currentConsensusOption?.required || 0)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={signer.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {signer.name}
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Owner Column */}
              <div>
                <h3 className="font-medium mb-3">Owner Users</h3>
                <div className="space-y-3">
                  {availableSigners
                    .filter((signer) => signer.role === "Owner")
                    .map((signer) => (
                      <div
                        key={signer.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={signer.id}
                          checked={policies.selectedSigners.includes(signer.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              if (
                                policies.selectedSigners.length <
                                (currentConsensusOption?.required || 0)
                              ) {
                                setPolicies({
                                  ...policies,
                                  selectedSigners: [
                                    ...policies.selectedSigners,
                                    signer.id,
                                  ],
                                });
                              }
                            } else {
                              setPolicies({
                                ...policies,
                                selectedSigners:
                                  policies.selectedSigners.filter(
                                    (id) => id !== signer.id,
                                  ),
                              });
                            }
                          }}
                          disabled={
                            !policies.selectedSigners.includes(signer.id) &&
                            policies.selectedSigners.length >=
                              (currentConsensusOption?.required || 0)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={signer.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {signer.name}
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Compliance Column */}
              <div>
                <h3 className="font-medium mb-3">Compliance Users</h3>
                <div className="space-y-3">
                  {availableSigners
                    .filter((signer) => signer.role.includes("Compliance"))
                    .map((signer) => (
                      <div
                        key={signer.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={signer.id}
                          checked={policies.selectedSigners.includes(signer.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              if (
                                policies.selectedSigners.length <
                                (currentConsensusOption?.required || 0)
                              ) {
                                setPolicies({
                                  ...policies,
                                  selectedSigners: [
                                    ...policies.selectedSigners,
                                    signer.id,
                                  ],
                                });
                              }
                            } else {
                              setPolicies({
                                ...policies,
                                selectedSigners:
                                  policies.selectedSigners.filter(
                                    (id) => id !== signer.id,
                                  ),
                              });
                            }
                          }}
                          disabled={
                            !policies.selectedSigners.includes(signer.id) &&
                            policies.selectedSigners.length >=
                              (currentConsensusOption?.required || 0)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={signer.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {signer.name}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {signer.role}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Agent Column */}
              <div>
                <h3 className="font-medium mb-3">Agent Users</h3>
                <div className="space-y-3">
                  {availableSigners
                    .filter((signer) => signer.role === "Agent")
                    .map((signer) => (
                      <div
                        key={signer.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={signer.id}
                          checked={policies.selectedSigners.includes(signer.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              if (
                                policies.selectedSigners.length <
                                (currentConsensusOption?.required || 0)
                              ) {
                                setPolicies({
                                  ...policies,
                                  selectedSigners: [
                                    ...policies.selectedSigners,
                                    signer.id,
                                  ],
                                });
                              }
                            } else {
                              setPolicies({
                                ...policies,
                                selectedSigners:
                                  policies.selectedSigners.filter(
                                    (id) => id !== signer.id,
                                  ),
                              });
                            }
                          }}
                          disabled={
                            !policies.selectedSigners.includes(signer.id) &&
                            policies.selectedSigners.length >=
                              (currentConsensusOption?.required || 0)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={signer.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {signer.name}
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-0.5 cursor-help">
                    <Label>Enable Auto-Approve</Label>
                    <p className="text-sm text-gray-500">
                      Allow automatic approval for transactions below limit
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enable automatic approval for low-risk transactions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Switch
              checked={policies.enableAutoApprove}
              onCheckedChange={(checked) =>
                setPolicies({ ...policies, enableAutoApprove: checked })
              }
            />
          </div>

          {policies.enableAutoApprove && (
            <div className="space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="cursor-help">
                      Auto-Approve Limit ($)
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Transactions below this amount will be automatically
                      approved without multi-sig
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Input
                type="number"
                value={policies.autoApproveLimit}
                onChange={(e) =>
                  setPolicies({
                    ...policies,
                    autoApproveLimit: parseInt(e.target.value),
                  })
                }
              />
              <p className="text-sm text-gray-500">
                Transactions below this amount will be auto-approved
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-0.5 cursor-help">
                  <Label>Enforce Key Rotation</Label>
                  <p className="text-sm text-gray-500">
                    Require periodic key rotation
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Automatically enforce key rotation for enhanced security</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Switch
            checked={policies.enforceKeyRotation}
            onCheckedChange={(checked) =>
              setPolicies({ ...policies, enforceKeyRotation: checked })
            }
          />
        </div>

        <div className="space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="cursor-help">
                  Key Rotation Period (days)
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Number of days before requiring key rotation (minimum 30 days)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input
            type="number"
            value={policies.keyRotationDays}
            onChange={(e) =>
              setPolicies({
                ...policies,
                keyRotationDays: parseInt(e.target.value),
              })
            }
            min={30}
          />
        </div>
      </div>

      <Button onClick={() => onSave(policies)} className="w-full">
        Save Policy Changes
      </Button>
    </Card>
  );
};

export default PolicyRules;
