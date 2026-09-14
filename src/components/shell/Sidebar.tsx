"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  PenLine,
  Library,
  Bell,
  Bookmark,
  Search,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import Logo from "@/components/Logo";

const trendingTags = [
  "love", "night", "healing", "nature", "life", "melancholy", "hope", "friendship",
];

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  const navItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: user ? "/write" : "/login", label: "Write", icon: PenLine, isCreate: true },
    { href: "/collections", label: "Collections", icon: Library },
    ...(user ? [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/library", label: "Saved", icon: Bookmark },
    ] : []),
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <Logo size="sm" />
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          if (item.isCreate) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="sidebar-nav-item write-btn"
                onClick={onNavigate}
              >
                <Icon size={20} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              onClick={onNavigate}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Search - visible on all screen sizes in sidebar */}
        <Link
          href="/search"
          className={`sidebar-nav-item ${pathname === "/search" ? "active" : ""}`}
          onClick={onNavigate}
        >
          <Search size={20} strokeWidth={1.5} />
          <span>Search</span>
        </Link>
      </nav>

      {/* Trending Tags */}
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Trending</h3>
        <div className="sidebar-tags">
          {trendingTags.map((tag) => (
            <Link
              key={tag}
              href={`/search?tag=${tag}`}
              className="sidebar-tag"
              onClick={onNavigate}
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* User Card */}
      {user && profile && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {profile.profile_image ? (
              <img
                src={profile.profile_image}
                alt={profile.display_name}
              />
            ) : (
              <span className="sidebar-user-initial">
                {profile.display_name?.[0] || "P"}
              </span>
            )}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{profile.display_name}</p>
            <p className="sidebar-user-username">@{profile.username}</p>
          </div>
          <Link
            href={`/profile/${profile.username}`}
            className="sidebar-user-link"
            onClick={onNavigate}
          >
            View
          </Link>
        </div>
      )}
    </aside>
  );
}
