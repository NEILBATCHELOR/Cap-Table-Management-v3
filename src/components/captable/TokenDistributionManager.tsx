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
import { supabase } from "@/lib/supabase";
import {
  Search,
  RefreshCw,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TokenDistributionDialog from "./TokenDistributionDialog";

interface TokenDistributionManagerProps {
  projectId: string;
  projectName?: string;
}

const TokenDistributionManager = ({
  projectId,
  projectName = "Project",
}: TokenDistributionManagerProps) => {
  const [distributions, setDistributions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [tokenTypes, setTokenTypes] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch data when component mounts
  useEffect(() => {
    if (projectId) {
      fetchDistributions();
      fetchTokenTypes();
    }
  }, [projectId]);

  const fetchDistributions = async () => {
    try {
      setIsLoading(true);

      // Get subscriptions for this project with investor details and token allocations
      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          `
          id,
          investor_id,
          subscription_id,
          confirmed,
          allocated,
          allocation_confirmed,
          distributed,
          investors!inner(name, email, wallet_address),
          token_allocations(id, token_type, token_amount, distributed, distribution_date, distribution_tx_hash)
        `,
        )
        .eq("project_id", projectId)
        .eq("allocation_confirmed", true);

      if (error) throw error;

      // Transform data for the table
      const transformedDistributions =
        data?.map((subscription) => {
          const tokenAllocation = subscription.token_allocations?.[0] || {};
          return {
            id: subscription.id,
            investorId: subscription.investor_id,
            investorName: subscription.investors.name,
            investorEmail: subscription.investors.email,
            walletAddress: subscription.investors.wallet_address,
            tokenType: tokenAllocation.token_type || "",
            tokenAmount: tokenAllocation.token_amount || 0,
            confirmed: subscription.confirmed || false,
            allocated: subscription.allocated || false,
            allocationConfirmed: subscription.allocation_confirmed || false,
            distributed: subscription.distributed || false,
            distributionDate: tokenAllocation.distribution_date,
            distributionTxHash: tokenAllocation.distribution_tx_hash,
          };
        }) || [];

      setDistributions(transformedDistributions);
    } catch (err) {
      console.error("Error fetching distributions:", err);
      toast({
        title: "Error",
        description: "Failed to load distribution data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTokenTypes = async () => {
    try {
      // Get token designs for this project
      const { data, error } = await supabase
        .from("token_designs")
        .select("*")
        .eq("project_id", projectId);

      if (error) throw error;

      setTokenTypes(
        data?.map((token) => ({
          type: token.token_type,
          minted: token.status === "minted",
        })) || [],
      );
    } catch (err) {
      console.error("Error fetching token types:", err);
    }
  };

  // Filter distributions based on search query
  const filteredDistributions = distributions.filter((distribution) => {
    const matchesSearch =
      distribution.investorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      distribution.investorEmail
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      distribution.tokenType
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (distribution.walletAddress &&
        distribution.walletAddress
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Handle distribution selection
  const handleSelectDistribution = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((prevId) => prevId !== id));
    }
  };

  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedIds(
        filteredDistributions.filter((d) => !d.distributed).map((d) => d.id),
      );
    } else {
      setSelectedIds([]);
    }
  };

  // Handle distribute tokens
  const handleDistributeTokens = async () => {
    try {
      // Update subscriptions to distributed
      const { error: subError } = await supabase
        .from("subscriptions")
        .update({
          distributed: true,
          updated_at: new Date().toISOString(),
        })
        .in("id", selectedIds);

      if (subError) throw subError;

      // Get token allocation IDs for these subscriptions
      const { data: tokenAllocations, error: allocError } = await supabase
        .from("token_allocations")
        .select("id")
        .in("subscription_id", selectedIds);

      if (allocError) throw allocError;

      if (tokenAllocations && tokenAllocations.length > 0) {
        // Update token allocations to distributed
        const { error: updateError } = await supabase
          .from("token_allocations")
          .update({
            distributed: true,
            distribution_date: new Date().toISOString(),
            distribution_tx_hash: `tx-${Date.now()}`, // In a real app, this would be the actual transaction hash
          })
          .in(
            "id",
            tokenAllocations.map((a) => a.id),
          );

        if (updateError) throw updateError;
      }

      // Refresh data
      await fetchDistributions();

      toast({
        title: "Tokens Distributed",
        description: `Successfully distributed tokens to ${selectedIds.length} investor(s).`,
      });

      // Clear selection
      setSelectedIds([]);
      setIsDistributeDialogOpen(false);
    } catch (err) {
      console.error("Error distributing tokens:", err);
      toast({
        title: "Error",
        description: "Failed to distribute tokens. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format token amount
  const formatTokenAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {projectName} Token Distribution
          </h1>
          <p className="text-sm text-muted-foreground">
            Distribute tokens to investors with confirmed allocations
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search distributions..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchDistributions}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Token Distribution</CardTitle>
              <CardDescription>
                Distribute tokens to investors with confirmed allocations
              </CardDescription>
            </div>
            {selectedIds.length > 0 && (
              <Button
                onClick={() => setIsDistributeDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Distribute to Selected ({selectedIds.length})</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        filteredDistributions.filter((d) => !d.distributed)
                          .length > 0 &&
                        selectedIds.length ===
                          filteredDistributions.filter((d) => !d.distributed)
                            .length
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all distributions"
                    />
                  </TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead>Token Type</TableHead>
                  <TableHead className="text-right">Token Amount</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Distribution Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDistributions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No distributions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDistributions.map((distribution) => (
                    <TableRow key={distribution.id}>
                      <TableCell>
                        {!distribution.distributed && (
                          <Checkbox
                            checked={selectedIds.includes(distribution.id)}
                            onCheckedChange={(checked) =>
                              handleSelectDistribution(
                                distribution.id,
                                !!checked,
                              )
                            }
                            aria-label={`Select distribution for ${distribution.investorName}`}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {distribution.investorName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {distribution.investorEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {distribution.tokenType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatTokenAmount(distribution.tokenAmount)}
                      </TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[150px]">
                        {distribution.walletAddress || "Not set"}
                      </TableCell>
                      <TableCell className="text-center">
                        {distribution.distributed ? (
                          <Badge className="bg-green-100 text-green-800">
                            Distributed
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800">
                            Ready for Distribution
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {distribution.distributed
                          ? formatDate(distribution.distributionDate)
                          : "Pending"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Dialog */}
      <TokenDistributionDialog
        open={isDistributeDialogOpen}
        onOpenChange={setIsDistributeDialogOpen}
        selectedInvestorIds={selectedIds}
        onDistribute={handleDistributeTokens}
        projectId={projectId}
        tokenTypes={tokenTypes}
      />
    </div>
  );
};

export default TokenDistributionManager;
