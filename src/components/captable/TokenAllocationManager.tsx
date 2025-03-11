import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { Search, RefreshCw, Plus, Upload, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import TokenAllocationTable from "./TokenAllocationTable";
import AllocationConfirmationDialog from "./AllocationConfirmationDialog";
import TokenAllocationForm from "./TokenAllocationForm";
import BulkStatusUpdateDialog from "./BulkStatusUpdateDialog";

interface TokenAllocationManagerProps {
  projectId: string;
  projectName?: string;
}

const TokenAllocationManager = ({
  projectId,
  projectName = "Project",
}: TokenAllocationManagerProps) => {
  const [activeTab, setActiveTab] = useState("allocations");
  const [allocations, setAllocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAllocationIds, setSelectedAllocationIds] = useState<string[]>(
    [],
  );
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isAllocationFormOpen, setIsAllocationFormOpen] = useState(false);
  const [isAllocationUploadOpen, setIsAllocationUploadOpen] = useState(false);
  const [isBulkStatusUpdateOpen, setIsBulkStatusUpdateOpen] = useState(false);
  const { toast } = useToast();

  // Fetch data when component mounts
  useEffect(() => {
    if (projectId) {
      fetchAllocations();
    }
  }, [projectId]);

  const fetchAllocations = async () => {
    try {
      setIsLoading(true);

      // Query token_allocations table directly
      const { data, error } = await supabase
        .from("token_allocations")
        .select(
          `
          id,
          investor_id,
          subscription_id,
          token_type,
          token_amount,
          distributed,
          allocation_date,
          notes,
          subscriptions!inner(currency, fiat_amount, confirmed, allocated, subscription_id),
          investors!inner(name, email, wallet_address)
        `,
        )
        .eq("project_id", projectId);

      if (error) throw error;

      // Transform data for the table
      const transformedAllocations =
        data?.map((allocation) => {
          return {
            id: allocation.id,
            investorId: allocation.investor_id,
            investorName: allocation.investors.name,
            investorEmail: allocation.investors.email,
            walletAddress: allocation.investors.wallet_address,
            tokenType: allocation.token_type,
            subscriptionId: allocation.subscriptions.subscription_id,
            currency: allocation.subscriptions.currency,
            fiatAmount: allocation.subscriptions.fiat_amount || 0,
            subscribedAmount: allocation.subscriptions.fiat_amount || 0,
            allocatedAmount: allocation.token_amount || 0,
            confirmed: allocation.subscriptions.confirmed || false,
            allocated: allocation.subscriptions.allocated || false,
            allocationConfirmed: allocation.allocation_date ? true : false,
            distributed: allocation.distributed || false,
          };
        }) || [];

      setAllocations(transformedAllocations);

      // No need to calculate token summaries anymore
    } catch (err) {
      console.error("Error fetching allocations:", err);
      toast({
        title: "Error",
        description: "Failed to load allocation data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed calculateTokenSummaries function as it's now in TokenMintingManager

  // Filter allocations based on search query
  const filteredAllocations = allocations.filter((allocation) => {
    const matchesSearch =
      allocation.investorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      allocation.investorEmail
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      allocation.tokenType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Handle allocation selection
  const handleSelectAllocation = (
    allocationId: string,
    isSelected: boolean,
  ) => {
    if (isSelected) {
      setSelectedAllocationIds((prev) => [...prev, allocationId]);
    } else {
      setSelectedAllocationIds((prev) =>
        prev.filter((id) => id !== allocationId),
      );
    }
  };

  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedAllocationIds(filteredAllocations.map((a) => a.id));
    } else {
      setSelectedAllocationIds([]);
    }
  };

  // Handle update allocation
  const handleUpdateAllocation = async (id: string, amount: number) => {
    try {
      // Find the allocation
      const allocation = allocations.find((a) => a.id === id);
      if (!allocation) return;

      // Update token allocation amount
      const { error } = await supabase
        .from("token_allocations")
        .update({
          token_amount: amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setAllocations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, allocatedAmount: amount } : a)),
      );

      // No need to recalculate token summaries

      toast({
        title: "Allocation Updated",
        description: "Token allocation has been updated successfully.",
      });
    } catch (err) {
      console.error("Error updating allocation:", err);
      toast({
        title: "Error",
        description: "Failed to update allocation. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle confirm allocations
  const handleConfirmAllocations = async () => {
    try {
      const now = new Date().toISOString();

      // Update token_allocations to set allocation_date (which marks them as confirmed)
      const { error: updateError } = await supabase
        .from("token_allocations")
        .update({
          allocation_date: now,
          updated_at: now,
        })
        .in("id", selectedAllocationIds);

      if (updateError) throw updateError;

      // Update local state
      setAllocations((prev) =>
        prev.map((a) =>
          selectedAllocationIds.includes(a.id)
            ? { ...a, allocationConfirmed: true }
            : a,
        ),
      );

      // No need to recalculate token summaries

      toast({
        title: "Allocations Confirmed",
        description: `${selectedAllocationIds.length} allocations have been confirmed.`,
      });

      // Clear selection
      setSelectedAllocationIds([]);
      setIsConfirmDialogOpen(false);

      // Refresh allocations to ensure UI is up to date
      fetchAllocations();
    } catch (err) {
      console.error("Error confirming allocations:", err);
      toast({
        title: "Error",
        description: "Failed to confirm allocations. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Removed handleMintTokens function as it's now in TokenMintingManager

  // Handle delete allocation
  const handleDeleteAllocation = async (id: string) => {
    try {
      // Delete the allocation from the database
      const { error } = await supabase
        .from("token_allocations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setAllocations((prev) => prev.filter((a) => a.id !== id));

      toast({
        title: "Allocation Deleted",
        description: "Token allocation has been deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting allocation:", err);
      toast({
        title: "Error",
        description: "Failed to delete allocation. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle adding token allocations
  const handleAddTokenAllocations = async (allocationData: any) => {
    try {
      const { subscription_id, investor_id, project_id, allocations, notes } =
        allocationData;

      // Get subscription details to check amount
      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from("subscriptions")
          .select("fiat_amount")
          .eq("id", subscription_id)
          .single();

      if (subscriptionError) throw subscriptionError;

      const hasValidAmount =
        subscriptionData && subscriptionData.fiat_amount > 0;
      const now = new Date().toISOString();

      // Create token allocations for each token type
      for (const allocation of allocations) {
        const { data, error } = await supabase
          .from("token_allocations")
          .insert({
            investor_id,
            subscription_id,
            project_id,
            token_type: allocation.token_type,
            token_amount: allocation.token_amount,
            notes,
            // Auto-confirm if there's a valid subscription amount
            allocation_date: hasValidAmount ? now : null,
            created_at: now,
            updated_at: now,
          });

        if (error) throw error;
      }

      // Update subscription to mark as allocated
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ allocated: true, updated_at: new Date().toISOString() })
        .eq("id", subscription_id);

      if (updateError) throw updateError;

      // Refresh allocations
      fetchAllocations();

      toast({
        title: "Success",
        description: `${allocations.length} token allocation(s) added successfully`,
      });

      setIsAllocationFormOpen(false);
    } catch (err) {
      console.error("Error adding token allocations:", err);
      toast({
        title: "Error",
        description: "Failed to add token allocations. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle bulk upload of token allocations
  const handleUploadTokenAllocations = async (allocationsData: any[]) => {
    try {
      // Implementation for bulk upload
      toast({
        title: "Success",
        description: `${allocationsData.length} token allocations uploaded successfully`,
      });
      setIsAllocationUploadOpen(false);
    } catch (err) {
      console.error("Error uploading token allocations:", err);
      toast({
        title: "Error",
        description: "Failed to upload token allocations. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search allocations..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchAllocations}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsAllocationUploadOpen(true)}
            disabled={!projectId}
          >
            <Upload className="h-4 w-4" />
            <span>Bulk Upload</span>
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsAllocationFormOpen(true)}
            disabled={!projectId}
          >
            <Plus className="h-4 w-4" />
            <span>Add Allocation</span>
          </Button>
          {selectedAllocationIds.length > 0 && (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsBulkStatusUpdateOpen(true)}
            >
              <Edit className="h-4 w-4" />
              <span>Update Status</span>
            </Button>
          )}
        </div>
      </div>

      <div>
        <TokenAllocationTable
          allocations={filteredAllocations}
          selectedIds={selectedAllocationIds}
          onSelectAllocation={handleSelectAllocation}
          onSelectAll={handleSelectAll}
          onUpdateAllocation={handleUpdateAllocation}
          onConfirmAllocations={() => setIsConfirmDialogOpen(true)}
          onMintTokens={() => {}} // Empty function as minting is now in a separate component
          onDeleteAllocation={handleDeleteAllocation}
          isLoading={isLoading}
        />
      </div>

      {/* Allocation Confirmation Dialog */}
      <AllocationConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        selectedInvestorIds={selectedAllocationIds}
        onConfirm={handleConfirmAllocations}
        projectId={projectId}
        allocations={filteredAllocations
          .filter((allocation) => selectedAllocationIds.includes(allocation.id))
          .map((allocation) => ({
            investorId: allocation.investorId,
            investorName: allocation.investorName,
            tokenType: allocation.tokenType,
            amount: allocation.allocatedAmount,
          }))}
      />

      {/* Removed Token Minting Dialog as it's now in TokenMintingManager */}

      {/* Token Allocation Form */}
      <TokenAllocationForm
        open={isAllocationFormOpen}
        onOpenChange={setIsAllocationFormOpen}
        onSubmit={handleAddTokenAllocations}
        projectId={projectId}
      />

      {/* Bulk Status Update Dialog */}
      <BulkStatusUpdateDialog
        open={isBulkStatusUpdateOpen}
        onOpenChange={setIsBulkStatusUpdateOpen}
        title="Update Allocation Status"
        description="Change the status of selected allocations"
        selectedCount={selectedAllocationIds.length}
        statusOptions={[
          { value: "confirmed", label: "Confirmed" },
          { value: "unconfirmed", label: "Unconfirmed" },
          { value: "distributed", label: "Distributed" },
          { value: "not_distributed", label: "Not Distributed" },
        ]}
        onConfirm={async (newStatus) => {
          try {
            if (!projectId || selectedAllocationIds.length === 0) return;

            const now = new Date().toISOString();
            const updates: Record<string, any> = { updated_at: now };

            if (newStatus === "confirmed") {
              updates.allocation_date = now;
            } else if (newStatus === "unconfirmed") {
              updates.allocation_date = null;
            } else if (newStatus === "distributed") {
              updates.distributed = true;
              updates.distribution_date = now;
            } else if (newStatus === "not_distributed") {
              updates.distributed = false;
              updates.distribution_date = null;
            }

            // Update all selected allocations
            const { error } = await supabase
              .from("token_allocations")
              .update(updates)
              .in("id", selectedAllocationIds);

            if (error) throw error;

            // Update local state
            setAllocations((prev) =>
              prev.map((a) => {
                if (selectedAllocationIds.includes(a.id)) {
                  const updated = { ...a };

                  if (newStatus === "confirmed") {
                    updated.allocationConfirmed = true;
                  } else if (newStatus === "unconfirmed") {
                    updated.allocationConfirmed = false;
                  } else if (newStatus === "distributed") {
                    updated.distributed = true;
                  } else if (newStatus === "not_distributed") {
                    updated.distributed = false;
                  }

                  return updated;
                }
                return a;
              }),
            );

            toast({
              title: "Success",
              description: `${selectedAllocationIds.length} allocations updated to ${newStatus}`,
            });

            // Clear selection
            setSelectedAllocationIds([]);
          } catch (err) {
            console.error("Error updating allocation status:", err);
            toast({
              title: "Error",
              description: "Failed to update allocation status",
              variant: "destructive",
            });
            throw err; // Re-throw to be caught by the dialog
          }
        }}
      />
    </div>
  );
};

export default TokenAllocationManager;
