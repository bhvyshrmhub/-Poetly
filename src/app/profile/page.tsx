"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { Profile, PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Link from "next/link";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile: myProfile, signOut } = useAuth();
  const username = params.username as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"poems" | "about">("poems");
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (p: Profile) => {
    setProfile(p);

    const { data: poemData } = await supabase
      .from("poems")
      .select("*, profiles!inner(*)")
      .eq("author_id", p.id)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    setPoems((poemData as PoemWithAuthor[]) || []);

    const { count: fc } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", p.id);
    setFollowerCount(fc || 0);

    const { count: fgc } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", p.id);
    setFollowingCount(fgc || 0);

    if (user && user.id !== p.id) {
      const { data: f } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", p.id).single();
      setIsFollowing(!!f);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!username && user && myProfile) {
      loadProfile(myProfile);
    } else if (username) {
      supabase.from("profiles").select("*").eq("username", username).single().then(({ data }) => {
        if (data) loadProfile(data as Profile);
        else setLoading(false);
      });
    } else if (!user) {
      setLoading(false);
    }
  }, [username, user, myProfile, loadProfile]);

  const handleFollow = async () => {
    if (!user) return router.push("/login");
    if (!profile) return;

    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.id);
      setIsFollowing(false);
      setFollowerCount(followerCount - 1);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.id });
      setIsFollowing(true);
      setFollowerCount(followerCount + 1);
    }
  };

  if (loading) {
    return <div className="min-h-screen"><Navbar /><div className="max-w-[var(--content-width)] mx-auto px-5 py-8"><div className="w-20 h-20 skeleton rounded-[var(--radius-md)] mb-5" /></div></div>;
  }

  if (!profile) {
    return <div className="min-h-screen"><Navbar /><div className="max-w-[var(--content-width)] mx-auto px-5 py-16 text-center"><p className="font-poem text-xl text-text-tertiary italic">Profile not found.</p></div></div>;
  }

  const isOwner = user?.id === profile.id;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-poem text-xl font-medium text-text-primary">{profile.display_name}</h1>
                  <p className="text-sm text-text-tertiary">@{profile.username}</p>
                </div>
                {isOwner ? (
                  <div className="flex gap-2">
                    <Link href="/settings" className="text-xs px-3 py-1.5 rounded-full border border-border-subtle text-text-secondary hover:text-text-primary transition-colors">Edit</Link>
                    <button onClick={signOut} className="text-xs px-3 py-1.5 rounded-full border border-border-subtle text-text-secondary hover:text-text-primary transition-colors">Log out</button>
                  </div>
                ) : (
                  <button onClick={handleFollow} className={`px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-150 ${isFollowing ? "bg-text-primary text-background hover:bg-text-primary/90" : "bg-brand text-white hover:bg-brand-hover"}`}>
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {profile.bio && <p className="text-sm text-text-secondary italic mb-4 max-w-md">&ldquo;{profile.bio}&rdquo;</p>}

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
            {profile.website && <p className="text-sm text-text-secondary mb-1">{profile.website}</p>}
            <p className="text-sm text-text-tertiary mt-4">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
