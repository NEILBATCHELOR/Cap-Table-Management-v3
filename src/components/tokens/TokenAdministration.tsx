import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Coins,
  Plus,
  Flame,
  Trash2,
  PauseCircle,
  PlayCircle,
  Lock,
  Unlock,
  UserX,
  UserCheck,
  ArrowLeft,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  Send,
  Clock,
  CheckSquare,
  XSquare,
} from "lucide-react";

interface TokenAdministrationProps {
  projectId?: string;
}

interface Token {
  id: string;
  project_id: string;
  name: string;
  symbol: string;
  decimals: number;
  standard: string;
  total_supply: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TokenHolder {
  id: string;
  investor_id: string;
  investor_name: string;
  wallet_address: string;
  token_amount: number;
  is_locked: boolean;
  is_blocked: boolean;
}

interface PendingRequest {
  id: string;
  action_type: string;
  requested_by: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected" | "executed";
  details: string;
  target_id?: string;
  amount?: number;
}

const TokenAdministration: React.FC<TokenAdministrationProps> = ({
  projectId: propProjectId,
}) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use projectId from props or from URL params
  const currentProjectId = propProjectId || paramProjectId;

  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tokenHolders, setTokenHolders] = useState<TokenHolder[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectName, setProjectName] = useState<string>("");

  // Form states
  const [mintForm, setMintForm] = useState({
    amount: 0,
    recipient: "",
  });

  const [burnForm, setBurnForm] = useState({
    amount: 0,
    source: "",
  });

  const [selectedHolders, setSelectedHolders] = useState<string[]>([]);
  const [lockReason, setLockReason] = useState("");
  const [blockReason, setBlockReason] = useState("");

  // Dialog states
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    details: any;
  } | null>(null);

  // Fetch tokens and project details when component mounts
  useEffect(() => {
    if (currentProjectId) {
      fetchTokens();
      fetchProjectDetails();
    }
  }, [currentProjectId]);

  // Fetch token holders when a token is selected
  useEffect(() => {
    if (selectedToken) {
      fetchTokenHolders(selectedToken.id);
      fetchPendingRequests(selectedToken.id);
    }
  }, [selectedToken]);

  // Fetch project details
  const fetchProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("name")
        .eq("id", currentProjectId)
        .single();

      if (error) throw error;
      setProjectName(data.name);
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  };

  // Fetch tokens for the current project
  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("tokens")
        .select("*")
        .eq("project_id", currentProjectId)
        .eq("status", "READY_TO_MINT")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTokens(data || []);

      // Select the first token by default if available
      if (data && data.length > 0 && !selectedToken) {
        setSelectedToken(data[0]);
      }
    } catch (err) {
      console.error("Error fetching tokens:", err);
      toast({
        title: "Error",
        description: "Failed to load tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch token holders
  const fetchTokenHolders = async (tokenId: string) => {
    try {
      setIsLoading(true);
      // In a real implementation, this would fetch actual token holders
      // For this demo, we'll create mock data
      const mockHolders: TokenHolder[] = [
        {
          id: "1",
          investor_id: "inv-1",
          investor_name: "John Smith",
          wallet_address: "0x1234...5678",
          token_amount: 10000,
          is_locked: false,
          is_blocked: false,
        },
        {
          id: "2",
          investor_id: "inv-2",
          investor_name: "Acme Corporation",
          wallet_address: "0xabcd...efgh",
          token_amount: 25000,
          is_locked: true,
          is_blocked: false,
        },
        {
          id: "3",
          investor_id: "inv-3",
          investor_name: "Jane Doe",
          wallet_address: "0x9876...5432",
          token_amount: 5000,
          is_locked: false,
          is_blocked: true,
        },
        {
          id: "4",
          investor_id: "inv-4",
          investor_name: "Global Investments Ltd",
          wallet_address: "0xijkl...mnop",
          token_amount: 50000,
          is_locked: false,
          is_blocked: false,
        },
        {
          id: "5",
          investor_id: "inv-5",
          investor_name: "Tech Ventures",
          wallet_address: "0xqrst...uvwx",
          token_amount: 15000,
          is_locked: false,
          is_blocked: false,
        },
      ];

      setTokenHolders(mockHolders);
    } catch (err) {
      console.error("Error fetching token holders:", err);
      toast({
        title: "Error",
        description: "Failed to load token holders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending requests
  const fetchPendingRequests = async (tokenId: string) => {
    try {
      // In a real implementation, this would fetch actual pending requests
      // For this demo, we'll create mock data
      const mockRequests: PendingRequest[] = [
        {
          id: "req-1",
          action_type: "mint",
          requested_by: "Admin User",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: "pending",
          details: "Mint 5,000 tokens to 0x1234...5678",
          amount: 5000,
        },
        {
          id: "req-2",
          action_type: "block",
          requested_by: "Admin User",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: "approved",
          details: "Block investor Jane Doe (0x9876...5432)",
          target_id: "inv-3",
        },
        {
          id: "req-3",
          action_type: "lock",
          requested_by: "Admin User",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: "executed",
          details: "Lock wallet for Acme Corporation (0xabcd...efgh)",
          target_id: "inv-2",
        },
      ];

      setPendingRequests(mockRequests);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    }
  };

  // Handle token selection
  const handleTokenSelect = (tokenId: string) => {
    const token = tokens.find((t) => t.id === tokenId);
    if (token) {
      setSelectedToken(token);
    }
  };

  // Handle mint request
  const handleMintRequest = () => {
    if (!selectedToken || mintForm.amount <= 0) return;

    setConfirmAction({
      type: "mint",
      details: {
        tokenId: selectedToken.id,
        amount: mintForm.amount,
        recipient: mintForm.recipient || "Issuer Wallet",
      },
    });
    setIsConfirmDialogOpen(true);
  };

  // Handle burn request
  const handleBurnRequest = () => {
    if (!selectedToken || burnForm.amount <= 0) return;

    setConfirmAction({
      type: "burn",
      details: {
        tokenId: selectedToken.id,
        amount: burnForm.amount,
        source: burnForm.source || "Issuer Wallet",
      },
    });
    setIsConfirmDialogOpen(true);
  };

  // Handle pause/unpause token
  const handlePauseToggle = () => {
    if (!selectedToken) return;

    const action = selectedToken.status === "PAUSED" ? "unpause" : "pause";
    setConfirmAction({
      type: action,
      details: {
        tokenId: selectedToken.id,
        tokenName: selectedToken.name,
      },
    });
    setIsConfirmDialogOpen(true);
  };

  // Handle lock wallet
  const handleLockWallet = () => {
    if (!selectedToken || selectedHolders.length === 0) return;

    setConfirmAction({
      type: "lock",
      details: {
        tokenId: selectedToken.id,
        holderIds: selectedHolders,
        reason: lockReason,
      },
    });
    setIsConfirmDialogOpen(true);
  };

  // Handle block investor
  const handleBlockInvestor = () => {
    if (!selectedToken || selectedHolders.length === 0) return;

    setConfirmAction({
      type: "block",
      details: {
        tokenId: selectedToken.id,
        holderIds: selectedHolders,
        reason: blockReason,
      },
    });
    setIsConfirmDialogOpen(true);
  };

  // Handle unblock investor
  const handleUnblockInvestor = (holderId: string) => {
    if (!selectedToken) return;

    setConfirmAction({
      type: "unblock",
      details: {
        tokenId: selectedToken.id,
        holderId: holderId,
      },
    });
    setIsConfirmDialogOpen(true);
  };

  // Handle unlock wallet
  const handleUnlockWallet = (holderId: string) => {
    if (!selectedToken) return;

    setConfirmAction({
      type: "unlock",
      details: {
        tokenId: selectedToken.id,
        holderId: holderId,
      },
    });
    setIsConfirmDialogOpen(true);
  };

  // Handle approve request
  const handleApproveRequest = (requestId: string) => {
    // In a real implementation, this would call an API to approve the request
    // For this demo, we'll update the local state
    setPendingRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "approved" } : req,
      ),
    );

    toast({
      title: "Request Approved",
      description: "The request has been approved and will be executed soon.",
    });
  };

  // Handle reject request
  const handleRejectRequest = (requestId: string) => {
    // In a real implementation, this would call an API to reject the request
    // For this demo, we'll update the local state
    setPendingRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "rejected" } : req,
      ),
    );

    toast({
      title: "Request Rejected",
      description: "The request has been rejected.",
    });
  };

  // Handle confirm action
  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      setIsLoading(true);
      // In a real implementation, this would call an API to submit the request
      // For this demo, we'll simulate the request submission

      // Create a new pending request
      const newRequest: PendingRequest = {
        id: `req-${Date.now()}`,
        action_type: confirmAction.type,
        requested_by: "Admin User",
        timestamp: new Date().toISOString(),
        status: "pending",
        details: getRequestDetails(confirmAction),
      };

      // Add amount or target_id if applicable
      if (confirmAction.type === "mint" || confirmAction.type === "burn") {
        newRequest.amount = confirmAction.details.amount;
      } else if (
        confirmAction.type === "lock" ||
        confirmAction.type === "block" ||
        confirmAction.type === "unlock" ||
        confirmAction.type === "unblock"
      ) {
        newRequest.target_id = Array.isArray(confirmAction.details.holderIds)
          ? confirmAction.details.holderIds[0]
          : confirmAction.details.holderId;
      }

      // Add the new request to the list
      setPendingRequests((prev) => [newRequest, ...prev]);

      // Update UI based on action type
      if (confirmAction.type === "pause") {
        setSelectedToken((prev) =>
          prev ? { ...prev, status: "PAUSED" } : null,
        );
      } else if (confirmAction.type === "unpause") {
        setSelectedToken((prev) =>
          prev ? { ...prev, status: "READY_TO_MINT" } : null,
        );
      } else if (
        confirmAction.type === "lock" &&
        confirmAction.details.holderIds
      ) {
        setTokenHolders((prev) =>
          prev.map((holder) =>
            confirmAction.details.holderIds.includes(holder.id)
              ? { ...holder, is_locked: true }
              : holder,
          ),
        );
      } else if (confirmAction.type === "unlock") {
        setTokenHolders((prev) =>
          prev.map((holder) =>
            holder.id === confirmAction.details.holderId
              ? { ...holder, is_locked: false }
              : holder,
          ),
        );
      } else if (
        confirmAction.type === "block" &&
        confirmAction.details.holderIds
      ) {
        setTokenHolders((prev) =>
          prev.map((holder) =>
            confirmAction.details.holderIds.includes(holder.id)
              ? { ...holder, is_blocked: true }
              : holder,
          ),
        );
      } else if (confirmAction.type === "unblock") {
        setTokenHolders((prev) =>
          prev.map((holder) =>
            holder.id === confirmAction.details.holderId
              ? { ...holder, is_blocked: false }
              : holder,
          ),
        );
      }

      // Reset form states
      if (confirmAction.type === "mint") {
        setMintForm({ amount: 0, recipient: "" });
      } else if (confirmAction.type === "burn") {
        setBurnForm({ amount: 0, source: "" });
      } else if (
        confirmAction.type === "lock" ||
        confirmAction.type === "block"
      ) {
        setSelectedHolders([]);
        setLockReason("");
        setBlockReason("");
      }

      toast({
        title: "Request Submitted",
        description: `Your ${confirmAction.type} request has been submitted for approval.`,
      });
    } catch (err) {
      console.error(`Error submitting ${confirmAction.type} request:`, err);
      toast({
        title: "Error",
        description: `Failed to submit ${confirmAction.type} request. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };

  // Get request details for display
  const getRequestDetails = (action: { type: string; details: any }) => {
    switch (action.type) {
      case "mint":
        return `Mint ${action.details.amount.toLocaleString()} tokens to ${action.details.recipient}`;
      case "burn":
        return `Burn ${action.details.amount.toLocaleString()} tokens from ${action.details.source}`;
      case "pause":
        return `Pause all transactions for ${action.details.tokenName}`;
      case "unpause":
        return `Resume transactions for ${action.details.tokenName}`;
      case "lock":
        const lockHolders = action.details.holderIds.map((id: string) => {
          const holder = tokenHolders.find((h) => h.id === id);
          return holder ? holder.investor_name : id;
        });
        return `Lock wallets for: ${lockHolders.join(", ")}${action.details.reason ? ` (Reason: ${action.details.reason})` : ""}`;
      case "unlock":
        const unlockHolder = tokenHolders.find(
          (h) => h.id === action.details.holderId,
        );
        return `Unlock wallet for ${unlockHolder ? unlockHolder.investor_name : action.details.holderId}`;
      case "block":
        const blockHolders = action.details.holderIds.map((id: string) => {
          const holder = tokenHolders.find((h) => h.id === id);
          return holder ? holder.investor_name : id;
        });
        return `Block investors: ${blockHolders.join(", ")}${action.details.reason ? ` (Reason: ${action.details.reason})` : ""}`;
      case "unblock":
        const unblockHolder = tokenHolders.find(
          (h) => h.id === action.details.holderId,
        );
        return `Unblock investor ${unblockHolder ? unblockHolder.investor_name : action.details.holderId}`;
      default:
        return "Unknown action";
    }
  };

  // Filter token holders based on search query
  const filteredHolders = tokenHolders.filter((holder) => {
    if (!searchQuery) return true;

    return (
      holder.investor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      holder.wallet_address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get blocked holders
  const blockedHolders = tokenHolders.filter((holder) => holder.is_blocked);

  // Get locked holders
  const lockedHolders = tokenHolders.filter((holder) => holder.is_locked);

  // Calculate token statistics
  const tokenStats = {
    totalSupply: selectedToken?.total_supply || 0,
    holdersCount: tokenHolders.length,
    blockedCount: blockedHolders.length,
    lockedCount: lockedHolders.length,
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  navigate(`/projects/${currentProjectId}/captable`)
                }
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">
                {projectName} Token Administration
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage token operations, compliance, and investor restrictions
            </p>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedToken?.id || ""}
              onValueChange={handleTokenSelect}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.id} value={token.id}>
                    {token.name} ({token.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                fetchTokens();
                if (selectedToken) {
                  fetchTokenHolders(selectedToken.id);
                  fetchPendingRequests(selectedToken.id);
                }
              }}
              disabled={isLoading}
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading && !selectedToken ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !selectedToken ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Coins className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Tokens Available</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                There are no tokens in the "Ready to Mint" state for this
                project. Configure a token in the Token Builder first.
              </p>
              <Button
                onClick={() => navigate(`/projects/${currentProjectId}/tokens`)}
              >
                Go to Token Builder
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Token Information Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      {selectedToken.name} ({selectedToken.symbol})
                    </CardTitle>
                    <CardDescription>
                      {selectedToken.standard} • {selectedToken.decimals}{" "}
                      decimals
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      selectedToken.status === "PAUSED"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {selectedToken.status === "PAUSED" ? "PAUSED" : "ACTIVE"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Total Supply
                    </p>
                    <p className="text-2xl font-bold">
                      {tokenStats.totalSupply.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Holders</p>
                    <p className="text-2xl font-bold">
                      {tokenStats.holdersCount}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Blocked Investors
                    </p>
                    <p className="text-2xl font-bold">
                      {tokenStats.blockedCount}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Locked Wallets
                    </p>
                    <p className="text-2xl font-bold">
                      {tokenStats.lockedCount}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    variant={
                      selectedToken.status === "PAUSED" ? "default" : "outline"
                    }
                    className="flex items-center gap-2"
                    onClick={handlePauseToggle}
                  >
                    {selectedToken.status === "PAUSED" ? (
                      <>
                        <PlayCircle className="h-4 w-4" />
                        <span>Resume Token</span>
                      </>
                    ) : (
                      <>
                        <PauseCircle className="h-4 w-4" />
                        <span>Pause Token</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="requests"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  <span>Pending Requests</span>
                </TabsTrigger>
                <TabsTrigger value="mint" className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  <span>Mint & Burn</span>
                </TabsTrigger>
                <TabsTrigger value="lock" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Lock & Block</span>
                </TabsTrigger>
                <TabsTrigger
                  value="unblock"
                  className="flex items-center gap-2"
                >
                  <Unlock className="h-4 w-4" />
                  <span>Unblock</span>
                </TabsTrigger>
              </TabsList>

              {/* Pending Requests Tab */}
              <TabsContent value="requests" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>
                      Review and approve token administration requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pendingRequests.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">
                          No pending requests
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Action</TableHead>
                              <TableHead>Requested By</TableHead>
                              <TableHead>Timestamp</TableHead>
                              <TableHead>Details</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={`
                                      ${request.action_type === "mint" ? "bg-green-100 text-green-800" : ""}
                                      ${request.action_type === "burn" ? "bg-red-100 text-red-800" : ""}
                                      ${request.action_type === "pause" || request.action_type === "lock" || request.action_type === "block" ? "bg-yellow-100 text-yellow-800" : ""}
                                      ${request.action_type === "unpause" || request.action_type === "unlock" || request.action_type === "unblock" ? "bg-blue-100 text-blue-800" : ""}
                                    `}
                                  >
                                    {request.action_type.toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell>{request.requested_by}</TableCell>
                                <TableCell>
                                  {new Date(request.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell>{request.details}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      request.status === "pending"
                                        ? "outline"
                                        : request.status === "approved"
                                          ? "default"
                                          : request.status === "executed"
                                            ? "secondary"
                                            : "destructive"
                                    }
                                  >
                                    {request.status.toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {request.status === "pending" && (
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        onClick={() =>
                                          handleApproveRequest(request.id)
                                        }
                                      >
                                        <CheckSquare className="h-4 w-4" />
                                        <span>Approve</span>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1 text-red-500"
                                        onClick={() =>
                                          handleRejectRequest(request.id)
                                        }
                                      >
                                        <XSquare className="h-4 w-4" />
                                        <span>Reject</span>
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Mint & Burn Tab */}
              <TabsContent value="mint" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mint Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-green-500" />
                        <span>Mint Tokens</span>
                      </CardTitle>
                      <CardDescription>
                        Create new tokens and assign them to a wallet
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="mint-amount">Amount to Mint</Label>
                          <Input
                            id="mint-amount"
                            type="number"
                            min="1"
                            placeholder="Enter amount"
                            value={mintForm.amount || ""}
                            onChange={(e) =>
                              setMintForm({
                                ...mintForm,
                                amount: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mint-recipient">
                            Recipient Wallet (Optional)
                          </Label>
                          <Input
                            id="mint-recipient"
                            placeholder="Enter wallet address or leave blank for issuer wallet"
                            value={mintForm.recipient}
                            onChange={(e) =>
                              setMintForm({
                                ...mintForm,
                                recipient: e.target.value,
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            If left blank, tokens will be minted to the issuer's
                            wallet
                          </p>
                        </div>
                        <Button
                          className="w-full mt-2"
                          onClick={handleMintRequest}
                          disabled={!mintForm.amount || mintForm.amount <= 0}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Submit Mint Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Burn Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-red-500" />
                        <span>Burn Tokens</span>
                      </CardTitle>
                      <CardDescription>
                        Remove tokens from circulation permanently
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="burn-amount">Amount to Burn</Label>
                          <Input
                            id="burn-amount"
                            type="number"
                            min="1"
                            placeholder="Enter amount"
                            value={burnForm.amount || ""}
                            onChange={(e) =>
                              setBurnForm({
                                ...burnForm,
                                amount: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="burn-source">
                            Source Wallet (Optional)
                          </Label>
                          <Input
                            id="burn-source"
                            placeholder="Enter wallet address or leave blank for issuer wallet"
                            value={burnForm.source}
                            onChange={(e) =>
                              setBurnForm({
                                ...burnForm,
                                source: e.target.value,
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            If left blank, tokens will be burned from the
                            issuer's wallet
                          </p>
                        </div>
                        <Button
                          className="w-full mt-2"
                          variant="destructive"
                          onClick={handleBurnRequest}
                          disabled={!burnForm.amount || burnForm.amount <= 0}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Submit Burn Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Lock & Block Tab */}
              <TabsContent value="lock" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Token Holders</CardTitle>
                        <CardDescription>
                          Select holders to lock wallets or block investors
                        </CardDescription>
                      </div>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search holders..."
                          className="pl-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                                  selectedHolders.length > 0 &&
                                  selectedHolders.length ===
                                    filteredHolders.length
                                }
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedHolders(
                                      filteredHolders.map((h) => h.id),
                                    );
                                  } else {
                                    setSelectedHolders([]);
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead>Investor</TableHead>
                            <TableHead>Wallet Address</TableHead>
                            <TableHead className="text-right">
                              Token Amount
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredHolders.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center py-4"
                              >
                                No token holders found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredHolders.map((holder) => (
                              <TableRow key={holder.id}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedHolders.includes(
                                      holder.id,
                                    )}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedHolders([
                                          ...selectedHolders,
                                          holder.id,
                                        ]);
                                      } else {
                                        setSelectedHolders(
                                          selectedHolders.filter(
                                            (id) => id !== holder.id,
                                          ),
                                        );
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {holder.investor_name}
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {holder.wallet_address}
                                </TableCell>
                                <TableCell className="text-right">
                                  {holder.token_amount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    {holder.is_locked && (
                                      <Badge
                                        variant="outline"
                                        className="bg-yellow-100 text-yellow-800"
                                      >
                                        LOCKED
                                      </Badge>
                                    )}
                                    {holder.is_blocked && (
                                      <Badge
                                        variant="outline"
                                        className="bg-red-100 text-red-800"
                                      >
                                        BLOCKED
                                      </Badge>
                                    )}
                                    {!holder.is_locked &&
                                      !holder.is_blocked && (
                                        <Badge
                                          variant="outline"
                                          className="bg-green-100 text-green-800"
                                        >
                                          ACTIVE
                                        </Badge>
                                      )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {holder.is_locked ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        onClick={() =>
                                          handleUnlockWallet(holder.id)
                                        }
                                      >
                                        <Unlock className="h-4 w-4" />
                                        <span>Unlock</span>
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        onClick={() => {
                                          setSelectedHolders([holder.id]);
                                          setLockReason("");
                                          handleLockWallet();
                                        }}
                                      >
                                        <Lock className="h-4 w-4" />
                                        <span>Lock</span>
                                      </Button>
                                    )}
                                    {holder.is_blocked ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        onClick={() =>
                                          handleUnblockInvestor(holder.id)
                                        }
                                      >
                                        <UserCheck className="h-4 w-4" />
                                        <span>Unblock</span>
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        onClick={() => {
                                          setSelectedHolders([holder.id]);
                                          setBlockReason("");
                                          handleBlockInvestor();
                                        }}
                                      >
                                        <UserX className="h-4 w-4" />
                                        <span>Block</span>
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {selectedHolders.length > 0 && (
                      <div className="mt-6 space-y-4">
                        <div className="bg-muted/20 p-4 rounded-md">
                          <p className="font-medium">
                            {selectedHolders.length} holder(s) selected
                          </p>
                          <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="lock-reason">
                                Lock Reason (Optional)
                              </Label>
                              <Input
                                id="lock-reason"
                                placeholder="Enter reason for locking wallets"
                                value={lockReason}
                                onChange={(e) => setLockReason(e.target.value)}
                              />
                            </div>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                              onClick={handleLockWallet}
                            >
                              <Lock className="h-4 w-4" />
                              <span>Lock Selected Wallets</span>
                            </Button>
                          </div>

                          <div className="mt-6 space-y-2">
                            <Label htmlFor="block-reason">
                              Block Reason (Optional)
                            </Label>
                            <Input
                              id="block-reason"
                              placeholder="Enter reason for blocking investors"
                              value={blockReason}
                              onChange={(e) => setBlockReason(e.target.value)}
                            />
                          </div>
                          <Button
                            variant="outline"
                            className="flex items-center gap-2 mt-4"
                            onClick={handleBlockInvestor}
                          >
                            <UserX className="h-4 w-4" />
                            <span>Block Selected Investors</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Unblock Tab */}
              <TabsContent value="unblock" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Blocked Investors */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserX className="h-5 w-5 text-red-500" />
                        <span>Blocked Investors</span>
                      </CardTitle>
                      <CardDescription>
                        Investors currently blocked from transactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {blockedHolders.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">
                            No blocked investors
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {blockedHolders.map((holder) => (
                            <div
                              key={holder.id}
                              className="flex justify-between items-center p-3 border rounded-md"
                            >
                              <div>
                                <p className="font-medium">
                                  {holder.investor_name}
                                </p>
                                <p className="text-xs font-mono">
                                  {holder.wallet_address}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => handleUnblockInvestor(holder.id)}
                              >
                                <UserCheck className="h-4 w-4" />
                                <span>Unblock</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Locked Wallets */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-yellow-500" />
                        <span>Locked Wallets</span>
                      </CardTitle>
                      <CardDescription>
                        Wallets currently locked from transfers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {lockedHolders.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">
                            No locked wallets
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {lockedHolders.map((holder) => (
                            <div
                              key={holder.id}
                              className="flex justify-between items-center p-3 border rounded-md"
                            >
                              <div>
                                <p className="font-medium">
                                  {holder.investor_name}
                                </p>
                                <p className="text-xs font-mono">
                                  {holder.wallet_address}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => handleUnlockWallet(holder.id)}
                              >
                                <Unlock className="h-4 w-4" />
                                <span>Unlock</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm{" "}
              {confirmAction?.type.charAt(0).toUpperCase() +
                confirmAction?.type.slice(1)}{" "}
              Request
            </DialogTitle>
            <DialogDescription>
              This action will be submitted for approval before execution.
            </DialogDescription>
          </DialogHeader>

          {confirmAction && (
            <div className="py-4">
              <div className="bg-muted/20 p-4 rounded-md">
                <p className="font-medium">Request Details:</p>
                <p className="mt-2">{getRequestDetails(confirmAction)}</p>
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  This request will go through the following process:
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>Validation by Guardian Policy Enforcement</li>
                  <li>Multi-signature approval by authorized approvers</li>
                  <li>Execution on the blockchain by Guardian Wallet</li>
                  <li>Notification to affected parties</li>
                </ol>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmDialogOpen(false);
                setConfirmAction(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmAction}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TokenAdministration;
