"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Collection, PoemWithAuthor } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import PoemCard from "@/components/PoemCard";
import AppShell from "@/components/shell/AppShell";
import Toast from "@/components/Toast";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPoem, setShowAddPoem] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isOwner = Boolean(user && collection && user.id === collection.user_id);

  const fetchData = useCallback(async () => {
    try {
      const { data: col, error: colErr } = await supabase
        .from("collections")
        .select("*")
        .eq("id", id)
        .single();

      if (colErr || !col) {
        setCollection(null);
        setLoading(false);
        return;
      }

      setCollection(col);
      setEditTitle(col.title);
      setEditDesc(col.description || "");

      const { data: cp } = await supabase
        .from("collection_poems")
        .select("poem_id")
        .eq("collection_id", id);

      const poemIds = cp?.map((r) => r.poem_id) || [];
      if (poemIds.length > 0) {
        const { data } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .in("id", poemIds);
        setPoems((data as PoemWithAuthor[]) || []);
      } else {
        setPoems([]);
      }
    } catch {
      setToast("Failed to load collection");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !collection) return;
    setSavingEdit(true);

    try {
      const { error } = await supabase
        .from("collections")
        .update({
          title: editTitle.trim(),
          description: editDesc.trim() || null,
        })
        .eq("id", id);

      if (!error) {
        setCollection({
          ...collection,
          title: editTitle.trim(),
          description: editDesc.trim() || null,
        });
        setIsEditing(false);
        setToast("Collection updated");
      } else {
        setToast("Failed to update collection");
      }
    } catch {
      setToast("Failed to update collection");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this collection? This action cannot be undone.")) {
      return;
    }
    setDeleting(true);

    try {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (!error) {
        router.push("/collections");
      } else {
        setToast("Failed to delete collection");
        setDeleting(false);
      }
    } catch {
      setToast("Failed to delete collection");
      setDeleting(false);
    }
  };

  const handleAddPoem = async (poemId: string) => {
    try {
      const { error } = await supabase
        .from("collection_poems")
        .insert({ collection_id: id, poem_id: poemId });

      if (!error) {
        setShowAddPoem(false);
        fetchData();
        setToast("Poem added to collection");
      } else {
        setToast("Failed to add poem");
      }
    } catch {
      setToast("Failed to add poem");
    }
  };

  const handleRemovePoem = async (poemId: string) => {
    try {
      const { error } = await supabase
        .from("collection_poems")
        .delete()
        .eq("collection_id", id)
        .eq("poem_id", poemId);

      if (!error) {
        setPoems(poems.filter((p) => p.id !== poemId));
        setToast("Poem removed from collection");
      } else {
        setToast("Failed to remove poem");
      }
    } catch {
      setToast("Failed to remove poem");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-[var(--content-width)] mx-auto px-5 py-8">
          <div className="w-48 h-6 skeleton rounded mb-4" />
          <div className="w-64 h-4 skeleton rounded" />
        </div>
      </AppShell>
    );
  }

  if (!collection) {
    return (
      <AppShell>
        <div className="max-w-[var(--content-width)] mx-auto px-5 py-16 text-center">
          <p className="font-poem text-xl text-text-tertiary italic">Collection not found.</p>
          <Link href="/collections" className="text-sm text-brand hover:text-brand-hover mt-4 inline-block">
            Return to collections
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell maxWidth="feed">
      <Link
        href="/collections"
        className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={14} strokeWidth={1.5} /> Collections
      </Link>

        {isEditing ? (
          <div className="mb-8 p-5 bg-surface border border-border-subtle rounded-[var(--radius-lg)] animate-fade-in space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-text-tertiary block mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-surface-secondary border border-border-subtle rounded-[var(--radius-sm)] px-3 py-2 text-base text-text-primary outline-none focus:border-brand"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-text-tertiary block mb-1">Description</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-surface-secondary border border-border-subtle rounded-[var(--radius-sm)] px-3 py-2 text-sm text-text-primary outline-none focus:border-brand resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-text-tertiary hover:text-text-primary rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit || !editTitle.trim()}
                className="px-4 py-1.5 text-xs font-medium text-white gradient-brand rounded-full hover:opacity-90 disabled:opacity-50"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">{collection.title}</h1>
                {collection.description && <p className="text-sm text-text-secondary mb-2">{collection.description}</p>}
                <p className="text-xs text-text-tertiary">
                  {poems.length} {poems.length === 1 ? "poem" : "poems"}
                </p>
              </div>
              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-text-tertiary hover:text-text-primary rounded-[var(--radius-sm)] hover:bg-surface-hover transition-colors"
                    title="Edit collection"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-2 text-text-tertiary hover:text-error rounded-[var(--radius-sm)] hover:bg-surface-hover transition-colors"
                    title="Delete collection"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {isOwner && (
          <button
            onClick={() => setShowAddPoem(!showAddPoem)}
            className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors mb-6"
          >
            <Plus size={12} strokeWidth={2} /> Add poem to collection
          </button>
        )}

        {showAddPoem && (
          <AddPoemSelector
            onSelect={handleAddPoem}
            existingIds={poems.map((p) => p.id)}
            onClose={() => setShowAddPoem(false)}
          />
        )}

        {poems.length > 0 ? (
          <div className="space-y-4">
            {poems.map((poem) => (
              <div key={poem.id} className="relative group">
                <PoemCard poem={poem} />
                {isOwner && (
                  <button
                    onClick={() => handleRemovePoem(poem.id)}
                    className="absolute top-4 right-4 text-xs text-text-tertiary hover:text-error transition-colors opacity-0 group-hover:opacity-100 bg-surface/80 px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">This collection is quiet.</p>
            <p className="text-sm text-text-secondary mb-4">Add poems to build your personal poetry collection.</p>
            {isOwner && (
              <button
                onClick={() => setShowAddPoem(true)}
                className="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
              >
                + Add a poem
              </button>
            )}
          </div>
        )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}

function AddPoemSelector({
  onSelect,
  existingIds,
  onClose,
}: {
  onSelect: (id: string) => void;
  existingIds: string[];
  onClose: () => void;
}) {
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(30);

        if (!error && data) {
          setPoems(data as PoemWithAuthor[]);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const available = poems.filter((p) => !existingIds.includes(p.id));

  return (
    <div className="mb-6 p-4 bg-surface border border-border-subtle rounded-[var(--radius-lg)] animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-text-primary">Select a poem</p>
        <button onClick={onClose} className="text-xs text-text-tertiary hover:text-text-primary">
          <X size={16} />
        </button>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 skeleton rounded" />
          ))}
        </div>
      ) : available.length > 0 ? (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {available.map((poem) => (
            <button
              key={poem.id}
              onClick={() => onSelect(poem.id)}
              className="w-full text-left px-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-surface-hover transition-colors flex items-center justify-between group"
            >
              <div className="min-w-0 flex-1 pr-3">
                <p className="text-sm font-medium text-text-primary truncate">{poem.title}</p>
                <p className="text-xs text-text-tertiary truncate">by {poem.profiles?.display_name}</p>
              </div>
              <span className="text-xs text-brand opacity-0 group-hover:opacity-100 transition-opacity">Add →</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-tertiary py-4 text-center">No more published poems found.</p>
      )}
    </div>
  );
}
