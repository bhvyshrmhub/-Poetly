"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  initialCount: number;
  initialLiked?: boolean;
  size?: "sm" | "md";
  onToggle?: (liked: boolean) => void;
}

export default function LikeButton({
  initialCount,
  initialLiked = false,
  size = "md",
  onToggle,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const handleToggle = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setCount(newLiked ? count + 1 : count - 1);
    onToggle?.(newLiked);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 transition-colors ${
        size === "sm" ? "text-xs" : "text-sm"
      } ${liked ? "text-accent" : "text-text-tertiary hover:text-text-secondary"}`}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <Heart
        size={size === "sm" ? 14 : 16}
        strokeWidth={1.5}
        fill={liked ? "currentColor" : "none"}
      />
      <span>{count}</span>
    </button>
  );
}
