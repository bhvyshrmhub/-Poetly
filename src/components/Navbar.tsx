"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Search, Bell, BookMarked, User, PenLine } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const leftLinks = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/trending", label: "Trending", icon: TrendingUp },
    { href: "/search", label: "Search", icon: Search },
  ];

  const rightLinks = [
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/library", label: "Library", icon: BookMarked },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="hidden md:flex items-center justify-between px-6 h-[var(--nav-height)] border-b border-border-subtle bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <Link href={user ? "/home" : "/"} className="flex items-center gap-2.5 mr-8">
        <div className="w-7 h-7 rounded-[var(--radius-sm)] gradient-brand flex items-center justify-center">
          <span className="text-white text-xs font-semibold">P</span>
        </div>
        <span className="font-display text-lg text-text-primary tracking-tight hidden lg:block">
          Poetly
        </span>
      </Link>

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
        href="/write"
        className="flex items-center gap-2 px-4 py-1.5 gradient-brand text-white text-sm font-medium rounded-[var(--radius-full)] hover:opacity-90 transition-opacity shadow-sm"
      >
        <PenLine size={15} strokeWidth={2} />
        <span className="hidden lg:inline">Create</span>
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
      </div>
    </nav>
  );
}
