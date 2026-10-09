"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Profile, PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import AppShell from "@/components/layout/AppShell";
import Toast from "@/components/Toast";
import Avatar from "@/components/ui/Avatar";
import SuggestedWriters from "@/components/home/SuggestedWriters";

export default function ProfileByUsernamePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"poems" | "about">("poems");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const isOwnProfile = user && profile && user.id === profile.id;

  const loadProfile = useCallback(async (p: Profile) => {
    setProfile(p);

    try {
      const { data: poemData } = await supabase
        .from("poems")
        .select("*, profiles!inner(*)")
        .eq("author_id", p.id)
        .eq("status", "published")
        .eq("visibility", "public")
        .order("published_at", { ascending: false });

      setPoems((poemData as PoemWithAuthor[]) || []);

      const { count: fc } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", p.id);
      setFollowerCount(fc || 0);

      const { count: fgc } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", p.id);
      setFollowingCount(fgc || 0);

      if (user && user.id !== p.id) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", p.id)
          .maybeSingle();
        setIsFollowing(!!followData);
      }
    } catch {
      setToast("Failed to load profile");
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (username) {
      supabase.from("profiles").select("*").eq("username", username).maybeSingle().then(({ data, error }) => {
        if (data) {
          loadProfile(data as Profile);
        } else if (error) {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
  }, [username, loadProfile]);

  const handleFollow = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!profile || user.id === profile.id) return;

    const previousFollow = isFollowing;
    const previousCount = followerCount;

    if (previousFollow) {
      setFollowerCount(Math.max(0, previousCount - 1));
      setIsFollowing(false);
    } else {
      setFollowerCount(previousCount + 1);
      setIsFollowing(true);
    }

    try {
      if (previousFollow) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: profile.id });
        if (error) throw error;

        // Create notification
        await supabase.from("notifications").insert({
          recipient_id: profile.id,
          actor_id: user.id,
          type: "follow",
        });
      }
    } catch {
      // Revert on error
      setIsFollowing(previousFollow);
      setFollowerCount(previousCount);
      setToast("Failed to update follow");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-[var(--content-width)] mx-auto px-5 py-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 skeleton rounded-[var(--radius-md)]" />
            <div className="space-y-2">
              <div className="w-40 h-6 skeleton rounded" />
              <div className="w-24 h-4 skeleton rounded" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="max-w-[var(--content-width)] mx-auto px-5 py-16 text-center">
          <p className="font-poem text-xl text-text-tertiary italic">Profile not found.</p>
          <Link href="/home" className="text-sm text-brand hover:text-brand-hover mt-4 inline-block">Return home</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell maxWidth="feed" rightRail={<SuggestedWriters />}>
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={14} strokeWidth={1.5} /> Back
      </button>

      <div className="animate-fade-in mb-8">
        <div className="flex items-start gap-4 mb-5">
          <Avatar
            src={profile.profile_image}
            name={profile.display_name}
            size="xl"
            className="shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-poem text-xl sm:text-2xl font-semibold text-text-primary">
                {profile.display_name}
              </h1>
              {isOwnProfile && (
                <Link
                  href="/profile/setup"
                  className="p-1 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors"
                  aria-label="Edit profile settings"
                >
                  <Settings size={15} strokeWidth={1.5} />
                </Link>
              )}
            </div>
            <p className="text-xs sm:text-sm text-text-tertiary">@{profile.username}</p>
          </div>

          {!isOwnProfile && user && (
            <button
              type="button"
              onClick={handleFollow}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all select-none ${
                isFollowing
                  ? "border border-border-default text-text-secondary hover:border-error hover:text-error"
                  : "bg-brand text-white hover:bg-brand-hover shadow-xs"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {profile.bio && (
          <p className="text-xs sm:text-sm text-text-secondary italic mb-4 max-w-lg font-serif">
            &ldquo;{profile.bio}&rdquo;
          </p>
        )}

        <div className="flex gap-6 text-xs sm:text-sm pt-2 border-t border-border-subtle/50">
          <div>
            <span className="font-semibold text-text-primary">{poems.length}</span>{" "}
            <span className="text-text-tertiary">{poems.length === 1 ? "Poem" : "Poems"}</span>
          </div>
          <div>
            <span className="font-semibold text-text-primary">{followerCount}</span>{" "}
            <span className="text-text-tertiary">Followers</span>
          </div>
          <div>
            <span className="font-semibold text-text-primary">{followingCount}</span>{" "}
            <span className="text-text-tertiary">Following</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-surface-secondary rounded-[var(--radius-full)] p-1 border border-border-subtle/50">
        {(["poems", "about"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-150 capitalize select-none ${
              activeTab === tab
                ? "bg-surface text-text-primary shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "poems" ? (
        poems.length > 0 ? (
          <div className="space-y-0">
            {poems.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-tertiary py-12 text-center font-poem italic">
            No poems published yet.
          </p>
        )
      ) : (
        <div className="py-4 space-y-3">
          {profile.bio && (
            <p className="font-poem text-lg text-text-primary italic mb-4">&ldquo;{profile.bio}&rdquo;</p>
          )}
          {profile.location && <p className="text-sm text-text-secondary">📍 {profile.location}</p>}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand hover:text-brand-hover block underline underline-offset-4"
            >
              {profile.website}
            </a>
          )}
          <p className="text-xs text-text-tertiary pt-2">
            Member since {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
