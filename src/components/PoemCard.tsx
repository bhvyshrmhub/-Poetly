"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Flag,
  Sparkles,
} from "lucide-react";
import { PoemWithAuthor } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import Avatar from "@/components/ui/Avatar";
import Tag from "@/components/ui/Tag";

export interface PoemCardProps {
  poem: PoemWithAuthor;
  variant?: "default" | "featured" | "compact";
  onReport?: (poemId: string) => void;
  className?: string;
}

export default function PoemCard({
  poem,
  variant = "default",
  onReport,
  className = "",
}: PoemCardProps) {
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
    let isMounted = true;
    (async () => {
      try {
        const [likesRes, commentsRes] = await Promise.all([
          supabase
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("poem_id", poem.id),
          supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("poem_id", poem.id),
        ]);

        if (isMounted) {
          if (!likesRes.error) setLikeCount(likesRes.count || 0);
          if (!commentsRes.error) setCommentCount(commentsRes.count || 0);
        }

        if (user && isMounted) {
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

          if (isMounted) {
            setIsLiked(Boolean(userLike.data));
            setIsSaved(Boolean(userSave.data));
          }
        }
      } catch {
        // silent fail
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [poem.id, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = typeof window !== "undefined" ? `${window.location.origin}/poem/${poem.id}` : "";
    if (navigator.share) {
      navigator.share({ title: poem.title, url }).catch(() => {});
    } else if (navigator.clipboard) {
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
      // silent fail
    } finally {
      setReporting(false);
      setShowActions(false);
    }
  };

  const author = poem.profiles;
  const authorName = author?.display_name || "Anonymous";
  const authorUsername = author?.username || "poet";
  const lines = poem.content ? poem.content.split("\n") : [];
  const previewMaxLines = variant === "featured" ? 8 : variant === "compact" ? 3 : 5;
  const preview = lines.slice(0, previewMaxLines).join("\n");
  const timeAgo = getTimeAgo(poem.published_at || poem.created_at);

  if (variant === "featured") {
    return (
      <article
        className={`py-8 md:py-10 border-b border-border-subtle animate-fade-in ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-brand tracking-wider uppercase">
            <Sparkles size={14} />
            <span>Featured Poem</span>
          </div>
          <span className="text-xs text-text-tertiary">{timeAgo}</span>
        </div>

        <Link href={`/poem/${poem.id}`} className="group block mb-4">
          <h2 className="font-poem-title text-2xl sm:text-3xl lg:text-4xl text-text-primary group-hover:text-brand transition-colors mb-4">
            {poem.title}
          </h2>
          <div className="poem-content-lg text-text-primary/90 leading-relaxed font-poem text-lg">
            {preview}
            {lines.length > previewMaxLines && (
              <span className="text-text-tertiary">...</span>
            )}
          </div>
        </Link>

        {/* Author Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-subtle/60">
          <Link
            href={`/profile/${authorUsername}`}
            className="flex items-center gap-2.5 group"
          >
            <Avatar
              src={author?.profile_image}
              name={authorName}
              size="sm"
            />
            <div>
              <p className="text-xs sm:text-sm font-medium text-text-primary group-hover:text-brand transition-colors">
                {authorName}
              </p>
              <p className="text-[11px] text-text-tertiary">@{authorUsername}</p>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                isLiked ? "text-brand" : "hover:text-brand"
              }`}
            >
              <Heart
                size={16}
                strokeWidth={1.75}
                fill={isLiked ? "currentColor" : "none"}
              />
              <span>{likeCount}</span>
            </button>
            <Link
              href={`/poem/${poem.id}#comments`}
              className="flex items-center gap-1.5 hover:text-brand transition-colors"
            >
              <MessageCircle size={16} strokeWidth={1.75} />
              <span>{commentCount}</span>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`py-6 border-b border-border-subtle last:border-b-0 animate-fade-in ${className}`}
    >
      {/* Header: Author + Meta + Actions */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <Link
            href={`/profile/${authorUsername}`}
            className="shrink-0 rounded-full focus-visible:outline-none"
          >
            <Avatar
              src={author?.profile_image}
              name={authorName}
              size="sm"
            />
          </Link>

          <div className="min-w-0">
            <Link
              href={`/profile/${authorUsername}`}
              className="text-xs sm:text-sm font-medium text-text-primary hover:text-brand transition-colors truncate block"
            >
              {authorName}
            </Link>
            <p className="text-[11px] text-text-tertiary truncate">
              @{authorUsername} · {timeAgo}
            </p>
          </div>
        </div>

        {/* Overflow Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowActions((prev) => !prev)}
            className="p-1.5 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors"
            aria-label="More poem actions"
            aria-expanded={showActions}
          >
            <MoreHorizontal size={16} />
          </button>

          {showActions && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowActions(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border-subtle rounded-[var(--radius-md)] shadow-xl z-30 py-1 text-xs animate-scale-in">
                <Link
                  href={`/poem/${poem.id}/canvas`}
                  onClick={() => setShowActions(false)}
                  className="w-full px-3.5 py-2 text-left text-text-secondary hover:bg-surface-hover hover:text-text-primary flex items-center gap-2 transition-colors"
                >
                  <Sparkles size={14} className="text-brand" />
                  <span>Poetry Canvas card</span>
                </Link>

                {reportSuccess ? (
                  <div className="px-3.5 py-2 text-success">Report submitted</div>
                ) : (
                  <button
                    type="button"
                    onClick={handleReport}
                    disabled={reporting}
                    className="w-full px-3.5 py-2 text-left text-text-secondary hover:bg-surface-hover hover:text-error flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Flag size={14} />
                    <span>{reporting ? "Submitting..." : "Report poem"}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <Link href={`/poem/${poem.id}`} className="group block mb-2.5">
        <h2 className="font-poem-title text-xl sm:text-2xl text-text-primary group-hover:text-brand transition-colors">
          {poem.title}
        </h2>
      </Link>

      {/* Content excerpt */}
      <Link href={`/poem/${poem.id}`} className="group block mb-3.5">
        <div className="poem-content text-text-primary/85 leading-relaxed font-poem text-[0.98rem]">
          {preview}
          {lines.length > previewMaxLines && (
            <span className="text-text-tertiary block mt-1">...</span>
          )}
        </div>
      </Link>

      {/* Mood and Tags */}
      {(poem.mood || (poem.tags && poem.tags.length > 0)) && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {poem.mood && <Tag label={poem.mood} />}
          {(poem.tags || []).slice(0, 3).map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}

      {/* Interactive Action Bar */}
      <div className="flex items-center gap-5 sm:gap-6 pt-1 text-xs text-text-secondary select-none">
        {/* Like */}
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors ${
            isLiked ? "text-brand" : "hover:text-brand"
          }`}
          aria-label={isLiked ? "Unlike poem" : "Like poem"}
        >
          <Heart
            size={17}
            strokeWidth={1.6}
            fill={isLiked ? "currentColor" : "none"}
            className={isLiked ? "animate-like-pop" : ""}
          />
          <span>{likeCount}</span>
        </button>

        {/* Comments */}
        <Link
          href={`/poem/${poem.id}#comments`}
          className="flex items-center gap-1.5 hover:text-brand transition-colors"
          aria-label="View comments"
        >
          <MessageCircle size={17} strokeWidth={1.6} />
          <span>{commentCount}</span>
        </Link>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-brand transition-colors"
          aria-label="Share poem"
        >
          <Share2 size={17} strokeWidth={1.6} />
        </button>

        {/* Save Bookmark */}
        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-1.5 ml-auto transition-colors ${
            isSaved ? "text-brand" : "hover:text-brand"
          }`}
          aria-label={isSaved ? "Unsave poem" : "Save poem"}
        >
          <Bookmark
            size={17}
            strokeWidth={1.6}
            fill={isSaved ? "currentColor" : "none"}
          />
        </button>
      </div>
    </article>
  );
}

function getTimeAgo(dateString: string): string {
  if (!dateString) return "recently";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
