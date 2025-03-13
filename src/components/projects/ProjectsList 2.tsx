import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Loader2, RefreshCw } from "lucide-react";
import ProjectCard from "./ProjectCard";
import ProjectDialog from "./ProjectDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

const ProjectsList = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [projectStats, setProjectStats] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Fetch projects from Supabase
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProjects(data || []);

      // Fetch stats for each project
      if (data && data.length > 0) {
        const statsMap: Record<string, any> = {};

        for (const project of data) {
          // Get investor count
          const { count: investorCount, error: countError } = await supabase
            .from("subscriptions")
            .select("investor_id", { count: "exact", head: true })
            .eq("project_id", project.id);

          if (countError)
            console.error("Error fetching investor count:", countError);

          // Get total raised
          const { data: subscriptions, error: subError } = await supabase
            .from("subscriptions")
            .select("fiat_amount")
            .eq("project_id", project.id);

          if (subError)
            console.error("Error fetching subscriptions:", subError);

          const totalRaised =
            subscriptions?.reduce(
              (sum, sub) => sum + (sub.fiat_amount || 0),
              0,
            ) || 0;

          statsMap[project.id] = {
            totalInvestors: investorCount || 0,
            totalRaised,
          };
        }

        setProjectStats(statsMap);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter projects based on search query and filters
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter ? project.status === statusFilter : true;
    const matchesType = typeFilter ? project.project_type === typeFilter : true;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle adding a new project
  const handleAddProject = async (projectData: any) => {
    try {
      setIsProcessing(true);

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("projects")
        .insert({
          ...projectData,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) throw error;

      // Create a cap table for this project
      const { error: capTableError } = await supabase
        .from("cap_tables")
        .insert({
          project_id: data.id,
          created_at: now,
          updated_at: now,
        });

      if (capTableError) throw capTableError;

      setProjects((prev) => [data, ...prev]);

      // Initialize stats for the new project
      setProjectStats((prev) => ({
        ...prev,
        [data.id]: { totalInvestors: 0, totalRaised: 0 },
      }));

      toast({
        title: "Success",
        description: "Project created successfully",
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error("Error adding project:", err);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle editing a project
  const handleEditProject = async (projectData: any) => {
    if (!currentProject) return;

    try {
      setIsProcessing(true);

      const { data, error } = await supabase
        .from("projects")
        .update({
          ...projectData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentProject.id)
        .select()
        .single();

      if (error) throw error;

      setProjects((prev) =>
        prev.map((project) =>
          project.id === currentProject.id ? data : project,
        ),
      );

      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      setIsEditDialogOpen(false);
      setCurrentProject(null);
    } catch (err) {
      console.error("Error updating project:", err);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle deleting a project
  const handleDeleteProject = async () => {
    if (!currentProject) return;

    try {
      setIsProcessing(true);

      // Get the cap table for this project
      const { data: capTable, error: capTableError } = await supabase
        .from("cap_tables")
        .select("id")
        .eq("project_id", currentProject.id)
        .maybeSingle();

      if (capTableError) throw capTableError;

      if (capTable) {
        // Delete cap table investors
        const { error: investorsError } = await supabase
          .from("cap_table_investors")
          .delete()
          .eq("cap_table_id", capTable.id);

        if (investorsError) throw investorsError;

        // Delete cap table
        const { error: deleteCapTableError } = await supabase
          .from("cap_tables")
          .delete()
          .eq("id", capTable.id);

        if (deleteCapTableError) throw deleteCapTableError;
      }

      // Get subscriptions for this project
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("project_id", currentProject.id);

      if (subscriptionsError) throw subscriptionsError;

      if (subscriptions && subscriptions.length > 0) {
        const subscriptionIds = subscriptions.map((sub) => sub.id);

        // Delete token allocations
        const { error: allocationsError } = await supabase
          .from("token_allocations")
          .delete()
          .in("subscription_id", subscriptionIds);

        if (allocationsError) throw allocationsError;

        // Delete subscriptions
        const { error: deleteSubscriptionsError } = await supabase
          .from("subscriptions")
          .delete()
          .eq("project_id", currentProject.id);

        if (deleteSubscriptionsError) throw deleteSubscriptionsError;
      }

      // Delete the project
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", currentProject.id);

      if (error) throw error;

      setProjects((prev) =>
        prev.filter((project) => project.id !== currentProject.id),
      );

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setCurrentProject(null);
    } catch (err) {
      console.error("Error deleting project:", err);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setStatusFilter(null);
    setTypeFilter(null);
    setSearchQuery("");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your token issuance projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchProjects}
            disabled={isLoading}
            title="Refresh projects"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setCurrentProject(null);
              setIsAddDialogOpen(true);
            }}
            disabled={isProcessing}
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter || ""}
            onValueChange={(value) => setTypeFilter(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="equity">Equity</SelectItem>
              <SelectItem value="token">Token</SelectItem>
              <SelectItem value="debt">Debt</SelectItem>
              <SelectItem value="convertible">Convertible</SelectItem>
            </SelectContent>
          </Select>

          {(statusFilter || typeFilter || searchQuery) && (
            <Button variant="ghost" onClick={resetFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchProjects}>
            Retry
          </Button>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              stats={
                projectStats[project.id] || {
                  totalInvestors: 0,
                  totalRaised: 0,
                }
              }
              onEdit={() => {
                setCurrentProject(project);
                setIsEditDialogOpen(true);
              }}
              onDelete={() => {
                setCurrentProject(project);
                setIsDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Plus className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">
              {searchQuery || statusFilter || typeFilter
                ? "No matching projects found"
                : "No projects yet"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {searchQuery || statusFilter || typeFilter
                ? "Try adjusting your search or filters"
                : "Create your first project to start managing token issuances"}
            </p>
            {!(searchQuery || statusFilter || typeFilter) && (
              <Button
                onClick={() => {
                  setCurrentProject(null);
                  setIsAddDialogOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Project</span>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Project Dialog */}
      <ProjectDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddProject}
        isProcessing={isProcessing}
        title="Create New Project"
        description="Set up a new token issuance project"
      />

      {/* Edit Project Dialog */}
      {currentProject && (
        <ProjectDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEditProject}
          isProcessing={isProcessing}
          title="Edit Project"
          description="Update project details"
          defaultValues={currentProject}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {currentProject && (
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteProject}
          isProcessing={isProcessing}
          itemName={currentProject.name}
          itemType="project"
        />
      )}
    </div>
  );
};

export default ProjectsList;
