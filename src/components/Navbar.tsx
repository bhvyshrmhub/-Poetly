"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/write", label: "Write" },
    { href: "/library", label: "Library" },
  ];

  return (
    <nav className="hidden md:flex items-center justify-between px-8 py-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
          Poetry Platform
        </span>
      </Link>

      <div className="flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm tracking-wide transition-colors hover:text-foreground ${
              pathname === link.href
                ? "text-foreground font-medium"
                : "text-text-secondary"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/search"
          className="text-text-secondary hover:text-foreground transition-colors"
          aria-label="Search"
        >
          <Search size={18} strokeWidth={1.5} />
        </Link>
        <Link
          href="/profile"
          className="text-text-secondary hover:text-foreground transition-colors"
          aria-label="Profile"
        >
          <User size={18} strokeWidth={1.5} />
        </Link>
      </div>
    </nav>
  );
}
