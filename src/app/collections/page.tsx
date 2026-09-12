"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Collection } from "@/lib/types";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Toast from "@/components/Toast";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    const { data } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    setCollections((data as Collection[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;

    const { error } = await supabase.from("collections").insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      title: newTitle.trim(),
      description: newDesc.trim() || null,
    });

    if (!error) {
      setNewTitle("");
      setNewDesc("");
      setShowCreate(false);
      fetchCollections();
      setToast("Collection created");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Collections</h1>
            <p className="text-sm text-text-secondary">Your curated groups of poems.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors px-3 py-1.5 rounded-full border border-brand/30 hover:border-brand"
          >
            <Plus size={12} strokeWidth={2} /> New
          </button>
        </div>

        {showCreate && (
          <div className="mb-6 p-4 bg-surface border border-border-subtle rounded-[var(--radius-lg)] animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text-primary">New Collection</p>
              <button onClick={() => setShowCreate(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Collection name"
              className="w-full bg-surface-secondary border border-border-subtle rounded-[var(--radius-sm)] px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand mb-2"
              autoFocus
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full bg-surface-secondary border border-border-subtle rounded-[var(--radius-sm)] px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand resize-none mb-3"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="text-xs text-text-tertiary hover:text-text-primary transition-colors px-3 py-1.5">Cancel</button>
              <button onClick={handleCreate} disabled={!newTitle.trim()} className="text-xs font-medium text-white bg-brand hover:bg-brand-hover px-4 py-1.5 rounded-full transition-colors disabled:opacity-50">Create</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton rounded-[var(--radius-md)]" />)}
          </div>
        ) : collections.length > 0 ? (
          collections.map((c) => (
            <Link key={c.id} href={`/collections/${c.id}`} className="group block py-5 border-b border-border-subtle last:border-0 hover:bg-surface-hover -mx-5 px-5 transition-colors">
              <h3 className="font-poem text-lg font-medium text-text-primary mb-1 group-hover:text-brand transition-colors">{c.title}</h3>
              {c.description && <p className="text-sm text-text-secondary">{c.description}</p>}
              <p className="text-xs text-text-tertiary mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
            </Link>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">No collections yet.</p>
            <p className="text-sm text-text-tertiary mb-4">Create collections to organize your poems.</p>
            <button onClick={() => setShowCreate(true)} className="text-sm font-medium text-brand hover:text-brand-hover transition-colors">Create your first collection</button>
          </div>
        )}
      </main>
      <MobileNav />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
