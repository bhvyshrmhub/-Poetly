"use client";

import { useState } from "react";
import Link from "next/link";

const suggestedWriters = [
  {
    id: 1,
    name: "Elena Rivers",
    username: "elenarivers",
    initial: "E",
    bio: "Writing about the quiet moments between heartbeats.",
    isFollowed: false,
  },
  {
    id: 2,
    name: "Marcus Chen",
    username: "marcuschen",
    initial: "M",
    bio: "Finding beauty in everyday words.",
    isFollowed: false,
  },
  {
    id: 3,
    name: "Sophia Williams",
    username: "sophiawilliams",
    initial: "S",
    bio: "Poetry is the language of the soul.",
    isFollowed: false,
  },
];

export default function SuggestedWriters() {
  const [writers, setWriters] = useState(suggestedWriters);

  const toggleFollow = (id: number) => {
    setWriters((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isFollowed: !w.isFollowed } : w
      )
    );
  };

  return (
    <div className="sidebar-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="sidebar-section-title mb-0">Suggested for you</h3>
        <Link
          href="/writers"
          className="text-xs text-brand hover:text-brand-hover transition-colors"
        >
          See all
        </Link>
      </div>
      <div className="space-y-3">
        {writers.map((writer) => (
          <div key={writer.id} className="writer-card">
            <Link
              href={`/profile/${writer.username}`}
              className="profile-avatar"
            >
              <span className="profile-avatar-initial">{writer.initial}</span>
            </Link>
            <div className="writer-info">
              <Link
                href={`/profile/${writer.username}`}
                className="writer-name hover:text-brand transition-colors block"
              >
                {writer.name}
              </Link>
              <p className="writer-username">@{writer.username}</p>
            </div>
            <button
              onClick={() => toggleFollow(writer.id)}
              className={`follow-btn ${writer.isFollowed ? "following" : ""}`}
            >
              {writer.isFollowed ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
