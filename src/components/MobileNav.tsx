"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PenLine, BookOpen, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/write", label: "Create", icon: PenLine },
    { href: "/library", label: "Library", icon: BookOpen },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isCreate = item.href === "/write";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px] ${
                isCreate
                  ? "text-accent"
                  : isActive
                  ? "text-foreground"
                  : "text-text-tertiary"
              }`}
              aria-label={item.label}
            >
              <Icon size={isCreate ? 22 : 20} strokeWidth={isActive ? 1.8 : 1.5} />
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
