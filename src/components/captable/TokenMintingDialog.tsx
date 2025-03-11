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
import { Coins, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TokenSummary {
  tokenType: string;
  totalAmount: number;
  status: string;
}

interface TokenMintingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  tokenSummaries: TokenSummary[];
  onMintComplete: (tokenTypes: string[]) => void;
}

const TokenMintingDialog = ({
  open,
  onOpenChange,
  projectId,
  tokenSummaries = [],
  onMintComplete,
}: TokenMintingDialogProps) => {
  const [selectedTokenTypes, setSelectedTokenTypes] = useState<string[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle token type selection
  const handleTokenTypeSelection = (tokenType: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTokenTypes((prev) => [...prev, tokenType]);
    } else {
      setSelectedTokenTypes((prev) =>
        prev.filter((type) => type !== tokenType),
      );
    }
  };

  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedTokenTypes(
        tokenSummaries
          .filter((summary) => summary.status === "ready_to_mint")
          .map((summary) => summary.tokenType),
      );
    } else {
      setSelectedTokenTypes([]);
    }
  };

  // Handle mint tokens
  const handleMintTokens = async () => {
    if (!confirmationChecked || selectedTokenTypes.length === 0) return;

    try {
      setIsMinting(true);
      await onMintComplete(selectedTokenTypes);
      setSelectedTokenTypes([]);
      setConfirmationChecked(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error minting tokens:", error);
    } finally {
      setIsMinting(false);
    }
  };

  // Filter token types that are ready to mint
  const mintableTokenTypes = tokenSummaries.filter(
    (summary) => summary.status === "ready_to_mint",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <span>Mint Tokens</span>
          </DialogTitle>
          <DialogDescription>
            Mint tokens for confirmed allocations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Available Token Types</h3>
            {mintableTokenTypes.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={
                    selectedTokenTypes.length === mintableTokenTypes.length &&
                    mintableTokenTypes.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm">
                  Select All Ready to Mint
                </Label>
              </div>
            )}
          </div>

          {tokenSummaries.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No token types available for minting
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {tokenSummaries.map((summary) => (
                <div
                  key={summary.tokenType}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {summary.status === "ready_to_mint" && (
                        <Checkbox
                          id={`token-${summary.tokenType}`}
                          checked={selectedTokenTypes.includes(
                            summary.tokenType,
                          )}
                          onCheckedChange={(checked) =>
                            handleTokenTypeSelection(
                              summary.tokenType,
                              !!checked,
                            )
                          }
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{summary.tokenType}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(summary.totalAmount)}
                        </p>
                      </div>
                    </div>
                    {summary.status === "ready_to_mint" ? (
                      <Badge className="bg-green-100 text-green-800">
                        Ready to Mint
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Pending Confirmation
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-md border p-4 space-y-2 mt-4">
            <h3 className="text-sm font-medium">Minting Information</h3>
            <p className="text-sm text-muted-foreground">
              Minting tokens requires multi-signature approval and will make the
              tokens available for distribution to investors. Once minted,
              tokens will be held in the issuer's wallet until distributed to
              investors.
            </p>
          </div>

          {mintableTokenTypes.length > 0 && (
            <div className="flex items-start space-x-2 pt-4">
              <Checkbox
                id="mint-confirmation"
                checked={confirmationChecked}
                onCheckedChange={(checked) => setConfirmationChecked(!!checked)}
                disabled={selectedTokenTypes.length === 0}
              />
              <Label
                htmlFor="mint-confirmation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I confirm that I want to mint these tokens. This action requires
                multi-signature approval and cannot be undone.
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isMinting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleMintTokens}
            disabled={
              !confirmationChecked ||
              selectedTokenTypes.length === 0 ||
              isMinting
            }
          >
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting Tokens...
              </>
            ) : (
              "Mint Selected Tokens"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TokenMintingDialog;
