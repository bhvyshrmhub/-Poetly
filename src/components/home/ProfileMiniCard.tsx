"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function ProfileMiniCard() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="profile-card-mini">
      <div className="profile-avatar">
        {profile.profile_image ? (
          <img
            src={profile.profile_image}
            alt={profile.display_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="profile-avatar-initial">
            {profile.display_name?.[0] || "P"}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary text-sm truncate">
          {profile.display_name}
        </p>
        <p className="text-xs text-text-tertiary truncate">
          @{profile.username}
        </p>
        {profile.bio && (
          <p className="text-xs text-text-secondary mt-1 line-clamp-2">
            {profile.bio}
          </p>
        )}
      </div>
      <Link
        href={`/profile/${profile.username}`}
        className="text-xs text-brand hover:text-brand-hover transition-colors"
      >
        View
      </Link>
    </div>
  );
}
