"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Star, EyeOff, RotateCcw, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";

type Poem = Database["public"]["Tables"]["poems"]["Row"];
type PoemWithAuthor = Poem & { profiles: Database["public"]["Tables"]["profiles"]["Row"] };

export default function AdminPoemsPage() {
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "hidden" | "removed" | "draft">("all");
  const [confirm, setConfirm] = useState<{ action: string; poemId: string; poemTitle: string } | null>(null);

  const fetchPoems = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("poems")
      .select("*, profiles!inner(*)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setPoems((data as PoemWithAuthor[]) || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchPoems(); }, [fetchPoems]);

  const handleAction = async (action: string, poemId: string) => {
    setConfirm(null);

    switch (action) {
      case "feature": {
        const { error } = await supabase.from("featured_content").insert({
          content_type: "poem",
          content_id: poemId,
        });
        if (!error) fetchPoems();
        break;
      }
      case "unfeature": {
        await supabase.from("featured_content").delete().eq("content_type", "poem").eq("content_id", poemId);
        fetchPoems();
        break;
      }
      case "hide": {
        await supabase.from("poems").update({ status: "hidden" }).eq("id", poemId);
        fetchPoems();
        break;
      }
      case "restore": {
        await supabase.from("poems").update({ status: "published" }).eq("id", poemId);
        fetchPoems();
        break;
      }
      case "delete": {
        await supabase.from("poems").update({ status: "removed" }).eq("id", poemId);
        fetchPoems();
        break;
      }
    }
  };

  const filters = [
    { id: "all" as const, label: "All" },
    { id: "published" as const, label: "Published" },
    { id: "hidden" as const, label: "Hidden" },
    { id: "removed" as const, label: "Removed" },
    { id: "draft" as const, label: "Drafts" },
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

      {loading ? (
        <AdminSkeleton rows={8} />
      ) : poems.length > 0 ? (
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
      ) : (
        <AdminEmptyState title="No poems found" description={filter === "all" ? "No poems exist yet." : `No ${filter} poems.`} />
      )}

      {confirm && (
        <ConfirmDialog
          title={
            confirm.action === "feature" ? "Feature this poem?" :
            confirm.action === "unfeature" ? "Remove from featured?" :
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
          onConfirm={() => handleAction(confirm.action, confirm.poemId)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
