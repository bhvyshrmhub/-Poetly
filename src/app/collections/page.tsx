"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Collection } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import CollectionCard from "@/components/poetry/CollectionCard";
import Toast from "@/components/Toast";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const { user } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      let query = supabase
        .from("collections")
        .select("*, collection_poems(id)")
        .order("created_at", { ascending: false });

      if (user) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCollections((data as unknown as Collection[]) || []);
    } catch {
      setToast("Failed to load collections");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    if (!user) {
      setToast("You must be logged in");
      return;
    }

    try {
      const { error } = await supabase.from("collections").insert({
        user_id: user.id,
        title: newTitle.trim(),
        description: newDesc.trim() || null,
      });

      if (!error) {
        setNewTitle("");
        setNewDesc("");
        setShowCreate(false);
        fetchCollections();
        setToast("Collection created");
      } else {
        setToast("Failed to create collection");
      }
    } catch {
      setToast("Failed to create collection");
    }
  };

  return (
    <AppShell maxWidth="feed">
      {/* Consistent Page Header */}
      <PageHeader
        title="Collections"
        subtitle="Keep the words that stay with you."
        action={
          user ? (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-brand hover:bg-brand-hover transition-colors px-3.5 py-1.5 rounded-full shadow-xs"
            >
              <Plus size={14} strokeWidth={2.2} />
              <span>New</span>
            </button>
          ) : undefined
        }
      />

      {/* Create Modal / Inline Drawer */}
      {showCreate && (
        <div className="mb-6 p-4.5 bg-surface border border-border-subtle rounded-[var(--radius-lg)] animate-fade-in shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-text-primary">New Collection</p>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-text-tertiary hover:text-text-primary transition-colors p-1"
              aria-label="Cancel new collection"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Collection name"
            className="w-full bg-surface-secondary border border-border-subtle rounded-[var(--radius-sm)] px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand mb-2.5 transition-colors"
            autoFocus
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full bg-surface-secondary border border-border-subtle rounded-[var(--radius-sm)] px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand resize-none mb-3.5 transition-colors"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="text-xs font-medium text-white bg-brand hover:bg-brand-hover px-4 py-1.5 rounded-full transition-colors disabled:opacity-50 shadow-xs"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Collections Grid / List */}
      {loading ? (
        <div className="space-y-3.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 skeleton rounded-[var(--radius-lg)]" />
          ))}
        </div>
      ) : collections.length > 0 ? (
        <div className="space-y-3.5">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </div>
      ) : !user ? (
        <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-subtle">
          <p className="font-poem text-xl text-text-tertiary italic mb-2">
            Organize your favorite poems into collections.
          </p>
          <p className="text-sm text-text-secondary mb-4">
            Sign in to create and manage personal poetry shelves.
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2 text-xs sm:text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-full transition-colors shadow-xs"
          >
            Sign In
          </Link>
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-subtle">
          <p className="font-poem text-xl text-text-tertiary italic mb-2">
            No collections yet.
          </p>
          <p className="text-sm text-text-secondary mb-4">
            Create collections to organize and preserve poems.
          </p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="text-xs sm:text-sm font-medium text-brand hover:text-brand-hover transition-colors underline underline-offset-4"
          >
            Create your first collection
          </button>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
