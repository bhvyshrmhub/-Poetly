"use client";

import { useState, useEffect, useCallback } from "react";
import AdminCard from "@/components/admin/AdminCard";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";

interface ActivityEntry {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: string | null;
  created_at: string;
  admin_id: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    poems: 0,
    publishedPoems: 0,
    draftPoems: 0,
    reports: 0,
    pendingReports: 0,
    comments: 0,
    featured: 0,
  });
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/data?type=dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const json = await res.json();
      if (json.stats) setStats(json.stats);
      if (json.activity) setActivity(json.activity);
    } catch (err) {
      setError("Failed to load dashboard statistics.");
      console.error("Dashboard stats error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-xl font-medium text-text-primary mb-1">Dashboard</h1>
          <p className="text-sm text-text-secondary">Overview of Poetly community.</p>
        </div>
        <AdminSkeleton rows={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-xl font-medium text-text-primary mb-1">Dashboard</h1>
          <p className="text-sm text-text-secondary">Overview of Poetly community.</p>
        </div>
        <div className="bg-error-subtle border border-error/20 rounded-[var(--radius-md)] p-4">
          <p className="text-sm text-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-medium text-text-primary mb-1">Dashboard</h1>
        <p className="text-sm text-text-secondary">Overview of Poetly community.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <AdminCard label="Total Users" value={stats.users} />
        <AdminCard label="Total Poems" value={stats.poems} sub={`${stats.publishedPoems} published, ${stats.draftPoems} drafts`} />
        <AdminCard label="Pending Reports" value={stats.pendingReports} sub={stats.pendingReports > 0 ? "Needs attention" : "All clear"} />
        <AdminCard label="Comments" value={stats.comments} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <AdminCard label="Published Poems" value={stats.publishedPoems} />
        <AdminCard label="Draft Poems" value={stats.draftPoems} />
        <AdminCard label="Featured Content" value={stats.featured} />
      </div>

      <div className="bg-surface border border-border-subtle rounded-[var(--radius-md)] p-5">
        <h2 className="text-sm font-medium text-text-primary mb-4">Recent Activity</h2>
        {activity.length > 0 ? (
          <div className="space-y-3">
            {activity.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-secondary">
                    <span className="text-text-primary font-medium">{entry.action}</span>
                    {entry.target_type && (
                      <span className="text-text-tertiary"> on {entry.target_type}</span>
                    )}
                    {entry.details && (
                      <span className="text-text-tertiary"> — {entry.details}</span>
                    )}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AdminEmptyState title="No activity yet" description="Admin actions will appear here." />
        )}
      </div>
    </div>
  );
}
