"use client";

import Link from "next/link";
import { Profile } from "@/lib/types";

interface WriterCardProps {
  writer: Profile;
  showBio?: boolean;
}

export default function WriterCard({ writer, showBio = true }: WriterCardProps) {
  return (
    <Link href={`/profile/${writer.username}`} className="group block">
      <div className="flex items-center gap-3.5 py-3">
        <div className="w-11 h-11 rounded-[var(--radius-md)] bg-brand-subtle flex items-center justify-center flex-shrink-0 group-hover:bg-brand/15 transition-colors overflow-hidden">
          {writer.profile_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={writer.profile_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-brand font-display text-sm font-medium">{writer.display_name[0]}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-text-primary group-hover:text-brand transition-colors truncate">{writer.display_name}</p>
            <span className="text-xs text-text-tertiary">@{writer.username}</span>
          </div>
          {showBio && writer.bio && (
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{writer.bio}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
