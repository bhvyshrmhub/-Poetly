"use client";

import Link from "next/link";
import { PoemWithAuthor } from "@/lib/types";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface PoemCardProps {
  poem: PoemWithAuthor;
  variant?: "default" | "compact" | "featured";
}

export default function PoemCard({ poem, variant = "default" }: PoemCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("likes").select("id").eq("user_id", user.id).eq("poem_id", poem.id).single().then(({ data }) => setLiked(!!data));
    supabase.from("saves").select("id").eq("user_id", user.id).eq("poem_id", poem.id).single().then(({ data }) => setSaved(!!data));
  }, [user, poem.id]);

  useEffect(() => {
    supabase.from("likes").select("*", { count: "exact", head: true }).eq("poem_id", poem.id).then(({ count }) => setLikeCount(count || 0));
  }, [poem.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("poem_id", poem.id);
      setLiked(false);
      setLikeCount(Math.max(0, likeCount - 1));
    } else {
      await supabase.from("likes").insert({ user_id: user.id, poem_id: poem.id });
      setLiked(true);
      setLikeCount(likeCount + 1);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (saved) {
      await supabase.from("saves").delete().eq("user_id", user.id).eq("poem_id", poem.id);
      setSaved(false);
    } else {
      await supabase.from("saves").insert({ user_id: user.id, poem_id: poem.id });
      setSaved(true);
    }
  };

  const preview = poem.content.split("\n").slice(0, 4).join("\n");
  const author = poem.profiles;

  if (variant === "featured") {
    return (
      <Link href={`/poem/${poem.id}`} className="group block">
        <div className="py-8 md:py-12">
          <p className="text-[11px] font-medium text-brand tracking-widest uppercase mb-5">Featured Poem</p>
          <h2 className="font-poem-title text-3xl md:text-[2.5rem] mb-6 text-text-primary group-hover:text-brand transition-colors">{poem.title}</h2>
          <div className="poem-content-lg text-text-primary/85 mb-6">{poem.content}</div>
          <div className="flex items-center gap-2.5 text-text-secondary">
            <div className="w-6 h-6 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center">
              <span className="text-brand text-[10px] font-display">{author.display_name[0]}</span>
            </div>
            <span className="text-sm font-medium">{author.display_name}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/poem/${poem.id}`} className="group block">
      <article className="py-5 border-b border-border-subtle last:border-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center">
            <span className="text-brand text-[10px] font-display font-medium">{author.display_name[0]}</span>
          </div>
          <span className="text-sm font-medium text-text-primary">{author.display_name}</span>
          <span className="text-xs text-text-tertiary">· {new Date(poem.published_at || poem.created_at).toLocaleDateString()}</span>
        </div>

        <h3 className="font-poem-title text-xl mb-2.5 text-text-primary group-hover:text-brand transition-colors">{poem.title}</h3>

        <div className="poem-content text-text-primary/80 mb-4 text-[0.95rem] leading-[1.85]">
          {preview}
          {poem.content.split("\n").length > 4 && <span className="text-text-tertiary">...</span>}
        </div>

        <div className="flex items-center gap-5">
          <button onClick={handleLike} className={`flex items-center gap-1.5 text-xs transition-all duration-150 ${liked ? "text-brand" : "text-text-tertiary hover:text-text-secondary"}`}>
            <Heart size={15} strokeWidth={1.5} fill={liked ? "currentColor" : "none"} className={liked ? "animate-like-pop" : ""} />
            <span>{likeCount}</span>
          </button>
          <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <MessageCircle size={15} strokeWidth={1.5} />
          </span>
          <button onClick={handleSave} className={`flex items-center gap-1.5 text-xs transition-all duration-150 ${saved ? "text-brand" : "text-text-tertiary hover:text-text-secondary"}`}>
            <Bookmark size={15} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </article>
    </Link>
  );
}
