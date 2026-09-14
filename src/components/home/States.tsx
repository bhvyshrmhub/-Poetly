"use client";

import Link from "next/link";
import { Compass, PenLine, RefreshCw } from "lucide-react";

export function EmptyFeedState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <PenLine size={28} />
      </div>
      <h3 className="empty-state-title">Your Poetly is quiet.</h3>
      <p className="empty-state-text">
        Discover new voices or write something of your own.
      </p>
      <div className="empty-state-actions">
        <Link
          href="/explore"
          className="btn-secondary"
        >
          <Compass size={16} />
          <span>Explore</span>
        </Link>
        <Link
          href="/write"
          className="btn-primary"
        >
          <PenLine size={16} />
          <span>Write</span>
        </Link>
      </div>
    </div>
  );
}

export function ErrorFeedState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="error-state">
      <div className="empty-state-icon" style={{ background: "var(--error-subtle)" }}>
        <RefreshCw size={28} style={{ color: "var(--error)" }} />
      </div>
      <h3 className="error-state-title">Something went quiet.</h3>
      <p className="error-state-text">
        We couldn&apos;t load your Poetly feed.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary"
        >
          <RefreshCw size={16} />
          <span>Try again</span>
        </button>
      )}
    </div>
  );
}

export function EmptyActivityState() {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-text-tertiary">
        No recent activity.
      </p>
    </div>
  );
}

export function EmptyWritersState() {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-text-tertiary">
        No suggestions yet.
      </p>
      <Link
        href="/writers"
        className="text-sm text-brand hover:text-brand-hover transition-colors mt-2 inline-block"
      >
        Discover writers
      </Link>
    </div>
  );
}
