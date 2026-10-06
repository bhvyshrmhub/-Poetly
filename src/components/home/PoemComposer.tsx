"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PenLine, HelpCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export default function PoemComposer() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [content, setContent] = useState("");
  const [focused, setFocused] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <Link
        href="/login"
        className="composer group"
      >
        <div className="profile-avatar">
          <span className="profile-avatar-initial">?</span>
        </div>
        <div className="flex-1 text-text-tertiary group-hover:text-text-secondary transition-colors">
          Share a thought, a poem, or a moment...
        </div>
      </Link>
    );
  }

  const handlePost = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    setError(null);

    try {
      const lines = content.trim().split("\n").filter(Boolean);
      const title = lines[0]?.length <= 40 ? lines[0] : "Untitled";

      const { data, error: insertError } = await supabase
        .from("poems")
        .insert({
          author_id: user.id,
          title,
          content: content.trim(),
          status: "published",
          visibility: "public",
          published_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      setContent("");
      setFocused(false);
      if (data) {
        router.push(`/poem/${data.id}`);
      }
    } catch {
      setError("Failed to post poem. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className={`composer ${focused ? "ring-1 ring-brand/30" : ""}`}>
      <div className="profile-avatar overflow-hidden">
        {profile?.profile_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.profile_image}
            alt={profile.display_name || "Profile"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="profile-avatar-initial">
            {profile?.display_name?.[0] || "P"}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share a stanza, a poem, or a fleeting thought..."
          className="composer-input font-poem"
          rows={focused ? 3 : 1}
          onFocus={() => setFocused(true)}
        />

        {error && <p className="text-xs text-error mt-1">{error}</p>}

        {focused && (
          <div className="composer-actions">
            <div className="flex items-center gap-1.5">
              <Link
                href="/write"
                className="composer-action poem-action"
                aria-label="Open full poetry editor"
              >
                <PenLine size={15} />
                <span>Full Editor</span>
              </Link>
              <Link
                href="/prompts"
                className="composer-action"
                aria-label="Find a prompt"
              >
                <HelpCircle size={15} />
                <span>Prompts</span>
              </Link>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => {
                  setContent("");
                  setFocused(false);
                }}
                className="text-xs text-text-tertiary hover:text-text-primary px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePost}
                disabled={posting || !content.trim()}
                className="btn-primary !min-h-[34px] !px-4 !text-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {posting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <span>Publish</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
