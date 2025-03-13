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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Coins,
  Plus,
  Save,
  Trash2,
  Copy,
  Code,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

interface TokenBuilderProps {
  projectId?: string;
}

interface Token {
  id: string;
  project_id: string;
  name: string;
  symbol: string;
  decimals: number;
  standard: string;
  blocks: any;
  metadata: any;
  status: string;
  contract_preview?: string;
  created_at: string;
  updated_at: string;
}

interface TokenTemplate {
  name: string;
  description: string;
  category: string;
  standard: string;
  defaultBlocks: any;
  icon: React.ReactNode;
}

const TOKEN_STANDARDS = [
  {
    value: "ERC-20",
    label: "ERC-20 (Fungible Token)",
    description:
      "Standard for fungible tokens where each token is identical and interchangeable",
    mandatoryFunctions: [
      "totalSupply()",
      "balanceOf(address)",
      "transfer(address,uint256)",
      "transferFrom(address,address,uint256)",
      "approve(address,uint256)",
      "allowance(address,address)",
    ],
    optionalFunctions: ["name()", "symbol()", "decimals()"],
    configOptions: [
      "Initial Supply",
      "Minting/Burning",
      "Pausable",
      "Access Control",
    ],
  },
  {
    value: "ERC-721",
    label: "ERC-721 (Non-Fungible Token)",
    description:
      "Standard for non-fungible tokens where each token is unique and not interchangeable",
    mandatoryFunctions: [
      "balanceOf(address)",
      "ownerOf(uint256)",
      "safeTransferFrom(address,address,uint256)",
      "transferFrom(address,address,uint256)",
      "approve(address,uint256)",
      "getApproved(uint256)",
      "setApprovalForAll(address,bool)",
      "isApprovedForAll(address,address)",
    ],
    optionalFunctions: ["name()", "symbol()", "tokenURI(uint256)"],
    configOptions: ["Base URI", "Minting", "Royalties", "Metadata Storage"],
  },
  {
    value: "ERC-1155",
    label: "ERC-1155 (Multi Token)",
    description:
      "Standard for contracts that manage multiple token types (both fungible and non-fungible)",
    mandatoryFunctions: [
      "balanceOf(address,uint256)",
      "balanceOfBatch(address[],uint256[])",
      "setApprovalForAll(address,bool)",
      "isApprovedForAll(address,address)",
      "safeTransferFrom(address,address,uint256,uint256,bytes)",
      "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)",
    ],
    optionalFunctions: ["uri(uint256)"],
    configOptions: ["URI", "Minting", "Batch Operations", "Supply Tracking"],
  },
  {
    value: "ERC-1400",
    label: "ERC-1400 (Security Token)",
    description:
      "Standard for security tokens with transfer restrictions and compliance controls",
    mandatoryFunctions: [
      "getDocument(bytes32)",
      "setDocument(bytes32,string,bytes32)",
      "isControllable()",
      "isIssuable()",
      "canTransferByPartition(bytes32,address,address,uint256,bytes)",
      "transferByPartition(bytes32,address,uint256,bytes)",
    ],
    optionalFunctions: [
      "controllers()",
      "authorizeOperator(address)",
      "revokeOperator(address)",
      "isOperator(address,address)",
    ],
    configOptions: [
      "Partitions",
      "Transfer Restrictions",
      "Document Management",
      "Compliance Controls",
    ],
  },
  {
    value: "ERC-3525",
    label: "ERC-3525 (Semi-Fungible Token)",
    description:
      "Standard for semi-fungible tokens with slot-based value system",
    mandatoryFunctions: [
      "balanceOf(address)",
      "ownerOf(uint256)",
      "transferFrom(address,address,uint256)",
      "slotOf(uint256)",
      "valueDecimals()",
      "valueOf(uint256)",
      "transferValueFrom(uint256,uint256,uint256)",
    ],
    optionalFunctions: ["name()", "symbol()", "slotURI(uint256)"],
    configOptions: ["Slots", "Values", "Decimals", "Tranches"],
  },
  {
    value: "ERC-4626",
    label: "ERC-4626 (Tokenized Vault)",
    description: "Standard for tokenized yield-bearing vaults",
    mandatoryFunctions: [
      "asset()",
      "totalAssets()",
      "convertToShares(uint256)",
      "convertToAssets(uint256)",
      "maxDeposit(address)",
      "previewDeposit(uint256)",
      "deposit(uint256,address)",
      "maxMint(address)",
      "previewMint(uint256)",
      "mint(uint256,address)",
      "maxWithdraw(address)",
      "previewWithdraw(uint256)",
      "withdraw(uint256,address,address)",
      "maxRedeem(address)",
      "previewRedeem(uint256)",
      "redeem(uint256,address,address)",
    ],
    optionalFunctions: [],
    configOptions: [
      "Underlying Asset",
      "Yield Strategy",
      "Deposit/Withdrawal Limits",
      "Fee Structure",
    ],
  },
];

const PRODUCT_CATEGORIES = [
  {
    name: "Traditional Assets",
    products: [
      "Structured Products",
      "Equity",
      "Commodities",
      "Funds, ETFs, ETPs",
      "Bonds",
      "Quantitative Investment Strategies",
    ],
  },
  {
    name: "Alternative Assets",
    products: [
      "Private Equity",
      "Private Debt",
      "Real Estate",
      "Energy",
      "Infrastructure",
      "Collectibles & all other assets",
    ],
  },
  {
    name: "Digital Assets",
    products: ["Digital Tokenised Fund"],
  },
];

const TOKEN_TEMPLATES: TokenTemplate[] = [
  {
    name: "Equity Token",
    description: "Standard equity token with voting rights and dividends",
    category: "Equity",
    standard: "ERC-1400",
    defaultBlocks: {
      compliance: ["KYC", "AML", "Accredited Investors Only"],
      features: ["Voting", "Dividends", "Transfer Restrictions"],
      governance: ["Board Approval"],
    },
    icon: <Coins className="h-8 w-8 text-blue-500" />,
  },
  {
    name: "Real Estate Token",
    description: "Token representing fractional ownership of real estate",
    category: "Real Estate",
    standard: "ERC-1400",
    defaultBlocks: {
      compliance: ["KYC", "AML", "Accredited Investors Only"],
      features: ["Rental Income", "Transfer Restrictions", "Redemption Rights"],
      governance: ["Manager Approval"],
    },
    icon: <Coins className="h-8 w-8 text-green-500" />,
  },
  {
    name: "Bond Token",
    description: "Fixed income security with regular coupon payments",
    category: "Bonds",
    standard: "ERC-20",
    defaultBlocks: {
      compliance: ["KYC", "AML"],
      features: ["Fixed Interest", "Maturity Date", "Early Redemption"],
      governance: ["Issuer Control"],
    },
    icon: <Coins className="h-8 w-8 text-purple-500" />,
  },
  {
    name: "Fund Token",
    description: "Token representing shares in an investment fund",
    category: "Funds, ETFs, ETPs",
    standard: "ERC-4626 + ERC-1400",
    defaultBlocks: {
      compliance: [
        "KYC",
        "AML",
        "Investor Qualification",
        "Whitelist",
        "Jurisdiction Restrictions",
      ],
      features: [
        "NAV Calculation",
        "Redemption Windows",
        "Management Fee",
        "Deposit Limits",
        "Withdrawal Limits",
        "Yield Strategy",
      ],
      governance: ["Fund Manager Control"],
    },
    icon: <Coins className="h-8 w-8 text-amber-500" />,
  },
  {
    name: "Structured Product Token",
    description:
      "Complex financial product with conditional returns and multiple tranches",
    category: "Structured Products",
    standard: "ERC-3525",
    defaultBlocks: {
      compliance: [
        "KYC",
        "AML",
        "Sophisticated Investors Only",
        "Jurisdiction Restrictions",
      ],
      features: [
        "Conditional Returns",
        "Barrier Levels",
        "Underlying Asset Linkage",
        "Tranche Structure",
        "Maturity Date",
      ],
      governance: ["Issuer Control"],
    },
    icon: <Coins className="h-8 w-8 text-red-500" />,
  },
  {
    name: "Credit Linked Note",
    description:
      "Structured product linked to credit performance of underlying assets",
    category: "Structured Products",
    standard: "ERC-3525",
    defaultBlocks: {
      compliance: [
        "KYC",
        "AML",
        "Accredited Investors Only",
        "Jurisdiction Restrictions",
      ],
      features: [
        "Tranche Structure",
        "Interest Rate",
        "Maturity Date",
        "Credit Event Triggers",
      ],
      governance: ["Issuer Control"],
    },
    icon: <Coins className="h-8 w-8 text-orange-500" />,
  },
];

const BUILDING_BLOCKS = {
  compliance: [
    { id: "kyc", name: "KYC", description: "Know Your Customer verification" },
    {
      id: "aml",
      name: "AML",
      description: "Anti-Money Laundering checks",
    },
    {
      id: "accredited",
      name: "Accredited Investors Only",
      description: "Restrict to accredited/qualified investors",
    },
    {
      id: "jurisdiction",
      name: "Jurisdiction Restrictions",
      description: "Restrict based on investor jurisdiction",
    },
    {
      id: "max_investors",
      name: "Maximum Investors",
      description: "Limit the total number of investors",
    },
  ],
  features: [
    {
      id: "voting",
      name: "Voting",
      description: "Enable governance voting rights",
    },
    {
      id: "dividends",
      name: "Dividends",
      description: "Enable dividend/distribution payments",
    },
    {
      id: "transfer_restrictions",
      name: "Transfer Restrictions",
      description: "Restrict token transfers based on rules",
    },
    {
      id: "redemption",
      name: "Redemption Rights",
      description: "Allow token redemption under specific conditions",
    },
    {
      id: "lockup",
      name: "Lockup Period",
      description: "Enforce token lockup periods",
    },
    {
      id: "vesting",
      name: "Vesting Schedule",
      description: "Implement token vesting schedules",
    },
  ],
  governance: [
    {
      id: "issuer_control",
      name: "Issuer Control",
      description: "Issuer maintains full control over token",
    },
    {
      id: "board_approval",
      name: "Board Approval",
      description: "Require board approval for certain actions",
    },
    {
      id: "dao",
      name: "DAO Governance",
      description: "Decentralized Autonomous Organization governance",
    },
    {
      id: "multi_sig",
      name: "Multi-Signature",
      description: "Require multiple signatures for key actions",
    },
  ],
};

const TokenBuilder: React.FC<TokenBuilderProps> = ({
  projectId: propProjectId,
}) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use projectId from props or from URL params
  const currentProjectId = propProjectId || paramProjectId;

  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tokens");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TokenTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");

  // New token form state
  const [tokenForm, setTokenForm] = useState({
    name: "",
    symbol: "",
    decimals: 18,
    standard: "ERC-20",
    totalSupply: 1000000,
    blocks: {
      compliance: [] as string[],
      features: [] as string[],
      governance: [] as string[],
    },
    metadata: {
      description: "",
      category: "",
      product: "",
      issuanceDate: "",
      maturityDate: "",
      tranches: [] as {
        id: number;
        name: string;
        value: number;
        interestRate: number;
      }[],
      whitelistEnabled: true,
      jurisdictionRestrictions: [] as string[],
      conversionRate: 0,
      // Fund & ETF specific fields
      underlyingAsset: "ETH",
      yieldStrategy: "STAKING",
      minDeposit: "1000",
      maxDeposit: "1000000",
      redemptionNoticeDays: "30",
      managementFee: "2.0",
      navOracleEnabled: false,
      erc20ConversionRate: "1.0",
    },
  });

  // Fetch tokens when component mounts
  useEffect(() => {
    if (currentProjectId) {
      fetchTokens();
      fetchProjectDetails();
    }
  }, [currentProjectId]);

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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTokens(data || []);
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

  // Handle token selection
  const handleSelectToken = async (token: Token) => {
    setSelectedToken(token);
    setActiveTab("builder");
    setTokenForm({
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      standard: token.standard,
      blocks: token.blocks || {
        compliance: [],
        features: [],
        governance: [],
      },
      metadata: token.metadata || {
        description: "",
        category: "",
        product: "",
      },
    });
  };

  // Handle creating a new token
  const handleCreateToken = () => {
    setSelectedToken(null);
    setIsCreating(true);
    setActiveTab("templates");
    resetTokenForm();
  };

  // Reset token form
  const resetTokenForm = () => {
    setTokenForm({
      name: "",
      symbol: "",
      decimals: 18,
      standard: "ERC-20",
      totalSupply: 1000000,
      blocks: {
        compliance: [],
        features: [],
        governance: [],
      },
      metadata: {
        description: "",
        category: "",
        product: "",
        issuanceDate: "",
        maturityDate: "",
        tranches: [],
        whitelistEnabled: true,
        jurisdictionRestrictions: [],
        conversionRate: 0,
        underlyingAsset: "ETH",
        yieldStrategy: "STAKING",
        minDeposit: "1000",
        maxDeposit: "1000000",
        redemptionNoticeDays: "30",
        managementFee: "2.0",
        navOracleEnabled: false,
        erc20ConversionRate: "1.0",
      },
    });
    setSelectedTemplate(null);
    setSelectedCategory("");
    setSelectedProduct("");
  };

  // Handle selecting a template
  const handleSelectTemplate = (template: TokenTemplate) => {
    setSelectedTemplate(template);

    // Default tranches for structured products
    const defaultTranches =
      template.name.includes("Structured Product") ||
      template.name.includes("Credit Linked")
        ? [
            { id: 1, name: "Senior (AAA)", value: 700000, interestRate: 3 },
            { id: 2, name: "Mezzanine (BBB)", value: 200000, interestRate: 5 },
            { id: 3, name: "Junior (CCC)", value: 100000, interestRate: 8 },
          ]
        : [];

    // Default name and symbol for templates
    let defaultName = "";
    let defaultSymbol = "";

    if (template.name === "Credit Linked Note") {
      defaultName = "CreditLinkedNote2025";
      defaultSymbol = "CLN";
    } else if (template.name === "Fund Token") {
      defaultName = "YieldFund2025";
      defaultSymbol = "YF";
    }

    setTokenForm({
      name: defaultName,
      symbol: defaultSymbol,
      decimals: template.standard === "ERC-3525" ? 0 : 18, // 0 decimals for structured products
      standard: template.standard,
      totalSupply: 1000000,
      blocks: template.defaultBlocks,
      metadata: {
        description: "",
        category: template.category,
        product: template.name,
        issuanceDate: new Date().toISOString().split("T")[0],
        maturityDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 5),
        )
          .toISOString()
          .split("T")[0],
        tranches: defaultTranches,
        whitelistEnabled: true,
        jurisdictionRestrictions: [],
        conversionRate: 100,
        underlyingAsset: "ETH",
        yieldStrategy: "STAKING",
        minDeposit: "1000",
        maxDeposit: "1000000",
        redemptionNoticeDays: "30",
        managementFee: "2.0",
        navOracleEnabled: false,
        erc20ConversionRate: "1.0",
      },
    });
    setActiveTab("builder");
  };

  // Handle selecting a product category
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedProduct("");
  };

  // Handle selecting a product
  const handleSelectProduct = (product: string) => {
    setSelectedProduct(product);
    // Find matching templates
    const matchingTemplates = TOKEN_TEMPLATES.filter(
      (template) => template.category === product,
    );
    if (matchingTemplates.length === 1) {
      handleSelectTemplate(matchingTemplates[0]);
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setTokenForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle token standard change
  const handleStandardChange = (value: string) => {
    setTokenForm((prev) => ({ ...prev, standard: value }));
  };

  // Handle building block toggle
  const handleBlockToggle = (
    blockType: "compliance" | "features" | "governance",
    blockId: string,
  ) => {
    setTokenForm((prev) => {
      const blocks = { ...prev.blocks };
      if (blocks[blockType].includes(blockId)) {
        blocks[blockType] = blocks[blockType].filter((id) => id !== blockId);
      } else {
        blocks[blockType] = [...blocks[blockType], blockId];
      }
      return { ...prev, blocks };
    });
  };

  // Save token to database
  const saveToken = async () => {
    try {
      setIsSaving(true);

      // Validate form
      if (!tokenForm.name || !tokenForm.symbol || !tokenForm.standard) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Generate contract preview (simplified for demo)
      const contractPreview = generateContractPreview();

      if (selectedToken) {
        // Update existing token
        const { error } = await supabase
          .from("tokens")
          .update({
            name: tokenForm.name,
            symbol: tokenForm.symbol,
            decimals: tokenForm.decimals,
            standard: tokenForm.standard,
            blocks: tokenForm.blocks,
            metadata: tokenForm.metadata,
            contract_preview: contractPreview,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedToken.id);

        if (error) throw error;

        // Create a new version
        await supabase.from("token_versions").insert({
          token_id: selectedToken.id,
          version: 1, // In a real app, you'd increment this
          data: {
            name: tokenForm.name,
            symbol: tokenForm.symbol,
            decimals: tokenForm.decimals,
            standard: tokenForm.standard,
            blocks: tokenForm.blocks,
            metadata: tokenForm.metadata,
          },
          created_at: new Date().toISOString(),
        });

        toast({
          title: "Success",
          description: "Token updated successfully.",
        });
      } else {
        // Create new token
        const { data, error } = await supabase
          .from("tokens")
          .insert({
            project_id: currentProjectId,
            name: tokenForm.name,
            symbol: tokenForm.symbol,
            decimals: tokenForm.decimals,
            standard: tokenForm.standard,
            blocks: tokenForm.blocks,
            metadata: tokenForm.metadata,
            status: "DRAFT",
            contract_preview: contractPreview,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        // Create initial version
        await supabase.from("token_versions").insert({
          token_id: data.id,
          version: 1,
          data: {
            name: tokenForm.name,
            symbol: tokenForm.symbol,
            decimals: tokenForm.decimals,
            standard: tokenForm.standard,
            blocks: tokenForm.blocks,
            metadata: tokenForm.metadata,
          },
          created_at: new Date().toISOString(),
        });

        setSelectedToken(data);
        toast({
          title: "Success",
          description: "Token created successfully.",
        });
      }

      // Refresh tokens list
      fetchTokens();
      setIsCreating(false);
    } catch (err) {
      console.error("Error saving token:", err);
      toast({
        title: "Error",
        description: "Failed to save token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete token
  const deleteToken = async (tokenId: string) => {
    try {
      const { error } = await supabase
        .from("tokens")
        .delete()
        .eq("id", tokenId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Token deleted successfully.",
      });

      // Refresh tokens list and reset selection
      fetchTokens();
      setSelectedToken(null);
      setActiveTab("tokens");
    } catch (err) {
      console.error("Error deleting token:", err);
      toast({
        title: "Error",
        description: "Failed to delete token. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate contract preview (simplified)
  const generateContractPreview = () => {
    const { name, symbol, standard, blocks, metadata, totalSupply, decimals } =
      tokenForm;
    let preview = "";

    if (standard === "ERC-20") {
      preview = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${name.replace(/\s+/g, "")} is ERC20, Ownable {
    constructor() ERC20("${name}", "${symbol}") {
        // Initial setup
        _mint(msg.sender, ${totalSupply} * 10**${decimals});
    }
`;

      // Add compliance features
      if (blocks.compliance.includes("KYC")) {
        preview += `
    // KYC Implementation
    mapping(address => bool) private _kycApproved;
    
    function setKycStatus(address account, bool status) external onlyOwner {
        _kycApproved[account] = status;
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        super._beforeTokenTransfer(from, to, amount);
        require(from == address(0) || _kycApproved[from], "KYC not approved for sender");
        require(to == address(0) || _kycApproved[to], "KYC not approved for recipient");
    }
`;
      }

      // Add features
      if (blocks.features.includes("Dividends")) {
        preview += `
    // Dividend Distribution
    function distributeTokenDividends(uint256 amount) external onlyOwner {
        // Dividend distribution logic
    }
`;
      }

      preview += "}"; // Close contract
    } else if (standard === "ERC-1400") {
      preview = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${name.replace(/\s+/g, "")} is ERC20, Ownable {
    // ERC-1400 Security Token Implementation
    constructor() ERC20("${name}", "${symbol}") {
        // Initial setup
        _mint(msg.sender, ${totalSupply} * 10**${decimals});
    }
`;

      // Add compliance features
      if (blocks.compliance.length > 0) {
        preview += `
    // Compliance Controls
    mapping(address => bool) private _whitelisted;
    ${metadata.whitelistEnabled ? "bool private _whitelistEnabled = true;" : "bool private _whitelistEnabled = false;"}
    
    function setWhitelistStatus(address account, bool status) external onlyOwner {
        _whitelisted[account] = status;
    }
    
    function setWhitelistEnabled(bool enabled) external onlyOwner {
        _whitelistEnabled = enabled;
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        super._beforeTokenTransfer(from, to, amount);
        if (_whitelistEnabled) {
            require(from == address(0) || _whitelisted[from], "Sender not whitelisted");
            require(to == address(0) || _whitelisted[to], "Recipient not whitelisted");
        }
    }
`;
      }

      // Add jurisdiction restrictions if any
      if (
        metadata.jurisdictionRestrictions &&
        metadata.jurisdictionRestrictions.length > 0
      ) {
        preview += `
    // Jurisdiction Restrictions
    mapping(string => bool) private _restrictedJurisdictions;
    
    constructor() {
        ${metadata.jurisdictionRestrictions.map((j) => `_restrictedJurisdictions["${j}"] = true;`).join("\n        ")}
    }
    
    function setJurisdictionRestriction(string memory jurisdiction, bool restricted) external onlyOwner {
        _restrictedJurisdictions[jurisdiction] = restricted;
    }
    
    function isJurisdictionRestricted(string memory jurisdiction) public view returns (bool) {
        return _restrictedJurisdictions[jurisdiction];
    }
`;
      }

      preview += "}"; // Close contract
    } else if (standard === "ERC-3525") {
      preview = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${name.replace(/\s+/g, "")} is ERC721Enumerable, Ownable {
    // ERC-3525 Semi-Fungible Token Implementation for Structured Products
    
    // Token details
    string private _name = "${name}";
    string private _symbol = "${symbol}";
    uint8 private _decimals = ${decimals};
    uint256 private _totalSupply = ${totalSupply};
    
    // Tranche/Slot structure
    struct Tranche {
        uint256 slotId;
        string name;
        uint256 value;
        uint256 interestRate; // Basis points (1% = 100)
    }
    
    // Mapping from slot ID to tranche details
    mapping(uint256 => Tranche) private _tranches;
    
    // Mapping from token ID to slot ID
    mapping(uint256 => uint256) private _tokenSlots;
    
    // Mapping from token ID to value
    mapping(uint256 => uint256) private _tokenValues;
    
    // Issuance and maturity dates
    uint256 private _issuanceDate = ${metadata.issuanceDate ? `${new Date(metadata.issuanceDate).getTime() / 1000}` : "block.timestamp"};
    uint256 private _maturityDate = ${metadata.maturityDate ? `${new Date(metadata.maturityDate).getTime() / 1000}` : "block.timestamp + 157680000"}; // Default: 5 years
    
    // Conversion rate to ERC-20
    uint256 private _conversionRate = ${metadata.conversionRate || 100};
    
    // Events
    event SlotCreated(uint256 indexed slotId, string name, uint256 value, uint256 interestRate);
    event TokenMinted(address indexed to, uint256 indexed tokenId, uint256 indexed slotId, uint256 value);
    
    constructor() ERC721("${name}", "${symbol}") {
        // Initialize tranches
${metadata.tranches.map((tranche) => `        _createTranche(${tranche.id}, "${tranche.name}", ${tranche.value}, ${tranche.interestRate * 100});`).join("\n")}
    }
    
    function _createTranche(uint256 slotId, string memory name, uint256 value, uint256 interestRate) internal {
        require(_tranches[slotId].slotId == 0, "Tranche already exists");
        _tranches[slotId] = Tranche(slotId, name, value, interestRate);
        emit SlotCreated(slotId, name, value, interestRate);
    }
    
    function mintToken(address to, uint256 slotId, uint256 value) external onlyOwner {
        require(_tranches[slotId].slotId != 0, "Tranche does not exist");
        require(value > 0, "Value must be greater than 0");
        
        uint256 tokenId = totalSupply() + 1;
        _mint(to, tokenId);
        _tokenSlots[tokenId] = slotId;
        _tokenValues[tokenId] = value;
        
        emit TokenMinted(to, tokenId, slotId, value);
    }
    
    function getTokenSlot(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenSlots[tokenId];
    }
    
    function getTokenValue(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenValues[tokenId];
    }
    
    function getTrancheDetails(uint256 slotId) external view returns (string memory, uint256, uint256) {
        require(_tranches[slotId].slotId != 0, "Tranche does not exist");
        Tranche memory tranche = _tranches[slotId];
        return (tranche.name, tranche.value, tranche.interestRate);
    }
    
    function getMaturityDate() external view returns (uint256) {
        return _maturityDate;
    }
    
    function getIssuanceDate() external view returns (uint256) {
        return _issuanceDate;
    }
    
    function getConversionRate() external view returns (uint256) {
        return _conversionRate;
    }
`;

      // Add compliance features
      if (blocks.compliance.length > 0) {
        preview += `
    // Compliance Controls
    mapping(address => bool) private _whitelisted;
    ${metadata.whitelistEnabled ? "bool private _whitelistEnabled = true;" : "bool private _whitelistEnabled = false;"}
    
    function setWhitelistStatus(address account, bool status) external onlyOwner {
        _whitelisted[account] = status;
    }
    
    function setWhitelistEnabled(bool enabled) external onlyOwner {
        _whitelistEnabled = enabled;
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override {
        super._beforeTokenTransfer(from, to, tokenId);
        if (_whitelistEnabled) {
            require(from == address(0) || _whitelisted[from], "Sender not whitelisted");
            require(to == address(0) || _whitelisted[to], "Recipient not whitelisted");
        }
    }
`;
      }

      preview += "}"; // Close contract
    }

    return preview;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/projects/${currentProjectId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Token Builder</h1>
          </div>
          <p className="text-muted-foreground">
            Design and structure tokenized assets for {projectName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => fetchTokens()}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={handleCreateToken}
          >
            <Plus className="h-4 w-4" />
            <span>New Token</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span>My Tokens</span>
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="flex items-center gap-2"
            disabled={!isCreating && !selectedToken}
          >
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger
            value="builder"
            className="flex items-center gap-2"
            disabled={!isCreating && !selectedToken}
          >
            <Code className="h-4 w-4" />
            <span>Token Builder</span>
          </TabsTrigger>
        </TabsList>

        {/* Tokens List Tab */}
        <TabsContent value="tokens" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tokens.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Coins className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Tokens Yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  You haven't created any tokens for this project. Get started
                  by creating your first token.
                </p>
                <Button onClick={handleCreateToken}>
                  <Plus className="h-4 w-4 mr-2" /> Create Token
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tokens.map((token) => (
                <Card
                  key={token.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectToken(token)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{token.name}</CardTitle>
                        <CardDescription>{token.symbol}</CardDescription>
                      </div>
                      <div>
                        <Badge
                          variant={
                            token.status === "DRAFT" ? "outline" : "default"
                          }
                        >
                          {token.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Standard
                          </p>
                          <p className="font-medium">{token.standard}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Decimals
                          </p>
                          <p className="font-medium">{token.decimals}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Building Blocks
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {token.blocks?.compliance?.map((block: string) => (
                            <Badge key={block} variant="secondary">
                              {block}
                            </Badge>
                          ))}
                          {token.blocks?.features
                            ?.slice(0, 2)
                            .map((block: string) => (
                              <Badge key={block} variant="secondary">
                                {block}
                              </Badge>
                            ))}
                          {(token.blocks?.features?.length > 2 ||
                            token.blocks?.governance?.length > 0) && (
                            <Badge variant="secondary">+more</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <p className="text-xs text-muted-foreground">
                          Created{" "}
                          {new Date(token.created_at).toLocaleDateString()}
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Token</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this token? This
                                action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteToken(token.id);
                                }}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Product Category</CardTitle>
              <CardDescription>
                Choose a financial product category to see relevant templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PRODUCT_CATEGORIES.map((category) => (
                  <Card
                    key={category.name}
                    className={`cursor-pointer hover:border-primary transition-colors ${selectedCategory === category.name ? "border-primary bg-primary/5" : ""}`}
                    onClick={() => handleSelectCategory(category.name)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {category.products.map((product) => (
                          <li key={product}>{product}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle>Select Product Type</CardTitle>
                <CardDescription>
                  Choose a specific product type within {selectedCategory}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {PRODUCT_CATEGORIES.find(
                    (cat) => cat.name === selectedCategory,
                  )?.products.map((product) => (
                    <Button
                      key={product}
                      variant={
                        selectedProduct === product ? "default" : "outline"
                      }
                      className="h-auto py-3 justify-start"
                      onClick={() => handleSelectProduct(product)}
                    >
                      {product}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedProduct && (
            <Card>
              <CardHeader>
                <CardTitle>Select Template</CardTitle>
                <CardDescription>
                  Choose a template for your {selectedProduct} token
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {TOKEN_TEMPLATES.filter(
                    (template) => template.category === selectedProduct,
                  ).map((template) => (
                    <Card
                      key={template.name}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {template.name}
                          </CardTitle>
                          {template.icon}
                        </div>
                        <CardDescription>
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Recommended Standard
                            </p>
                            <p className="font-medium">{template.standard}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Default Building Blocks
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {template.defaultBlocks.compliance
                                .slice(0, 2)
                                .map((block: string) => (
                                  <Badge key={block} variant="secondary">
                                    {block}
                                  </Badge>
                                ))}
                              {template.defaultBlocks.features
                                .slice(0, 2)
                                .map((block: string) => (
                                  <Badge key={block} variant="secondary">
                                    {block}
                                  </Badge>
                                ))}
                              {template.defaultBlocks.compliance.length +
                                template.defaultBlocks.features.length +
                                template.defaultBlocks.governance.length >
                                4 && <Badge variant="secondary">+more</Badge>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Custom Template Option */}
                  <Card
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          category: selectedCategory,
                          product: selectedProduct,
                        },
                      }));
                      setActiveTab("builder");
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          Custom Template
                        </CardTitle>
                        <Plus className="h-8 w-8 text-primary" />
                      </div>
                      <CardDescription>
                        Create a custom token from scratch
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Choose your own configuration
                          </p>
                          <p className="font-medium">Full customization</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Select your own building blocks
                          </p>
                          <Button
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => setActiveTab("builder")}
                          >
                            Start Building
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedToken ? "Edit Token" : "Create New Token"}
              </CardTitle>
              <CardDescription>
                {selectedToken
                  ? `Editing ${selectedToken.name} (${selectedToken.symbol})`
                  : "Configure your token properties"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Basic Token Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="standard">Token Standard</Label>
                    <Select
                      value={tokenForm.standard}
                      onValueChange={handleStandardChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a token standard" />
                      </SelectTrigger>
                      <SelectContent>
                        {TOKEN_STANDARDS.map((standard) => (
                          <SelectItem
                            key={standard.value}
                            value={standard.value}
                          >
                            {standard.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {tokenForm.standard && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {
                          TOKEN_STANDARDS.find(
                            (s) => s.value === tokenForm.standard,
                          )?.description
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* ERC-20 Configuration */}
                {tokenForm.standard === "ERC-20" && (
                  <div className="space-y-6 border-t pt-6">
                    <h3 className="text-lg font-medium">
                      ERC-20 Token Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Token Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., MyToken"
                          value={tokenForm.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="symbol">Token Symbol</Label>
                        <Input
                          id="symbol"
                          name="symbol"
                          placeholder="e.g., MTK"
                          value={tokenForm.symbol}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="decimals">Decimals</Label>
                        <Input
                          id="decimals"
                          name="decimals"
                          type="number"
                          min="0"
                          max="18"
                          placeholder="18"
                          value={tokenForm.decimals}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalSupply">Total Supply</Label>
                        <Input
                          id="totalSupply"
                          name="totalSupply"
                          type="number"
                          min="1"
                          placeholder="1000000"
                          value={tokenForm.totalSupply}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              totalSupply: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerAddress">
                          Owner Address (ETH Wallet)
                        </Label>
                        <Input
                          id="ownerAddress"
                          name="ownerAddress"
                          placeholder="0x..."
                          value={tokenForm.metadata.ownerAddress || ""}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                ownerAddress: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-medium">Token Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mintable"
                            checked={tokenForm.metadata.mintable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  mintable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="mintable">Mintable</Label>
                            <p className="text-xs text-muted-foreground">
                              Allow creation of new tokens
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="burnable"
                            checked={tokenForm.metadata.burnable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  burnable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="burnable">Burnable</Label>
                            <p className="text-xs text-muted-foreground">
                              Allow tokens to be destroyed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pausable"
                            checked={tokenForm.metadata.pausable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  pausable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="pausable">Pausable</Label>
                            <p className="text-xs text-muted-foreground">
                              Enable emergency stop functionality
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="transferRestrictions"
                            checked={
                              tokenForm.metadata.transferRestrictions || false
                            }
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  transferRestrictions: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="transferRestrictions">
                              Transfer Restrictions
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Limit transfers based on rules
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6 border-t pt-6">
                      <h4 className="font-medium">ERC-20 Metadata Editor</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="description">Description*</Label>
                          <Input
                            id="description"
                            placeholder="Token description"
                            value={tokenForm.metadata.description || ""}
                            onChange={(e) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  description: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="externalUrl">External URL</Label>
                          <Input
                            id="externalUrl"
                            placeholder="https://"
                            value={tokenForm.metadata.externalUrl || ""}
                            onChange={(e) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  externalUrl: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxSupply">Max Supply*</Label>
                          <Input
                            id="maxSupply"
                            type="number"
                            min="0"
                            placeholder="0 for unlimited"
                            value={tokenForm.metadata.maxSupply || ""}
                            onChange={(e) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  maxSupply: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isTransferable"
                            checked={
                              tokenForm.metadata.isTransferable !== false
                            } // Default to true
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  isTransferable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="isTransferable">
                              Is Transferable
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Allow tokens to be transferred between wallets
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ERC-721 Configuration */}
                {tokenForm.standard === "ERC-721" && (
                  <div className="space-y-6 border-t pt-6">
                    <h3 className="text-lg font-medium">
                      ERC-721 Non-Fungible Token Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Token Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., MyNFT"
                          value={tokenForm.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="symbol">Token Symbol</Label>
                        <Input
                          id="symbol"
                          name="symbol"
                          placeholder="e.g., MNFT"
                          value={tokenForm.symbol}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          placeholder="Collection description"
                          value={tokenForm.metadata.description || ""}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                description: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input
                          id="imageUrl"
                          placeholder="https://"
                          value={tokenForm.metadata.imageUrl || ""}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                imageUrl: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerAddress">
                          Owner Address (ETH Wallet)
                        </Label>
                        <Input
                          id="ownerAddress"
                          placeholder="0x..."
                          value={tokenForm.metadata.ownerAddress || ""}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                ownerAddress: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-medium">Token Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mintable"
                            checked={tokenForm.metadata.mintable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  mintable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="mintable">Mintable</Label>
                            <p className="text-xs text-muted-foreground">
                              Allow creation of new tokens
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="burnable"
                            checked={tokenForm.metadata.burnable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  burnable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="burnable">Burnable</Label>
                            <p className="text-xs text-muted-foreground">
                              Allow tokens to be destroyed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pausable"
                            checked={tokenForm.metadata.pausable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  pausable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="pausable">Pausable</Label>
                            <p className="text-xs text-muted-foreground">
                              Enable emergency stop functionality
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="transferRestrictions"
                            checked={
                              tokenForm.metadata.transferRestrictions || false
                            }
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  transferRestrictions: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="transferRestrictions">
                              Transfer Restrictions
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Limit transfers based on rules
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6 border-t pt-6">
                      <h4 className="font-medium">ERC-721 Metadata Editor</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="collectionName">
                            Collection Name*
                          </Label>
                          <Input
                            id="collectionName"
                            placeholder="Collection name"
                            value={
                              tokenForm.metadata.collectionName ||
                              tokenForm.name
                            }
                            onChange={(e) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  collectionName: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="royalties">Royalties (%)</Label>
                          <Input
                            id="royalties"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0"
                            value={tokenForm.metadata.royalties || ""}
                            onChange={(e) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  royalties: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isTransferable"
                            checked={
                              tokenForm.metadata.isTransferable !== false
                            } // Default to true
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  isTransferable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="isTransferable">
                              Is Transferable
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Allow tokens to be transferred between wallets
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="baseUri">
                            Custom Base Metadata URI
                          </Label>
                          <Input
                            id="baseUri"
                            placeholder="ipfs://"
                            value={tokenForm.metadata.baseUri || ""}
                            onChange={(e) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  baseUri: e.target.value,
                                },
                              }))
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Allows off-chain metadata link
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ERC-1155 Configuration */}
                {tokenForm.standard === "ERC-1155" && (
                  <div className="space-y-6 border-t pt-6">
                    <h3 className="text-lg font-medium">
                      ERC-1155 Multi Token Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Token Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., MultiToken"
                          value={tokenForm.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="symbol">Token Symbol</Label>
                        <Input
                          id="symbol"
                          name="symbol"
                          placeholder="e.g., MTK"
                          value={tokenForm.symbol}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerAddress">
                          Owner Address (ETH Wallet)
                        </Label>
                        <Input
                          id="ownerAddress"
                          placeholder="0x..."
                          value={tokenForm.metadata.ownerAddress || ""}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                ownerAddress: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Token Types</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newTokens = [
                              ...(tokenForm.metadata.tokens || []),
                            ];
                            newTokens.push({
                              id: newTokens.length + 1,
                              type: "Fungible",
                              name: `Token ${newTokens.length + 1}`,
                              amount: 1000,
                              maxSupply: 0,
                              uri: "",
                              burnable: false,
                              transferable: true,
                            });
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                tokens: newTokens,
                              },
                            }));
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Token
                        </Button>
                      </div>

                      {!tokenForm.metadata.tokens ||
                      tokenForm.metadata.tokens.length === 0 ? (
                        <div className="text-center py-4 border rounded-md">
                          <p className="text-muted-foreground">
                            No tokens defined. Add a token to get started.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {tokenForm.metadata.tokens.map((token, index) => (
                            <div
                              key={index}
                              className="border rounded-md p-4 space-y-4"
                            >
                              <div className="flex justify-between items-center">
                                <h5 className="font-medium">
                                  Token #{token.id}
                                </h5>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newTokens = [
                                      ...tokenForm.metadata.tokens,
                                    ];
                                    newTokens.splice(index, 1);
                                    setTokenForm((prev) => ({
                                      ...prev,
                                      metadata: {
                                        ...prev.metadata,
                                        tokens: newTokens,
                                      },
                                    }));
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`token-${index}-type`}>
                                    Token Type
                                  </Label>
                                  <Select
                                    value={token.type}
                                    onValueChange={(value) => {
                                      const newTokens = [
                                        ...tokenForm.metadata.tokens,
                                      ];
                                      newTokens[index].type = value;
                                      setTokenForm((prev) => ({
                                        ...prev,
                                        metadata: {
                                          ...prev.metadata,
                                          tokens: newTokens,
                                        },
                                      }));
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select token type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Fungible">
                                        Fungible
                                      </SelectItem>
                                      <SelectItem value="Semi-Fungible">
                                        Semi-Fungible
                                      </SelectItem>
                                      <SelectItem value="Non-Fungible">
                                        Non-Fungible
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`token-${index}-name`}>
                                    Name
                                  </Label>
                                  <Input
                                    id={`token-${index}-name`}
                                    value={token.name}
                                    onChange={(e) => {
                                      const newTokens = [
                                        ...tokenForm.metadata.tokens,
                                      ];
                                      newTokens[index].name = e.target.value;
                                      setTokenForm((prev) => ({
                                        ...prev,
                                        metadata: {
                                          ...prev.metadata,
                                          tokens: newTokens,
                                        },
                                      }));
                                    }}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`token-${index}-amount`}>
                                    Amount
                                  </Label>
                                  <Input
                                    id={`token-${index}-amount`}
                                    type="number"
                                    min="1"
                                    value={token.amount}
                                    onChange={(e) => {
                                      const newTokens = [
                                        ...tokenForm.metadata.tokens,
                                      ];
                                      newTokens[index].amount =
                                        parseInt(e.target.value) || 1;
                                      setTokenForm((prev) => ({
                                        ...prev,
                                        metadata: {
                                          ...prev.metadata,
                                          tokens: newTokens,
                                        },
                                      }));
                                    }}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`token-${index}-maxSupply`}>
                                    Maximum Supply
                                  </Label>
                                  <Input
                                    id={`token-${index}-maxSupply`}
                                    type="number"
                                    min="0"
                                    placeholder="0 for unlimited"
                                    value={token.maxSupply}
                                    onChange={(e) => {
                                      const newTokens = [
                                        ...tokenForm.metadata.tokens,
                                      ];
                                      newTokens[index].maxSupply =
                                        parseInt(e.target.value) || 0;
                                      setTokenForm((prev) => ({
                                        ...prev,
                                        metadata: {
                                          ...prev.metadata,
                                          tokens: newTokens,
                                        },
                                      }));
                                    }}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`token-${index}-uri`}>
                                    URI
                                  </Label>
                                  <Input
                                    id={`token-${index}-uri`}
                                    placeholder="ipfs://"
                                    value={token.uri}
                                    onChange={(e) => {
                                      const newTokens = [
                                        ...tokenForm.metadata.tokens,
                                      ];
                                      newTokens[index].uri = e.target.value;
                                      setTokenForm((prev) => ({
                                        ...prev,
                                        metadata: {
                                          ...prev.metadata,
                                          tokens: newTokens,
                                        },
                                      }));
                                    }}
                                  />
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`token-${index}-burnable`}
                                    checked={token.burnable}
                                    onCheckedChange={(checked) => {
                                      const newTokens = [
                                        ...tokenForm.metadata.tokens,
                                      ];
                                      newTokens[index].burnable = !!checked;
                                      setTokenForm((prev) => ({
                                        ...prev,
                                        metadata: {
                                          ...prev.metadata,
                                          tokens: newTokens,
                                        },
                                      }));
                                    }}
                                  />
                                  <Label htmlFor={`token-${index}-burnable`}>
                                    Burnable
                                  </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`token-${index}-transferable`}
                                    checked={token.transferable}
                                    onCheckedChange={(checked) => {
                                      const newTokens = [
                                        ...tokenForm.metadata.tokens,
                                      ];
                                      newTokens[index].transferable = !!checked;
                                      setTokenForm((prev) => ({
                                        ...prev,
                                        metadata: {
                                          ...prev.metadata,
                                          tokens: newTokens,
                                        },
                                      }));
                                    }}
                                  />
                                  <Label
                                    htmlFor={`token-${index}-transferable`}
                                  >
                                    Transferable
                                  </Label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-medium">Token Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mintable"
                            checked={tokenForm.metadata.mintable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  mintable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="mintable">Mintable</Label>
                            <p className="text-xs text-muted-foreground">
                              Allow creation of new tokens
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="burnable"
                            checked={tokenForm.metadata.burnable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  burnable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="burnable">Burnable</Label>
                            <p className="text-xs text-muted-foreground">
                              Allow tokens to be destroyed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pausable"
                            checked={tokenForm.metadata.pausable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  pausable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="pausable">Pausable</Label>
                            <p className="text-xs text-muted-foreground">
                              Enable emergency stop functionality
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="transferRestrictions"
                            checked={
                              tokenForm.metadata.transferRestrictions || false
                            }
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  transferRestrictions: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="transferRestrictions">
                              Transfer Restrictions
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Limit transfers based on rules
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6 border-t pt-6">
                      <h4 className="font-medium">ERC-1155 Metadata Editor</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="collectionName">
                            Collection Name*
                          </Label>
                          <Input
                            id="collectionName"
                            placeholder="Collection name"
                            value={
                              tokenForm.metadata.collectionName ||
                              tokenForm.name
                            }
                            onChange={(e) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  collectionName: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="supportsBatchTransfers"
                            checked={
                              tokenForm.metadata.supportsBatchTransfers !==
                              false
                            } // Default to true
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  supportsBatchTransfers: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="supportsBatchTransfers">
                              Supports Batch Transfers
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Enable efficient batch operations
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="baseUri">
                            Custom Base Metadata URI
                          </Label>
                          <Input
                            id="baseUri"
                            placeholder="ipfs://"
                            value={tokenForm.metadata.baseUri || ""}
                            onChange={(e) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  baseUri: e.target.value,
                                },
                              }))
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Allows off-chain metadata link
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ERC-1400 Configuration */}
                {tokenForm.standard === "ERC-1400" && (
                  <div className="space-y-6 border-t pt-6">
                    <h3 className="text-lg font-medium">
                      ERC-1400 Security Token Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Token Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., SecurityToken"
                          value={tokenForm.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="symbol">Token Symbol</Label>
                        <Input
                          id="symbol"
                          name="symbol"
                          placeholder="e.g., STKN"
                          value={tokenForm.symbol}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerAddress">
                          Owner Address (ETH Wallet)
                        </Label>
                        <Input
                          id="ownerAddress"
                          placeholder="0x..."
                          value={tokenForm.metadata.ownerAddress || ""}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                ownerAddress: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-medium">Restricted Jurisdictions</h4>
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allJurisdictions = [
                              "Cuba",
                              "North Korea",
                              "Russia",
                              "Donetsk",
                              "Belarus",
                              "Venezuela",
                              "Democratic Republic of the Congo",
                              "Lebanon",
                              "Somalia",
                              "Yemen",
                              "Iran",
                              "Syria",
                              "Crimea",
                              "Luhansk",
                              "Myanmar",
                              "Zimbabwe",
                              "Iraq",
                              "Libya",
                              "Sudan",
                            ];
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                restrictedJurisdictions: allJurisdictions,
                              },
                            }));
                          }}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                restrictedJurisdictions: [],
                              },
                            }));
                          }}
                        >
                          Deselect All
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          "Cuba",
                          "North Korea",
                          "Russia",
                          "Donetsk (Ukraine)",
                          "Belarus",
                          "Venezuela",
                          "Democratic Republic of the Congo",
                          "Lebanon",
                          "Somalia",
                          "Yemen",
                          "Iran",
                          "Syria",
                          "Crimea (Ukraine)",
                          "Luhansk (Ukraine)",
                          "Myanmar (Burma)",
                          "Zimbabwe",
                          "Iraq",
                          "Libya",
                          "Sudan",
                        ].map((jurisdiction) => (
                          <div
                            key={jurisdiction}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`jurisdiction-${jurisdiction}`}
                              checked={(
                                tokenForm.metadata.restrictedJurisdictions || []
                              ).includes(jurisdiction)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTokenForm((prev) => ({
                                    ...prev,
                                    metadata: {
                                      ...prev.metadata,
                                      restrictedJurisdictions: [
                                        ...(prev.metadata
                                          .restrictedJurisdictions || []),
                                        jurisdiction,
                                      ],
                                    },
                                  }));
                                } else {
                                  setTokenForm((prev) => ({
                                    ...prev,
                                    metadata: {
                                      ...prev.metadata,
                                      restrictedJurisdictions: (
                                        prev.metadata.restrictedJurisdictions ||
                                        []
                                      ).filter((j) => j !== jurisdiction),
                                    },
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={`jurisdiction-${jurisdiction}`}>
                              {jurisdiction}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="issuanceDate">Issuance Date</Label>
                        <Input
                          id="issuanceDate"
                          type="date"
                          value={tokenForm.metadata.issuanceDate || ""}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                issuanceDate: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maturityDate">Maturity Date</Label>
                        <Input
                          id="maturityDate"
                          type="date"
                          value={tokenForm.metadata.maturityDate || ""}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                maturityDate: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-medium">Advanced Settings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="transferRestrictions"
                            checked={
                              tokenForm.metadata.transferRestrictions || false
                            }
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  transferRestrictions: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="transferRestrictions">
                              Transfer Restrictions
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Limit trading to KYC-verified wallets
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="lockupPeriods"
                            checked={tokenForm.metadata.lockupPeriods || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  lockupPeriods: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="lockupPeriods">
                              Lock-up Periods
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Prevent early selling
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="complianceModules"
                            checked={
                              tokenForm.metadata.complianceModules || false
                            }
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  complianceModules: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="complianceModules">
                              Compliance Modules
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Auto-restrict based on investor type
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-medium">Token Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mintable"
                            checked={tokenForm.metadata.mintable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  mintable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="mintable">Mintable</Label>
                            <p className="text-xs text-muted-foreground">
                              Allow creation of new tokens
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="burnable"
                            checked={tokenForm.metadata.burnable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  burnable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="burnable">Burnable</Label>
                            <p className="text-xs text-muted-foreground">
                              Allow tokens to be destroyed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pausable"
                            checked={tokenForm.metadata.pausable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  pausable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="pausable">Pausable</Label>
                            <p className="text-xs text-muted-foreground">
                              Enable emergency stop functionality
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6 border-t pt-6">
                      <h4 className="font-medium">ERC-1400 Metadata Editor</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="securityType">Security Type*</Label>
                          <Select
                            value={tokenForm.metadata.securityType || ""}
                            onValueChange={(value) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  securityType: value,
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select security type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equity">Equity</SelectItem>
                              <SelectItem value="debt">Debt</SelectItem>
                              <SelectItem value="derivative">
                                Derivative
                              </SelectItem>
                              <SelectItem value="fund">Fund</SelectItem>
                              <SelectItem value="reit">REIT</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="issuerName">Issuer Name*</Label>
                          <Input
                            id="issuerName"
                            placeholder="Legal entity name"
                            value={tokenForm.metadata.issuerName || ""}
                            onChange={(e) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  issuerName: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="kycRequired"
                            checked={tokenForm.metadata.kycRequired !== false} // Default to true
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  kycRequired: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="kycRequired">KYC Required</Label>
                            <p className="text-xs text-muted-foreground">
                              Require KYC verification for token holders
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ERC-3525 Configuration */}
                {tokenForm.standard === "ERC-3525" && (
                  <div className="space-y-6 border-t pt-6">
                    <h3 className="text-lg font-medium">
                      ERC-3525 Semi-Fungible Token Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Token Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., SemiFungibleToken"
                          value={tokenForm.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="symbol">Token Symbol</Label>
                        <Input
                          id="symbol"
                          name="symbol"
                          placeholder="e.g., SFT"
                          value={tokenForm.symbol}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tokenId">Token ID</Label>
                        <Input
                          id="tokenId"
                          type="number"
                          min="1"
                          placeholder="1"
                          value={tokenForm.metadata.tokenId || "1"}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                tokenId: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slot">Slot</Label>
                        <Input
                          id="slot"
                          type="number"
                          min="1"
                          placeholder="1"
                          value={tokenForm.metadata.slot || "1"}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                slot: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="value">Value</Label>
                        <Input
                          id="value"
                          type="number"
                          min="0"
                          placeholder="100"
                          value={tokenForm.metadata.value || "100"}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                value: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nav">NAV (Net Asset Value)</Label>
                        <Input
                          id="nav"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="1.00"
                          value={tokenForm.metadata.nav || "1.00"}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                nav: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerAddress">
                          Owner Address (ETH Wallet)
                        </Label>
                        <Input
                          id="ownerAddress"
                          placeholder="0x..."
                          value={tokenForm.metadata.ownerAddress || ""}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                ownerAddress: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-medium">Advanced Settings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="splitMerge"
                            checked={tokenForm.metadata.splitMerge || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  splitMerge: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="splitMerge">
                              Split/Merge Functionality
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Enable dynamic token management
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="redeemableValue"
                            checked={
                              tokenForm.metadata.redeemableValue || false
                            }
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  redeemableValue: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="redeemableValue">
                              Redeemable Value
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Set rules for cashing out
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="expiration"
                            checked={tokenForm.metadata.expiration || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  expiration: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="expiration">Expiration</Label>
                            <p className="text-xs text-muted-foreground">
                              Auto-revoke tokens on a set date
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-medium">Token Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mintable"
                            checked={tokenForm.metadata.mintable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  mintable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="mintable">Mintable</Label>
                            <p className="text-xs text-muted-foreground">
                              Allow creation of new tokens
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="burnable"
                            checked={tokenForm.metadata.burnable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  burnable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="burnable">Burnable</Label>
                            <p className="text-xs text-muted-foreground">
                              Allow tokens to be destroyed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pausable"
                            checked={tokenForm.metadata.pausable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  pausable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="pausable">Pausable</Label>
                            <p className="text-xs text-muted-foreground">
                              Enable emergency stop functionality
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="transferRestrictions"
                            checked={
                              tokenForm.metadata.transferRestrictions || false
                            }
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  transferRestrictions: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="transferRestrictions">
                              Transfer Restrictions
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Limit transfers based on rules
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6 border-t pt-6">
                      <h4 className="font-medium">ERC-3525 Metadata Editor</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="slotDescription">
                            Slot Description*
                          </Label>
                          <Input
                            id="slotDescription"
                            placeholder="Description of this slot"
                            value={tokenForm.metadata.slotDescription || ""}
                            onChange={(e) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  slotDescription: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="valueUnit">Value Unit*</Label>
                          <Input
                            id="valueUnit"
                            placeholder="e.g., USD, Shares, Points"
                            value={tokenForm.metadata.valueUnit || ""}
                            onChange={(e) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  valueUnit: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="allowsValueTransfer"
                            checked={
                              tokenForm.metadata.allowsValueTransfer !== false
                            } // Default to true
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  allowsValueTransfer: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="allowsValueTransfer">
                              Allows Value Transfer
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Enable transferring value between tokens
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ERC-4626 Configuration */}
                {tokenForm.standard === "ERC-4626" && (
                  <div className="space-y-6 border-t pt-6">
                    <h3 className="text-lg font-medium">
                      ERC-4626 Tokenized Vault Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Vault Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., Yield Vault"
                          value={tokenForm.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="symbol">Symbol</Label>
                        <Input
                          id="symbol"
                          name="symbol"
                          placeholder="e.g., yVAULT"
                          value={tokenForm.symbol}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalAssets">Total Assets</Label>
                        <Input
                          id="totalAssets"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={tokenForm.metadata.totalAssets || "0"}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                totalAssets: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerAddress">
                          Owner Address (ETH Wallet)
                        </Label>
                        <Input
                          id="ownerAddress"
                          placeholder="0x..."
                          value={tokenForm.metadata.ownerAddress || ""}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                ownerAddress: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-medium">Vault Functions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="deposit"
                            checked={tokenForm.metadata.deposit !== false} // Default to true
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  deposit: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="deposit">Deposit</Label>
                            <p className="text-xs text-muted-foreground">
                              Deposit assets into vault
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="withdraw"
                            checked={tokenForm.metadata.withdraw !== false} // Default to true
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  withdraw: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="withdraw">Withdraw</Label>
                            <p className="text-xs text-muted-foreground">
                              Withdraw from vault
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="convertToShares"
                            checked={
                              tokenForm.metadata.convertToShares !== false
                            } // Default to true
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  convertToShares: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="convertToShares">
                              Convert to Shares
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Convert deposits to vault shares
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="convertToAssets"
                            checked={
                              tokenForm.metadata.convertToAssets !== false
                            } // Default to true
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  convertToAssets: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="convertToAssets">
                              Convert to Assets
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Convert shares to underlying assets
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="maxWithdraw"
                            checked={tokenForm.metadata.maxWithdraw !== false} // Default to true
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  maxWithdraw: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="maxWithdraw">Max Withdraw</Label>
                            <p className="text-xs text-muted-foreground">
                              Get max allowable withdrawal
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-medium">Token Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mintable"
                            checked={tokenForm.metadata.mintable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  mintable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="mintable">Mintable</Label>
                            <p className="text-xs text-muted-foreground">
                              Allow creation of new tokens
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="burnable"
                            checked={tokenForm.metadata.burnable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  burnable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="burnable">Burnable</Label>
                            <p className="text-xs text-muted-foreground">
                              Allow tokens to be destroyed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pausable"
                            checked={tokenForm.metadata.pausable || false}
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  pausable: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="pausable">Pausable</Label>
                            <p className="text-xs text-muted-foreground">
                              Enable emergency stop functionality
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="transferRestrictions"
                            checked={
                              tokenForm.metadata.transferRestrictions || false
                            }
                            onCheckedChange={(checked) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  transferRestrictions: !!checked,
                                },
                              }))
                            }
                          />
                          <div>
                            <Label htmlFor="transferRestrictions">
                              Transfer Restrictions
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Limit transfers based on rules
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6 border-t pt-6">
                      <h4 className="font-medium">ERC-4626 Metadata Editor</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="underlyingAsset">
                            Underlying Asset*
                          </Label>
                          <Select
                            value={tokenForm.metadata.underlyingAsset || ""}
                            onValueChange={(value) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  underlyingAsset: value,
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select asset" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ETH">ETH</SelectItem>
                              <SelectItem value="USDC">USDC</SelectItem>
                              <SelectItem value="USDT">USDT</SelectItem>
                              <SelectItem value="DAI">DAI</SelectItem>
                              <SelectItem value="WBTC">WBTC</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="yieldStrategy">Yield Strategy*</Label>
                          <Select
                            value={tokenForm.metadata.yieldStrategy || ""}
                            onValueChange={(value) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  yieldStrategy: value,
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select strategy" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LENDING">Lending</SelectItem>
                              <SelectItem value="STAKING">Staking</SelectItem>
                              <SelectItem value="LIQUIDITY">
                                Liquidity Provision
                              </SelectItem>
                              <SelectItem value="YIELD_FARMING">
                                Yield Farming
                              </SelectItem>
                              <SelectItem value="ARBITRAGE">
                                Arbitrage
                              </SelectItem>
                              <SelectItem value="CUSTOM">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="managementFee">
                            Management Fee (%)
                          </Label>
                          <Input
                            id="managementFee"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="2.0"
                            value={tokenForm.metadata.managementFee || ""}
                            onChange={(e) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  managementFee: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="performanceFee">
                            Performance Fee (%)
                          </Label>
                          <Input
                            id="performanceFee"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="20.0"
                            value={tokenForm.metadata.performanceFee || ""}
                            onChange={(e) =>
                              setTokenForm((prev) => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  performanceFee: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dates for structured products */}
                {(tokenForm.standard === "ERC-3525" ||
                  tokenForm.metadata.product.includes("Structured Product") ||
                  tokenForm.metadata.product.includes("Credit Linked")) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="issuanceDate">Issuance Date</Label>
                      <Input
                        id="issuanceDate"
                        type="date"
                        value={tokenForm.metadata.issuanceDate}
                        onChange={(e) =>
                          setTokenForm((prev) => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              issuanceDate: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maturityDate">Maturity Date</Label>
                      <Input
                        id="maturityDate"
                        type="date"
                        value={tokenForm.metadata.maturityDate}
                        onChange={(e) =>
                          setTokenForm((prev) => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              maturityDate: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Tranche Configuration for structured products */}
                {(tokenForm.standard === "ERC-3525" ||
                  tokenForm.metadata.product.includes("Structured Product") ||
                  tokenForm.metadata.product.includes("Credit Linked")) && (
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        Tranche Configuration
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newId =
                            tokenForm.metadata.tranches.length > 0
                              ? Math.max(
                                  ...tokenForm.metadata.tranches.map(
                                    (t) => t.id,
                                  ),
                                ) + 1
                              : 1;
                          setTokenForm((prev) => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              tranches: [
                                ...prev.metadata.tranches,
                                {
                                  id: newId,
                                  name: `Tranche ${newId}`,
                                  value: 0,
                                  interestRate: 0,
                                },
                              ],
                            },
                          }));
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Tranche
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {tokenForm.metadata.tranches.length === 0 ? (
                        <div className="text-center py-4 border rounded-md">
                          <p className="text-muted-foreground">
                            No tranches defined. Add a tranche to get started.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Tranche Name</TableHead>
                                <TableHead>Slot ID</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Interest Rate (%)</TableHead>
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tokenForm.metadata.tranches.map(
                                (tranche, index) => (
                                  <TableRow key={tranche.id}>
                                    <TableCell>
                                      <Input
                                        value={tranche.name}
                                        onChange={(e) => {
                                          const updatedTranches = [
                                            ...tokenForm.metadata.tranches,
                                          ];
                                          updatedTranches[index].name =
                                            e.target.value;
                                          setTokenForm((prev) => ({
                                            ...prev,
                                            metadata: {
                                              ...prev.metadata,
                                              tranches: updatedTranches,
                                            },
                                          }));
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>{tranche.id}</TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={tranche.value}
                                        onChange={(e) => {
                                          const updatedTranches = [
                                            ...tokenForm.metadata.tranches,
                                          ];
                                          updatedTranches[index].value =
                                            parseInt(e.target.value) || 0;
                                          setTokenForm((prev) => ({
                                            ...prev,
                                            metadata: {
                                              ...prev.metadata,
                                              tranches: updatedTranches,
                                            },
                                          }));
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={tranche.interestRate}
                                        onChange={(e) => {
                                          const updatedTranches = [
                                            ...tokenForm.metadata.tranches,
                                          ];
                                          updatedTranches[index].interestRate =
                                            parseFloat(e.target.value) || 0;
                                          setTokenForm((prev) => ({
                                            ...prev,
                                            metadata: {
                                              ...prev.metadata,
                                              tranches: updatedTranches,
                                            },
                                          }));
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const updatedTranches =
                                            tokenForm.metadata.tranches.filter(
                                              (_, i) => i !== index,
                                            );
                                          setTokenForm((prev) => ({
                                            ...prev,
                                            metadata: {
                                              ...prev.metadata,
                                              tranches: updatedTranches,
                                            },
                                          }));
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ),
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Tranche summary */}
                      {tokenForm.metadata.tranches.length > 0 && (
                        <div className="flex justify-between items-center mt-4 p-3 bg-muted/20 rounded-md">
                          <span>
                            Total Value:{" "}
                            {tokenForm.metadata.tranches
                              .reduce((sum, t) => sum + t.value, 0)
                              .toLocaleString()}
                          </span>
                          <span
                            className={
                              tokenForm.metadata.tranches.reduce(
                                (sum, t) => sum + t.value,
                                0,
                              ) !== tokenForm.totalSupply
                                ? "text-red-500"
                                : "text-green-500"
                            }
                          >
                            {tokenForm.metadata.tranches.reduce(
                              (sum, t) => sum + t.value,
                              0,
                            ) === tokenForm.totalSupply
                              ? "✓ Matches total supply"
                              : `⚠️ Doesn't match total supply (${tokenForm.totalSupply.toLocaleString()})`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Fund & ETF Configuration */}
                {(tokenForm.standard.includes("ERC-4626") ||
                  tokenForm.metadata.product.includes("Fund Token")) && (
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">Fund Parameters</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="underlying-asset">
                          Underlying Asset
                        </Label>
                        <Select
                          value={tokenForm.metadata.underlyingAsset || "ETH"}
                          onValueChange={(value) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                underlyingAsset: value,
                              },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select underlying asset" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ETH">ETH</SelectItem>
                            <SelectItem value="USDC">USDC</SelectItem>
                            <SelectItem value="USDT">USDT</SelectItem>
                            <SelectItem value="DAI">DAI</SelectItem>
                            <SelectItem value="BTC">BTC</SelectItem>
                            <SelectItem value="MIXED">Mixed Assets</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="yield-strategy">Yield Strategy</Label>
                        <Select
                          value={tokenForm.metadata.yieldStrategy || "STAKING"}
                          onValueChange={(value) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                yieldStrategy: value,
                              },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select yield strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STAKING">Staking</SelectItem>
                            <SelectItem value="LENDING">Lending</SelectItem>
                            <SelectItem value="LIQUIDITY">
                              Liquidity Provision
                            </SelectItem>
                            <SelectItem value="YIELD_FARMING">
                              Yield Farming
                            </SelectItem>
                            <SelectItem value="ARBITRAGE">Arbitrage</SelectItem>
                            <SelectItem value="CUSTOM">
                              Custom Strategy
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="min-deposit">Minimum Deposit</Label>
                        <Input
                          id="min-deposit"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={tokenForm.metadata.minDeposit || ""}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                minDeposit: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-deposit">Maximum Deposit</Label>
                        <Input
                          id="max-deposit"
                          type="number"
                          min="0"
                          placeholder="No limit"
                          value={tokenForm.metadata.maxDeposit || ""}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                maxDeposit: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="redemption-notice">
                          Redemption Notice Period (Days)
                        </Label>
                        <Input
                          id="redemption-notice"
                          type="number"
                          min="0"
                          placeholder="30"
                          value={
                            tokenForm.metadata.redemptionNoticeDays || "30"
                          }
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                redemptionNoticeDays: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="management-fee">
                          Management Fee (%)
                        </Label>
                        <Input
                          id="management-fee"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="2.0"
                          value={tokenForm.metadata.managementFee || "2.0"}
                          onChange={(e) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                managementFee: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="nav-oracle"
                          checked={tokenForm.metadata.navOracleEnabled || false}
                          onCheckedChange={(checked) =>
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                navOracleEnabled: !!checked,
                              },
                            }))
                          }
                        />
                        <Label htmlFor="nav-oracle">
                          Enable Oracle-based NAV Calculation
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        When enabled, NAV will be calculated automatically using
                        price oracles. Otherwise, NAV will be updated manually
                        by the fund manager.
                      </p>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="erc20-conversion">
                        ERC-20 Conversion Rate
                      </Label>
                      <Input
                        id="erc20-conversion"
                        type="number"
                        min="0"
                        step="0.000001"
                        placeholder="1.0"
                        value={tokenForm.metadata.erc20ConversionRate || "1.0"}
                        onChange={(e) =>
                          setTokenForm((prev) => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              erc20ConversionRate: e.target.value,
                            },
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Rate at which fund tokens can be converted to ERC-20
                        tokens for liquidity
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-md mt-4">
                      <h4 className="font-medium text-blue-800 mb-2">
                        NAV Preview
                      </h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">
                          Initial NAV per Token:
                        </span>
                        <span className="font-medium">
                          {tokenForm.metadata.underlyingAsset || "ETH"}{" "}
                          {(1.0).toFixed(6)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-blue-700">
                          Management Fee Impact (Annual):
                        </span>
                        <span className="font-medium text-red-600">
                          -
                          {parseFloat(
                            tokenForm.metadata.managementFee || "2.0",
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-blue-700">
                          Estimated Yield (Annual):
                        </span>
                        <span className="font-medium text-green-600">
                          +
                          {tokenForm.metadata.yieldStrategy === "STAKING"
                            ? "5.2"
                            : tokenForm.metadata.yieldStrategy === "LENDING"
                              ? "3.8"
                              : tokenForm.metadata.yieldStrategy === "LIQUIDITY"
                                ? "8.5"
                                : tokenForm.metadata.yieldStrategy ===
                                    "YIELD_FARMING"
                                  ? "12.4"
                                  : tokenForm.metadata.yieldStrategy ===
                                      "ARBITRAGE"
                                    ? "7.6"
                                    : "6.0"}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compliance settings for structured products */}
                {(tokenForm.standard.includes("ERC-1400") ||
                  tokenForm.standard === "ERC-3525" ||
                  tokenForm.metadata.product.includes("Structured Product") ||
                  tokenForm.metadata.product.includes("Credit Linked") ||
                  tokenForm.metadata.product.includes("Fund Token")) && (
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">Compliance Settings</h3>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="whitelistEnabled"
                        checked={tokenForm.metadata.whitelistEnabled}
                        onCheckedChange={(checked) =>
                          setTokenForm((prev) => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              whitelistEnabled: !!checked,
                            },
                          }))
                        }
                      />
                      <Label htmlFor="whitelistEnabled">
                        Enable investor whitelist
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Jurisdiction Restrictions</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          "US",
                          "EU",
                          "UK",
                          "APAC",
                          "LATAM",
                          "MENA",
                          "AFRICA",
                          "OTHER",
                        ].map((region) => (
                          <div
                            key={region}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`region-${region}`}
                              checked={tokenForm.metadata.jurisdictionRestrictions.includes(
                                region,
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTokenForm((prev) => ({
                                    ...prev,
                                    metadata: {
                                      ...prev.metadata,
                                      jurisdictionRestrictions: [
                                        ...prev.metadata
                                          .jurisdictionRestrictions,
                                        region,
                                      ],
                                    },
                                  }));
                                } else {
                                  setTokenForm((prev) => ({
                                    ...prev,
                                    metadata: {
                                      ...prev.metadata,
                                      jurisdictionRestrictions:
                                        prev.metadata.jurisdictionRestrictions.filter(
                                          (r) => r !== region,
                                        ),
                                    },
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={`region-${region}`}>{region}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (isCreating) {
                  setIsCreating(false);
                  setActiveTab("tokens");
                } else {
                  // Just reset the form for editing
                  if (selectedToken) {
                    handleSelectToken(selectedToken);
                  }
                }
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveToken} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {selectedToken ? "Update Token" : "Create Token"}
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TokenBuilder;
