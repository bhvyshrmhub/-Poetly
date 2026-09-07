"use client";

interface MoodTagProps {
  name: string;
  slug: string;
  color: string;
  icon: string;
  size?: "sm" | "md";
}

export default function MoodTag({ name, color, icon, size = "md" }: MoodTagProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border transition-colors hover:bg-accent-muted cursor-pointer ${
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      }`}
      style={{
        borderColor: `${color}30`,
        color: color,
      }}
    >
      <span>{icon}</span>
      <span className="font-medium">{name}</span>
    </div>
  );
}
