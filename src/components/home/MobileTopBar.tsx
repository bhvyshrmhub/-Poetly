"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import Logo from "@/components/Logo";

export default function MobileTopBar() {
  const { user, profile } = useAuth();

  return (
    <nav className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border-subtle">
      <div className="flex items-center justify-between px-4 h-[var(--nav-height)]">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="p-2 rounded-[var(--radius-md)] text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all"
            aria-label="Search"
          >
            <Search size={20} strokeWidth={1.5} />
          </Link>
          {user && (
            <Link
              href="/notifications"
              className="p-2 rounded-[var(--radius-md)] text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all"
              aria-label="Notifications"
            >
              <Bell size={20} strokeWidth={1.5} />
            </Link>
          )}
          {user ? (
            <Link
              href={`/profile/${profile?.username || ""}`}
              className="w-8 h-8 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center overflow-hidden"
            >
              {profile?.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-brand text-xs font-display font-medium">
                  {profile?.display_name?.[0] || "P"}
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
