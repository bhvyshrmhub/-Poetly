"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Heart, MessageCircle, Bookmark, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor, CommentWithAuthor } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";

export default function PoemPage() {
  const params = useParams();
  const id = params.id as string;

  const [poem, setPoem] = useState<PoemWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [responseCount, setResponseCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: poemData } = await supabase
        .from("poems")
        .select("*, profiles!inner(*)")
        .eq("id", id)
        .single();

      if (poemData) {
        setPoem(poemData as PoemWithAuthor);

        const { count } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("poem_id", id);
        setLikeCount(count || 0);

        const { count: resCount } = await supabase
          .from("responses")
          .select("*", { count: "exact", head: true })
          .eq("original_id", id);
        setResponseCount(resCount || 0);

        const { data: commentData } = await supabase
          .from("comments")
          .select("*, profiles!inner(*)")
          .eq("poem_id", id)
          .order("created_at", { ascending: true });
        setComments((commentData as CommentWithAuthor[]) || []);
      }
      setLoading(false);
    })();
  }, [id]);

  const handleLike = async () => {
    await supabase.from("likes").insert({ user_id: "00000000-0000-0000-0000-000000000000", poem_id: id });
    setLikeCount(likeCount + 1);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await supabase.from("comments").insert({ poem_id: id, author_id: "00000000-0000-0000-0000-000000000000", content: commentText.trim() });
    setCommentText("");
    const { data: commentData } = await supabase
      .from("comments")
      .select("*, profiles!inner(*)")
      .eq("poem_id", id)
      .order("created_at", { ascending: true });
    setComments((commentData as CommentWithAuthor[]) || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8">
          <div className="w-40 h-4 skeleton mb-8 rounded" />
          <div className="w-12 h-12 skeleton mb-8 rounded-[var(--radius-sm)]" />
          <div className="w-64 h-8 skeleton mb-10 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="w-full h-4 skeleton rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-[var(--content-width)] mx-auto px-5 py-16 text-center">
          <p className="font-poem text-xl text-text-tertiary italic">Poem not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <article className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-6 md:py-12">
        <Link href="/home" className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-10">
          <ArrowLeft size={14} strokeWidth={1.5} /> Back
        </Link>

        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center">
              <span className="text-brand text-sm font-display font-medium">{poem.profiles.display_name[0]}</span>
            </div>
            <div>
              <Link href={`/profile/${poem.profiles.username}`} className="text-sm font-medium text-text-primary hover:text-brand transition-colors">
                {poem.profiles.display_name}
              </Link>
              <p className="text-xs text-text-tertiary">@{poem.profiles.username} · {new Date(poem.published_at || poem.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <h1 className="font-poem-title text-3xl md:text-[2.75rem] text-text-primary mb-10">{poem.title}</h1>
          <div className="poem-content-lg text-text-primary/85 mb-10">{poem.content}</div>

          {poem.tags && poem.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {poem.tags.map((tag) => (
                <span key={tag} className="text-xs text-text-tertiary bg-surface-secondary px-2.5 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-5 py-5 border-y border-border-subtle mb-8">
            <button onClick={handleLike} className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-all duration-150">
              <Heart size={17} strokeWidth={1.5} />
              <span>{likeCount}</span>
            </button>
            <span className="flex items-center gap-2 text-sm text-text-tertiary">
              <MessageCircle size={17} strokeWidth={1.5} /><span>{comments.length}</span>
            </span>
            <button className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
              <Bookmark size={17} strokeWidth={1.5} />
            </button>
            <button className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
              <Share2 size={17} strokeWidth={1.5} />
            </button>
            {responseCount > 0 && (
              <Link href={`/poem/${id}/responses`} className="flex items-center gap-2 text-sm text-brand hover:text-brand-hover transition-colors ml-auto">
                {responseCount} {responseCount === 1 ? "response" : "responses"} →
              </Link>
            )}
          </div>

          <div className="text-center mb-10 py-6 bg-surface-secondary rounded-[var(--radius-lg)] space-y-3">
            <p className="text-sm text-text-secondary">Not a comment. A poem.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={`/poem/${id}/respond`} className="inline-flex items-center justify-center px-5 py-2.5 gradient-brand text-white text-sm font-medium rounded-[var(--radius-full)] hover:opacity-90 transition-opacity">
                Respond with a poem
              </Link>
              <Link href={`/poem/${id}/canvas`} className="inline-flex items-center justify-center px-5 py-2.5 border border-border-default text-text-primary text-sm font-medium rounded-[var(--radius-full)] hover:border-brand hover:text-brand transition-colors">
                Create Canvas
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border-subtle">
            <h3 className="font-poem text-lg font-medium text-text-primary mb-6">Leave a note</h3>
            <div className="mb-8">
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a note..." className="w-full bg-surface-secondary border border-border-subtle focus:border-brand rounded-[var(--radius-md)] outline-none py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary resize-none" rows={2} />
              <div className="flex justify-end mt-2">
                <button onClick={handleComment} disabled={!commentText.trim()} className="text-xs font-medium text-brand hover:text-brand-hover transition-colors px-3 py-1 disabled:opacity-30">Post</button>
              </div>
            </div>
            <div className="space-y-5">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-brand text-[10px] font-display font-medium">{comment.profiles.display_name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-text-primary">@{comment.profiles.username}</span>
                      <span className="text-xs text-text-tertiary">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
