"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Home,
  Lock,
  Users,
  Bell,
  FileText,
  Thermometer,
  Settings,
  Heart,
  Wind,
  Shield,
  ClipboardCheck,
  FileWarning,
  UsersRound,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePortfolioStore } from "@/lib/store/portfolioStore";

interface NavSection {
  label: string;
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navSections: NavSection[] = [
  {
    label: 'Operations',
    items: [
      { href: "/portfolio", label: "Portfolio", icon: LayoutDashboard },
      { href: "/properties", label: "Properties", icon: Building2 },
      { href: "/residents", label: "Residents", icon: Users },
      { href: "/access", label: "Access", icon: Lock },
      { href: "/hvac", label: "HVAC", icon: Thermometer },
    ],
  },
  {
    label: 'Wellness',
    items: [
      { href: "/alerts", label: "Alert Center", icon: Bell },
      { href: "/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { href: "/compliance", label: "WELL Compliance", icon: ClipboardCheck },
      { href: "/incidents", label: "Incidents", icon: FileWarning },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: "/community", label: "Community", icon: UsersRound },
      { href: "/portfolio/wellness", label: "Benchmarking", icon: BarChart3 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const resetDemo = usePortfolioStore((state) => state.resetDemo);

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-50">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/portfolio" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <Home className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-900">WellStack</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-1">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-3 h-8",
                        isActive && "bg-slate-200 text-slate-900"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-slate-600"
          onClick={() => {
            resetDemo();
            window.location.reload();
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          Reset Demo
        </Button>
      </div>
    </div>
  );
}
