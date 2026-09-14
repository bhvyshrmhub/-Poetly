"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Moon, Sun, Menu, Bell } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";

interface TopBarProps {
  onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/home") return "Home";
    if (pathname === "/explore") return "Explore";
    if (pathname === "/write") return "Write";
    if (pathname === "/collections") return "Collections";
    if (pathname === "/notifications") return "Notifications";
    if (pathname === "/search") return "Search";
    if (pathname === "/library") return "Saved";
    if (pathname === "/trending") return "Trending";
    if (pathname === "/writers") return "Writers";
    if (pathname.startsWith("/profile")) return "Profile";
    if (pathname.startsWith("/poem")) return "Poem";
    if (pathname.startsWith("/prompts")) return "Prompts";
    return "Poetly";
  };

  return (
    <header className="app-topbar">
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title (mobile) */}
      <h1 className="app-topbar-title md:hidden">{getPageTitle()}</h1>

      {/* Search bar */}
      <div className="app-topbar-search hidden md:block">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            placeholder="Search poems, writers, tags..."
            className="w-full h-10 pl-10 pr-4 rounded-[var(--radius-full)] bg-surface border border-border-subtle text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="app-topbar-actions">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all"
          aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        >
          {resolvedTheme === "dark" ? (
            <Sun size={18} strokeWidth={1.5} />
          ) : (
            <Moon size={18} strokeWidth={1.5} />
          )}
        </button>

        {/* Notifications (mobile only) */}
        {user && (
          <Link
            href="/notifications"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={1.5} />
          </Link>
        )}

        {/* Profile */}
        {user ? (
          <Link
            href={`/profile/${profile?.username || ""}`}
            className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-sm)] bg-brand-subtle overflow-hidden hover:ring-2 hover:ring-brand/20 transition-all"
          >
            {profile?.profile_image ? (
              <img
                src={profile.profile_image}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-brand text-sm font-display font-medium">
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
    </header>
  );
}
