"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  action,
  backHref,
  backLabel = "Back",
  onBack,
  className = "",
}: PageHeaderProps) {
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
          <h1 className="font-poem font-semibold text-2xl sm:text-3xl text-text-primary tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div className="shrink-0 self-start sm:self-auto flex items-center gap-2">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
