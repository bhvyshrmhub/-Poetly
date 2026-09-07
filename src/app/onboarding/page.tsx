"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError("Username must be 3-20 characters, lowercase letters, numbers, and underscores only.");
      return;
    }

    setLoading(true);

    // Check if username is taken
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      setError("That username is already taken.");
      setLoading(false);
      return;
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username,
        display_name: displayName || username,
        bio: bio || null,
      })
      .eq("id", user.id);

    if (updateError) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    await refreshProfile();
    router.push("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg font-semibold">P</span>
          </div>
          <h1 className="font-poem text-2xl text-text-primary mb-1">Create your identity</h1>
          <p className="text-sm text-text-secondary">Set up your Poetly profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="px-3 py-2 bg-error-subtle text-error text-xs rounded-[var(--radius-sm)]">
              {error}
            </div>
          )}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="Username"
            required
            className="w-full px-3.5 py-2.5 bg-surface border border-border-subtle rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand transition-colors"
          />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            required
            className="w-full px-3.5 py-2.5 bg-surface border border-border-subtle rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand transition-colors"
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio (optional)"
            rows={3}
            className="w-full px-3.5 py-2.5 bg-surface border border-border-subtle rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand transition-colors resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 gradient-brand text-white text-sm font-medium rounded-[var(--radius-md)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Setting up..." : "Continue to Poetly"}
          </button>
        </form>
      </div>
    </div>
  );
}
