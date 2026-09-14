"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PenLine, Library, Bell, Bookmark } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function MainNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/write", label: "Write", icon: PenLine, isCreate: true },
    { href: "/collections", label: "Collections", icon: Library },
    ...(user ? [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/library", label: "Saved", icon: Bookmark },
    ] : []),
  ];

  return (
    <nav className="sidebar-section">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

        if (link.isCreate) {
          return (
            <Link
              key={link.href}
              href={user ? link.href : "/login"}
              className="nav-item mb-2"
              style={{
                background: "var(--brand-primary)",
                color: "var(--text-on-accent)",
              }}
            >
              <Icon size={20} strokeWidth={2} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
