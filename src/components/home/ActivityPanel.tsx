"use client";

import Link from "next/link";

const activities = [
  {
    id: 1,
    user: { name: "Elena Rivers", username: "elenarivers", initial: "E" },
    action: "liked your poem",
    target: "The Quiet Between",
    time: "2h ago",
  },
  {
    id: 2,
    user: { name: "Marcus Chen", username: "marcuschen", initial: "M" },
    action: "started following you",
    target: null,
    time: "4h ago",
  },
  {
    id: 3,
    user: { name: "Sophia Williams", username: "sophiawilliams", initial: "S" },
    action: "commented on",
    target: "Midnight Thoughts",
    time: "6h ago",
  },
  {
    id: 4,
    user: { name: "James Anderson", username: "jamesanderson", initial: "J" },
    action: "saved your poem",
    target: "Morning Light",
    time: "1d ago",
  },
];

export default function ActivityPanel() {
  return (
    <div className="sidebar-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="sidebar-section-title mb-0">Activity</h3>
        <Link
          href="/notifications"
          className="text-xs text-brand hover:text-brand-hover transition-colors"
        >
          See all
        </Link>
      </div>
      <div className="space-y-1">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-avatar">{activity.user.initial}</div>
            <div className="activity-content">
              <p className="activity-text">
                <strong>{activity.user.name}</strong>{" "}
                {activity.action}
                {activity.target && (
                  <>
                    {" "}
                    <span className="text-text-primary">&ldquo;{activity.target}&rdquo;</span>
                  </>
                )}
              </p>
              <p className="activity-time">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
