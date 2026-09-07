"use client";

import { writers } from "@/lib/mock-data";
import { Heart, UserPlus, MessageCircle, BookMarked } from "lucide-react";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

const notifications = [
  { id: "1", type: "like", user: writers[1], poem: "The Ocean", time: "2h ago", icon: Heart, color: "text-brand" },
  { id: "2", type: "follow", user: writers[2], time: "5h ago", icon: UserPlus, color: "text-brand" },
  { id: "3", type: "comment", user: writers[3], poem: "Midnight Thoughts", time: "1d ago", icon: MessageCircle, color: "text-brand-secondary" },
  { id: "4", type: "like", user: writers[4], poem: "Small Things", time: "1d ago", icon: Heart, color: "text-brand" },
  { id: "5", type: "save", user: writers[5], poem: "The Ocean", time: "2d ago", icon: BookMarked, color: "text-brand" },
  { id: "6", type: "follow", user: writers[0], time: "3d ago", icon: UserPlus, color: "text-brand" },
];

export default function NotificationsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-[var(--content-width)] mx-auto px-5 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-poem text-2xl md:text-3xl text-text-primary mb-1">
            Notifications
          </h1>
        </div>

        <div className="space-y-1">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="flex items-center gap-3.5 py-3.5 border-b border-border-subtle last:border-0">
                <div className={`w-9 h-9 rounded-full bg-brand-subtle flex items-center justify-center flex-shrink-0`}>
                  <Icon size={15} strokeWidth={1.5} className={n.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{n.user.name}</span>
                    {n.type === "like" && ` liked your poem "${n.poem}"`}
                    {n.type === "follow" && " started following you"}
                    {n.type === "comment" && ` commented on "${n.poem}"`}
                    {n.type === "save" && ` saved your poem "${n.poem}"`}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
