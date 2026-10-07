"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import Avatar from "@/components/ui/Avatar";

export default function ProfileMiniCard() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-[var(--radius-lg)] bg-surface border border-border-subtle hover:border-brand/30 transition-all">
      <Link
        href={`/profile/${profile.username}`}
        className="shrink-0 focus-visible:outline-none"
      >
        <Avatar
          src={profile.profile_image}
          name={profile.display_name}
          size="md"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/profile/${profile.username}`}
          className="font-medium text-text-primary text-sm hover:text-brand transition-colors truncate block"
        >
          {profile.display_name}
        </Link>
        <p className="text-xs text-text-tertiary truncate">
          @{profile.username}
        </p>
        {profile.bio && (
          <p className="text-xs text-text-secondary mt-1 line-clamp-1 italic font-serif">
            {profile.bio}
          </p>
        )}
      </div>
      <Link
        href={`/profile/${profile.username}`}
        className="text-xs text-brand hover:text-brand-hover font-medium transition-colors shrink-0"
      >
        View
      </Link>
    </div>
  );
}
