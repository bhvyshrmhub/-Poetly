"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";

type ActivityLog = Database["public"]["Tables"]["admin_activity_log"]["Row"];

const PAGE_SIZE = 30;

export default function AdminActivityPage() {
  const [entries, setEntries] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const offset = reset ? 0 : page * PAGE_SIZE;
      const { data, error: fetchError } = await supabase
        .from("admin_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);
      if (fetchError) throw fetchError;

      const typedData = (data as ActivityLog[]) || [];
      setEntries(reset ? typedData : [...entries, ...typedData]);
      setHasMore(typedData.length === PAGE_SIZE);
    } catch (err) {
      setError("Failed to load activity log.");
      console.error("Fetch activity error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, entries]);

  useEffect(() => {
    setPage(0);
    setLoading(true);
    const load = async () => {
      setError(null);
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("admin_activity_log")
          .select("*")
          .order("created_at", { ascending: false })
          .range(0, PAGE_SIZE - 1);
        if (fetchError) throw fetchError;
        setEntries((data as ActivityLog[]) || []);
        setHasMore((data as ActivityLog[])?.length === PAGE_SIZE);
      } catch (err) {
        setError("Failed to load activity log.");
        console.error("Fetch activity error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-text-primary mb-1">Activity Log</h1>
        <p className="text-sm text-text-secondary">Record of all admin actions.</p>
      </div>

      {error && (
        <div className="bg-error-subtle border border-error/20 rounded-[var(--radius-md)] p-4 mb-6">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {loading && entries.length === 0 ? (
        <AdminSkeleton rows={10} />
      ) : entries.length > 0 ? (
        <>
          <div className="space-y-0">
            {entries.map((entry) => (
              <div key={entry.id} className="py-3 border-b border-border-subtle">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-text-primary">{formatAction(entry.action)}</span>
                      {entry.target_type && (
                        <span className="text-[10px] text-text-tertiary uppercase tracking-wider">{entry.target_type}</span>
                      )}
                    </div>
                    {entry.details && (
                      <p className="text-xs text-text-secondary line-clamp-1">{entry.details}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-text-tertiary">{new Date(entry.created_at).toLocaleString()}</span>
                      {entry.target_id && (
                        <span className="text-[10px] text-text-tertiary font-mono">{entry.target_id.slice(0, 8)}...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-text-tertiary">
              Showing {entries.length} entr{entries.length !== 1 ? "ies" : "y"}
            </p>
            <button
              onClick={() => { setPage(page + 1); fetchActivity(false); }}
              disabled={!hasMore || loading}
              className="text-xs text-brand hover:text-brand-hover disabled:opacity-30 transition-colors"
            >
              {loading ? "Loading..." : hasMore ? "Load more" : "No more entries"}
            </button>
          </div>
        </>
      ) : (
        <AdminEmptyState
          title="No activity yet"
          description="Admin actions will be recorded here."
        />
      )}
    </div>
  );
}
