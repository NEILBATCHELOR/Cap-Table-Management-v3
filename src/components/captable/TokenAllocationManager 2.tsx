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
import { Search, RefreshCw, Plus, Upload, Edit, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import TokenAllocationTable from "./TokenAllocationTable";
import AllocationConfirmationDialog from "./AllocationConfirmationDialog";
import TokenAllocationForm from "./TokenAllocationForm";
import TokenAllocationUploadDialog from "./TokenAllocationUploadDialog";
import TokenAllocationExportDialog from "./TokenAllocationExportDialog";
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
  const [isAllocationExportOpen, setIsAllocationExportOpen] = useState(false);
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
  const handleUpdateAllocation = async (
    id: string,
    amount: number,
    status?: boolean,
  ) => {
    try {
      // Find the allocation
      const allocation = allocations.find((a) => a.id === id);
      if (!allocation) return;

      // Update token allocation amount and status if provided
      const updates: Record<string, any> = {
        token_amount: amount,
        updated_at: new Date().toISOString(),
      };

      // If status is provided, update allocation_date accordingly
      if (status !== undefined) {
        updates.allocation_date = status ? new Date().toISOString() : null;
      }

      const { error } = await supabase
        .from("token_allocations")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setAllocations((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            const updated = { ...a, allocatedAmount: amount };
            // Update allocation confirmation status if provided
            if (status !== undefined) {
              updated.allocationConfirmed = status;
            }
            return updated;
          }
          return a;
        }),
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

  // Handle export token allocations
  const handleExportAllocations = async (options: any) => {
    try {
      // Determine which allocations to export
      const allocationsToExport =
        options.exportType === "selected"
          ? filteredAllocations.filter((allocation) =>
              selectedAllocationIds.includes(allocation.id),
            )
          : filteredAllocations;

      if (allocationsToExport.length === 0) {
        toast({
          title: "No Data",
          description: "No allocations to export",
          variant: "destructive",
        });
        return;
      }

      // Create headers based on selected options
      const headers = ["Token Type", "Allocated Amount"];

      if (options.includeInvestorDetails) {
        headers.push("Investor Name", "Investor Email", "Wallet Address");
      }

      if (options.includeSubscriptionDetails) {
        headers.push("Subscription ID", "Currency", "Subscription Amount");
      }

      if (options.includeStatus) {
        headers.push("Confirmed", "Distributed");
      }

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...allocationsToExport.map((allocation) => {
          const row = [`"${allocation.tokenType}"`, allocation.allocatedAmount];

          if (options.includeInvestorDetails) {
            row.push(
              `"${allocation.investorName}"`,
              `"${allocation.investorEmail}"`,
              `"${allocation.walletAddress || ""}"`,
            );
          }

          if (options.includeSubscriptionDetails) {
            row.push(
              `"${allocation.subscriptionId}"`,
              `"${allocation.currency}"`,
              allocation.fiatAmount,
            );
          }

          if (options.includeStatus) {
            row.push(
              allocation.allocationConfirmed ? "Yes" : "No",
              allocation.distributed ? "Yes" : "No",
            );
          }

          return row.join(",");
        }),
      ].join("\n");

      // Create and download the file
      if (options.fileFormat === "csv") {
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `token_allocations_export_${new Date().toISOString().split("T")[0]}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For Excel, we'd normally use a library like xlsx
        // For simplicity, we'll just use CSV with an .xlsx extension
        const blob = new Blob([csvContent], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `token_allocations_export_${new Date().toISOString().split("T")[0]}.xlsx`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Success",
        description: `${allocationsToExport.length} token allocations exported successfully`,
      });
    } catch (err) {
      console.error("Error exporting token allocations:", err);
      toast({
        title: "Error",
        description: "Failed to export token allocations. Please try again.",
        variant: "destructive",
      });
    }
  };

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
      if (!projectId) {
        toast({
          title: "Error",
          description: "Project ID is required. Please select a project first.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      const now = new Date().toISOString();
      let successCount = 0;

      for (const allocation of allocationsData) {
        try {
          // Get subscription details
          const { data: subscriptionData, error: subscriptionError } =
            await supabase
              .from("subscriptions")
              .select("id, investor_id")
              .eq("subscription_id", allocation.subscription_id)
              .eq("project_id", projectId)
              .single();

          if (subscriptionError) {
            console.error(
              `Subscription not found: ${allocation.subscription_id}`,
            );
            continue;
          }

          // Create token allocation
          const { error: insertError } = await supabase
            .from("token_allocations")
            .insert({
              subscription_id: subscriptionData.id,
              investor_id: subscriptionData.investor_id,
              project_id: projectId,
              token_type: allocation.token_type,
              token_amount: allocation.token_amount,
              created_at: now,
              updated_at: now,
            });

          if (insertError) {
            console.error("Error inserting allocation:", insertError);
            continue;
          }

          // Update subscription to mark as allocated
          await supabase
            .from("subscriptions")
            .update({ allocated: true, updated_at: now })
            .eq("id", subscriptionData.id);

          successCount++;
        } catch (err) {
          console.error("Error processing allocation:", err);
        }
      }

      toast({
        title: "Success",
        description: `${successCount} of ${allocationsData.length} token allocations uploaded successfully`,
      });
      setIsAllocationUploadOpen(false);

      // Refresh allocations
      fetchAllocations();
    } catch (err) {
      console.error("Error uploading token allocations:", err);
      toast({
        title: "Error",
        description: "Failed to upload token allocations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsAllocationExportOpen(true)}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
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

      {/* Token Allocation Upload Dialog */}
      <TokenAllocationUploadDialog
        open={isAllocationUploadOpen}
        onOpenChange={setIsAllocationUploadOpen}
        onUploadComplete={handleUploadTokenAllocations}
        projectId={projectId}
      />

      {/* Token Allocation Export Dialog */}
      <TokenAllocationExportDialog
        open={isAllocationExportOpen}
        onOpenChange={setIsAllocationExportOpen}
        onExport={handleExportAllocations}
        selectedCount={selectedAllocationIds.length}
        totalCount={filteredAllocations.length}
      />

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
