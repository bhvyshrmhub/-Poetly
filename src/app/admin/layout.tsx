"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Flag,
  Star,
  MessageSquare,
  Activity,
  Settings,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/poems", label: "Poems", icon: FileText },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/featured", label: "Featured", icon: Star },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      console.log(`[ADMIN LAYOUT] authLoading=false, user=${user?.id || "null"}, isAdmin=${isAdmin}`);
    }
  }, [authLoading, user, isAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background-subtle flex items-center justify-center">
        <div className="text-sm text-text-tertiary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background-subtle flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-text-secondary mb-3">You must be signed in to access the admin panel.</p>
          <Link href="/login" className="text-sm text-brand hover:text-brand-hover transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-error-subtle flex items-center justify-center mx-auto mb-4">
            <span className="text-error text-lg font-medium">!</span>
          </div>
          <h1 className="text-lg font-medium text-text-primary mb-1">Access Denied</h1>
          <p className="text-sm text-text-secondary mb-4">You do not have admin privileges.</p>
          <Link href="/home" className="text-sm text-brand hover:text-brand-hover transition-colors">
            Return to Poetly
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-subtle">
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-56 h-screen sticky top-0 bg-surface border-r border-border-subtle shrink-0">
          <div className="px-4 py-5 border-b border-border-subtle">
            <Link href="/" className="flex items-center gap-2 text-xs text-text-tertiary hover:text-text-primary transition-colors">
              <ChevronLeft size={14} strokeWidth={1.5} /> Back to Poetly
            </Link>
            <h1 className="font-display text-base font-semibold text-text-primary mt-2">Admin</h1>
          </div>
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-[var(--radius-sm)] transition-colors ${
                    isActive
                      ? "bg-brand-subtle text-brand font-medium"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  }`}
                >
                  <item.icon size={16} strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-3 border-t border-border-subtle">
            <p className="text-[10px] text-text-tertiary">Poetly Admin v1.0</p>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border-subtle">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="text-text-secondary hover:text-text-primary transition-colors">
                <Menu size={20} strokeWidth={1.5} />
              </button>
              <h1 className="font-display text-sm font-semibold text-text-primary">Admin</h1>
            </div>
            <Link href="/" className="text-xs text-text-tertiary hover:text-text-primary transition-colors">
              Back to Poetly
            </Link>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-64 bg-surface border-r border-border-subtle shadow-xl animate-slide-in">
              <div className="flex items-center justify-between px-4 py-4 border-b border-border-subtle">
                <h2 className="font-display text-sm font-semibold text-text-primary">Admin Menu</h2>
                <button onClick={() => setMobileOpen(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
              <nav className="px-2 py-3 space-y-0.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-[var(--radius-sm)] transition-colors ${
                        isActive
                          ? "bg-brand-subtle text-brand font-medium"
                          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      }`}
                    >
                      <item.icon size={16} strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 lg:max-h-screen lg:overflow-y-auto">
          <div className="px-5 md:px-8 py-6 md:py-8 lg:pt-6 pt-16">{children}</div>
        </main>
      </div>
    </div>
  );
}
