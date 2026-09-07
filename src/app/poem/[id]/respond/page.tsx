"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowDown } from "lucide-react";
import Link from "next/link";
import { poems } from "@/lib/mock-data";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";

export default function RespondPage() {
  const params = useParams();
  const id = params.id as string;
  const originalPoem = poems.find((p) => p.id === id) || poems[0];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/poem/${originalPoem.id}`}
            className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to poem
          </Link>
        </div>

        <div className="mb-8 animate-fade-in">
          <h1 className="font-editorial text-2xl md:text-3xl text-foreground mb-2">
            Respond with a poem
          </h1>
          <p className="text-sm text-text-secondary">
            Not a comment. A poem.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Original poem */}
          <div className="md:w-2/5">
            <p className="text-xs text-text-tertiary tracking-widest uppercase mb-4">
              Original Poem
            </p>
            <div className="py-6 border-l-2 border-accent/30 pl-6">
              <h3 className="font-poem-title text-xl text-foreground mb-3">
                {originalPoem.title}
              </h3>
              <div className="poem-content text-sm text-foreground/80 mb-3">
                {originalPoem.content}
              </div>
              <p className="text-xs text-text-tertiary">
                — {originalPoem.author.name}
              </p>
            </div>
          </div>

          {/* Response area */}
          <div className="flex-1">
            <div className="flex items-center justify-center mb-6">
              <div className="w-px h-8 bg-border" />
              <ArrowDown size={14} className="text-text-tertiary mx-2" />
              <div className="w-px h-8 bg-border" />
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title your response"
              className="w-full bg-transparent font-poem-title text-xl md:text-2xl text-foreground placeholder:text-text-tertiary outline-none mb-6"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your response..."
              className="w-full bg-transparent font-poem text-lg text-foreground placeholder:text-text-tertiary outline-none resize-none min-h-[40vh] leading-relaxed"
            />

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setToast("Draft saved")}
                className="text-xs text-text-tertiary hover:text-foreground transition-colors px-4 py-2 rounded-full border border-border hover:border-foreground"
              >
                Save Draft
              </button>
              <button className="text-xs text-text-tertiary hover:text-foreground transition-colors px-4 py-2 rounded-full border border-border hover:border-foreground">
                Preview
              </button>
              <button className="text-xs font-medium text-background bg-foreground px-5 py-2 rounded-full hover:bg-foreground/90 transition-colors">
                Publish Response
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
