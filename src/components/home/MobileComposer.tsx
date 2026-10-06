"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PenLine, HelpCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export default function MobileComposer() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-3 px-4 py-3 bg-surface border border-border-subtle rounded-[var(--radius-lg)] mb-4"
      >
        <div className="profile-avatar">
          <span className="profile-avatar-initial">?</span>
        </div>
        <span className="text-sm text-text-tertiary">
          Share a thought, a poem, or a moment...
        </span>
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
      setExpanded(false);
      if (data) {
        router.push(`/poem/${data.id}`);
      }
    } catch {
      setError("Failed to post poem.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="px-4 mb-4">
      {!expanded ? (
        <div className="flex items-center gap-3">
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
          <button
            onClick={() => setExpanded(true)}
            className="flex-1 text-left px-4 py-3 bg-surface border border-border-subtle rounded-[var(--radius-lg)] text-sm text-text-tertiary"
          >
            Write a line, a poem, a thought...
          </button>
        </div>
      ) : (
        <div className="p-4 bg-surface border border-border-subtle rounded-[var(--radius-lg)]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your poem..."
            className="w-full min-h-[100px] bg-transparent border-none outline-none text-sm text-text-primary resize-none font-poem"
            autoFocus
          />
          {error && <p className="text-xs text-error mt-1">{error}</p>}
          <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-3">
            <div className="flex items-center gap-2">
              <Link
                href="/write"
                className="p-2 rounded-[var(--radius-sm)] text-brand hover:bg-brand-subtle transition-all"
                aria-label="Write full poem"
              >
                <PenLine size={18} />
              </Link>
              <Link
                href="/prompts"
                className="p-2 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-all"
                aria-label="Use prompt"
              >
                <HelpCircle size={18} />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setContent("");
                  setExpanded(false);
                }}
                className="px-3 py-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
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
        </div>
      )}
    </div>
  );
}
