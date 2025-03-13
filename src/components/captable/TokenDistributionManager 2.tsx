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
  Filter,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import TokenDistributionDialog from "./TokenDistributionDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface TokenDistributionManagerProps {
  projectId: string;
  projectName?: string;
}

const TokenDistributionManager = ({
  projectId,
  projectName = "Project",
}: TokenDistributionManagerProps) => {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDistributionDialogOpen, setIsDistributionDialogOpen] =
    useState(false);
  const [selectedAllocations, setSelectedAllocations] = useState<string[]>([]);
  const [tokenTypeFilter, setTokenTypeFilter] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch data when component mounts
  useEffect(() => {
    if (projectId) {
      fetchTokenAllocations();
    }
  }, [projectId]);

  const fetchTokenAllocations = async () => {
    try {
      setIsLoading(true);

      // Fetch token allocations from the database
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
          distribution_date,
          distribution_tx_hash,
          allocation_date,
          subscriptions!inner(confirmed, allocated),
          investors!inner(name, email, wallet_address)
        `,
        )
        .eq("project_id", projectId)
        .not("allocation_date", "is", null); // Only get confirmed allocations

      if (error) throw error;

      // Transform data for the table
      const transformedAllocations = data?.map((allocation) => ({
        id: allocation.id,
        investorId: allocation.investor_id,
        investorName: allocation.investors.name,
        investorEmail: allocation.investors.email,
        walletAddress: allocation.investors.wallet_address,
        tokenType: allocation.token_type,
        tokenAmount: allocation.token_amount,
        distributed: allocation.distributed,
        distributionDate: allocation.distribution_date,
        distributionTxHash: allocation.distribution_tx_hash,
        allocationDate: allocation.allocation_date,
        confirmed: allocation.subscriptions.confirmed,
        allocated: allocation.subscriptions.allocated,
      }));

      setAllocations(transformedAllocations || []);
    } catch (err) {
      console.error("Error fetching token allocations:", err);
      toast({
        title: "Error",
        description: "Failed to load token allocation data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter allocations based on search query and token type filter
  const filteredAllocations = allocations.filter((allocation) => {
    const matchesSearch =
      allocation.investorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      allocation.investorEmail
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      allocation.tokenType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTokenType = tokenTypeFilter
      ? allocation.tokenType === tokenTypeFilter
      : true;

    return matchesSearch && matchesTokenType;
  });

  // Get unique token types for filtering
  const tokenTypes = [...new Set(allocations.map((a) => a.tokenType))].sort();

  // Handle distribute tokens
  const handleDistributeTokens = async (allocationsToDistribute: string[]) => {
    try {
      // In a real implementation, this would interact with a blockchain
      // For now, we'll just update the database
      const now = new Date().toISOString();

      // Update the allocations to mark them as distributed
      const { error } = await supabase
        .from("token_allocations")
        .update({
          distributed: true,
          distribution_date: now,
          distribution_tx_hash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        })
        .in("id", allocationsToDistribute);

      if (error) throw error;

      toast({
        title: "Tokens Distributed",
        description: `Successfully distributed tokens to ${allocationsToDistribute.length} allocation(s).`,
      });

      setIsDistributionDialogOpen(false);
      setSelectedAllocations([]);
      fetchTokenAllocations(); // Refresh data after distribution
    } catch (err) {
      console.error("Error distributing tokens:", err);
      toast({
        title: "Error",
        description: "Failed to distribute tokens. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select allocations that are not already distributed
      setSelectedAllocations(
        filteredAllocations
          .filter((allocation) => !allocation.distributed)
          .map((allocation) => allocation.id),
      );
    } else {
      setSelectedAllocations([]);
    }
  };

  // Handle select allocation
  const handleSelectAllocation = (
    allocationId: string,
    isSelected: boolean,
  ) => {
    if (isSelected) {
      setSelectedAllocations((prev) => [...prev, allocationId]);
    } else {
      setSelectedAllocations((prev) =>
        prev.filter((id) => id !== allocationId),
      );
    }
  };

  // Format number
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate summary statistics
  const summaryStats = {
    totalAllocations: allocations.length,
    distributedAllocations: allocations.filter((a) => a.distributed).length,
    pendingAllocations: allocations.filter((a) => !a.distributed).length,
    totalTokens: allocations.reduce((sum, a) => sum + a.tokenAmount, 0),
    distributedTokens: allocations
      .filter((a) => a.distributed)
      .reduce((sum, a) => sum + a.tokenAmount, 0),
    pendingTokens: allocations
      .filter((a) => !a.distributed)
      .reduce((sum, a) => sum + a.tokenAmount, 0),
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {projectName} Token Distribution
          </h1>
          <p className="text-sm text-muted-foreground">
            Distribute tokens to investor wallets
          </p>
        </div>
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
            onClick={fetchTokenAllocations}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summaryStats.totalAllocations}
            </div>
            <div className="flex justify-between mt-2">
              <div>
                <p className="text-sm text-muted-foreground">Distributed</p>
                <p className="text-lg font-medium">
                  {summaryStats.distributedAllocations}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-lg font-medium">
                  {summaryStats.pendingAllocations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(summaryStats.totalTokens)}
            </div>
            <div className="flex justify-between mt-2">
              <div>
                <p className="text-sm text-muted-foreground">Distributed</p>
                <p className="text-lg font-medium">
                  {formatNumber(summaryStats.distributedTokens)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-lg font-medium">
                  {formatNumber(summaryStats.pendingTokens)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Distribution Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summaryStats.totalAllocations > 0
                ? Math.round(
                    (summaryStats.distributedAllocations /
                      summaryStats.totalAllocations) *
                      100,
                  )
                : 0}
              %
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{
                  width: `${
                    summaryStats.totalAllocations > 0
                      ? (summaryStats.distributedAllocations /
                          summaryStats.totalAllocations) *
                        100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {summaryStats.distributedAllocations} of{" "}
              {summaryStats.totalAllocations} allocations distributed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Token Type Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={tokenTypeFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setTokenTypeFilter(null)}
        >
          All Types
        </Button>
        {tokenTypes.map((type) => (
          <Button
            key={type}
            variant={tokenTypeFilter === type ? "default" : "outline"}
            size="sm"
            onClick={() => setTokenTypeFilter(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Allocations Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Token Allocations</CardTitle>
              <CardDescription>
                Manage and distribute tokens to investors
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedAllocations.length > 0 && (
                <Button
                  onClick={() => setIsDistributionDialogOpen(true)}
                  disabled={selectedAllocations.length === 0}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Distribute Selected ({selectedAllocations.length})
                </Button>
              )}
            </div>
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
                        filteredAllocations.filter((a) => !a.distributed)
                          .length > 0 &&
                        selectedAllocations.length ===
                          filteredAllocations.filter((a) => !a.distributed)
                            .length
                      }
                      onCheckedChange={handleSelectAll}
                      disabled={
                        filteredAllocations.filter((a) => !a.distributed)
                          .length === 0
                      }
                    />
                  </TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead>Token Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Status</TableHead>
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
                ) : filteredAllocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No allocations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAllocations.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedAllocations.includes(allocation.id)}
                          onCheckedChange={(checked) =>
                            handleSelectAllocation(allocation.id, !!checked)
                          }
                          disabled={allocation.distributed}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {allocation.investorName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {allocation.investorEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{allocation.tokenType}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(allocation.tokenAmount)}
                      </TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[150px]">
                        {allocation.walletAddress || (
                          <span className="text-red-500">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {allocation.distributed ? (
                          <Badge className="bg-green-100 text-green-800">
                            Distributed
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {allocation.distributionDate
                          ? new Date(
                              allocation.distributionDate,
                            ).toLocaleDateString()
                          : "Not distributed"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Token Distribution Dialog */}
      <TokenDistributionDialog
        open={isDistributionDialogOpen}
        onOpenChange={setIsDistributionDialogOpen}
        projectId={projectId}
        selectedAllocations={selectedAllocations}
        allocations={filteredAllocations.filter((a) =>
          selectedAllocations.includes(a.id),
        )}
        onDistributeComplete={handleDistributeTokens}
      />
    </div>
  );
};

export default TokenDistributionManager;
