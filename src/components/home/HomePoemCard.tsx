"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PoemWithAuthor } from "@/lib/types";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Share2, Flag } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import Tag from "@/components/ui/Tag";

interface HomePoemCardProps {
  poem: PoemWithAuthor;
  onReport?: (poemId: string) => void;
}

export default function HomePoemCard({ poem, onReport }: HomePoemCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [likesRes, commentsRes] = await Promise.all([
          supabase.from("likes").select("*", { count: "exact", head: true }).eq("poem_id", poem.id),
          supabase.from("comments").select("*", { count: "exact", head: true }).eq("poem_id", poem.id),
        ]);
        if (!likesRes.error) setLikeCount(likesRes.count || 0);
        if (!commentsRes.error) setCommentCount(commentsRes.count || 0);

        if (user) {
          const [userLike, userSave] = await Promise.all([
            supabase
              .from("likes")
              .select("id")
              .eq("poem_id", poem.id)
              .eq("user_id", user.id)
              .maybeSingle(),
            supabase
              .from("saves")
              .select("id")
              .eq("poem_id", poem.id)
              .eq("user_id", user.id)
              .maybeSingle(),
          ]);
          setIsLiked(Boolean(userLike.data));
          setIsSaved(Boolean(userSave.data));
        }
      } catch {
        // ignore
      }
    })();
  }, [poem.id, user]);

  const handleLike = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      if (previousLiked) {
        await supabase
          .from("likes")
          .delete()
          .eq("poem_id", poem.id)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("likes")
          .insert({ poem_id: poem.id, user_id: user.id });

        if (user.id !== poem.author_id) {
          await supabase.from("notifications").insert({
            recipient_id: poem.author_id,
            actor_id: user.id,
            type: "like",
            reference_id: poem.id,
          });
        }
      }
    } catch {
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  const handleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    const previousSaved = isSaved;
    setIsSaved(!previousSaved);

    try {
      if (previousSaved) {
        await supabase
          .from("saves")
          .delete()
          .eq("poem_id", poem.id)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("saves")
          .insert({ poem_id: poem.id, user_id: user.id });
      }
    } catch {
      setIsSaved(previousSaved);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/poem/${poem.id}`;
    if (navigator.share) {
      navigator.share({ title: poem.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleReport = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setReporting(true);
    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        target_type: "poem",
        target_id: poem.id,
        reason: "Inappropriate or abusive content",
      });
      if (!error) {
        setReportSuccess(true);
        onReport?.(poem.id);
      }
    } catch {
      // ignore
    } finally {
      setReporting(false);
      setShowActions(false);
    }
  };

  const preview = poem.content.split("\n").slice(0, 6).join("\n");
  const author = poem.profiles;
  const timeAgo = getTimeAgo(poem.published_at || poem.created_at);

  return (
    <article className="py-6 border-b border-border-subtle last:border-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${author.username}`} className="profile-avatar overflow-hidden">
            {author.profile_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={author.profile_image}
                alt={author.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="profile-avatar-initial">
                {author.display_name[0]}
              </span>
            )}
          </Link>
          <div>
            <Link
              href={`/profile/${author.username}`}
              className="text-sm font-medium text-text-primary hover:text-brand transition-colors"
            >
              {author.display_name}
            </Link>
            <p className="text-xs text-text-tertiary">
              @{author.username} · {timeAgo}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-all"
            aria-label="More actions"
          >
            <MoreHorizontal size={16} />
          </button>
          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border-subtle rounded-[var(--radius-md)] shadow-lg z-10 py-1">
              {reportSuccess ? (
                <div className="px-4 py-2 text-xs text-success">Report submitted</div>
              ) : (
                <button
                  onClick={handleReport}
                  disabled={reporting}
                  className="w-full px-4 py-2 text-left text-xs text-text-secondary hover:bg-surface-hover hover:text-error transition-colors flex items-center gap-2"
                >
                  <Flag size={13} />
                  <span>{reporting ? "Reporting..." : "Report poem"}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <Link href={`/poem/${poem.id}`} className="group block mb-3">
        <h2 className="font-poem-title text-xl md:text-2xl text-text-primary group-hover:text-brand transition-colors">
          {poem.title}
        </h2>
      </Link>

      {/* Content */}
      <Link href={`/poem/${poem.id}`} className="group block mb-4">
        <div className="poem-content text-text-primary/85 leading-relaxed font-poem">
          {preview}
          {poem.content.split("\n").length > 6 && (
            <span className="text-text-tertiary">...</span>
          )}
        </div>
      </Link>

      {/* Tags */}
      {(poem.mood || (poem.tags && poem.tags.length > 0)) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {poem.mood && <Tag label={poem.mood} />}
          {(poem.tags || []).slice(0, 4).map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm transition-all ${
            isLiked
              ? "text-brand"
              : "text-text-tertiary hover:text-brand"
          }`}
          aria-label={isLiked ? "Unlike poem" : "Like poem"}
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            fill={isLiked ? "currentColor" : "none"}
            className={isLiked ? "animate-like-pop" : ""}
          />
          <span>{likeCount}</span>
        </button>

        <Link
          href={`/poem/${poem.id}#comments`}
          className="flex items-center gap-2 text-sm text-text-tertiary hover:text-brand transition-colors"
          aria-label="View comments"
        >
          <MessageCircle size={18} strokeWidth={1.5} />
          <span>{commentCount}</span>
        </Link>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-sm text-text-tertiary hover:text-brand transition-colors"
          aria-label="Share poem"
        >
          <Share2 size={18} strokeWidth={1.5} />
        </button>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 text-sm transition-all ${
            isSaved
              ? "text-brand"
              : "text-text-tertiary hover:text-brand"
          }`}
          aria-label={isSaved ? "Unsave poem" : "Save poem"}
        >
          <Bookmark
            size={18}
            strokeWidth={1.5}
            fill={isSaved ? "currentColor" : "none"}
          />
        </button>
      </div>
    </article>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString();
}
