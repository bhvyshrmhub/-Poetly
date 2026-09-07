"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";

interface SaveButtonProps {
  initialSaved?: boolean;
  size?: "sm" | "md";
  onToggle?: (saved: boolean) => void;
}

export default function SaveButton({
  initialSaved = false,
  size = "md",
  onToggle,
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);

  const handleToggle = () => {
    const newSaved = !saved;
    setSaved(newSaved);
    onToggle?.(newSaved);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 transition-colors ${
        size === "sm" ? "text-xs" : "text-sm"
      } ${saved ? "text-accent" : "text-text-tertiary hover:text-text-secondary"}`}
      aria-label={saved ? "Unsave" : "Save"}
    >
      <Bookmark
        size={size === "sm" ? 14 : 16}
        strokeWidth={1.5}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}
