"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";

type FeaturedRow = Database["public"]["Tables"]["featured_content"]["Row"];
type Poem = Database["public"]["Tables"]["poems"]["Row"];
type Prompt = Database["public"]["Tables"]["prompts"]["Row"];

interface FeaturedItem extends FeaturedRow {
  poem?: Poem;
  prompt?: Prompt;
}

export default function AdminFeaturedPage() {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<"poem" | "prompt">("poem");
  const [availablePoems, setAvailablePoems] = useState<Poem[]>([]);
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);
  const [confirm, setConfirm] = useState<{ id: string } | null>(null);

  const fetchFeatured = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("featured_content").select("*").order("position", { ascending: true });
      const featured = (data as FeaturedRow[]) || [];

      const enriched = await Promise.all(
        featured.map(async (f) => {
          if (f.content_type === "poem") {
            const { data: poem } = await supabase.from("poems").select("*").eq("id", f.content_id).single();
            return { ...f, poem: poem as Poem };
          }
          if (f.content_type === "prompt") {
            const { data: prompt } = await supabase.from("prompts").select("*").eq("id", f.content_id).single();
            return { ...f, prompt: prompt as Prompt };
          }
          return f;
        })
      );

      setItems(enriched);
    } catch (error) {
      console.error("Failed to fetch featured content:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeatured(); }, [fetchFeatured]);

  const loadAvailable = async () => {
    try {
      const [poemsRes, promptsRes] = await Promise.all([
        supabase.from("poems").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(20),
        supabase.from("prompts").select("*").order("created_at", { ascending: false }).limit(20),
      ]);
      setAvailablePoems((poemsRes.data as Poem[]) || []);
      setAvailablePrompts((promptsRes.data as Prompt[]) || []);
    } catch (error) {
      console.error("Failed to load available content:", error);
    }
  };

  const handleAdd = async (contentId: string) => {
    try {
      const maxPos = items.reduce((max, i) => Math.max(max, i.position), -1);
      await supabase.from("featured_content").insert({
        content_type: addType,
        content_id: contentId,
        position: maxPos + 1,
      });
      setShowAdd(false);
      fetchFeatured();
    } catch (error) {
      console.error("Failed to add featured content:", error);
    }
  };

  const handleRemove = async (id: string) => {
    setConfirm(null);
    try {
      await supabase.from("featured_content").delete().eq("id", id);
      fetchFeatured();
    } catch (error) {
      console.error("Failed to remove featured content:", error);
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const updated = [...items];
    [updated[idx].position, updated[swapIdx].position] = [updated[swapIdx].position, updated[idx].position];
    const [moved] = updated.splice(idx, 1);
    updated.splice(swapIdx, 0, moved);

    try {
      await Promise.all(
        updated.map((item) =>
          supabase.from("featured_content").update({ position: item.position }).eq("id", item.id)
        )
      );
      setItems(updated);
    } catch (error) {
      console.error("Failed to reorder featured content:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-text-primary mb-1">Featured</h1>
          <p className="text-sm text-text-secondary">Manage featured content on Poetly.</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); loadAvailable(); }}
          className="flex items-center gap-1.5 text-xs font-medium text-brand border border-brand/30 hover:border-brand px-3 py-1.5 rounded-full transition-colors"
        >
          <Plus size={12} strokeWidth={2} /> Add Featured
        </button>
      </div>

      {loading ? (
        <AdminSkeleton rows={4} />
      ) : items.length > 0 ? (
        <div className="space-y-0">
          {items.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3 py-4 border-b border-border-subtle group">
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleMove(item.id, "up")}
                  disabled={idx === 0}
                  className="text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors text-[10px]"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleMove(item.id, "down")}
                  disabled={idx === items.length - 1}
                  className="text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors text-[10px]"
                >
                  ▼
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-text-tertiary uppercase tracking-widest">{item.content_type}</span>
                  <span className="text-[10px] text-text-tertiary">#{item.position}</span>
                </div>
                {item.poem && (
                  <Link href={`/poem/${item.poem.id}`} className="text-sm font-medium text-text-primary hover:text-brand transition-colors">
                    {item.poem.title}
                  </Link>
                )}
                {item.prompt && (
                  <Link href={`/prompts/${item.prompt.id}`} className="text-sm font-medium text-text-primary hover:text-brand transition-colors italic">
                    &ldquo;{item.prompt.title}&rdquo;
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.poem && (
                  <Link href={`/poem/${item.poem.id}`} className="p-1.5 text-text-tertiary hover:text-text-primary transition-colors">
                    <ExternalLink size={14} strokeWidth={1.5} />
                  </Link>
                )}
                <button
                  onClick={() => setConfirm({ id: item.id })}
                  className="p-1.5 text-text-tertiary hover:text-error transition-colors"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          title="No featured content"
          description="Feature poems or prompts to highlight them on Poetly."
        />
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-surface border border-border-subtle rounded-[var(--radius-lg)] p-6 max-w-md w-full shadow-xl animate-fade-in max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-medium text-text-primary mb-4">Add Featured Content</h3>
            <div className="flex gap-1 mb-4 bg-surface-secondary rounded-[var(--radius-full)] p-1">
              {(["poem", "prompt"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setAddType(t)}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-full transition-all capitalize ${
                    addType === t ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary"
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {addType === "poem"
                ? availablePoems.map((poem) => (
                    <button
                      key={poem.id}
                      onClick={() => handleAdd(poem.id)}
                      className="w-full text-left px-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-surface-hover transition-colors"
                    >
                      <p className="text-sm font-medium text-text-primary truncate">{poem.title}</p>
                    </button>
                  ))
                : availablePrompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handleAdd(prompt.id)}
                      className="w-full text-left px-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-surface-hover transition-colors"
                    >
                      <p className="text-sm font-medium text-text-primary truncate italic">&ldquo;{prompt.title}&rdquo;</p>
                    </button>
                  ))}
            </div>
            <button onClick={() => setShowAdd(false)} className="mt-4 text-xs text-text-tertiary hover:text-text-primary">Close</button>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title="Remove from featured?"
          message="This will remove the content from the featured list."
          confirmLabel="Remove"
          danger
          onConfirm={() => handleRemove(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
