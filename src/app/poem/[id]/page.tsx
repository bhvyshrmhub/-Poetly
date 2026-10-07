"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, MessageCircle, Bookmark, Share2, ArrowLeft, Edit2, Trash2, Flag } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor, CommentWithAuthor } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import AppShell from "@/components/layout/AppShell";
import Toast from "@/components/Toast";
import Avatar from "@/components/ui/Avatar";

export default function PoemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [poem, setPoem] = useState<PoemWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const { user } = useAuth();
  const [responseCount, setResponseCount] = useState(0);

  const fetchPoemDetails = useCallback(async () => {
    try {
      const { data: poemData, error: poemError } = await supabase
        .from("poems")
        .select("*, profiles!inner(*)")
        .eq("id", id)
        .single();

      if (poemError || !poemData) {
        setPoem(null);
        setLoading(false);
        return;
      }

      setPoem(poemData as PoemWithAuthor);

      const [likesRes, savesRes, resCountRes, commentData] = await Promise.all([
        supabase.from("likes").select("*", { count: "exact", head: true }).eq("poem_id", id),
        user
          ? supabase.from("saves").select("id").eq("poem_id", id).eq("user_id", user.id).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase.from("responses").select("*", { count: "exact", head: true }).eq("original_poem_id", id),
        supabase
          .from("comments")
          .select("*, profiles!inner(*)")
          .eq("poem_id", id)
          .order("created_at", { ascending: true }),
      ]);

      setLikeCount(likesRes.count || 0);
      setIsSaved(Boolean(savesRes.data));
      setResponseCount(resCountRes.count || 0);
      setComments((commentData.data as CommentWithAuthor[]) || []);

      if (user) {
        const { data: existingLike } = await supabase
          .from("likes")
          .select("id")
          .eq("poem_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
        setIsLiked(Boolean(existingLike));
      }
    } catch {
      setToast("Failed to load poem");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchPoemDetails();
  }, [fetchPoemDetails]);

  const handleLike = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/poem/${id}`)}`);
      return;
    }
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      if (previousLiked) {
        await supabase.from("likes").delete().eq("poem_id", id).eq("user_id", user.id);
      } else {
        await supabase.from("likes").insert({ user_id: user.id, poem_id: id });

        if (poem && user.id !== poem.author_id) {
          await supabase.from("notifications").insert({
            recipient_id: poem.author_id,
            actor_id: user.id,
            type: "like",
            reference_id: id,
          });
        }
      }
    } catch {
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      setToast("Failed to update like");
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || submittingComment) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/poem/${id}`)}`);
      return;
    }
    setSubmittingComment(true);

    try {
      const { error } = await supabase.from("comments").insert({
        poem_id: id,
        author_id: user.id,
        content: commentText.trim(),
      });

      if (error) throw error;

      setCommentText("");
      const { data: updatedComments } = await supabase
        .from("comments")
        .select("*, profiles!inner(*)")
        .eq("poem_id", id)
        .order("created_at", { ascending: true });

      setComments((updatedComments as CommentWithAuthor[]) || []);

      if (poem && user.id !== poem.author_id) {
        await supabase.from("notifications").insert({
          recipient_id: poem.author_id,
          actor_id: user.id,
          type: "comment",
          reference_id: id,
        });
      }
      setToast("Note posted");
    } catch {
      setToast("Failed to post note");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("author_id", user.id);

      if (!error) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setToast("Note deleted");
      }
    } catch {
      setToast("Failed to delete note");
    }
  };

  const handleSave = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/poem/${id}`)}`);
      return;
    }
    const previousSaved = isSaved;
    setIsSaved(!previousSaved);

    try {
      if (previousSaved) {
        await supabase.from("saves").delete().eq("poem_id", id).eq("user_id", user.id);
        setToast("Poem unsaved");
      } else {
        await supabase.from("saves").insert({ user_id: user.id, poem_id: id });
        setToast("Poem saved to your library");
      }
    } catch {
      setIsSaved(previousSaved);
      setToast("Failed to save poem");
    }
  };

  const handleReport = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/poem/${id}`)}`);
      return;
    }
    try {
      await supabase.from("reports").insert({
        reporter_id: user.id,
        target_type: "poem",
        target_id: id,
        reason: "Inappropriate or abusive content",
      });
      setToast("Thank you. Report received for review.");
    } catch {
      setToast("Failed to submit report");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8">
          <div className="w-40 h-4 skeleton mb-8 rounded" />
          <div className="w-12 h-12 skeleton mb-8 rounded-[var(--radius-sm)]" />
          <div className="w-64 h-8 skeleton mb-10 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full h-4 skeleton rounded" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (!poem) {
    return (
      <AppShell>
        <div className="max-w-[var(--content-width)] mx-auto px-5 py-16 text-center">
          <p className="font-poem text-xl text-text-tertiary italic">Poem not found.</p>
          <Link href="/home" className="text-sm text-brand hover:text-brand-hover mt-4 inline-block">
            Return home
          </Link>
        </div>
      </AppShell>
    );
  }

  const isAuthor = user && poem && user.id === poem.author_id;

  return (
    <AppShell maxWidth="reading">
      <article className="w-full py-4 md:py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> Back
          </button>
          {isAuthor && (
            <Link
              href={`/poem/${id}/edit`}
              className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-brand transition-colors border border-border-subtle rounded-full px-3 py-1"
            >
              <Edit2 size={12} /> Edit poem
            </Link>
          )}
        </div>

        <div className="animate-fade-in">
          <div className="flex items-center gap-3.5 mb-8">
            <Link
              href={`/profile/${poem.profiles.username}`}
              className="shrink-0 focus-visible:outline-none"
            >
              <Avatar
                src={poem.profiles.profile_image}
                name={poem.profiles.display_name}
                size="md"
              />
            </Link>
            <div>
              <Link
                href={`/profile/${poem.profiles.username}`}
                className="text-sm font-medium text-text-primary hover:text-brand transition-colors"
              >
                {poem.profiles.display_name}
              </Link>
              <p className="text-xs text-text-tertiary">
                @{poem.profiles.username} · {new Date(poem.published_at || poem.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <h1 className="font-poem-title text-3xl md:text-[2.75rem] text-text-primary mb-10">{poem.title}</h1>
          <div className="poem-content-lg text-text-primary/90 mb-10 leading-relaxed font-poem whitespace-pre-line">
            {poem.content}
          </div>

          {poem.tags && poem.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {poem.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?tag=${encodeURIComponent(tag)}`}
                  className="text-xs text-text-tertiary bg-surface-secondary px-2.5 py-1 rounded-full hover:text-brand transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-5 py-5 border-y border-border-subtle mb-8">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 text-sm transition-all duration-150 ${
                isLiked ? "text-error" : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <Heart size={18} strokeWidth={1.5} fill={isLiked ? "currentColor" : "none"} />
              <span>{likeCount}</span>
            </button>
            <span className="flex items-center gap-2 text-sm text-text-tertiary">
              <MessageCircle size={18} strokeWidth={1.5} />
              <span>{comments.length}</span>
            </span>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 text-sm transition-colors ${
                isSaved ? "text-brand" : "text-text-tertiary hover:text-text-secondary"
              }`}
              title={isSaved ? "Unsave" : "Save poem"}
            >
              <Bookmark size={18} strokeWidth={1.5} fill={isSaved ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({ title: poem.title, url }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(url);
                  setToast("Link copied to clipboard");
                }
              }}
              className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
              title="Share"
            >
              <Share2 size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={handleReport}
              className="text-text-tertiary hover:text-error transition-colors text-xs flex items-center gap-1"
              title="Report content"
            >
              <Flag size={13} />
            </button>
            {responseCount > 0 && (
              <Link
                href={`/poem/${id}/responses`}
                className="flex items-center gap-1 text-sm text-brand hover:text-brand-hover transition-colors ml-auto"
              >
                {responseCount} {responseCount === 1 ? "response" : "responses"} →
              </Link>
            )}
          </div>

          <div className="text-center mb-10 py-6 bg-surface-secondary rounded-[var(--radius-lg)] space-y-3">
            <p className="text-sm text-text-secondary">Not a comment. A poem.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/poem/${id}/respond`}
                className="inline-flex items-center justify-center px-5 py-2.5 gradient-brand text-white text-sm font-medium rounded-[var(--radius-full)] hover:opacity-90 transition-opacity"
              >
                Respond with a poem
              </Link>
              <Link
                href={`/poem/${id}/canvas`}
                className="inline-flex items-center justify-center px-5 py-2.5 border border-border-default text-text-primary text-sm font-medium rounded-[var(--radius-full)] hover:border-brand hover:text-brand transition-colors"
              >
                Create Canvas
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border-subtle" id="comments">
            <h3 className="font-poem text-lg font-medium text-text-primary mb-6">Leave a note</h3>
            <div className="mb-8">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a note to the author..."
                className="w-full bg-surface-secondary border border-border-subtle focus:border-brand rounded-[var(--radius-md)] outline-none py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary resize-none"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim() || submittingComment}
                  className="text-xs font-medium text-white gradient-brand px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {submittingComment ? "Posting..." : "Post note"}
                </button>
              </div>
            </div>
            <div className="space-y-5">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <Avatar
                    src={comment.profiles?.profile_image}
                    name={comment.profiles?.display_name}
                    size="xs"
                    className="mt-0.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${comment.profiles?.username}`} className="text-xs font-medium text-text-primary hover:text-brand">
                          @{comment.profiles?.username}
                        </Link>
                        <span className="text-xs text-text-tertiary">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {user && user.id === comment.author_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-error transition-all"
                          title="Delete note"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
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
    </AppShell>
  );
}
