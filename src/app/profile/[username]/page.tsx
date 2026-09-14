"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Profile, PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import AppShell from "@/components/shell/AppShell";
import Toast from "@/components/Toast";

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
          .single();
        setIsFollowing(!!followData);
      }
    } catch {
      setToast("Failed to load profile");
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (username) {
      supabase.from("profiles").select("*").eq("username", username).single().then(({ data, error }) => {
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
    if (!profile) return;

    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.id);
      setFollowerCount(Math.max(0, followerCount - 1));
      setIsFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.id });
      setFollowerCount(followerCount + 1);
      setIsFollowing(true);

      // Create notification
      if (user.id !== profile.id) {
        await supabase.from("notifications").insert({
          recipient_id: profile.id,
          actor_id: user.id,
          type: "follow",
        });
      }
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
    <AppShell>
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-8">
          <ArrowLeft size={14} strokeWidth={1.5} /> Back
        </button>

        <div className="animate-fade-in mb-8">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[var(--radius-md)] bg-brand-subtle flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profile.profile_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profile_image} alt="" width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <span className="text-brand font-display text-2xl font-medium">{profile.display_name[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-poem text-xl font-medium text-text-primary">{profile.display_name}</h1>
                {isOwnProfile && (
                  <Link href="/profile/setup" className="text-xs text-text-tertiary hover:text-text-primary transition-colors">
                    <Settings size={14} strokeWidth={1.5} />
                  </Link>
                )}
              </div>
              <p className="text-sm text-text-tertiary">@{profile.username}</p>
            </div>
            {!isOwnProfile && user && (
              <button
                onClick={handleFollow}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                  isFollowing
                    ? "border border-border-default text-text-secondary hover:border-error hover:text-error"
                    : "gradient-brand text-white hover:opacity-90"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-text-secondary italic mb-4 max-w-md">&ldquo;{profile.bio}&rdquo;</p>
          )}

          <div className="flex gap-6 text-sm">
            <div><span className="font-medium text-text-primary">{poems.length}</span> <span className="text-text-tertiary">Poems</span></div>
            <div><span className="font-medium text-text-primary">{followerCount}</span> <span className="text-text-tertiary">Followers</span></div>
            <div><span className="font-medium text-text-primary">{followingCount}</span> <span className="text-text-tertiary">Following</span></div>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-surface-secondary rounded-[var(--radius-full)] p-1">
          {(["poems", "about"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 capitalize ${activeTab === tab ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>{tab}</button>
          ))}
        </div>

        {activeTab === "poems" ? (
          poems.length > 0 ? poems.map((poem) => <PoemCard key={poem.id} poem={poem} />) : <p className="text-sm text-text-tertiary py-12 text-center">No poems yet.</p>
        ) : (
          <div className="py-4">
            {profile.bio && <p className="font-poem text-lg text-text-primary italic mb-4">&ldquo;{profile.bio}&rdquo;</p>}
            {profile.location && <p className="text-sm text-text-secondary mb-1">{profile.location}</p>}
            {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:text-brand-hover mb-1 block">{profile.website}</a>}
            <p className="text-sm text-text-tertiary mt-4">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
        )}
      </main>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
