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
      <div className="max-w-4xl mx-auto px-5 md:px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/poem/${originalPoem.id}`}
            className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to poem
          </Link>
        </div>

        <div className="mb-8 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">
            Respond with a poem
          </h1>
          <p className="text-sm text-text-secondary">
            Not a comment. A poem.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
          {/* Original poem */}
          <div className="md:w-2/5">
            <p className="text-[11px] font-medium text-text-tertiary tracking-widest uppercase mb-4">
              Original Poem
            </p>
            <div className="py-5 border-l-2 border-brand/25 pl-5">
              <h3 className="font-poem-title text-lg text-text-primary mb-2">
                {originalPoem.title}
              </h3>
              <div className="poem-content text-sm text-text-primary/75 mb-2 leading-[1.9]">
                {originalPoem.content}
              </div>
              <p className="text-xs text-text-tertiary">
                — {originalPoem.author.name}
              </p>
            </div>
          </div>

          {/* Response area */}
          <div className="flex-1">
            <div className="flex items-center justify-center mb-5">
              <div className="w-px h-6 bg-border-subtle" />
              <ArrowDown size={13} className="text-text-tertiary mx-2" />
              <div className="w-px h-6 bg-border-subtle" />
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title your response"
              className="w-full bg-transparent font-poem-title text-xl md:text-2xl text-text-primary placeholder:text-text-disabled outline-none mb-5"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your response..."
              className="w-full bg-transparent font-poem text-lg text-text-primary placeholder:text-text-disabled outline-none resize-none min-h-[35vh] leading-relaxed"
            />

            <div className="flex items-center gap-2 mt-8">
              <button
                onClick={() => setToast("Draft saved")}
                className="text-xs text-text-tertiary hover:text-text-primary transition-colors px-3.5 py-2 rounded-full border border-border-subtle hover:border-border-default"
              >
                Save Draft
              </button>
              <button className="text-xs text-text-tertiary hover:text-text-primary transition-colors px-3.5 py-2 rounded-full border border-border-subtle hover:border-border-default">
                Preview
              </button>
              <button className="text-xs font-medium text-white bg-brand hover:bg-brand-hover px-5 py-2 rounded-full transition-colors">
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
