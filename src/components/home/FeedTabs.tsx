"use client";

export type FeedTabType = "for-you" | "following" | "new-voices" | "trending";

const tabs: { id: FeedTabType; label: string }[] = [
  { id: "for-you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "new-voices", label: "New Voices" },
  { id: "trending", label: "Trending" },
];

interface FeedTabsProps {
  activeTab?: FeedTabType;
  onTabChange?: (tab: FeedTabType) => void;
}

export default function FeedTabs({ activeTab = "for-you", onTabChange }: FeedTabsProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="feed-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`feed-tab ${activeTab === tab.id ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
