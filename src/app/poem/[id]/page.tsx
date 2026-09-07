"use client";

import { useParams } from "next/navigation";
import { poems, comments } from "@/lib/mock-data";
import { Heart, MessageCircle, Bookmark, Share2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import CommentSection from "@/components/CommentSection";
import Navbar from "@/components/Navbar";

export default function PoemPage() {
  const params = useParams();
  const id = params.id as string;
  const poem = poems.find((p) => p.id === id) || poems[0];

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(poem.likes);
  const [saved, setSaved] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <article className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-6 md:py-12">
        {/* Back */}
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-10"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back
        </Link>

        <div className="animate-fade-in">
          {/* Author */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center">
              <span className="text-brand text-sm font-display font-medium">
                {poem.author.name[0]}
              </span>
            </div>
            <div>
              <Link
                href={`/profile?id=${poem.author.id}`}
                className="text-sm font-medium text-text-primary hover:text-brand transition-colors"
              >
                {poem.author.name}
              </Link>
              <p className="text-xs text-text-tertiary">{poem.createdAt}</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-poem-title text-3xl md:text-[2.75rem] text-text-primary mb-10">
            {poem.title}
          </h1>

          {/* Content */}
          <div className="poem-content-lg text-text-primary/85 mb-10">
            {poem.content}
          </div>

          {/* Tags */}
          {poem.tags && (
            <div className="flex flex-wrap gap-2 mb-10">
              {poem.tags.map((tag) => (
                <span key={tag} className="text-xs text-text-tertiary bg-surface-secondary px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-5 py-5 border-y border-border-subtle mb-8">
            <button
              onClick={() => {
                setLiked(!liked);
                setLikeCount(liked ? likeCount - 1 : likeCount + 1);
              }}
              className={`flex items-center gap-2 text-sm transition-all duration-150 ${
                liked ? "text-brand" : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <Heart size={17} strokeWidth={1.5} fill={liked ? "currentColor" : "none"}
                className={liked ? "animate-like-pop" : ""}
              />
              <span>{likeCount}</span>
            </button>
            <button className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
              <MessageCircle size={17} strokeWidth={1.5} />
              <span>{poem.comments}</span>
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-2 text-sm transition-all duration-150 ${
                saved ? "text-brand" : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <Bookmark size={17} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
            </button>
            <button className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
              <Share2 size={17} strokeWidth={1.5} />
            </button>
          </div>

          {/* Respond CTA */}
          <div className="text-center mb-10 py-6 bg-surface-secondary rounded-[var(--radius-lg)]">
            <p className="text-sm text-text-secondary mb-3">
              Not a comment. A poem.
            </p>
            <Link
              href={`/poem/${poem.id}/respond`}
              className="inline-flex items-center justify-center px-5 py-2.5 gradient-brand text-white text-sm font-medium rounded-[var(--radius-full)] hover:opacity-90 transition-opacity"
            >
              Respond with a poem
            </Link>
          </div>

          {/* Comments */}
          <CommentSection comments={comments} />
        </div>
      </article>
    </div>
  );
}
