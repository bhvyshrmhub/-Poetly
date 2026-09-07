"use client";

import { useState } from "react";

interface FollowButtonProps {
  initialFollowed?: boolean;
  size?: "sm" | "md";
}

export default function FollowButton({
  initialFollowed = false,
  size = "md",
}: FollowButtonProps) {
  const [followed, setFollowed] = useState(initialFollowed);

  return (
    <button
      onClick={() => setFollowed(!followed)}
      className={`font-medium rounded-full border transition-all ${
        size === "sm" ? "px-3 py-1 text-xs" : "px-5 py-1.5 text-sm"
      } ${
        followed
          ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
          : "bg-transparent text-foreground border-border hover:border-foreground"
      }`}
    >
      {followed ? "Following" : "Follow"}
    </button>
  );
}
