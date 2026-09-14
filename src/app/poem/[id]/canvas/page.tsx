"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, RotateCcw, Save } from "lucide-react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { CanvasState, getDefaultCanvasState } from "@/lib/canvas-types";
import CanvasPreview from "@/components/canvas/CanvasPreview";
import CanvasControls from "@/components/canvas/CanvasControls";
import AppShell from "@/components/shell/AppShell";
import Toast from "@/components/Toast";

type Poem = Database["public"]["Tables"]["poems"]["Row"];

const STORAGE_KEY = "poetly-canvas-styles";

export default function CanvasPage() {
  const params = useParams();
  const poemId = params.id as string;
  const previewRef = useRef<HTMLDivElement>(null);

  const [poem, setPoem] = useState<Poem | null>(null);
  const [state, setState] = useState<CanvasState | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [scale, setScale] = useState(0.35);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("poems")
          .select("*")
          .eq("id", poemId)
          .single();
        if (data) {
          setPoem(data);
          setState(getDefaultCanvasState(data.title, data.content, "Anonymous Poet"));
        }
      } catch {
        setToast("Failed to load poem");
      } finally {
        setLoading(false);
      }
    })();
  }, [poemId]);

  const updateState = useCallback((updates: Partial<CanvasState>) => {
    setState((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const handleExport = useCallback(async () => {
    if (!previewRef.current || !state) return;
    setExporting(true);

    try {
      const scaleMultiplier = 2;
      const dataUrl = await toPng(previewRef.current, {
        width: state.canvasWidth,
        height: state.canvasHeight,
        pixelRatio: scaleMultiplier,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      const link = document.createElement("a");
      link.download = `poetly-canvas-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setToast("Canvas exported");
    } catch {
      setToast("Export failed — try again");
    }
    setExporting(false);
  }, [state]);

  const handleSaveStyle = useCallback(() => {
    if (!state) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const style = { ...state, savedAt: new Date().toISOString(), name: `Style ${saved.length + 1}` };
      saved.push(style);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setToast("Style saved");
    } catch {
      setToast("Failed to save style");
    }
  }, [state]);

  const handleReset = useCallback(() => {
    if (!poem) return;
    if (!confirm("Reset canvas to default?")) return;
    setState(getDefaultCanvasState(poem.title, poem.content, "Anonymous Poet"));
    setToast("Canvas reset");
  }, [poem]);

  useEffect(() => {
    if (!state) return;
    const container = document.getElementById("canvas-preview-container");
    if (!container) return;
    const containerWidth = container.clientWidth - 40;
    const canvasDisplayWidth = state.canvasWidth * 0.35;
    const newScale = Math.min(0.5, Math.max(0.15, containerWidth / canvasDisplayWidth));
    setScale(newScale);
  }, [state?.canvasWidth, state?.canvasHeight]);

  if (loading || !state) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto px-5 py-8">
          <div className="w-32 h-4 skeleton rounded mb-8" />
          <div className="h-[400px] skeleton rounded-[var(--radius-lg)]" />
        </div>
      </AppShell>
    );
  }

  if (!poem) {
    return (
      <AppShell>
        <div className="max-w-[var(--content-width)] mx-auto px-5 py-16 text-center">
          <p className="font-poem text-xl text-text-tertiary italic">Poem not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/poem/${poemId}`} className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors">
            <ArrowLeft size={14} strokeWidth={1.5} /> Back
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full border border-border-subtle hover:border-border-default">
              <RotateCcw size={12} strokeWidth={1.5} /> Reset
            </button>
            <button onClick={handleSaveStyle} className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full border border-border-subtle hover:border-border-default">
              <Save size={12} strokeWidth={1.5} /> Save Style
            </button>
            <button onClick={handleExport} disabled={exporting} className="flex items-center gap-1.5 text-xs font-medium text-white bg-brand hover:bg-brand-hover px-4 py-1.5 rounded-full transition-colors disabled:opacity-50">
              <Download size={12} strokeWidth={1.5} /> {exporting ? "Exporting..." : "Download PNG"}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-72 shrink-0 order-2 lg:order-1">
            <div className="bg-surface border border-border-subtle rounded-[var(--radius-lg)] p-4 max-h-[calc(100vh-160px)] overflow-y-auto">
              <CanvasControls state={state} onChange={updateState} />
            </div>
          </div>

          <div id="canvas-preview-container" className="flex-1 order-1 lg:order-2 flex items-start justify-center bg-background-subtle rounded-[var(--radius-lg)] border border-border-subtle p-5 min-h-[400px] overflow-hidden">
            <div style={{ width: state.canvasWidth * scale, height: state.canvasHeight * scale, position: "relative" }}>
              <CanvasPreview state={state} scale={scale} previewRef={previewRef} />
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
