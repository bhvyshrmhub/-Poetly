"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  action?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  description,
  action,
  actions,
  badge,
  backHref,
  backLabel = "Back",
  onBack,
  className = "",
}: PageHeaderProps) {
  const displaySubtitle = subtitle || description;
  const displayAction = action || actions;

  return (
    <header className={`mb-6 md:mb-8 animate-fade-in ${className}`}>
      {/* Optional back navigation link */}
      {(backHref || onBack) && (
        <div className="mb-3">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors focus-visible:outline-none"
            >
              <ArrowLeft size={14} strokeWidth={1.75} />
              <span>{backLabel}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors focus-visible:outline-none"
            >
              <ArrowLeft size={14} strokeWidth={1.75} />
              <span>{backLabel}</span>
            </button>
          )}
        </div>
      )}

      {/* Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-poem font-semibold text-2xl sm:text-3xl text-text-primary tracking-tight">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {displaySubtitle && (
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {displaySubtitle}
            </p>
          )}
        </div>

        {displayAction && (
          <div className="shrink-0 self-start sm:self-auto flex items-center gap-2">
            {displayAction}
          </div>
        )}
      </div>
    </header>
  );
}
