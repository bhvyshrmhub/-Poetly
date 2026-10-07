"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Moon,
  Sun,
  Bell,
  PenLine,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import Logo from "@/components/Logo";
import Avatar from "@/components/ui/Avatar";

export interface GlobalHeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export default function GlobalHeader({
  onMenuToggle,
  isMenuOpen = false,
}: GlobalHeaderProps) {
  const router = useRouter();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 w-full h-[var(--nav-height,60px)] bg-background/90 backdrop-blur-md border-b border-border-subtle transition-colors duration-200"
    >
      <div className="w-full max-w-[1360px] mx-auto h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile Menu Toggle & Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-surface-hover active:scale-95 transition-all"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Logo size="sm" withWordmark={true} />
        </div>

        {/* Center: Desktop Global Search */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative w-full" role="search">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search poems, writers, tags..."
              aria-label="Search poems, writers, and tags"
              className="w-full h-9.5 pl-10 pr-4 rounded-[var(--radius-full)] bg-surface border border-border-subtle text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
            />
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-surface-hover active:scale-95 transition-all"
            aria-label="Toggle mobile search"
          >
            <Search size={18} strokeWidth={1.8} />
          </button>

          {/* Primary Action: Write */}
          <Link
            href={user ? "/write" : "/login"}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2 rounded-[var(--radius-full)] bg-brand text-white hover:bg-brand-hover active:scale-[0.98] transition-all duration-150 text-xs sm:text-sm font-medium shadow-sm shadow-brand/20 select-none min-h-[36px]"
            aria-label="Write a poem"
          >
            <PenLine size={15} strokeWidth={2.2} />
            <span className="hidden xs:inline">Write</span>
          </Link>

          {/* Notifications */}
          {user && (
            <Link
              href="/notifications"
              className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-surface-hover active:scale-95 transition-all"
              aria-label="View notifications"
            >
              <Bell size={18} strokeWidth={1.8} />
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-surface-hover active:scale-95 transition-all"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? (
              <Sun size={18} strokeWidth={1.8} />
            ) : (
              <Moon size={18} strokeWidth={1.8} />
            )}
          </button>

          {/* Profile / Account Dropdown */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:ring-2 hover:ring-brand/30 transition-all cursor-pointer"
                aria-label="User account menu"
                aria-expanded={profileDropdownOpen}
              >
                <Avatar
                  src={profile?.profile_image}
                  name={profile?.display_name}
                  size="sm"
                />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-0 mt-2 w-52 bg-surface border border-border-subtle rounded-[var(--radius-md)] shadow-xl z-40 py-1.5 animate-scale-in text-sm"
                    role="menu"
                  >
                    <div className="px-3.5 py-2 border-b border-border-subtle">
                      <p className="font-medium text-text-primary truncate">
                        {profile?.display_name || "Writer"}
                      </p>
                      <p className="text-xs text-text-tertiary truncate">
                        @{profile?.username || "writer"}
                      </p>
                    </div>

                    <Link
                      href={profile?.username ? `/profile/${profile.username}` : "/profile"}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                      role="menuitem"
                    >
                      <UserIcon size={16} />
                      <span>Your Profile</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                        role="menuitem"
                      >
                        <ShieldAlert size={16} />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        setProfileDropdownOpen(false);
                        await signOut();
                        router.push("/home");
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-error hover:bg-surface-hover transition-colors text-left"
                      role="menuitem"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-brand hover:text-brand-hover hover:bg-brand-subtle px-3 py-1.5 rounded-[var(--radius-sm)] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden px-3 py-2 bg-surface border-b border-border-subtle animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search poems, writers, tags..."
              autoFocus
              className="w-full h-9 pl-9 pr-8 rounded-[var(--radius-full)] bg-background border border-border-subtle text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>
      )}
    </header>
  );
}
