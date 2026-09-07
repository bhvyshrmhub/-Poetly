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
          <p className="text-xs text-text-tertiary tracking-widest uppercase mb-4">
            Featured Poem
          </p>
          <h2 className="font-poem-title text-3xl md:text-4xl mb-6 text-foreground">
            {poem.title}
          </h2>
          <div className="poem-content text-lg md:text-xl text-foreground/90 mb-6">
            {poem.content}
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <span className="text-sm">—</span>
            <span className="text-sm font-medium">{poem.author.name}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/poem/${poem.id}`} className="group block py-4">
        <h3 className="font-poem-title text-lg mb-2 text-foreground group-hover:text-accent transition-colors">
          {poem.title}
        </h3>
        <p className="text-sm text-text-secondary line-clamp-2 mb-2">
          {preview}
        </p>
        <div className="flex items-center gap-3 text-xs text-text-tertiary">
          <span>{poem.author.name}</span>
          <span>·</span>
          <span>{poem.likes} likes</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/poem/${poem.id}`} className="group block">
      <article className="py-6 border-b border-border-light last:border-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-accent-muted flex items-center justify-center">
            <span className="text-accent text-[10px] font-serif font-semibold">
              {poem.author.name[0]}
            </span>
          </div>
          <span className="text-xs text-text-secondary">{poem.author.name}</span>
          <span className="text-xs text-text-tertiary">· {poem.createdAt}</span>
        </div>

        <h3 className="font-poem-title text-xl mb-3 text-foreground group-hover:text-accent transition-colors">
          {poem.title}
        </h3>

        <div className="poem-content text-foreground/85 mb-4 text-base">
          {preview}
          {poem.content.split("\n").length > 4 && (
            <span className="text-text-tertiary">...</span>
          )}
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              liked ? "text-accent" : "text-text-tertiary hover:text-text-secondary"
            }`}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <Heart size={14} strokeWidth={1.5} fill={liked ? "currentColor" : "none"} />
            <span>{likeCount}</span>
          </button>
          <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <MessageCircle size={14} strokeWidth={1.5} />
            <span>{poem.comments}</span>
          </span>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              saved ? "text-accent" : "text-text-tertiary hover:text-text-secondary"
            }`}
            aria-label={saved ? "Unsave" : "Save"}
          >
            <Bookmark size={14} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </article>
    </Link>
  );
}
