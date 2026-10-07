"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

export interface NavigationItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  isAccent?: boolean;
  badge?: number | string;
  onClick?: () => void;
  className?: string;
}

export default function NavigationItem({
  href,
  label,
  icon: Icon,
  isActive = false,
  isAccent = false,
  badge,
  onClick,
  className = "",
}: NavigationItemProps) {
  if (isAccent) {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        className={`group relative flex items-center gap-3.5 px-4 py-3 rounded-[var(--radius-full)] font-medium text-sm transition-all duration-200 select-none ${
          isActive
            ? "bg-brand text-white shadow-md shadow-brand/25"
            : "bg-brand text-white hover:bg-brand-hover active:scale-[0.98] shadow-sm shadow-brand/20"
        } ${className}`}
      >
        <Icon
          size={19}
          strokeWidth={2.2}
          className="transition-transform duration-200 group-hover:rotate-6 shrink-0"
        />
        <span className="truncate tracking-wide">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-[var(--radius-md)] text-sm transition-all duration-150 select-none ${
        isActive
          ? "bg-brand-subtle text-brand font-medium"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover active:scale-[0.99]"
      } ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <Icon
          size={19}
          strokeWidth={isActive ? 2.2 : 1.7}
          className={`shrink-0 transition-colors duration-150 ${
            isActive ? "text-brand" : "text-text-secondary group-hover:text-text-primary"
          }`}
        />
        <span className="truncate">{label}</span>
      </div>

      {badge !== undefined && (
        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-semibold rounded-full bg-brand/15 text-brand">
          {badge}
        </span>
      )}

      {/* Subtle indicator bar for active desktop state */}
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-brand"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
