"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { NotificationWithActor } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import Avatar from "@/components/ui/Avatar";

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("notifications")
        .select("*, profiles!notifications_actor_id_fkey(*)")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setNotifications((data as NotificationWithActor[]) || []);

      // Mark all as read
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("recipient_id", user.id)
        .eq("read", false);
    } catch {
      // Silent fail
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchNotifications();
    }
  }, [authLoading, fetchNotifications]);

  const getNotificationText = (n: NotificationWithActor) => {
    const actorName = n.profiles?.display_name || "Someone";
    switch (n.type) {
      case "like":
        return `${actorName} liked your poem`;
      case "comment":
        return `${actorName} commented on your poem`;
      case "follow":
        return `${actorName} started following you`;
      case "response":
        return `${actorName} responded with a poem`;
      case "mention":
        return `${actorName} mentioned you`;
      default:
        return "New activity on your poetry";
    }
  };

  const getNotificationLink = (n: NotificationWithActor) => {
    if (n.type === "follow") {
      return `/profile/${n.profiles?.username || ""}`;
    }
    if (n.reference_id) {
      return `/poem/${n.reference_id}`;
    }
    return "/home";
  };

  return (
    <AppShell maxWidth="feed">
      {/* Consistent Page Header */}
      <PageHeader
        title="Notifications"
        subtitle="What's happening around your writing."
      />

      {authLoading || loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 py-4 border-b border-border-subtle"
            >
              <div className="w-10 h-10 skeleton rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="w-48 h-4 skeleton rounded" />
                <div className="w-24 h-3 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : !user ? (
        <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-subtle">
          <p className="font-poem text-xl text-text-tertiary italic mb-2">
            Sign in to see notifications.
          </p>
          <p className="text-sm text-text-secondary mb-4">
            Follow other poets and get alerted when they interact with your poems.
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2 text-xs sm:text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-full transition-colors shadow-xs"
          >
            Sign In
          </Link>
        </div>
      ) : notifications.length > 0 ? (
        <div className="divide-y divide-border-subtle">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={getNotificationLink(n)}
              className={`flex items-center gap-3.5 py-4 px-2.5 -mx-2.5 rounded-[var(--radius-md)] transition-colors hover:bg-surface-hover ${
                !n.read ? "bg-brand-muted/70" : ""
              }`}
            >
              <Avatar
                src={n.profiles?.profile_image}
                name={n.profiles?.display_name}
                size="md"
              />

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-text-primary font-medium">
                  {getNotificationText(n)}
                </p>
                <p className="text-[11px] text-text-tertiary mt-0.5">
                  {new Date(n.created_at).toLocaleDateString()}
                </p>
              </div>

              {!n.read && (
                <span
                  className="w-2 h-2 rounded-full bg-brand shrink-0"
                  aria-label="Unread notification"
                />
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-subtle">
          <p className="font-poem text-xl text-text-tertiary italic mb-2">
            No notifications yet.
          </p>
          <p className="text-sm text-text-secondary">
            When someone likes, comments, or follows your work, you&apos;ll see it here.
          </p>
        </div>
      )}
    </AppShell>
  );
}
