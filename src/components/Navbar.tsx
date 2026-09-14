"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Library, Search, Bell, User, PenLine, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import Logo from "@/components/Logo";

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  const leftLinks = [
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/collections", label: "Collections", icon: Library },
    { href: "/search", label: "Search", icon: Search },
  ];

  const rightLinks = user
    ? [
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: `/profile/${profile?.username || ""}`, label: "Profile", icon: User },
      ]
    : [];

  return (
    <nav className="hidden md:flex items-center justify-between px-6 h-[var(--nav-height)] border-b border-border-subtle bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="mr-8">
        <Logo size="sm" />
      </div>

      <div className="flex items-center gap-1">
        {leftLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] text-sm transition-all duration-150 ${
                isActive
                  ? "bg-brand-subtle text-brand font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              }`}
            >
              <Icon size={17} strokeWidth={isActive ? 2 : 1.5} />
              <span className="hidden lg:inline">{link.label}</span>
            </Link>
          );
        })}
      </div>

      <Link
        href={user ? "/write" : "/login"}
        className="flex items-center gap-2 px-5 py-2 text-white text-sm font-medium rounded-[var(--radius-full)] hover:opacity-90 transition-opacity"
        style={{ background: "var(--brand-primary)", minHeight: 44 }}
      >
        <PenLine size={15} strokeWidth={2} />
        <span className="hidden lg:inline">Write</span>
      </Link>

      <div className="flex items-center gap-1">
        {rightLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] text-sm transition-all duration-150 ${
                isActive
                  ? "bg-brand-subtle text-brand font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              }`}
            >
              <Icon size={17} strokeWidth={isActive ? 2 : 1.5} />
              <span className="hidden lg:inline">{link.label}</span>
            </Link>
          );
        })}

        {user ? (
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150"
          >
            <LogOut size={17} strokeWidth={1.5} />
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150"
          >
            <User size={17} strokeWidth={1.5} />
            <span className="hidden lg:inline">Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
