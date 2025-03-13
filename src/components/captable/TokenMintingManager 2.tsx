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
import { Search, RefreshCw, Coins, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import TokenMintingDialog from "./TokenMintingDialog";

interface TokenMintingManagerProps {
  projectId: string;
  projectName?: string;
}

const TokenMintingManager = ({
  projectId,
  projectName = "Project",
}: TokenMintingManagerProps) => {
  const [tokenSummaries, setTokenSummaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMintDialogOpen, setIsMintDialogOpen] = useState(false);
  const [selectedTokenType, setSelectedTokenType] = useState<string | null>(
    null,
  );
  const { toast } = useToast();

  // Fetch data when component mounts
  useEffect(() => {
    if (projectId) {
      console.log(
        "TokenMintingManager: Fetching allocations for project ID:",
        projectId,
      );
      fetchTokenAllocations();
    } else {
      console.warn("TokenMintingManager: No project ID provided");
    }
  }, [projectId]);

  const fetchTokenAllocations = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching token allocations for project ID:", projectId);

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
          minted,
          minting_date,
          minting_tx_hash,
          project_id,
          subscriptions!inner(confirmed, allocated),
          investors!inner(name, email, wallet_address)
        `,
        )
        .eq("project_id", projectId);

      console.log("Token allocations query result:", { data, error });

      if (error) throw error;

      // Group allocations by token type
      const tokenGroups = (data || []).reduce(
        (acc, allocation) => {
          const tokenType = allocation.token_type || "Unassigned";
          if (!acc[tokenType]) {
            acc[tokenType] = [];
          }
          acc[tokenType].push(allocation);
          return acc;
        },
        {} as Record<string, any[]>,
      );

      // Calculate summaries
      const summaries = Object.entries(tokenGroups).map(
        ([tokenType, allocations]) => {
          const totalAmount = allocations.reduce(
            (sum, a) => sum + (a.token_amount || 0),
            0,
          );

          const confirmedAllocations = allocations.filter(
            (a) => a.subscriptions.confirmed && a.subscriptions.allocated,
          );

          const confirmedAmount = confirmedAllocations.reduce(
            (sum, a) => sum + (a.token_amount || 0),
            0,
          );

          const mintedAllocations = allocations.filter(
            (a) => a.minted === true,
          );
          const mintedAmount = mintedAllocations.reduce(
            (sum, a) => sum + (a.token_amount || 0),
            0,
          );

          const distributedAllocations = allocations.filter(
            (a) => a.distributed,
          );
          const distributedAmount = distributedAllocations.reduce(
            (sum, a) => sum + (a.token_amount || 0),
            0,
          );

          return {
            tokenType,
            totalAmount,
            confirmedAmount,
            distributedAmount,
            mintedAmount,
            totalCount: allocations.length,
            confirmedCount: confirmedAllocations.length,
            distributedCount: distributedAllocations.length,
            mintedCount: mintedAllocations.length,
            status:
              mintedAllocations.length > 0
                ? "minted"
                : confirmedAllocations.length > 0
                  ? "ready_to_mint"
                  : "pending",
            readyToMint:
              confirmedAllocations.length > 0 && mintedAllocations.length === 0,
            isMinted: mintedAllocations.length > 0,
            allocations: allocations,
          };
        },
      );

      setTokenSummaries(summaries);
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

  // Filter token summaries based on search query
  const filteredTokenSummaries = tokenSummaries.filter((summary) => {
    return summary.tokenType.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle mint tokens
  const handleMintTokens = async (tokenTypes: string[]) => {
    try {
      // In a real implementation, this would interact with a blockchain
      // For now, we'll update the database to mark tokens as minted
      const now = new Date().toISOString();

      // For each token type, update the allocations to mark them as minted
      for (const tokenType of tokenTypes) {
        // Find all allocations for this token type
        const allocationsForType =
          tokenSummaries.find((summary) => summary.tokenType === tokenType)
            ?.allocations || [];

        // Get the IDs of these allocations
        const allocationIds = allocationsForType.map((a) => a.id);

        if (allocationIds.length > 0) {
          // Update the allocations in the database to mark them as minted
          const { error } = await supabase
            .from("token_allocations")
            .update({
              minted: true,
              minting_date: now,
              minting_tx_hash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
              updated_at: now,
            })
            .in("id", allocationIds);

          if (error) throw error;
        }
      }

      toast({
        title: "Tokens Minted",
        description: `Successfully minted ${tokenTypes.length} token type(s).`,
      });

      setIsMintDialogOpen(false);
      fetchTokenAllocations(); // Refresh data after minting
    } catch (err) {
      console.error("Error minting tokens:", err);
      toast({
        title: "Error",
        description: "Failed to mint tokens. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format currency
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{projectName} Token Minting</h1>
          <p className="text-sm text-muted-foreground">
            Review and mint tokens for confirmed allocations
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search token types..."
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredTokenSummaries.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground">
                No token allocations found
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTokenSummaries.map((summary) => (
            <Card key={summary.tokenType} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{summary.tokenType}</CardTitle>
                  {summary.isMinted ? (
                    <Badge className="bg-blue-100 text-blue-800">Minted</Badge>
                  ) : summary.readyToMint ? (
                    <Badge className="bg-green-100 text-green-800">
                      Ready to Mint
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {summary.confirmedCount} of {summary.totalCount} allocations
                  confirmed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold">
                        {formatNumber(summary.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confirmed</p>
                      <p className="text-2xl font-bold">
                        {formatNumber(summary.confirmedAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Minted</p>
                      <p className="text-xl font-medium">
                        {formatNumber(summary.mintedAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Distributed
                      </p>
                      <p className="text-xl font-medium">
                        {formatNumber(summary.distributedAmount)}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-2"
                    disabled={!summary.readyToMint || summary.isMinted}
                    onClick={() => {
                      setSelectedTokenType(summary.tokenType);
                      setIsMintDialogOpen(true);
                    }}
                  >
                    <Coins className="mr-2 h-4 w-4" />
                    {summary.isMinted ? "Minted" : "Mint Tokens"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Token Minting Dialog */}
      <TokenMintingDialog
        open={isMintDialogOpen}
        onOpenChange={setIsMintDialogOpen}
        projectId={projectId}
        tokenSummaries={
          selectedTokenType
            ? filteredTokenSummaries
                .filter((summary) => summary.tokenType === selectedTokenType)
                .map((summary) => ({
                  tokenType: summary.tokenType,
                  totalAmount: summary.totalAmount,
                  status: summary.status,
                }))
            : filteredTokenSummaries.map((summary) => ({
                tokenType: summary.tokenType,
                totalAmount: summary.totalAmount,
                status: summary.status,
              }))
        }
        onMintComplete={handleMintTokens}
      />
    </div>
  );
};

export default TokenMintingManager;
