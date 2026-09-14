"use client";

import { useState } from "react";

const tabs = [
  { id: "for-you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "new-voices", label: "New Voices" },
  { id: "trending", label: "Trending" },
];

export default function FeedTabs() {
  const [activeTab, setActiveTab] = useState("for-you");

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="feed-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`feed-tab ${activeTab === tab.id ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <select className="text-xs text-text-secondary bg-transparent border-none focus:outline-none cursor-pointer">
          <option value="recent">Recent</option>
          <option value="popular">Popular</option>
          <option value="discussed">Discussed</option>
        </select>
      </div>
    </div>
  );
}
