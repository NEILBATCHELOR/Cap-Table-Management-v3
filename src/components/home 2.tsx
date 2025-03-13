import React, { useState, useEffect } from "react";
import Header from "./layout/Header";
import { useLocation } from "react-router-dom";
import ProjectsList from "./projects/ProjectsList";
import CapTableView from "./captable/CapTableView";
import SubscriptionManager from "./subscriptions/SubscriptionManager";
import { getProject, getProjectStatistics } from "@/lib/projects";
import { useToast } from "@/components/ui/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "draft" | "active" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
  totalInvestors: number;
  totalAllocation: number;
  authorizedShares?: number;
  sharePrice?: number;
  projectType?: "equity" | "token" | "hybrid";
  tokenSymbol?: string;
  companyValuation?: number;
  fundingRound?: string;
  legalEntity?: string;
  jurisdiction?: string;
  taxId?: string;
  subscription?: {
    status: "active" | "canceled" | "expired" | "trial";
    planName: string;
    id?: string;
    planId?: string;
    startDate?: string;
    endDate?: string;
    trialEndDate?: string;
    billingCycle?: string;
    price?: number;
    nextPaymentDate?: string;
    lastPaymentDate?: string;
    paymentMethod?: any;
  };
}

const Home = () => {
  const location = useLocation();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [selectedSubscriptionProject, setSelectedSubscriptionProject] =
    useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // We no longer need to maintain projects state here as it's handled in ProjectsList
  /*const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "Token Issuance Alpha",
      description: "First token issuance project for early investors",
      status: "active",
      createdAt: "2023-05-10",
      updatedAt: "2023-06-15",
      totalInvestors: 15,
      totalAllocation: 2500000,
    },
    {
      id: "2",
      title: "Beta Round Funding",
      description: "Second phase token distribution for strategic partners",
      status: "draft",
      createdAt: "2023-07-20",
      updatedAt: "2023-07-25",
      totalInvestors: 8,
      totalAllocation: 1800000,
    },
    {
      id: "3",
      title: "Community Token Sale",
      description: "Public token sale for community members",
      status: "completed",
      createdAt: "2023-03-05",
      updatedAt: "2023-04-30",
      totalInvestors: 250,
      totalAllocation: 5000000,
    },
    {
      id: "4",
      title: "Institutional Offering",
      description: "Private token sale for institutional investors",
      status: "active",
      createdAt: "2023-08-01",
      updatedAt: "2023-08-15",
      totalInvestors: 12,
      totalAllocation: 10000000,
    },
    {
      id: "5",
      title: "Legacy Project Archive",
      description: "Archived token project from previous fiscal year",
      status: "archived",
      createdAt: "2022-11-10",
      updatedAt: "2023-01-05",
      totalInvestors: 45,
      totalAllocation: 3200000,
    },
  ]);*/

  // We no longer need these handlers as they're handled in ProjectsList component with Supabase

  // Handle project selection for viewing cap table
  const handleViewProject = async (projectId: string) => {
    try {
      setIsLoading(true);

      // Fetch the project details from Supabase
      const project = await getProject(projectId);

      if (!project) {
        toast({
          title: "Error",
          description: "Project not found",
          variant: "destructive",
        });
        return;
      }

      // Get project statistics (investor count, total allocation)
      const stats = await getProjectStatistics(projectId);

      // Transform the data to match the UI format
      const transformedProject = {
        id: project.id,
        title: project.name,
        description: project.description,
        status: project.status,
        createdAt: new Date(project.created_at || Date.now())
          .toISOString()
          .split("T")[0],
        updatedAt: new Date(project.updated_at || Date.now())
          .toISOString()
          .split("T")[0],
        totalInvestors: stats.investorCount,
        totalAllocation: project.target_raise,
        projectType: project.project_type,
        authorizedShares: project.authorized_shares,
        sharePrice: project.share_price,
        tokenSymbol: project.token_symbol,
        companyValuation: project.company_valuation,
        fundingRound: project.funding_round,
      };

      setSelectedProject(transformedProject);
    } catch (err) {
      console.error("Error fetching project details:", err);
      toast({
        title: "Error",
        description: "Failed to load project details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle going back to projects list
  const handleBackToProjects = () => {
    setSelectedProject(null);
    setShowSubscriptionManager(false);
    setSelectedSubscriptionProject(null);

    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  // Handle managing subscription
  const handleManageSubscription = async (projectId: string) => {
    try {
      setIsLoading(true);

      // Fetch the project details from Supabase
      const project = await getProject(projectId);

      if (!project) {
        toast({
          title: "Error",
          description: "Project not found",
          variant: "destructive",
        });
        return;
      }

      // Transform the data to match the UI format
      const transformedProject = {
        id: project.id,
        title: project.name,
        description: project.description,
        status: project.status,
        createdAt: new Date(project.created_at).toISOString().split("T")[0],
        updatedAt: new Date(project.updated_at).toISOString().split("T")[0],
        subscription: project.subscription,
      };

      setSelectedSubscriptionProject(transformedProject);
      setShowSubscriptionManager(true);
    } catch (err) {
      console.error("Error fetching project details:", err);
      toast({
        title: "Error",
        description: "Failed to load project details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription actions
  const handleSubscribe = async (planId: string) => {
    if (selectedSubscriptionProject) {
      try {
        setIsLoading(true);

        // Create a mock payment method for demo purposes
        const mockPaymentMethod = {
          type: "credit_card",
          last4: "4242",
          expiryDate: "12/25",
          cardType: "Visa",
        };

        // Call the createSubscription function from lib/subscriptions.ts
        const { createSubscription } = await import("@/lib/subscriptions");
        await createSubscription(
          selectedSubscriptionProject.id,
          planId,
          mockPaymentMethod,
        );

        // Update the UI with the new subscription
        setSelectedSubscriptionProject({
          ...selectedSubscriptionProject,
          subscription: {
            status: "active",
            planName:
              planId === "basic"
                ? "Basic"
                : planId === "professional"
                  ? "Professional"
                  : "Enterprise",
            planId: planId,
            startDate: new Date().toISOString(),
            billingCycle: "monthly",
            price:
              planId === "basic"
                ? 49.99
                : planId === "professional"
                  ? 99.99
                  : 199.99,
          },
        });

        toast({
          title: "Success",
          description: "Subscription created successfully",
        });
      } catch (err) {
        console.error("Error creating subscription:", err);
        toast({
          title: "Error",
          description: "Failed to create subscription. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelSubscription = async () => {
    if (
      selectedSubscriptionProject &&
      selectedSubscriptionProject.subscription &&
      selectedSubscriptionProject.subscription.id
    ) {
      try {
        setIsLoading(true);

        // Call the cancelSubscription function from lib/subscriptions.ts
        const { cancelSubscription } = await import("@/lib/subscriptions");
        await cancelSubscription(
          selectedSubscriptionProject.subscription.id,
          "User requested cancellation",
        );

        // Update the UI with the canceled subscription
        setSelectedSubscriptionProject({
          ...selectedSubscriptionProject,
          subscription: {
            ...selectedSubscriptionProject.subscription,
            status: "canceled",
          },
        });

        toast({
          title: "Success",
          description: "Subscription canceled successfully",
        });
      } catch (err) {
        console.error("Error canceling subscription:", err);
        toast({
          title: "Error",
          description: "Failed to cancel subscription. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRenewSubscription = async () => {
    if (
      selectedSubscriptionProject &&
      selectedSubscriptionProject.subscription &&
      selectedSubscriptionProject.subscription.id
    ) {
      try {
        setIsLoading(true);

        // Call the renewSubscription function from lib/subscriptions.ts
        const { renewSubscription } = await import("@/lib/subscriptions");
        await renewSubscription(
          selectedSubscriptionProject.subscription.id,
          selectedSubscriptionProject.subscription.planId,
        );

        // Update the UI with the renewed subscription
        setSelectedSubscriptionProject({
          ...selectedSubscriptionProject,
          subscription: {
            ...selectedSubscriptionProject.subscription,
            status: "active",
          },
        });

        toast({
          title: "Success",
          description: "Subscription renewed successfully",
        });
      } catch (err) {
        console.error("Error renewing subscription:", err);
        toast({
          title: "Error",
          description: "Failed to renew subscription. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
        {/* Show title based on current path */}
        {location.pathname === "/projects" && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
              Manage your token issuance projects
            </p>
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : selectedProject ? (
          <CapTableView
            projectId={selectedProject.id}
            projectName={selectedProject.title}
            projectSymbol={selectedProject.tokenSymbol || "TKN"}
            projectType={selectedProject.projectType || "hybrid"}
            authorizedShares={selectedProject.authorizedShares || 10000000}
            sharePrice={selectedProject.sharePrice || 1.0}
            companyValuation={selectedProject.companyValuation || 10000000}
            fundingRound={selectedProject.fundingRound || "Seed"}
            onBack={handleBackToProjects}
          />
        ) : showSubscriptionManager && selectedSubscriptionProject ? (
          <SubscriptionManager
            onBack={handleBackToProjects}
            currentSubscription={selectedSubscriptionProject.subscription}
            onSubscribe={handleSubscribe}
            onCancelSubscription={handleCancelSubscription}
            onRenewSubscription={handleRenewSubscription}
            onUpdatePaymentMethod={() => console.log("Update payment method")}
          />
        ) : (
          <ProjectsList
            onViewProject={handleViewProject}
            onManageSubscription={handleManageSubscription}
          />
        )}
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Chain Capital. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
