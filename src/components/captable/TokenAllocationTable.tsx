import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Coins,
  Edit,
  Trash2,
  X,
} from "lucide-react";

interface TokenAllocationProps {
  allocations: any[];
  selectedIds: string[];
  onSelectAllocation: (id: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onUpdateAllocation: (id: string, amount: number) => void;
  onConfirmAllocations: () => void;
  onMintTokens: () => void;
  onDeleteAllocation?: (id: string) => void;
  isLoading: boolean;
}

const TokenAllocationTable = ({
  allocations = [],
  selectedIds = [],
  onSelectAllocation,
  onSelectAll,
  onUpdateAllocation,
  onConfirmAllocations,
  onMintTokens,
  onDeleteAllocation,
  isLoading,
}: TokenAllocationProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Format number
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Start editing allocation
  const startEditing = (id: string, currentAmount: number) => {
    setEditingId(id);
    setEditValue(currentAmount.toString());
  };

  // Save edited allocation
  const saveEditing = (id: string) => {
    const amount = parseFloat(editValue);
    if (!isNaN(amount) && amount >= 0) {
      onUpdateAllocation(id, amount);
    }
    setEditingId(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
  };

  // Group allocations by token type
  const groupedAllocations = allocations.reduce(
    (acc, allocation) => {
      const tokenType = allocation.tokenType || "Unassigned";
      if (!acc[tokenType]) {
        acc[tokenType] = [];
      }
      acc[tokenType].push(allocation);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  // Calculate totals for each token type
  const tokenTypeTotals = Object.entries(groupedAllocations).map(
    ([tokenType, allocations]) => {
      const subscribedTotal = allocations.reduce(
        (sum, a) => sum + (a.subscribedAmount || 0),
        0,
      );
      const allocatedTotal = allocations.reduce(
        (sum, a) => sum + (a.allocatedAmount || 0),
        0,
      );
      // Count allocations that have been confirmed (subscription confirmed)
      const confirmedCount = allocations.filter((a) => a.confirmed).length;
      // Count allocations that have been allocation-confirmed (allocation_date is set)
      const allocationConfirmedCount = allocations.filter(
        (a) => a.allocationConfirmed === true,
      ).length;

      return {
        tokenType,
        subscribedTotal,
        allocatedTotal,
        count: allocations.length,
        confirmedCount,
        allocationConfirmedCount,
        readyToMint:
          confirmedCount > 0 && confirmedCount === allocationConfirmedCount,
      };
    },
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Token Allocation</h2>
          <p className="text-sm text-muted-foreground">
            Manage token allocations for confirmed subscriptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onConfirmAllocations}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Confirm Allocations</span>
          </Button>
        </div>
      </div>

      {/* Token Type Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokenTypeTotals.map((summary) => (
          <div
            key={summary.tokenType}
            className="bg-muted/20 rounded-lg p-4 border"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{summary.tokenType}</h3>
              {summary.readyToMint ? (
                <Badge className="bg-green-100 text-green-800">
                  Ready to Mint
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Investors:</span>
                <span>{summary.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscribed:</span>
                <span>{formatNumber(summary.subscribedTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Allocated:</span>
                <span>{formatNumber(summary.allocatedTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmed:</span>
                <span>
                  {summary.allocationConfirmedCount} / {summary.count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Allocation Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    allocations.length > 0 &&
                    selectedIds.length === allocations.length
                  }
                  onCheckedChange={onSelectAll}
                  aria-label="Select all allocations"
                />
              </TableHead>
              <TableHead>Investor</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Token Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : allocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No allocations found
                </TableCell>
              </TableRow>
            ) : (
              allocations.map((allocation) => (
                <TableRow key={allocation.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(allocation.id)}
                      onCheckedChange={(checked) =>
                        onSelectAllocation(allocation.id, !!checked)
                      }
                      aria-label={`Select allocation for ${allocation.investorName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{allocation.investorName}</div>
                    <div className="text-sm text-muted-foreground">
                      {allocation.investorEmail}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {allocation.subscriptionId?.substring(0, 12)}...
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {allocation.currency}{" "}
                      {allocation.fiatAmount?.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {allocation.tokenType || "Unassigned"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === allocation.id ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-24 h-8 text-right"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEditing(allocation.id);
                            if (e.key === "Escape") cancelEditing();
                          }}
                        />
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => saveEditing(allocation.id)}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={cancelEditing}
                          >
                            <AlertCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() =>
                          startEditing(
                            allocation.id,
                            allocation.allocatedAmount ||
                              allocation.subscribedAmount ||
                              0,
                          )
                        }
                      >
                        {formatNumber(
                          allocation.allocatedAmount ||
                            allocation.subscribedAmount ||
                            0,
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingId === `status-${allocation.id}` ? (
                      <div className="flex items-center justify-center gap-1">
                        <select
                          className="text-xs rounded-md border border-input bg-background px-2 py-1"
                          value={
                            allocation.allocationConfirmed
                              ? "confirmed"
                              : "unconfirmed"
                          }
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            const now = new Date().toISOString();

                            // Update in database
                            supabase
                              .from("token_allocations")
                              .update({
                                allocation_date:
                                  newStatus === "confirmed" ? now : null,
                                updated_at: now,
                              })
                              .eq("id", allocation.id)
                              .then(() => {
                                // Update local state with both amount and status
                                onUpdateAllocation(
                                  allocation.id,
                                  allocation.allocatedAmount,
                                  newStatus === "confirmed",
                                );

                                // Update the allocation status in the parent component
                                // This will trigger a re-render of the token type summary cards
                                const updatedAllocations = allocations.map(
                                  (a) =>
                                    a.id === allocation.id
                                      ? {
                                          ...a,
                                          allocationConfirmed:
                                            newStatus === "confirmed",
                                        }
                                      : a,
                                );

                                // Force a re-render of the component
                                onSelectAll(
                                  selectedIds.length === allocations.length,
                                );

                                setEditingId(null);
                              })
                              .catch((err) => {
                                console.error("Error updating status:", err);
                                setEditingId(null);
                              });
                          }}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="unconfirmed">Unconfirmed</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(null)}
                          className="h-6 w-6"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer flex justify-center"
                        onClick={() => setEditingId(`status-${allocation.id}`)}
                        title="Click to edit status"
                      >
                        {allocation.allocationConfirmed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[150px]">
                    {allocation.walletAddress || "Not set"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Edit Allocation"
                        onClick={() =>
                          startEditing(
                            allocation.id,
                            allocation.allocatedAmount ||
                              allocation.subscribedAmount ||
                              0,
                          )
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        title="Delete Allocation"
                        onClick={() =>
                          onDeleteAllocation &&
                          onDeleteAllocation(allocation.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TokenAllocationTable;
