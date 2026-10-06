"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { NotificationWithActor } from "@/lib/types";

interface RecentPoemActivity {
  id: string;
  type: "new_poem";
  created_at: string;
  title: string;
  profiles: {
    username: string;
    display_name: string;
    profile_image: string | null;
  };
}

function getTimeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityPanel() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [recentPoems, setRecentPoems] = useState<RecentPoemActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    try {
      if (user) {
        const { data: userNotifications } = await supabase
          .from("notifications")
          .select("*, profiles!actor_id(*)")
          .eq("recipient_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4);

        if (userNotifications && userNotifications.length > 0) {
          setNotifications(userNotifications as NotificationWithActor[]);
          setLoading(false);
          return;
        }
      }

      // If no notifications or user not logged in, fetch recently published poems
      const { data: poemsData } = await supabase
        .from("poems")
        .select("id, title, created_at, profiles!inner(username, display_name, profile_image)")
        .eq("status", "published")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(4);

      if (poemsData) {
        setRecentPoems(
          poemsData.map((p) => ({
            id: p.id,
            type: "new_poem" as const,
            created_at: p.created_at,
            title: p.title,
            profiles: p.profiles as unknown as RecentPoemActivity["profiles"],
          }))
        );
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const getActionText = (n: NotificationWithActor) => {
    switch (n.type) {
      case "like": return "liked your poem";
      case "comment": return "commented on your poem";
      case "follow": return "started following you";
      case "response": return "responded with a poem";
      case "mention": return "mentioned you";
      default: return "interacted with you";
    }
  };

  return (
    <div className="sidebar-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="sidebar-section-title mb-0">Community Activity</h3>
        {user && notifications.length > 0 && (
          <Link
            href="/notifications"
            className="text-xs text-brand hover:text-brand-hover transition-colors"
          >
            See all
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full skeleton" />
              <div className="flex-1 space-y-1">
                <div className="w-24 h-3 skeleton rounded" />
                <div className="w-16 h-2 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="activity-item">
              <div className="activity-avatar overflow-hidden">
                {n.profiles?.profile_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.profiles.profile_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{n.profiles?.display_name?.[0] || "?"}</span>
                )}
              </div>
              <div className="activity-content min-w-0">
                <p className="activity-text">
                  <Link href={`/profile/${n.profiles?.username}`} className="font-medium hover:text-brand">
                    {n.profiles?.display_name || "Someone"}
                  </Link>{" "}
                  {getActionText(n)}
                </p>
                <p className="activity-time">{getTimeAgo(n.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : recentPoems.length > 0 ? (
        <div className="space-y-2">
          {recentPoems.map((p) => (
            <div key={p.id} className="activity-item">
              <div className="activity-avatar overflow-hidden">
                {p.profiles?.profile_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.profiles.profile_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{p.profiles?.display_name?.[0] || "P"}</span>
                )}
              </div>
              <div className="activity-content min-w-0">
                <p className="activity-text">
                  <Link href={`/profile/${p.profiles?.username}`} className="font-medium hover:text-brand">
                    {p.profiles?.display_name}
                  </Link>{" "}
                  published &ldquo;
                  <Link href={`/poem/${p.id}`} className="hover:text-brand font-poem italic">
                    {p.title}
                  </Link>
                  &rdquo;
                </p>
                <p className="activity-time">{getTimeAgo(p.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-tertiary py-3">Quiet in the community today.</p>
      )}
    </div>
  );
}
