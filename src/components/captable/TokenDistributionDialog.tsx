import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TokenDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  selectedAllocations: string[];
  allocations: {
    id: string;
    investorName: string;
    investorEmail: string;
    walletAddress: string | null;
    tokenType: string;
    tokenAmount: number;
  }[];
  onDistributeComplete: (allocationIds: string[]) => void;
}

const TokenDistributionDialog = ({
  open,
  onOpenChange,
  projectId,
  selectedAllocations,
  allocations,
  onDistributeComplete,
}: TokenDistributionDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [distributionStep, setDistributionStep] = useState<
    "review" | "confirm" | "processing" | "complete"
  >("review");
  const [confirmChecked, setConfirmChecked] = useState(false);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setDistributionStep("review");
      setIsProcessing(false);
      setConfirmChecked(false);
    }
  }, [open]);

  // Check if any allocations are missing wallet addresses
  const missingWalletAddresses = allocations.filter(
    (allocation) => !allocation.walletAddress,
  );

  // Handle distribute tokens
  const handleDistributeTokens = async () => {
    try {
      setIsProcessing(true);
      setDistributionStep("processing");

      // Simulate distribution process with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Call the onDistributeComplete callback
      await onDistributeComplete(selectedAllocations);

      // Set distribution as complete
      setDistributionStep("complete");
    } catch (error) {
      console.error("Error distributing tokens:", error);
      // Reset to review step on error
      setDistributionStep("review");
    } finally {
      setIsProcessing(false);
    }
  };

  // Format number
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Group allocations by token type
  const allocationsByTokenType = allocations.reduce(
    (acc, allocation) => {
      const { tokenType } = allocation;
      if (!acc[tokenType]) {
        acc[tokenType] = [];
      }
      acc[tokenType].push(allocation);
      return acc;
    },
    {} as Record<string, typeof allocations>,
  );

  // Calculate total tokens by type
  const tokenTotals = Object.entries(allocationsByTokenType).map(
    ([tokenType, allocations]) => ({
      tokenType,
      total: allocations.reduce((sum, a) => sum + a.tokenAmount, 0),
      count: allocations.length,
    }),
  );

  // Render content based on current step
  const renderContent = () => {
    switch (distributionStep) {
      case "review":
        return (
          <div className="space-y-4">
            {missingWalletAddresses.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {missingWalletAddresses.length} allocation(s) are missing
                  wallet addresses. Please update investor details before
                  distributing.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Distribution Summary</h3>
              <div className="rounded-md border p-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Allocations
                  </p>
                  <p className="text-lg font-medium">{allocations.length}</p>
                </div>
                <div className="space-y-2">
                  {tokenTotals.map((tokenTotal) => (
                    <div
                      key={tokenTotal.tokenType}
                      className="flex justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {tokenTotal.tokenType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tokenTotal.count} allocation(s)
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatNumber(tokenTotal.total)} tokens
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              <h3 className="text-sm font-medium">Allocations to Distribute</h3>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2">Investor</th>
                      <th className="text-left p-2">Token Type</th>
                      <th className="text-right p-2">Amount</th>
                      <th className="text-left p-2">Wallet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((allocation) => (
                      <tr key={allocation.id} className="border-t">
                        <td className="p-2">
                          <div>{allocation.investorName}</div>
                          <div className="text-xs text-muted-foreground">
                            {allocation.investorEmail}
                          </div>
                        </td>
                        <td className="p-2">{allocation.tokenType}</td>
                        <td className="p-2 text-right">
                          {formatNumber(allocation.tokenAmount)}
                        </td>
                        <td className="p-2 font-mono text-xs truncate max-w-[150px]">
                          {allocation.walletAddress || (
                            <span className="text-red-500">Not set</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "confirm":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                You are about to distribute tokens to {allocations.length}{" "}
                investor(s). This action will send tokens to the specified
                wallet addresses and cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Distribution Details</h3>
              <div className="rounded-md border p-4 space-y-2">
                {tokenTotals.map((tokenTotal) => (
                  <div key={tokenTotal.tokenType}>
                    <p className="font-medium">{tokenTotal.tokenType}</p>
                    <p className="text-sm">
                      {formatNumber(tokenTotal.total)} tokens to{" "}
                      {tokenTotal.count} investor(s)
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="confirm-distribution"
                checked={confirmChecked}
                onCheckedChange={(checked) => setConfirmChecked(!!checked)}
              />
              <Label htmlFor="confirm-distribution">
                I confirm that I want to distribute these tokens and understand
                this action cannot be reversed
              </Label>
            </div>
          </div>
        );

      case "processing":
        return (
          <div className="space-y-4 text-center py-6">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h3 className="text-lg font-medium">Distributing Tokens</h3>
            <p className="text-muted-foreground">
              Please wait while your tokens are being distributed. This process
              may take a few minutes.
            </p>
          </div>
        );

      case "complete":
        return (
          <div className="space-y-4 text-center py-6">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h3 className="text-lg font-medium">Distribution Complete</h3>
            <p className="text-muted-foreground">
              Your tokens have been successfully distributed to investor
              wallets.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // Render footer based on current step
  const renderFooter = () => {
    switch (distributionStep) {
      case "review":
        return (
          <>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setDistributionStep("confirm")}
              disabled={
                isProcessing ||
                allocations.length === 0 ||
                missingWalletAddresses.length > 0
              }
            >
              <Send className="mr-2 h-4 w-4" />
              Continue to Distribution
            </Button>
          </>
        );

      case "confirm":
        return (
          <>
            <Button
              variant="outline"
              onClick={() => setDistributionStep("review")}
              disabled={isProcessing}
            >
              Back
            </Button>
            <Button
              onClick={handleDistributeTokens}
              disabled={isProcessing || !confirmChecked}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Distributing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Distribute Tokens
                </>
              )}
            </Button>
          </>
        );

      case "processing":
        return (
          <Button disabled={true}>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Distribution in Progress...
          </Button>
        );

      case "complete":
        return <Button onClick={() => onOpenChange(false)}>Close</Button>;

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <span>Distribute Tokens</span>
          </DialogTitle>
          <DialogDescription>
            Distribute tokens to investor wallets
          </DialogDescription>
        </DialogHeader>

        {renderContent()}

        <DialogFooter>{renderFooter()}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TokenDistributionDialog;
