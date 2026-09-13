"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Star, EyeOff, RotateCcw, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";
import Toast from "@/components/Toast";

type Poem = Database["public"]["Tables"]["poems"]["Row"];
type PoemWithAuthor = Poem & { profiles: Database["public"]["Tables"]["profiles"]["Row"] };

const PAGE_SIZE = 20;

export default function AdminPoemsPage() {
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "hidden" | "removed" | "draft">("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [confirm, setConfirm] = useState<{ action: string; poemId: string; poemTitle: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logActivity = useCallback(async (action: string, targetId: string, details?: string) => {
    const supabase = createClient();
    await supabase.from("admin_activity_log").insert({
      admin_id: null,
      action,
      target_type: "poem",
      target_id: targetId,
      details: details || null,
    });
  }, []);

  const fetchPoems = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const offset = reset ? 0 : page * PAGE_SIZE;
      let query = supabase
        .from("poems")
        .select("*, profiles!inner(*)")
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const typedData = (data as PoemWithAuthor[]) || [];
      setPoems(reset ? typedData : [...poems, ...typedData]);
      setHasMore(typedData.length === PAGE_SIZE);
    } catch (err) {
      setError("Failed to load poems. Please try again.");
      console.error("Fetch poems error:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, page, poems]);

  useEffect(() => {
    setPage(0);
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .order("created_at", { ascending: false })
          .range(0, PAGE_SIZE - 1);
        if (filter !== "all") {
          const filtered = (data as PoemWithAuthor[] || []).filter((p) => p.status === filter);
          setPoems(filtered);
          setHasMore(filtered.length === PAGE_SIZE);
        } else {
          setPoems((data as PoemWithAuthor[]) || []);
          setHasMore((data as PoemWithAuthor[])?.length === PAGE_SIZE);
        }
        if (fetchError) throw fetchError;
      } catch (err) {
        setError("Failed to load poems. Please try again.");
        console.error("Fetch poems error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter]);

  const handleAction = async (action: string, poemId: string, poemTitle: string) => {
    setConfirm(null);
    const supabase = createClient();

    try {
      switch (action) {
        case "feature": {
          const { error } = await supabase.from("featured_content").insert({
            content_type: "poem",
            content_id: poemId,
          });
          if (error) throw error;
          await logActivity("featured_poem", poemId, poemTitle);
          setToast("Poem featured successfully.");
          break;
        }
        case "hide": {
          const { error } = await supabase.from("poems").update({ status: "hidden" }).eq("id", poemId);
          if (error) throw error;
          await logActivity("hidden_poem", poemId, poemTitle);
          setToast("Poem hidden.");
          break;
        }
        case "restore": {
          const { error } = await supabase.from("poems").update({ status: "published" }).eq("id", poemId);
          if (error) throw error;
          await logActivity("restored_poem", poemId, poemTitle);
          setToast("Poem restored to published.");
          break;
        }
        case "delete": {
          const { error } = await supabase.from("poems").update({ status: "removed" }).eq("id", poemId);
          if (error) throw error;
          await logActivity("removed_poem", poemId, poemTitle);
          setToast("Poem removed.");
          break;
        }
      }
      fetchPoems(true);
    } catch (err) {
      setToast("Action failed. Please try again.");
      console.error("Poem action error:", err);
    }
  };

  const filters = [
    { id: "all" as const, label: "All" },
    { id: "published" as const, label: "Published" },
    { id: "draft" as const, label: "Drafts" },
    { id: "hidden" as const, label: "Hidden" },
    { id: "removed" as const, label: "Removed" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-text-primary mb-1">Poems</h1>
        <p className="text-sm text-text-secondary">Manage poem content.</p>
      </div>

      <div className="flex gap-1 mb-6 bg-surface-secondary rounded-[var(--radius-full)] p-1 max-w-fit">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filter === f.id ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-error-subtle border border-error/20 rounded-[var(--radius-md)] p-4 mb-6">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {loading && poems.length === 0 ? (
        <AdminSkeleton rows={8} />
      ) : poems.length > 0 ? (
        <>
          <div className="space-y-0">
            {poems.map((poem) => (
              <div key={poem.id} className="flex items-center gap-4 py-4 border-b border-border-subtle group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/poem/${poem.id}`} className="text-sm font-medium text-text-primary hover:text-brand transition-colors truncate">
                      {poem.title}
                    </Link>
                    <ExternalLink size={12} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-tertiary">
                    <span>{poem.profiles?.display_name || "Unknown"}</span>
                    <span>{new Date(poem.created_at).toLocaleDateString()}</span>
                    {poem.visibility !== "public" && (
                      <span className="text-warning text-[10px] uppercase">{poem.visibility}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <StatusBadge status={poem.status} />
                </div>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setConfirm({ action: "feature", poemId: poem.id, poemTitle: poem.title })}
                    className="p-1.5 text-text-tertiary hover:text-brand transition-colors"
                    title="Feature"
                  >
                    <Star size={14} strokeWidth={1.5} />
                  </button>
                  {poem.status === "hidden" ? (
                    <button
                      onClick={() => setConfirm({ action: "restore", poemId: poem.id, poemTitle: poem.title })}
                      className="p-1.5 text-text-tertiary hover:text-success transition-colors"
                      title="Restore"
                    >
                      <RotateCcw size={14} strokeWidth={1.5} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirm({ action: "hide", poemId: poem.id, poemTitle: poem.title })}
                      className="p-1.5 text-text-tertiary hover:text-warning transition-colors"
                      title="Hide"
                    >
                      <EyeOff size={14} strokeWidth={1.5} />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirm({ action: "delete", poemId: poem.id, poemTitle: poem.title })}
                    className="p-1.5 text-text-tertiary hover:text-error transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-text-tertiary">
              Showing {poems.length} poem{poems.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setPage(Math.max(0, page - 1)); fetchPoems(true); }}
                disabled={page === 0}
                className="p-1.5 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-text-tertiary">Page {page + 1}</span>
              <button
                onClick={() => { setPage(page + 1); fetchPoems(false); }}
                disabled={!hasMore || loading}
                className="p-1.5 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <AdminEmptyState title="No poems found" description={filter === "all" ? "No poems exist yet." : `No ${filter} poems.`} />
      )}

      {confirm && (
        <ConfirmDialog
          title={
            confirm.action === "feature" ? "Feature this poem?" :
            confirm.action === "hide" ? "Hide this poem?" :
            confirm.action === "restore" ? "Restore this poem?" :
            "Remove this poem?"
          }
          message={
            confirm.action === "delete"
              ? `This will permanently remove "${confirm.poemTitle}" from Poetly.`
              : confirm.action === "hide"
              ? `This will hide "${confirm.poemTitle}" from public view.`
              : `Perform this action on "${confirm.poemTitle}"?`
          }
          confirmLabel={
            confirm.action === "feature" ? "Feature" :
            confirm.action === "hide" ? "Hide" :
            confirm.action === "restore" ? "Restore" :
            "Remove"
          }
          danger={confirm.action === "delete"}
          onConfirm={() => handleAction(confirm.action, confirm.poemId, confirm.poemTitle)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
