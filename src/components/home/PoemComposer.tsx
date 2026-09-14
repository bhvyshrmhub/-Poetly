"use client";

import Link from "next/link";
import { useState } from "react";
import { Image, PenLine, List, HelpCircle, Globe } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function PoemComposer() {
  const { user, profile } = useAuth();
  const [focused, setFocused] = useState(false);

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

  return (
    <div className={`composer ${focused ? "ring-1 ring-brand/20" : ""}`}>
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
      <div className="flex-1">
        <textarea
          placeholder="Share a thought, a poem, or a moment..."
          className="composer-input"
          rows={focused ? 3 : 1}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            if (!e.target.value) setFocused(false);
          }}
        />
        {focused && (
          <div className="composer-actions">
            <div className="flex items-center gap-1">
              <button className="composer-action" aria-label="Add image">
                <Image size={16} />
              </button>
              <button className="composer-action poem-action" aria-label="Write poem">
                <PenLine size={16} />
                <span>Poem</span>
              </button>
              <button className="composer-action" aria-label="Create poll">
                <List size={16} />
              </button>
              <button className="composer-action" aria-label="Use prompt">
                <HelpCircle size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors">
                <Globe size={14} />
                <span>Public</span>
              </button>
              <button className="btn-primary !min-h-[36px] !px-4 !text-sm">
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
