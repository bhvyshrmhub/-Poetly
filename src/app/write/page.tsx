"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, Save, Palette, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import AppShell from "@/components/shell/AppShell";
import Toast from "@/components/Toast";

const typographyOptions = [
  { id: "serif", label: "Serif", className: "font-poem" },
  { id: "sans", label: "Sans", className: "font-sans" },
  { id: "editorial", label: "Editorial", className: "font-editorial" },
];

const alignmentOptions = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" },
];

const moodOptions = [
  { name: "Midnight", color: "#4A4F7C" },
  { name: "Rain", color: "#6CA4D9" },
  { name: "Love", color: "#E89AC7" },
  { name: "Hope", color: "#7BC4A0" },
  { name: "Melancholy", color: "#8B7FB0" },
];

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        </div>
      }
    >
      <WritePageInner />
    </Suspense>
  );
}

function WritePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptId = searchParams.get("prompt");
  const draftParam = searchParams.get("draft");

  const [draftId, setDraftId] = useState<string | null>(draftParam || null);
  const [promptInfo, setPromptInfo] = useState<{ id: string; title: string } | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTypography, setSelectedTypography] = useState("serif");
  const [selectedAlignment, setSelectedAlignment] = useState("left");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [showCanvas, setShowCanvas] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved" | null>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  // Protect against accidental navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSaveStatus === "unsaved" || (content.trim() && autoSaveStatus !== "saved")) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [autoSaveStatus, content]);

  // Load prompt information if responding to a prompt
  useEffect(() => {
    if (!promptId) return;
    (async () => {
      try {
        const { data } = await supabase.from("prompts").select("id, title").eq("id", promptId).single();
        if (data) setPromptInfo(data);
      } catch {
        // ignore
      }
    })();
  }, [promptId]);

  // Load existing draft if present
  useEffect(() => {
    if (!draftParam || !user) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("poems")
          .select("*")
          .eq("id", draftParam)
          .eq("author_id", user.id)
          .single();

        if (!error && data) {
          setTitle(data.title || "");
          setContent(data.content || "");
          setSelectedMood(data.mood || null);
          setTags(data.tags ? data.tags.join(", ") : "");
          setDraftId(data.id);
          setAutoSaveStatus("saved");
        }
      } catch {
        // ignore
      }
    })();
  }, [draftParam, user]);

  // Reliable Auto-Save
  useEffect(() => {
    if (!user || (!title.trim() && !content.trim())) return;
    setAutoSaveStatus("unsaved");

    const timer = setTimeout(async () => {
      setAutoSaveStatus("saving");
      try {
        const payload: Record<string, unknown> = {
          author_id: user.id,
          title: title.trim() || "Untitled",
          content,
          mood: selectedMood,
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
          status: "draft",
        };
        if (promptId) payload.prompt_id = promptId;

        if (draftId) {
          const { error } = await supabase.from("poems").update(payload).eq("id", draftId);
          if (!error) setAutoSaveStatus("saved");
        } else {
          const { data, error } = await supabase.from("poems").insert(payload).select("id").single();
          if (!error && data) {
            setDraftId(data.id);
            setAutoSaveStatus("saved");
          }
        }
      } catch {
        setAutoSaveStatus("unsaved");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, content, selectedMood, tags, user, draftId, promptId]);

  const handleSaveDraft = useCallback(async () => {
    if (!title.trim() && !content.trim()) {
      setToast("Write something first");
      return;
    }
    if (!user) {
      setToast("You must be logged in to save drafts");
      return;
    }
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        author_id: user.id,
        title: title.trim() || "Untitled",
        content,
        mood: selectedMood,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
        status: "draft",
      };
      if (promptId) payload.prompt_id = promptId;

      if (draftId) {
        const { error } = await supabase.from("poems").update(payload).eq("id", draftId);
        if (error) throw error;
        setAutoSaveStatus("saved");
        setToast("Draft updated");
      } else {
        const { data, error } = await supabase.from("poems").insert(payload).select("id").single();
        if (error) throw error;
        if (data) setDraftId(data.id);
        setAutoSaveStatus("saved");
        setToast("Draft saved");
      }
    } catch {
      setToast("Failed to save draft");
    } finally {
      setSaving(false);
    }
  }, [title, content, selectedMood, tags, user, draftId, promptId]);

  const handlePublish = async () => {
    if (!content.trim()) {
      setToast("Write poem content before publishing");
      return;
    }
    if (!user) {
      setToast("You must be logged in to publish");
      return;
    }
    setPublishing(true);

    try {
      const payload: Record<string, unknown> = {
        author_id: user.id,
        title: title.trim() || "Untitled",
        content: content.trim(),
        mood: selectedMood,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
        status: "published",
        published_at: new Date().toISOString(),
      };
      if (promptId) payload.prompt_id = promptId;

      let resultId: string | null = null;

      if (draftId) {
        const { data, error } = await supabase
          .from("poems")
          .update(payload)
          .eq("id", draftId)
          .select("id")
          .single();
        if (error) throw error;
        resultId = data?.id || draftId;
      } else {
        const { data, error } = await supabase
          .from("poems")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        resultId = data?.id || null;
      }

      if (resultId) {
        router.push(`/poem/${resultId}`);
      }
    } catch {
      setToast("Failed to publish poem. Please try again.");
      setPublishing(false);
    }
  };

  return (
    <AppShell maxWidth="wide">
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/home"
            className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> Back
          </Link>

          <div className="flex items-center gap-3">
            {autoSaveStatus === "saving" && (
              <span className="text-[11px] text-text-tertiary animate-pulse hidden sm:inline">
                Saving draft...
              </span>
            )}
            {autoSaveStatus === "saved" && (
              <span className="text-[11px] text-text-tertiary hidden sm:inline-flex items-center gap-1">
                <CheckCircle2 size={11} className="text-success" /> Draft saved
              </span>
            )}

            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full border border-border-subtle hover:border-border-default disabled:opacity-50"
            >
              <Save size={12} strokeWidth={1.5} />
              <span className="hidden sm:inline">{saving ? "Saving..." : "Save Draft"}</span>
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1.5 text-xs transition-colors px-3 py-1.5 rounded-full border ${
                showPreview
                  ? "border-brand text-brand bg-brand-subtle"
                  : "border-border-subtle text-text-tertiary hover:text-text-primary hover:border-border-default"
              }`}
            >
              <Eye size={12} strokeWidth={1.5} /> {showPreview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={() => setShowCanvas(!showCanvas)}
              className={`flex items-center gap-1.5 text-xs transition-colors px-3 py-1.5 rounded-full border hidden md:flex ${
                showCanvas
                  ? "border-brand/30 text-brand bg-brand-subtle"
                  : "border-border-subtle text-text-tertiary hover:text-text-primary hover:border-border-default"
              }`}
            >
              <Palette size={12} strokeWidth={1.5} /> Typography
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing || !content.trim()}
              className="flex items-center gap-1.5 text-xs font-medium text-white gradient-brand hover:opacity-90 px-4 py-1.5 rounded-full transition-opacity disabled:opacity-50"
            >
              {publishing ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            {promptInfo && (
              <div className="mb-4 px-3.5 py-2 rounded-[var(--radius-md)] bg-brand-subtle/60 border border-brand/20 flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  Responding to prompt: <strong className="text-brand font-medium">{promptInfo.title}</strong>
                </span>
                <Link href={`/prompts/${promptInfo.id}`} className="text-brand hover:underline">
                  View prompt
                </Link>
              </div>
            )}

            {showPreview ? (
              <div className="py-6 animate-fade-in border-b border-border-subtle pb-8 mb-6">
                <div className="text-[10px] uppercase tracking-widest text-text-tertiary mb-3">Live Preview</div>
                <h1 className="font-poem-title text-3xl md:text-[2.75rem] text-text-primary mb-8">{title || "Untitled"}</h1>
                <div
                  className={`text-lg text-text-primary leading-relaxed whitespace-pre-line ${
                    selectedTypography === "serif"
                      ? "font-poem"
                      : selectedTypography === "editorial"
                      ? "font-editorial"
                      : "font-sans"
                  }`}
                  style={{ textAlign: selectedAlignment as "left" | "center" | "right" }}
                >
                  {content || "Your poem will appear here..."}
                </div>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full bg-transparent font-poem-title text-2xl md:text-3xl text-text-primary placeholder:text-text-disabled outline-none mb-6"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing..."
                  className={`w-full bg-transparent text-lg text-text-primary placeholder:text-text-disabled outline-none resize-none min-h-[50vh] leading-relaxed ${
                    selectedTypography === "serif"
                      ? "font-poem"
                      : selectedTypography === "editorial"
                      ? "font-editorial"
                      : "font-sans"
                  }`}
                  style={{ textAlign: selectedAlignment as "left" | "center" | "right" }}
                />
              </>
            )}

            <div className="flex items-center justify-between text-xs text-text-tertiary pt-4 border-t border-border-subtle">
              <div className="flex items-center gap-4">
                <span>{wordCount} words</span>
                <span>{charCount} characters</span>
              </div>
              {selectedMood && (
                <span className="text-brand font-medium">Mood: {selectedMood}</span>
              )}
            </div>
          </div>

          {showCanvas && (
            <div className="hidden md:block w-56 flex-shrink-0 animate-slide-in">
              <div className="sticky top-20 space-y-6">
                <div>
                  <p className="text-[11px] font-medium text-text-tertiary tracking-widest uppercase mb-3">Typography</p>
                  <div className="space-y-1">
                    {typographyOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedTypography(opt.id)}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-[var(--radius-sm)] transition-colors ${
                          selectedTypography === opt.id
                            ? "bg-brand-subtle text-brand font-medium"
                            : "text-text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-text-tertiary tracking-widest uppercase mb-3">Alignment</p>
                  <div className="flex gap-1.5">
                    {alignmentOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedAlignment(opt.id)}
                        className={`flex-1 px-2 py-1.5 text-xs rounded-[var(--radius-sm)] transition-colors ${
                          selectedAlignment === opt.id
                            ? "bg-brand-subtle text-brand font-medium"
                            : "text-text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-text-tertiary tracking-widest uppercase mb-3">Mood</p>
                  <div className="flex flex-wrap gap-1.5">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.name}
                        onClick={() => setSelectedMood(selectedMood === mood.name ? null : mood.name)}
                        className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${
                          selectedMood === mood.name
                            ? "border-brand text-brand bg-brand-subtle"
                            : "border-border-subtle text-text-tertiary hover:border-border-default"
                        }`}
                      >
                        {mood.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-text-tertiary tracking-widest uppercase mb-3">Tags</p>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="love, rain, midnight"
                    className="w-full bg-surface-secondary border border-border-subtle rounded-[var(--radius-sm)] px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border-subtle px-4 py-2.5 z-40">
        <div className="flex gap-1.5 overflow-x-auto">
          {typographyOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedTypography(opt.id)}
              className={`px-3 py-1.5 text-xs rounded-full border flex-shrink-0 transition-colors ${
                selectedTypography === opt.id ? "border-brand text-brand bg-brand-subtle" : "border-border-subtle text-text-tertiary"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="w-px bg-border-subtle flex-shrink-0 my-1" />
          {alignmentOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedAlignment(opt.id)}
              className={`px-3 py-1.5 text-xs rounded-full border flex-shrink-0 transition-colors ${
                selectedAlignment === opt.id ? "border-brand text-brand bg-brand-subtle" : "border-border-subtle text-text-tertiary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
