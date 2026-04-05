"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { fetchDashboardStats } from "@/lib/api";
import type { DashboardStats } from "@/lib/mock-data";
import StatCard from "@/components/stat-card";
import BarChart from "@/components/bar-chart";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchDashboardStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center border-b border-gray-200 bg-white px-6">
        <LayoutDashboard className="mr-2 h-4 w-4 text-gray-500" />
        <h1 className="text-sm font-semibold text-gray-900">Dashboard</h1>
      </header>

      <div className="flex-1 overflow-y-auto space-y-5 p-6">
        {/* Stat Cards */}
        <div className="grid gap-4 lg:grid-cols-3">
          <StatCard
            label="Total Active Posts"
            value={stats.totalActivePosts.value}
            changePercent={stats.totalActivePosts.changePercent}
            trend={stats.totalActivePosts.trend}
            note={stats.totalActivePosts.note}
          />
          <StatCard
            label="Pending Organizer Requests"
            value={stats.pendingOrganizerRequests.value}
            changePercent={stats.pendingOrganizerRequests.changePercent}
            trend={stats.pendingOrganizerRequests.trend}
            note={stats.pendingOrganizerRequests.note}
          />
          <StatCard
            label="Pending Content Approval"
            value={stats.pendingContentApproval.value}
            changePercent={stats.pendingContentApproval.changePercent}
            trend={stats.pendingContentApproval.trend}
            note={stats.pendingContentApproval.note}
          />
        </div>

        {/* Bar Chart */}
        <BarChart />
      </div>
    </>
  );
}
