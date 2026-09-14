"use client";

import Link from "next/link";
import { useState } from "react";
import { Image, PenLine, List, HelpCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function MobileComposer() {
  const { user, profile } = useAuth();
  const [expanded, setExpanded] = useState(false);

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

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="profile-avatar">
          {profile?.profile_image ? (
            <img
              src={profile.profile_image}
              alt={profile.display_name}
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
          Share a thought, a poem, or a moment...
        </button>
      </div>

      {expanded && (
        <div className="mt-3 p-4 bg-surface border border-border-subtle rounded-[var(--radius-lg)]">
          <textarea
            placeholder="What's on your mind?"
            className="w-full min-h-[100px] bg-transparent border-none outline-none text-sm text-text-primary resize-none"
            autoFocus
          />
          <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-3">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-all" aria-label="Add image">
                <Image size={18} />
              </button>
              <button className="p-2 rounded-[var(--radius-sm)] text-brand hover:bg-brand-subtle transition-all" aria-label="Write poem">
                <PenLine size={18} />
              </button>
              <button className="p-2 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-all" aria-label="Create poll">
                <List size={18} />
              </button>
              <button className="p-2 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-all" aria-label="Use prompt">
                <HelpCircle size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpanded(false)}
                className="px-3 py-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button className="btn-primary !min-h-[36px] !px-4 !text-sm">
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
