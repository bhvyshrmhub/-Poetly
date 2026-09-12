"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import AdminCard from "@/components/admin/AdminCard";
import AdminSkeleton from "@/components/admin/AdminSkeleton";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    poems: 0,
    reports: 0,
    featured: 0,
    prompts: 0,
    collections: 0,
    comments: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [poems, reports, featured, prompts, collections, comments] = await Promise.all([
        supabase.from("poems").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("featured_content").select("id", { count: "exact", head: true }),
        supabase.from("prompts").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("collections").select("id", { count: "exact", head: true }),
        supabase.from("comments").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        poems: poems.count || 0,
        reports: reports.count || 0,
        featured: featured.count || 0,
        prompts: prompts.count || 0,
        collections: collections.count || 0,
        comments: comments.count || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-medium text-text-primary mb-1">Dashboard</h1>
        <p className="text-sm text-text-secondary">Overview of Poetly community.</p>
      </div>

      {loading ? (
        <AdminSkeleton rows={3} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <AdminCard label="Total Poems" value={stats.poems} />
            <AdminCard label="Pending Reports" value={stats.reports} sub={stats.reports > 0 ? "Needs attention" : "All clear"} />
            <AdminCard label="Featured" value={stats.featured} />
            <AdminCard label="Active Prompts" value={stats.prompts} />
            <AdminCard label="Collections" value={stats.collections} />
            <AdminCard label="Comments" value={stats.comments} />
          </div>

          <div className="bg-surface border border-border-subtle rounded-[var(--radius-md)] p-5">
            <h2 className="text-sm font-medium text-text-primary mb-3">Users</h2>
            <p className="text-sm text-text-tertiary">
              User management will become available when authentication is enabled.
            </p>
          </div>

          <div className="mt-6 bg-surface border border-border-subtle rounded-[var(--radius-md)] p-5">
            <h2 className="text-sm font-medium text-text-primary mb-3">Recent Activity</h2>
            <p className="text-sm text-text-tertiary">
              Activity logging will begin when admin authentication is connected.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
