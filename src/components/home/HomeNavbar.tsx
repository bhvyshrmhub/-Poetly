"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PenLine, Library, Search, Bell, Moon, Sun, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import Logo from "@/components/Logo";

export default function HomeNavbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const navLinks = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/write", label: "Write", icon: PenLine, isCreate: true },
    { href: "/collections", label: "Collections", icon: Library },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="max-w-[1500px] mx-auto px-6 h-[var(--nav-height)] flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <Logo size="sm" />
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search poems, writers, tags..."
              className="w-full h-10 pl-10 pr-4 rounded-[var(--radius-full)] bg-surface border border-border-subtle text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>
        </div>

        {/* Right: Nav links + Actions */}
        <div className="flex items-center gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

            if (link.isCreate) {
              return (
                <Link
                  key={link.href}
                  href={user ? link.href : "/login"}
                  className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-[var(--radius-full)] hover:opacity-90 transition-opacity"
                  style={{ background: "var(--brand-primary)" }}
                >
                  <Icon size={15} strokeWidth={2} />
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-brand-subtle text-brand font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span className="hidden lg:inline">{link.label}</span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-6 bg-border-subtle mx-2" />

          {/* Notifications */}
          {user && (
            <Link
              href="/notifications"
              className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-sm transition-all duration-150 ${
                pathname === "/notifications"
                  ? "bg-brand-subtle text-brand font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              }`}
            >
              <Bell size={18} strokeWidth={1.5} />
            </Link>
          )}

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          </button>

          {/* Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${profile?.username || ""}`}
                className="w-9 h-9 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-brand/20 transition-all"
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
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150"
                aria-label="Sign out"
              >
                <LogOut size={18} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand hover:bg-brand-subtle rounded-[var(--radius-md)] transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
