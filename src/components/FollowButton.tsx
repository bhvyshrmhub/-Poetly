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
      className={`font-medium rounded-full transition-all duration-150 ${
        size === "sm" ? "px-3.5 py-1 text-xs" : "px-5 py-1.5 text-sm"
      } ${
        followed
          ? "bg-text-primary text-background hover:bg-text-primary/90"
          : "bg-brand text-white hover:bg-brand-hover"
      }`}
    >
      {followed ? "Following" : "Follow"}
    </button>
  );
}
