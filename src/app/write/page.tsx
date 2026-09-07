"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Save } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";

const typographyOptions = [
  { id: "serif", label: "Serif", className: "font-poem" },
  { id: "sans", label: "Sans", className: "font-sans" },
  { id: "typewriter", label: "Typewriter", className: "font-[family-name:var(--font-typewriter)]" },
];

const alignmentOptions = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" },
];

const moodOptions = [
  { name: "Midnight", color: "#3D3D5C" },
  { name: "Rain", color: "#5C7A8B" },
  { name: "Love", color: "#9E4C5C" },
  { name: "Hope", color: "#7A8B5C" },
  { name: "Melancholy", color: "#6B7B8D" },
];

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTypography, setSelectedTypography] = useState("serif");
  const [selectedAlignment, setSelectedAlignment] = useState("left");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [showCanvas, setShowCanvas] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSaveDraft = () => {
    setToast("Draft saved");
  };

  const handlePreview = () => {
    if (!title.trim() && !content.trim()) {
      setToast("Write something first");
      return;
    }
    router.push(`/write/preview?title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-6 md:py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/home"
            className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border hover:border-foreground"
            >
              <Save size={12} strokeWidth={1.5} />
              Save Draft
            </button>
            <button
              onClick={() => setShowCanvas(!showCanvas)}
              className="text-xs text-text-tertiary hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border hover:border-foreground hidden md:block"
            >
              Canvas
            </button>
            <button
              onClick={handlePreview}
              className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-light transition-colors px-3 py-1.5 rounded-full border border-accent/30 hover:border-accent"
            >
              <Eye size={12} strokeWidth={1.5} />
              Preview
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Editor */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full bg-transparent font-poem-title text-2xl md:text-3xl text-foreground placeholder:text-text-tertiary outline-none mb-8"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              className={`w-full bg-transparent text-lg text-foreground placeholder:text-text-tertiary outline-none resize-none min-h-[50vh] leading-relaxed ${
                selectedTypography === "serif"
                  ? "font-poem"
                  : selectedTypography === "typewriter"
                  ? "font-[family-name:var(--font-typewriter)]"
                  : "font-sans"
              }`}
              style={{
                textAlign: selectedAlignment as "left" | "center" | "right",
              }}
            />
          </div>

          {/* Canvas panel */}
          {showCanvas && (
            <div className="hidden md:block w-64 flex-shrink-0 animate-slide-in">
              <div className="sticky top-24 space-y-6">
                <div>
                  <p className="text-xs text-text-tertiary tracking-widest uppercase mb-3">
                    Typography
                  </p>
                  <div className="space-y-1">
                    {typographyOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedTypography(opt.id)}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          selectedTypography === opt.id
                            ? "bg-accent-muted text-accent"
                            : "text-text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-text-tertiary tracking-widest uppercase mb-3">
                    Alignment
                  </p>
                  <div className="flex gap-2">
                    {alignmentOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedAlignment(opt.id)}
                        className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors ${
                          selectedAlignment === opt.id
                            ? "bg-accent-muted text-accent"
                            : "text-text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-text-tertiary tracking-widest uppercase mb-3">
                    Mood
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.name}
                        onClick={() => setSelectedMood(selectedMood === mood.name ? null : mood.name)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                          selectedMood === mood.name
                            ? "border-foreground text-foreground"
                            : "border-border text-text-tertiary hover:border-text-secondary"
                        }`}
                      >
                        {mood.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-text-tertiary tracking-widest uppercase mb-3">
                    Tags
                  </p>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="love, rain, midnight"
                    className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-text-tertiary outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile canvas controls */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 z-40">
        <div className="flex gap-2 overflow-x-auto">
          {typographyOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedTypography(opt.id)}
              className={`px-3 py-1.5 text-xs rounded-full border flex-shrink-0 transition-colors ${
                selectedTypography === opt.id
                  ? "border-accent text-accent"
                  : "border-border text-text-tertiary"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="w-px bg-border flex-shrink-0" />
          {alignmentOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedAlignment(opt.id)}
              className={`px-3 py-1.5 text-xs rounded-full border flex-shrink-0 transition-colors ${
                selectedAlignment === opt.id
                  ? "border-accent text-accent"
                  : "border-border text-text-tertiary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
