"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { Notification } from "@/lib/types";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function NotificationsPage() {
  const { user, isGuest } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    setNotifications((data as Notification[]) || []);

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("recipient_id", user.id)
      .eq("read", false);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const typeIcons: Record<string, string> = {
    like: "\u2661",
    comment: "\uD83D\uDCAC",
    follow: "\u2192",
    response: "\u21A9",
    mention: "@",
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">Notifications</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 skeleton rounded-[var(--radius-md)]" />)}
          </div>
        ) : isGuest ? (
          <div className="text-center py-16">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">No notifications yet.</p>
            <p className="text-sm text-text-tertiary">Sign in to see your notifications.</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-1">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-center gap-3.5 py-3.5 border-b border-border-subtle last:border-0">
                <div className="w-9 h-9 rounded-full bg-brand-subtle flex items-center justify-center flex-shrink-0">
                  <span className="text-brand text-sm">{typeIcons[n.type] || "\u2022"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    {n.type === "like" && "Someone liked your poem"}
                    {n.type === "comment" && "Someone commented on your poem"}
                    {n.type === "follow" && "Someone followed you"}
                    {n.type === "response" && "Someone responded with a poem"}
                    {n.type === "mention" && "Someone mentioned you"}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">You&apos;re all caught up.</p>
            <p className="text-sm text-text-tertiary">No notifications yet.</p>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
