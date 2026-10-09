"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Profile } from "@/lib/types";
import Avatar from "@/components/ui/Avatar";

interface SuggestedWriter extends Profile {
  isFollowed: boolean;
}

export default function SuggestedWriters() {
  const router = useRouter();
  const { user } = useAuth();
  const [writers, setWriters] = useState<SuggestedWriter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggested = useCallback(async () => {
    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6);

      if (user) {
        query = query.neq("id", user.id);
      }

      const { data: profiles, error } = await query;
      if (error || !profiles) {
        setWriters([]);
        setLoading(false);
        return;
      }

      let followedIds = new Set<string>();
      if (user) {
        const { data: follows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);
        if (follows) {
          followedIds = new Set(follows.map((f) => f.following_id));
        }
      }

      const formatted: SuggestedWriter[] = profiles.slice(0, 4).map((p) => ({
        ...p,
        isFollowed: followedIds.has(p.id),
      }));

      setWriters(formatted);
    } catch {
      setWriters([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSuggested();
  }, [fetchSuggested]);

  const toggleFollow = async (writerId: string, currentlyFollowed: boolean) => {
    if (!user) {
      router.push("/login");
      return;
    }

    setWriters((prev) =>
      prev.map((w) => (w.id === writerId ? { ...w, isFollowed: !currentlyFollowed } : w))
    );

    try {
      if (currentlyFollowed) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", writerId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: writerId });
        if (error) throw error;

        await supabase.from("notifications").insert({
          recipient_id: writerId,
          actor_id: user.id,
          type: "follow",
        });
      }
    } catch {
      // Revert on error
      setWriters((prev) =>
        prev.map((w) => (w.id === writerId ? { ...w, isFollowed: currentlyFollowed } : w))
      );
    }
  };

  if (loading) {
    return (
      <div className="sidebar-section">
        <h3 className="sidebar-section-title mb-3">Suggested Writers</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[var(--radius-sm)] skeleton" />
              <div className="flex-1 space-y-1">
                <div className="w-20 h-3 skeleton rounded" />
                <div className="w-14 h-2 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (writers.length === 0) {
    return null;
  }

  return (
    <div className="sidebar-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="sidebar-section-title mb-0">Suggested Writers</h3>
        <Link
          href="/writers"
          className="text-xs text-brand hover:text-brand-hover transition-colors"
        >
          See all
        </Link>
      </div>
      <div className="space-y-3">
        {writers.map((writer) => (
          <div key={writer.id} className="writer-card">
            <Link
              href={`/profile/${writer.username}`}
              className="shrink-0 focus-visible:outline-none"
            >
              <Avatar
                src={writer.profile_image}
                name={writer.display_name}
                size="sm"
              />
            </Link>
            <div className="writer-info min-w-0 flex-1">
              <Link
                href={`/profile/${writer.username}`}
                className="writer-name hover:text-brand transition-colors block truncate"
              >
                {writer.display_name}
              </Link>
              <p className="writer-username truncate">@{writer.username}</p>
            </div>
            <button
              onClick={() => toggleFollow(writer.id, writer.isFollowed)}
              className={`follow-btn ${writer.isFollowed ? "following" : ""}`}
            >
              {writer.isFollowed ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
