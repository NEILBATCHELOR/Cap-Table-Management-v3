import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  FileText,
  Layers,
  Settings,
  Home,
  PieChart,
  Wallet,
  FileCheck,
  Shield,
  Coins,
  ShieldCheck,
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-primary/10",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground",
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="h-full w-64 border-r bg-white p-4 flex flex-col">
      <div className="mb-8 px-2">
        <h2 className="text-xl font-bold">Chain Capital</h2>
        <p className="text-xs text-muted-foreground">
          Asset Management Platform
        </p>
      </div>

      <div className="space-y-1">
        <SidebarItem
          icon={<Home className="h-4 w-4" />}
          label="Dashboard"
          href="/"
          active={pathname === "/"}
        />
        <SidebarItem
          icon={<Layers className="h-4 w-4" />}
          label="Projects"
          href="/projects"
          active={
            pathname.startsWith("/projects") && !pathname.includes("/captable")
          }
        />
      </div>

      <div className="mt-6">
        <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
          CAP TABLE
        </h3>
        <div className="space-y-1">
          <SidebarItem
            icon={<PieChart className="h-4 w-4" />}
            label="Cap Table Overview"
            href="/captable"
            active={pathname === "/captable"}
          />
          <SidebarItem
            icon={<Users className="h-4 w-4" />}
            label="Investors"
            href="/captable/investors"
            active={pathname === "/captable/investors"}
          />

          <SidebarItem
            icon={<Shield className="h-4 w-4" />}
            label="Compliance"
            href="/captable/compliance"
            active={pathname === "/captable/compliance"}
          />

          <SidebarItem
            icon={<BarChart3 className="h-4 w-4" />}
            label="Reports"
            href="/captable/reports"
            active={pathname === "/captable/reports"}
          />
          <SidebarItem
            icon={<FileText className="h-4 w-4" />}
            label="Documents"
            href="/captable/documents"
            active={pathname === "/captable/documents"}
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
          MANAGEMENT
        </h3>
        <div className="space-y-1">
  			<SidebarItem
    			icon={<ShieldCheck className="h-4 w-4" />}
    			label="Rule Management"
    			href="/rule-management"
    			active={pathname === "/rule-management"}
  		  />
          <SidebarItem
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            href="/settings"
            active={pathname === "/settings"}
          />
        </div>
      </div>

      <div className="mt-auto pt-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">CC</span>
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
