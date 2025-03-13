import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Dashboard from "./components/dashboard/Dashboard";
import InvestorsList from "./components/investors/InvestorsList";
import ReportsDashboard from "./components/reports/ReportsDashboard";
import TokenBuilder from "./components/tokens/TokenBuilder";
import TokenAdministration from "./components/tokens/TokenAdministration";
import MainLayout from "./components/layout/MainLayout";
import CapTableManagerNew from "./components/captable/CapTableManagerNew";
import RuleManagementDashboard from "./components/rules/RuleManagementDashboard"; // Import rule management component


import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          {/* Main routes with layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Home />} />

            {/* Global Cap Table routes */}
            <Route
              path="/captable"
              element={<CapTableManagerNew section="overview" />}
            />
            <Route
              path="/captable/investors"
              element={<CapTableManagerNew section="investors" />}
            />
            <Route
              path="/captable/subscriptions"
              element={<CapTableManagerNew section="subscriptions" />}
            />
            <Route
              path="/captable/allocations"
              element={<CapTableManagerNew section="allocations" />}
            />
            <Route
              path="/captable/distributions"
              element={<CapTableManagerNew section="distributions" />}
            />
            <Route
              path="/captable/compliance"
              element={<CapTableManagerNew section="compliance" />}
            />
            <Route
              path="/captable/reports"
              element={<CapTableManagerNew section="reports" />}
            />
            <Route
              path="/captable/documents"
              element={<CapTableManagerNew section="documents" />}
            />
            <Route
              path="/captable/minting"
              element={<CapTableManagerNew section="minting" />}
            />

            {/* Project-specific Cap Table routes */}
            <Route
              path="/projects/:projectId/captable"
              element={<CapTableManagerNew />}
            />
            <Route
              path="/projects/:projectId/captable/investors"
              element={<CapTableManagerNew section="investors" />}
            />
            <Route
              path="/projects/:projectId/captable/subscriptions"
              element={<CapTableManagerNew section="subscriptions" />}
            />
            <Route
              path="/projects/:projectId/captable/allocations"
              element={<CapTableManagerNew section="allocations" />}
            />
            <Route
              path="/projects/:projectId/captable/distributions"
              element={<CapTableManagerNew section="distributions" />}
            />
            <Route
              path="/projects/:projectId/captable/compliance"
              element={<CapTableManagerNew section="compliance" />}
            />
            <Route
              path="/projects/:projectId/captable/reports"
              element={<CapTableManagerNew section="reports" />}
            />
            <Route
              path="/projects/:projectId/captable/documents"
              element={<CapTableManagerNew section="documents" />}
            />
            <Route
              path="/projects/:projectId/captable/minting"
              element={<CapTableManagerNew section="minting" />}
            />

            {/* Other routes */}
            <Route path="/rule-management" element={<RuleManagementDashboard />} />
            <Route path="/investors" element={<InvestorsList />} />
            <Route path="/reports" element={<ReportsDashboard />} />
            <Route
              path="/projects/:projectId/tokens"
              element={<TokenBuilder />}
            />
            <Route
              path="/projects/:projectId/token-admin"
              element={<TokenAdministration />}
            />
          </Route>
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
