"use client";

import Link from "next/link";

const trendingTags = [
  { tag: "love", count: 1240 },
  { tag: "night", count: 890 },
  { tag: "healing", count: 756 },
  { tag: "nature", count: 623 },
  { tag: "life", count: 589 },
  { tag: "melancholy", count: 445 },
  { tag: "hope", count: 398 },
  { tag: "friendship", count: 312 },
];

export default function TrendingTags() {
  return (
    <div className="sidebar-section">
      <h3 className="sidebar-section-title">Trending Tags</h3>
      <div className="trending-tags">
        {trendingTags.map((item) => (
          <Link
            key={item.tag}
            href={`/search?tag=${item.tag}`}
            className="tag-pill hover:bg-surface-hover transition-colors"
          >
            #{item.tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
