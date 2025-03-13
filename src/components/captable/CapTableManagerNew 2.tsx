import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import CapTableNavigation from "./CapTableNavigation";
import CapTableDashboard from "./CapTableDashboard";
import InvestorsList from "../investors/InvestorsList";
import SubscriptionManager from "./SubscriptionManager";
import TokenAllocationManager from "./TokenAllocationManager";
import TokenMintingManager from "./TokenMintingManager";
import TokenDistributionManager from "./TokenDistributionManager";
import CompliancePanel from "./CompliancePanel";
import ProjectSelector from "./ProjectSelector";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface CapTableManagerProps {
  projectId?: string;
  section?: string;
}

function CapTableManagerNew({ projectId, section }: CapTableManagerProps) {
  console.log("CapTableManagerNew rendering with:", { projectId, section });
  const params = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const { toast } = useToast();

  // Use projectId from props or from URL params
  const currentProjectId = projectId || params.projectId;
  const currentSection = section || params.section || "overview";

  console.log("Resolved params:", {
    currentProjectId,
    currentSection,
    rawParams: params,
  });

  useEffect(() => {
    if (currentProjectId) {
      console.log("Fetching project details for ID:", currentProjectId);
      fetchProjectDetails();
    }
  }, [currentProjectId]);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", currentProjectId)
        .single();

      if (error) throw error;
      console.log("Project data fetched:", data);
      setProject(data);
    } catch (err) {
      console.error("Error fetching project details:", err);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleProjectChange = (newProjectId: string) => {
    if (currentSection === "overview") {
      navigate(`/projects/${newProjectId}/captable`);
    } else {
      navigate(`/projects/${newProjectId}/captable/${currentSection}`);
    }
  };

  // Simple placeholder for testing
  const renderSimplePlaceholder = () => {
    return (
      <div className="p-6 bg-white rounded-lg shadow m-6">
        <h2 className="text-xl font-bold mb-4">Cap Table Manager</h2>
        <p className="mb-2">Current Project ID: {currentProjectId || "None"}</p>
        <p className="mb-2">Current Section: {currentSection}</p>
        <p className="mb-2">Project Name: {project?.name || "Unknown"}</p>
        <p>Status: {isLoading ? "Loading..." : "Ready"}</p>
      </div>
    );
  };

  const renderSection = () => {
    console.log("Rendering section:", currentSection);

    // Uncomment this line to use the simple placeholder for testing
    // return renderSimplePlaceholder();

    switch (currentSection) {
      case "overview":
        return <CapTableDashboard projectId={currentProjectId} />;
      case "investors":
        return <InvestorsList projectId={currentProjectId} />;
      case "subscriptions":
        return <SubscriptionManager projectId={currentProjectId} />;
      case "allocations":
        return (
          <TokenAllocationManager
            projectId={currentProjectId || ""}
            projectName={project?.name}
          />
        );
      case "minting":
        return (
          <TokenMintingManager
            projectId={currentProjectId || ""}
            projectName={project?.name}
          />
        );
      case "distributions":
        return (
          <TokenDistributionManager
            projectId={currentProjectId || ""}
            projectName={project?.name}
          />
        );
      case "compliance":
        return <CompliancePanel projectId={currentProjectId || ""} />;
      case "reports":
        return (
          <div className="p-6 bg-white rounded-lg shadow m-6">
            Reports Module (Coming Soon)
          </div>
        );
      case "documents":
        return (
          <div className="p-6 bg-white rounded-lg shadow m-6">
            Documents Module (Coming Soon)
          </div>
        );
      default:
        return <CapTableDashboard projectId={currentProjectId} />;
    }
  };

  return (
    <div className="w-full h-full bg-gray-50">
      {currentProjectId && <CapTableNavigation projectId={currentProjectId} />}

      {currentSection !== "overview" && (
        <div className="p-6 pb-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {project?.name || "Project"} -{" "}
                  {currentSection.charAt(0).toUpperCase() +
                    currentSection.slice(1)}
                </h1>
                <p className="text-muted-foreground">
                  Manage {currentSection} for this project
                </p>
              </div>
            </div>
            {currentProjectId && (
              <ProjectSelector
                currentProjectId={currentProjectId}
                onProjectChange={handleProjectChange}
              />
            )}
          </div>
        </div>
      )}

      {renderSection()}
    </div>
  );
}

export default CapTableManagerNew;
