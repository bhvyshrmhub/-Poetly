"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { NotificationWithActor } from "@/lib/types";
import AppShell from "@/components/shell/AppShell";
import Link from "next/link";

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

  if (authLoading || loading) {
    return (
      <AppShell>
        <div className="max-w-[var(--content-width)] mx-auto px-5 py-8">
          <div className="w-48 h-6 skeleton rounded mb-6" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-4 border-b border-border-subtle">
              <div className="w-9 h-9 skeleton rounded-[var(--radius-sm)]" />
              <div className="flex-1 space-y-2">
                <div className="w-48 h-4 skeleton rounded" />
                <div className="w-24 h-3 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <main className="max-w-[var(--content-width)] mx-auto px-5 py-16 text-center pb-24 md:pb-16">
          <p className="font-poem text-xl text-text-tertiary italic mb-2">Sign in to see notifications.</p>
          <Link href="/login" className="text-sm text-brand hover:text-brand-hover">Sign in →</Link>
        </main>
      </AppShell>
    );
  }

  const getNotificationText = (n: NotificationWithActor) => {
    const actorName = n.profiles?.display_name || "Someone";
    switch (n.type) {
      case "like": return `${actorName} liked your poem`;
      case "comment": return `${actorName} commented on your poem`;
      case "follow": return `${actorName} started following you`;
      case "response": return `${actorName} responded with a poem`;
      case "mention": return `${actorName} mentioned you`;
      default: return "New activity";
    }
  };

  return (
    <AppShell>
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-6 animate-fade-in">Notifications</h1>

        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div key={n.id} className={`flex items-center gap-3 py-4 border-b border-border-subtle ${!n.read ? "bg-brand-muted -mx-5 px-5" : ""}`}>
              <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center flex-shrink-0">
                {n.profiles?.profile_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.profiles.profile_image} alt="" className="w-full h-full object-cover rounded-[var(--radius-sm)]" />
                ) : (
                  <span className="text-brand text-xs font-medium">{n.profiles?.display_name?.[0] || "?"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">{getNotificationText(n)}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">No notifications yet.</p>
            <p className="text-sm text-text-tertiary">When someone interacts with your poems, you&apos;ll see it here.</p>
          </div>
        )}
      </main>
    </AppShell>
  );
}
