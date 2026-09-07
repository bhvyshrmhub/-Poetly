"use client";

import Link from "next/link";
import { Poem } from "@/lib/types";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { useState } from "react";

interface PoemCardProps {
  poem: Poem;
  variant?: "default" | "compact" | "featured";
}

export default function PoemCard({ poem, variant = "default" }: PoemCardProps) {
  const [liked, setLiked] = useState(poem.isLiked || false);
  const [likeCount, setLikeCount] = useState(poem.likes);
  const [saved, setSaved] = useState(poem.isSaved || false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
  };

  const preview = poem.content.split("\n").slice(0, 4).join("\n");

  if (variant === "featured") {
    return (
      <Link href={`/poem/${poem.id}`} className="group block">
        <div className="py-8 md:py-12">
          <p className="text-[11px] font-medium text-brand tracking-widest uppercase mb-5">
            Featured Poem
          </p>
          <h2 className="font-poem-title text-3xl md:text-[2.5rem] mb-6 text-text-primary group-hover:text-brand transition-colors">
            {poem.title}
          </h2>
          <div className="poem-content-lg text-text-primary/85 mb-6">
            {poem.content}
          </div>
          <div className="flex items-center gap-2.5 text-text-secondary">
            <div className="w-6 h-6 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center">
              <span className="text-brand text-[10px] font-display">{poem.author.name[0]}</span>
            </div>
            <span className="text-sm font-medium">{poem.author.name}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/poem/${poem.id}`} className="group block py-3.5">
        <h3 className="font-poem-title text-lg mb-1.5 text-text-primary group-hover:text-brand transition-colors">
          {poem.title}
        </h3>
        <p className="text-sm text-text-secondary line-clamp-2 mb-1.5 leading-relaxed">
          {preview}
        </p>
        <div className="flex items-center gap-2.5 text-xs text-text-tertiary">
          <span>{poem.author.name}</span>
          <span className="w-1 h-1 rounded-full bg-text-tertiary/40" />
          <span>{poem.likes} likes</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/poem/${poem.id}`} className="group block">
      <article className="py-5 border-b border-border-subtle last:border-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center">
            <span className="text-brand text-[10px] font-display font-medium">
              {poem.author.name[0]}
            </span>
          </div>
          <span className="text-sm font-medium text-text-primary">{poem.author.name}</span>
          <span className="text-xs text-text-tertiary">· {poem.createdAt}</span>
        </div>

        <h3 className="font-poem-title text-xl mb-2.5 text-text-primary group-hover:text-brand transition-colors">
          {poem.title}
        </h3>

        <div className="poem-content text-text-primary/80 mb-4 text-[0.95rem] leading-[1.85]">
          {preview}
          {poem.content.split("\n").length > 4 && (
            <span className="text-text-tertiary">...</span>
          )}
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs transition-all duration-150 ${
              liked ? "text-brand" : "text-text-tertiary hover:text-text-secondary"
            }`}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <Heart size={15} strokeWidth={1.5} fill={liked ? "currentColor" : "none"}
              className={liked ? "animate-like-pop" : ""}
            />
            <span>{likeCount}</span>
          </button>
          <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <MessageCircle size={15} strokeWidth={1.5} />
            <span>{poem.comments}</span>
          </span>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 text-xs transition-all duration-150 ${
              saved ? "text-brand" : "text-text-tertiary hover:text-text-secondary"
            }`}
            aria-label={saved ? "Unsave" : "Save"}
          >
            <Bookmark size={15} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </article>
    </Link>
  );
}
