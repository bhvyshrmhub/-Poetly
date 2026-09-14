"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Prompt } from "@/lib/types";
import AppShell from "@/components/shell/AppShell";
import Toast from "@/components/Toast";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let query = supabase.from("prompts").select("*").order("created_at", { ascending: false });

        if (activeTab === "active") {
          query = query.eq("is_active", true);
        } else {
          query = query.eq("is_active", false);
        }

        const { data } = await query;
        setPrompts((data as Prompt[]) || []);
      } catch {
        setToast("Failed to load prompts");
      } finally {
        setLoading(false);
      }
    })();
  }, [activeTab]);

  return (
    <AppShell>
      <div className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Writing Prompts</h1>
          <p className="text-sm text-text-secondary">Find your next poem.</p>
        </div>

        <div className="flex gap-1 mb-6 bg-surface-secondary rounded-[var(--radius-full)] p-1">
          {[
            { id: "active" as const, label: "Active" },
            { id: "archive" as const, label: "Archive" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === tab.id ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-[var(--radius-md)]" />)}
          </div>
        ) : prompts.length > 0 ? (
          prompts.map((prompt) => (
            <Link key={prompt.id} href={`/prompts/${prompt.id}`} className="group block py-5 border-b border-border-subtle last:border-0 hover:bg-surface-hover -mx-5 px-5 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-poem text-xl font-medium text-text-primary mb-1 group-hover:text-brand transition-colors italic">&ldquo;{prompt.title}&rdquo;</h3>
                  {prompt.description && <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{prompt.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      prompt.is_active ? "bg-success-subtle text-success" : "bg-surface-secondary text-text-tertiary"
                    }`}>
                      {prompt.is_active ? "Active" : "Ended"}
                    </span>
                    <span className="text-xs text-text-tertiary">{new Date(prompt.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">
              {activeTab === "active" ? "No active prompts right now." : "No archived prompts yet."}
            </p>
            <p className="text-sm text-text-tertiary">
              {activeTab === "active" ? "Check back soon for new writing prompts." : "Completed prompts will appear here."}
            </p>
          </div>
        )}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
