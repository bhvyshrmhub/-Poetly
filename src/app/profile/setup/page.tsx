"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else if (profile) {
        router.replace("/home");
      } else {
        setChecking(false);
        if (user.user_metadata?.full_name) {
          setDisplayName(user.user_metadata.full_name);
        }
      }
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus("checking");
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .single();
      setUsernameStatus(data ? "taken" : "available");
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !username.trim() || !displayName.trim()) return;

    setLoading(true);
    setError("");

    const normalizedUsername = username.toLowerCase().trim();

    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      setError("Username must be 3-20 characters, lowercase letters, numbers, and underscores only.");
      setLoading(false);
      return;
    }

    if (usernameStatus === "taken") {
      setError("That username is already taken.");
      setLoading(false);
      return;
    }

    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        username: normalizedUsername,
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        website: website.trim() || null,
        location: location.trim() || null,
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      if (upsertError.message.includes("unique")) {
        setError("That username is already taken.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
      return;
    }

    await refreshProfile();
    router.replace("/home");
  };

  if (checking || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 skeleton rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-5 py-12 animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="font-poem-title text-2xl md:text-3xl text-text-primary mb-2">
            Welcome to Poetly
          </h1>
          <p className="text-sm text-text-secondary">
            Choose your identity as a writer.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error-subtle border border-error/20 rounded-[var(--radius-md)]">
            <p className="text-xs text-error">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-medium text-text-tertiary tracking-widest uppercase mb-1.5 block">
              Username *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="yourname"
                className="w-full bg-surface border border-border-subtle rounded-[var(--radius-md)] pl-7 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-brand transition-colors"
                required
                minLength={3}
                maxLength={20}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === "checking" && (
                  <div className="w-4 h-4 border-2 border-text-tertiary border-t-transparent rounded-full animate-spin" />
                )}
                {usernameStatus === "available" && (
                  <span className="text-success text-xs">✓</span>
                )}
                {usernameStatus === "taken" && (
                  <span className="text-error text-xs">✗</span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-text-tertiary mt-1">Lowercase letters, numbers, and underscores. 3-20 characters.</p>
          </div>

          <div>
            <label className="text-[10px] font-medium text-text-tertiary tracking-widest uppercase mb-1.5 block">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-surface border border-border-subtle rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-brand transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-text-tertiary tracking-widest uppercase mb-1.5 block">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about your writing..."
              className="w-full bg-surface border border-border-subtle rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-brand transition-colors resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-[11px] text-text-tertiary mt-1">{bio.length}/200</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-medium text-text-tertiary tracking-widest uppercase mb-1.5 block">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface border border-border-subtle rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-brand transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-text-tertiary tracking-widest uppercase mb-1.5 block">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full bg-surface border border-border-subtle rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim() || !displayName.trim() || usernameStatus !== "available"}
            className="w-full py-3 gradient-brand text-white text-sm font-medium rounded-[var(--radius-full)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating your profile..." : "Start Writing"}
          </button>
        </form>
      </main>
    </div>
  );
}
