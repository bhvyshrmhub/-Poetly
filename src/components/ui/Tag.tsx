"use client";

export default function Tag({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span className="tag-pill" data-active={active}>
      {label}
    </span>
  );
}
