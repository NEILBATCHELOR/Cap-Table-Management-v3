import React, { useState } from "react";
import { Check, Plus, Trash2, UserPlus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface Approver {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface ApproverSelectionProps {
  selectedApprovers?: Approver[];
  onApproversChange?: (approvers: Approver[]) => void;
  minApprovers?: number;
  maxApprovers?: number;
}

const ApproverSelection = ({
  selectedApprovers = [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex.j@example.com",
      role: "Compliance Officer",
      avatarUrl:
        "https://api.dicebear.com/7.x/initials/svg?seed=AJ&backgroundColor=4F46E5",
    },
    {
      id: "2",
      name: "Morgan Smith",
      email: "morgan.s@example.com",
      role: "Risk Manager",
      avatarUrl:
        "https://api.dicebear.com/7.x/initials/svg?seed=MS&backgroundColor=4F46E5",
    },
  ],
  onApproversChange = () => {},
  minApprovers = 1,
  maxApprovers = 5,
}: ApproverSelectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalThreshold, setApprovalThreshold] = useState("all");

  // Mock available approvers for search/selection
  const availableApprovers: Approver[] = [
    {
      id: "3",
      name: "Jamie Lee",
      email: "jamie.l@example.com",
      role: "Owner",
      avatarUrl:
        "https://api.dicebear.com/7.x/initials/svg?seed=JL&backgroundColor=4F46E5",
    },
    {
      id: "4",
      name: "Taylor Wong",
      email: "taylor.w@example.com",
      role: "Agent",
      avatarUrl:
        "https://api.dicebear.com/7.x/initials/svg?seed=TW&backgroundColor=4F46E5",
    },
    {
      id: "5",
      name: "Jordan Rivera",
      email: "jordan.r@example.com",
      role: "Compliance Manager",
      avatarUrl:
        "https://api.dicebear.com/7.x/initials/svg?seed=JR&backgroundColor=4F46E5",
    },
  ];

  const filteredApprovers = availableApprovers.filter(
    (approver) =>
      !selectedApprovers.some((selected) => selected.id === approver.id) &&
      (approver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approver.role.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleAddApprover = (approver: Approver) => {
    if (selectedApprovers.length < maxApprovers) {
      const newApprovers = [...selectedApprovers, approver];
      onApproversChange(newApprovers);
      setSearchTerm("");
    }
  };

  const handleRemoveApprover = (approverId: string) => {
    const newApprovers = selectedApprovers.filter((a) => a.id !== approverId);
    onApproversChange(newApprovers);
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Approver Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Select {minApprovers}-{maxApprovers} approvers for this policy
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Approval threshold:</span>
            <Select
              value={approvalThreshold}
              onValueChange={setApprovalThreshold}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select threshold" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All approvers</SelectItem>
                <SelectItem value="majority">Majority</SelectItem>
                <SelectItem value="any">Any approver</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected approvers list */}
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Selected Approvers ({selectedApprovers.length}/{maxApprovers})
          </div>
          {selectedApprovers.length === 0 ? (
            <div className="text-sm text-gray-500 py-2">
              No approvers selected yet
            </div>
          ) : (
            <div className="space-y-2">
              {selectedApprovers.map((approver) => (
                <div
                  key={approver.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={approver.avatarUrl}
                        alt={approver.name}
                      />
                      <AvatarFallback>
                        {approver.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{approver.name}</div>
                      <div className="text-sm text-gray-500">
                        {approver.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {approver.role}
                    </Badge>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveApprover(approver.id)}
                            className="h-8 w-8 text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove approver</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add approver section */}
        {selectedApprovers.length < maxApprovers && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Add Approvers</div>
            <div className="relative">
              <Input
                placeholder="Search by name, email, or role"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              {searchTerm && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {searchTerm && (
              <div className="border rounded-md max-h-60 overflow-y-auto">
                {filteredApprovers.length > 0 ? (
                  filteredApprovers.map((approver) => (
                    <div
                      key={approver.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAddApprover(approver)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage
                            src={approver.avatarUrl}
                            alt={approver.name}
                          />
                          <AvatarFallback>
                            {approver.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{approver.name}</div>
                          <div className="text-sm text-gray-500">
                            {approver.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {approver.role}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-500"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    No matching approvers found
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full mt-2 border-dashed"
              onClick={() => setSearchTerm(searchTerm ? "" : " ")}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Approver
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApproverSelection;
