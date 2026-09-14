"use client";

import Link from "next/link";
import { PoemWithAuthor } from "@/lib/types";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Tag from "@/components/ui/Tag";

interface HomePoemCardProps {
  poem: PoemWithAuthor;
}

export default function HomePoemCard({ poem }: HomePoemCardProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [likesRes, commentsRes] = await Promise.all([
          supabase.from("likes").select("*", { count: "exact", head: true }).eq("poem_id", poem.id),
          supabase.from("comments").select("*", { count: "exact", head: true }).eq("poem_id", poem.id),
        ]);
        if (!likesRes.error) setLikeCount(likesRes.count || 0);
        if (!commentsRes.error) setCommentCount(commentsRes.count || 0);
      } catch {
        // ignore
      }
    })();
  }, [poem.id]);

  const preview = poem.content.split("\n").slice(0, 6).join("\n");
  const author = poem.profiles;
  const timeAgo = getTimeAgo(poem.published_at || poem.created_at);

  return (
    <article className="py-6 border-b border-border-subtle last:border-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${author.username}`} className="profile-avatar">
            {author.profile_image ? (
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
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border-subtle rounded-[var(--radius-md)] shadow-lg z-10">
              <button className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover transition-colors">
                Report poem
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover transition-colors">
                Mute author
              </button>
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
        <div className="poem-content text-text-primary/85">
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
          onClick={() => {
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
          }}
          className={`flex items-center gap-2 text-sm transition-all ${
            isLiked
              ? "text-brand"
              : "text-text-tertiary hover:text-brand"
          }`}
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
        >
          <MessageCircle size={18} strokeWidth={1.5} />
          <span>{commentCount}</span>
        </Link>
        <button className="flex items-center gap-2 text-sm text-text-tertiary hover:text-brand transition-colors">
          <Share2 size={18} strokeWidth={1.5} />
        </button>
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`flex items-center gap-2 text-sm transition-all ${
            isSaved
              ? "text-brand"
              : "text-text-tertiary hover:text-brand"
          }`}
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
