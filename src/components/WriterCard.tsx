"use client";

import Link from "next/link";
import { Writer } from "@/lib/types";

interface WriterCardProps {
  writer: Writer;
  showBio?: boolean;
}

export default function WriterCard({ writer, showBio = true }: WriterCardProps) {
  const initials = writer.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Link href={`/profile?id=${writer.id}`} className="group block">
      <div className="flex items-center gap-3.5 py-3">
        <div className="w-11 h-11 rounded-[var(--radius-md)] bg-brand-subtle flex items-center justify-center flex-shrink-0 group-hover:bg-brand/15 transition-colors">
          <span className="text-brand font-display text-sm font-medium">
            {initials}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-text-primary group-hover:text-brand transition-colors truncate">
              {writer.name}
            </p>
            <span className="text-xs text-text-tertiary">{writer.handle}</span>
          </div>
          {showBio && (
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
              {writer.bio}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
