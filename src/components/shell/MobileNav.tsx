"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PenLine, Library, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function MobileNav() {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  const items = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: user ? "/write" : "/login", label: "Write", icon: PenLine, isCreate: true },
    { href: "/collections", label: "Shelves", icon: Library },
    { href: user ? `/profile/${profile?.username || ""}` : "/login", label: "Profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border-subtle">
      <div
        className="flex items-center justify-around px-1 py-1.5"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          if (item.isCreate) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center w-12 h-12 -mt-3 rounded-full text-white"
                style={{ background: "var(--brand-primary)" }}
                aria-label={item.label}
              >
                <Icon size={20} strokeWidth={2} />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-[var(--radius-sm)] transition-colors min-w-[48px] ${
                isActive ? "text-brand" : "text-text-tertiary"
              }`}
              aria-label={item.label}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
