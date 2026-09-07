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
      <article className="max-w-3xl mx-auto px-6 md:px-8 py-8 md:py-16">
        {/* Back link */}
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back
        </Link>

        {/* Poem */}
        <div className="animate-fade-in">
          {/* Author info */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-accent-muted flex items-center justify-center">
              <span className="text-accent text-xs font-serif font-semibold">
                {poem.author.name[0]}
              </span>
            </div>
            <div>
              <Link
                href={`/profile?id=${poem.author.id}`}
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                {poem.author.name}
              </Link>
              <p className="text-xs text-text-tertiary">{poem.createdAt}</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-poem-title text-3xl md:text-5xl text-foreground mb-10">
            {poem.title}
          </h1>

          {/* Poem content */}
          <div className="poem-content-lg text-foreground/90 mb-12">
            {poem.content}
          </div>

          {/* Tags */}
          {poem.tags && (
            <div className="flex flex-wrap gap-2 mb-12">
              {poem.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-text-tertiary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 py-6 border-y border-border-light mb-8">
            <button
              onClick={() => {
                setLiked(!liked);
                setLikeCount(liked ? likeCount - 1 : likeCount + 1);
              }}
              className={`flex items-center gap-2 text-sm transition-colors ${
                liked ? "text-accent" : "text-text-tertiary hover:text-text-secondary"
              }`}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart size={18} strokeWidth={1.5} fill={liked ? "currentColor" : "none"} />
              <span>{likeCount}</span>
            </button>
            <button className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
              <MessageCircle size={18} strokeWidth={1.5} />
              <span>{poem.comments}</span>
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-2 text-sm transition-colors ${
                saved ? "text-accent" : "text-text-tertiary hover:text-text-secondary"
              }`}
              aria-label={saved ? "Unsave" : "Save"}
            >
              <Bookmark size={18} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
            </button>
            <button className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
              <Share2 size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Respond CTA */}
          <div className="text-center mb-12">
            <p className="text-sm text-text-secondary mb-4">
              Not a comment. A poem.
            </p>
            <Link
              href={`/poem/${poem.id}/respond`}
              className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors"
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
