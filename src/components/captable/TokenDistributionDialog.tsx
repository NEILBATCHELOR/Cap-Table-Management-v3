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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface TokenDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedInvestorIds: string[];
  onDistribute: () => void;
  projectId: string;
  tokenTypes: Array<{ type: string; minted: boolean }>;
}

const TokenDistributionDialog = ({
  open,
  onOpenChange,
  selectedInvestorIds,
  onDistribute,
  projectId,
  tokenTypes = [
    { type: "ERC-20", minted: true },
    { type: "ERC-1400", minted: true },
  ],
}: TokenDistributionDialogProps) => {
  const [isDistributing, setIsDistributing] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [distributionType, setDistributionType] = useState("standard"); // "standard" or "bespoke"
  const [standardAmount, setStandardAmount] = useState("100");
  const [selectedTokenType, setSelectedTokenType] = useState(
    tokenTypes.length > 0 ? tokenTypes[0].type : "",
  );
  const [walletWarning, setWalletWarning] = useState(false);
  const { toast } = useToast();

  const mintedTokenTypes = tokenTypes.filter((token) => token.minted);

  const handleDistribute = async () => {
    if (
      !confirmationChecked ||
      selectedInvestorIds.length === 0 ||
      !selectedTokenType ||
      !walletWarning
    )
      return;

    try {
      setIsDistributing(true);

      // In a real implementation, this would call a blockchain service to distribute tokens
      // For now, we'll simulate the API call

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Log the operation for demonstration
      console.log("Distributing tokens:", {
        projectId,
        investorIds: selectedInvestorIds,
        tokenType: selectedTokenType,
        distributionType,
        standardAmount:
          distributionType === "standard"
            ? parseInt(standardAmount)
            : "bespoke",
      });

      // Call the callback to notify parent component
      await onDistribute();

      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error distributing tokens:", error);
      toast({
        title: "Error",
        description: "Failed to distribute tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDistributing(false);
      setConfirmationChecked(false);
      setWalletWarning(false);
    }
  };

  // Check if all token types are minted
  const allTokensMinted = mintedTokenTypes.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <span>Distribute Tokens</span>
          </DialogTitle>
          <DialogDescription>
            Distribute tokens to {selectedInvestorIds.length} selected investor
            {selectedInvestorIds.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!allTokensMinted && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No minted tokens available for distribution. Please mint tokens
                first.
              </AlertDescription>
            </Alert>
          )}

          {allTokensMinted && (
            <>
              <div className="space-y-2">
                <Label>Token Type</Label>
                <RadioGroup
                  value={selectedTokenType}
                  onValueChange={setSelectedTokenType}
                  className="flex flex-col space-y-1"
                >
                  {mintedTokenTypes.map((token) => (
                    <div
                      key={token.type}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={token.type}
                        id={`token-${token.type}`}
                      />
                      <Label htmlFor={`token-${token.type}`}>
                        {token.type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Distribution Type</Label>
                <RadioGroup
                  value={distributionType}
                  onValueChange={setDistributionType}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard">
                      Standard (same amount for all selected investors)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bespoke" id="bespoke" />
                    <Label htmlFor="bespoke">
                      Bespoke (use confirmed subscription amounts)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {distributionType === "standard" && (
                <div className="space-y-2">
                  <Label htmlFor="standardAmount">Standard Amount</Label>
                  <Input
                    id="standardAmount"
                    type="number"
                    min="1"
                    value={standardAmount}
                    onChange={(e) => setStandardAmount(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Each selected investor will receive {standardAmount}{" "}
                    {selectedTokenType} tokens.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="rounded-md border p-4 space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Distribution Summary</h3>
              <Badge variant="outline">
                {selectedInvestorIds.length} Investor
                {selectedInvestorIds.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <p className="text-sm">
              You are about to distribute {selectedTokenType || "tokens"} to{" "}
              {selectedInvestorIds.length} investor
              {selectedInvestorIds.length !== 1 ? "s" : ""}. This action will
              send tokens to the investors' wallets and cannot be undone.
            </p>
            <p className="text-sm font-medium mt-2">
              Please ensure all wallet addresses are correct before proceeding.
            </p>
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="wallet-verification"
              checked={walletWarning}
              onCheckedChange={(checked) => setWalletWarning(!!checked)}
              disabled={!allTokensMinted}
            />
            <Label
              htmlFor="wallet-verification"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have verified that all investor wallet addresses are correct.
            </Label>
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="distribution-confirmation"
              checked={confirmationChecked}
              onCheckedChange={(checked) => setConfirmationChecked(!!checked)}
              disabled={!walletWarning || !allTokensMinted}
            />
            <Label
              htmlFor="distribution-confirmation"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I confirm that I want to distribute these tokens to the selected
              investors. This action cannot be undone.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDistributing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDistribute}
            disabled={
              !confirmationChecked ||
              selectedInvestorIds.length === 0 ||
              isDistributing ||
              !walletWarning ||
              !allTokensMinted
            }
          >
            {isDistributing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Distributing...
              </>
            ) : (
              "Distribute Tokens"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TokenDistributionDialog;
