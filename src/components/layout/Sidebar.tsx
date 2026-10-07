"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Library,
  Bookmark,
  Bell,
  PenLine,
  User,
  Search,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import NavigationItem from "@/components/navigation/NavigationItem";

export interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export default function Sidebar({ onNavigate, className = "" }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  const isHomeActive = pathname === "/home" || pathname === "/";
  const isExploreActive = pathname.startsWith("/explore") || pathname.startsWith("/trending") || pathname.startsWith("/writers");
  const isCollectionsActive = pathname.startsWith("/collections");
  const isSavedActive = pathname.startsWith("/saved") || pathname.startsWith("/library");
  const isNotificationsActive = pathname.startsWith("/notifications");
  const isWriteActive = pathname.startsWith("/write");
  const profileHref = user && profile?.username ? `/profile/${profile.username}` : user ? "/profile" : "/login";
  const isProfileActive = pathname.startsWith("/profile");

  return (
    <nav
      aria-label="Main Navigation"
      className={`flex flex-col h-full space-y-1.5 py-2 ${className}`}
    >
      {/* Primary Navigation List */}
      <div className="space-y-1">
        <NavigationItem
          href="/home"
          label="Home"
          icon={Home}
          isActive={isHomeActive}
          onClick={onNavigate}
        />
        <NavigationItem
          href="/explore"
          label="Explore"
          icon={Compass}
          isActive={isExploreActive}
          onClick={onNavigate}
        />
        <NavigationItem
          href="/collections"
          label="Collections"
          icon={Library}
          isActive={isCollectionsActive}
          onClick={onNavigate}
        />
        <NavigationItem
          href="/saved"
          label="Saved"
          icon={Bookmark}
          isActive={isSavedActive}
          onClick={onNavigate}
        />
        <NavigationItem
          href={user ? "/notifications" : "/login"}
          label="Notifications"
          icon={Bell}
          isActive={isNotificationsActive}
          onClick={onNavigate}
        />
        <NavigationItem
          href="/search"
          label="Search"
          icon={Search}
          isActive={pathname.startsWith("/search")}
          onClick={onNavigate}
        />
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-border-subtle" role="separator" />

      {/* Prominent Write Action */}
      <div className="px-1 py-1">
        <NavigationItem
          href={user ? "/write" : "/login"}
          label="Write a Poem"
          icon={PenLine}
          isActive={isWriteActive}
          isAccent={true}
          onClick={onNavigate}
        />
      </div>

      {/* Profile Navigation */}
      <div className="pt-1">
        <NavigationItem
          href={profileHref}
          label={user ? (profile?.display_name || "Profile") : "Sign In"}
          icon={User}
          isActive={isProfileActive}
          onClick={onNavigate}
        />
      </div>

      {/* Prompts shortcut pill */}
      <div className="pt-4 mt-auto">
        <Link
          href="/prompts"
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-3 py-2 text-xs text-text-tertiary hover:text-brand hover:bg-brand-subtle rounded-[var(--radius-md)] border border-dashed border-border-subtle transition-all"
        >
          <Sparkles size={14} className="text-brand shrink-0" />
          <span className="truncate">Daily writing prompts</span>
        </Link>
      </div>
    </nav>
  );
}
