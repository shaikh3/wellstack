"use client";

import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAlertStore } from "@/lib/store/alertStore";
import Link from "next/link";

export function TopNav() {
  const criticalCount = useAlertStore((state) => state.getCriticalAlerts().length);
  const warningCount = useAlertStore((state) => state.getWarningAlerts().length);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">
          Welcome back, Administrator
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/alerts">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {(criticalCount > 0 || warningCount > 0) && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                {criticalCount + warningCount}
              </span>
            )}
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-slate-200 text-slate-700">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-sm md:block">
            <p className="font-medium">Admin User</p>
            <p className="text-xs text-slate-500">Property Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
