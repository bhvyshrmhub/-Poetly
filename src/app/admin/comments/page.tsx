"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Trash2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Database } from "@/lib/database.types";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";
import Toast from "@/components/Toast";

type Comment = Database["public"]["Tables"]["comments"]["Row"];
type CommentWithAuthor = Comment & { profiles: Database["public"]["Tables"]["profiles"]["Row"] };

const PAGE_SIZE = 20;

export default function AdminCommentsPage() {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [confirm, setConfirm] = useState<{ commentId: string; content: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logActivity = useCallback(async (action: string, targetId: string, details?: string) => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("admin_activity_log").insert({
      admin_id: user.id,
      action,
      target_type: "comment",
      target_id: targetId,
      details: details || null,
    });
  }, [user]);

  const fetchComments = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const offset = reset ? 0 : page * PAGE_SIZE;
      let query = supabase
        .from("comments")
        .select("*, profiles!inner(*)")
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (search.trim()) {
        query = query.ilike("content", `%${search}%`);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const typedData = (data as CommentWithAuthor[]) || [];
      setComments(reset ? typedData : [...comments, ...typedData]);
      setHasMore(typedData.length === PAGE_SIZE);
    } catch (err) {
      setError("Failed to load comments.");
      console.error("Fetch comments error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, page, comments]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setPage(0);
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        let query = supabase
          .from("comments")
          .select("*, profiles!inner(*)")
          .order("created_at", { ascending: false })
          .range(0, PAGE_SIZE - 1);
        if (search.trim()) {
          query = query.ilike("content", `%${search}%`);
        }
        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;
        setComments((data as CommentWithAuthor[]) || []);
        setHasMore((data as CommentWithAuthor[])?.length === PAGE_SIZE);
      } catch (err) {
        setError("Failed to load comments.");
        console.error("Fetch comments error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (commentId: string, content: string) => {
    setConfirm(null);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
      await logActivity("deleted_comment", commentId, content.slice(0, 80));
      setToast("Comment deleted.");
      fetchComments(true);
    } catch (err) {
      setToast("Failed to delete comment.");
      console.error("Delete comment error:", err);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-text-primary mb-1">Comments</h1>
        <p className="text-sm text-text-secondary">Moderate user comments.</p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search comments..."
          className="w-full bg-surface border border-border-subtle rounded-[var(--radius-sm)] pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand transition-colors"
        />
      </div>

      {error && (
        <div className="bg-error-subtle border border-error/20 rounded-[var(--radius-md)] p-4 mb-6">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {loading && comments.length === 0 ? (
        <AdminSkeleton rows={8} />
      ) : comments.length > 0 ? (
        <>
          <div className="space-y-0">
            {comments.map((comment) => (
              <div key={comment.id} className="py-4 border-b border-border-subtle group">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-text-primary">{comment.profiles?.display_name || "Unknown"}</span>
                      <span className="text-[10px] text-text-tertiary">@{comment.profiles?.username}</span>
                      <span className="text-[10px] text-text-tertiary">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2">{comment.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Link href={`/poem/${comment.poem_id}`} className="text-[10px] text-text-tertiary hover:text-brand transition-colors flex items-center gap-1">
                        View poem <ExternalLink size={10} />
                      </Link>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirm({ commentId: comment.id, content: comment.content })}
                    className="p-1.5 text-text-tertiary hover:text-error transition-colors opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    title="Delete comment"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-text-tertiary">
              Showing {comments.length} comment{comments.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setPage(Math.max(0, page - 1)); fetchComments(true); }}
                disabled={page === 0}
                className="p-1.5 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-text-tertiary">Page {page + 1}</span>
              <button
                onClick={() => { setPage(page + 1); fetchComments(false); }}
                disabled={!hasMore || loading}
                className="p-1.5 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <AdminEmptyState
          title={search ? "No comments found" : "No comments yet"}
          description={search ? "No comments match your search." : "No comments have been posted yet."}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete this comment?"
          message={`This will permanently delete: "${confirm.content.slice(0, 100)}${confirm.content.length > 100 ? "..." : ""}"`}
          confirmLabel="Delete"
          danger
          onConfirm={() => handleDelete(confirm.commentId, confirm.content)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
