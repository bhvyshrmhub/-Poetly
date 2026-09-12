"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowDown } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";

export default function RespondPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [originalPoem, setOriginalPoem] = useState<PoemWithAuthor | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("poems")
      .select("*, profiles!inner(*)")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setOriginalPoem(data as PoemWithAuthor);
        setLoading(false);
      });
  }, [id]);

  const handlePublish = async () => {
    if (!content.trim()) {
      setToast("Write your response first");
      return;
    }

    const { data, error } = await supabase
      .from("poems")
      .insert({
        author_id: "00000000-0000-0000-0000-000000000000",
        title: title || "Response",
        content,
        response_to: id,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      await supabase.from("responses").insert({
        original_poem_id: id,
        response_poem_id: data.id,
        author_id: "00000000-0000-0000-0000-000000000000",
      });
      router.push(`/poem/${data.id}`);
    } else {
      setToast("Failed to publish");
    }
  };

  if (loading || !originalPoem) {
    return <div className="min-h-screen"><Navbar /><div className="max-w-4xl mx-auto px-5 py-8"><div className="w-40 h-4 skeleton rounded" /></div></div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-5 md:px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/poem/${id}`} className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors">
            <ArrowLeft size={14} strokeWidth={1.5} /> Back to poem
          </Link>
        </div>

        <div className="mb-8 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Respond with a poem</h1>
          <p className="text-sm text-text-secondary">Not a comment. A poem.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
          <div className="md:w-2/5">
            <p className="text-[11px] font-medium text-text-tertiary tracking-widest uppercase mb-4">Original Poem</p>
            <div className="py-5 border-l-2 border-brand/25 pl-5">
              <h3 className="font-poem-title text-lg text-text-primary mb-2">{originalPoem.title}</h3>
              <div className="poem-content text-sm text-text-primary/75 mb-2 leading-[1.9]">{originalPoem.content}</div>
              <p className="text-xs text-text-tertiary">— {originalPoem.profiles.display_name}</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-center mb-5">
              <div className="w-px h-6 bg-border-subtle" />
              <ArrowDown size={13} className="text-text-tertiary mx-2" />
              <div className="w-px h-6 bg-border-subtle" />
            </div>

            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title your response" className="w-full bg-transparent font-poem-title text-xl md:text-2xl text-text-primary placeholder:text-text-disabled outline-none mb-5" />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your response..." className="w-full bg-transparent font-poem text-lg text-text-primary placeholder:text-text-disabled outline-none resize-none min-h-[35vh] leading-relaxed" />

            <div className="flex items-center gap-2 mt-8">
              <button onClick={handlePublish} className="text-xs font-medium text-white bg-brand hover:bg-brand-hover px-5 py-2 rounded-full transition-colors">
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
