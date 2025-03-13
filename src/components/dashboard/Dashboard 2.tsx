import React, { useState, useEffect } from "react";
import { getProjects } from "@/lib/projects";
import { getInvestors } from "@/lib/investors";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Users, BarChart, TrendingUp, Plus } from "lucide-react";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalProjects: 0,
    activeProjects: 0,
    draftProjects: 0,
    completedProjects: 0,
    totalInvestors: 0,
    newInvestorsThisMonth: 0,
    totalAllocation: 0,
    allocationThisQuarter: 0,
    averageInvestment: 0,
    percentChangeInAverage: 0,
    recentProjects: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch projects from Supabase
        const projects = await getProjects();

        // Fetch investors from Supabase
        const investors = await getInvestors();

        // Calculate dashboard metrics
        const activeProjects = projects.filter(
          (p) => p.status === "active",
        ).length;
        const draftProjects = projects.filter(
          (p) => p.status === "draft",
        ).length;
        const completedProjects = projects.filter(
          (p) => p.status === "completed",
        ).length;

        // Calculate total allocation
        const totalAllocation = projects.reduce(
          (sum, project) => sum + project.target_raise,
          0,
        );

        // Calculate average investment (if we have investors and allocations)
        const averageInvestment =
          investors.length > 0 ? totalAllocation / investors.length : 0;

        // Get recent projects (sorted by updated_at)
        const recentProjects = [...projects]
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime(),
          )
          .slice(0, 3)
          .map((project) => ({
            id: project.id,
            name: project.name,
            updatedAt: new Date(project.updated_at).toLocaleDateString(),
          }));

        setDashboardData({
          totalProjects: projects.length,
          activeProjects,
          draftProjects,
          completedProjects,
          totalInvestors: investors.length,
          newInvestorsThisMonth: Math.round(investors.length * 0.2), // Placeholder calculation
          totalAllocation,
          allocationThisQuarter: Math.round(totalAllocation * 0.15), // Placeholder calculation
          averageInvestment,
          percentChangeInAverage: 12, // Placeholder calculation
          recentProjects,
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Chain Capital platform
          </p>
        </div>
        <Button asChild>
          <Link to="/projects" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData.totalProjects}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardData.activeProjects} active,{" "}
                {dashboardData.draftProjects} draft,{" "}
                {dashboardData.completedProjects} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Investors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData.totalInvestors}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardData.newInvestorsThisMonth} new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${(dashboardData.totalAllocation / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${(dashboardData.allocationThisQuarter / 1000000).toFixed(1)}M
                this quarter
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${(dashboardData.averageInvestment / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +{dashboardData.percentChangeInAverage}% from last quarter
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Your most recently updated projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentProjects.length > 0 ? (
                dashboardData.recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {project.updatedAt}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/projects`} state={{ projectId: project.id }}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No projects found
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/projects">View All Projects</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to="/projects" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Manage Projects</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to="/investors" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>View Investors</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to="/reports" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  <span>Generate Reports</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>Run Scenario</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
