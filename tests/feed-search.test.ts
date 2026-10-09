import { test, describe } from "node:test";
import assert from "node:assert";

function sanitizeSearchTag(rawTag: string): string {
  return rawTag.replace(/^#/, "").trim().toLowerCase().replace(/[^a-zA-Z0-9_\-]/g, "");
}

interface LikeEvent {
  poem_id: string;
  created_at: string;
}

function calculateTrendingPoemIds(likes: LikeEvent[], now: Date = new Date()): string[] {
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLikes = likes.filter((l) => new Date(l.created_at) >= sevenDaysAgo);
  const counts: Record<string, number> = {};
  for (const l of recentLikes) {
    counts[l.poem_id] = (counts[l.poem_id] || 0) + 1;
  }

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id);
}

function shouldSendNotification(actorId: string, recipientId: string): boolean {
  // Prevent users from receiving self-notifications when they interact with their own work
  return Boolean(actorId && recipientId && actorId !== recipientId);
}

describe("Feeds, Search & Discovery Logic", () => {
  test("sanitizes special characters from tag search input", () => {
    assert.strictEqual(sanitizeSearchTag("#Midnight"), "midnight");
    assert.strictEqual(sanitizeSearchTag("  #love!  "), "love");
    assert.strictEqual(sanitizeSearchTag("tags.cs.{injected}"), "tagscsinjected");
    assert.strictEqual(sanitizeSearchTag("poem-tag_123"), "poem-tag_123");
  });

  test("calculates trending poems ranked by recent 7-day likes", () => {
    const now = new Date("2026-10-09T12:00:00Z");
    const twoDaysAgo = new Date("2026-10-07T12:00:00Z").toISOString();
    const tenDaysAgo = new Date("2026-09-29T12:00:00Z").toISOString();

    const likes: LikeEvent[] = [
      { poem_id: "poem-A", created_at: twoDaysAgo },
      { poem_id: "poem-A", created_at: twoDaysAgo },
      { poem_id: "poem-B", created_at: twoDaysAgo },
      { poem_id: "poem-B", created_at: twoDaysAgo },
      { poem_id: "poem-B", created_at: twoDaysAgo },
      { poem_id: "poem-C", created_at: tenDaysAgo }, // Outside window
      { poem_id: "poem-C", created_at: tenDaysAgo },
      { poem_id: "poem-C", created_at: tenDaysAgo },
    ];

    const trending = calculateTrendingPoemIds(likes, now);
    assert.deepStrictEqual(trending, ["poem-B", "poem-A"]);
    assert.strictEqual(trending.includes("poem-C"), false);
  });

  test("notification triggers only for other actors, not self", () => {
    assert.strictEqual(shouldSendNotification("user-1", "user-1"), false);
    assert.strictEqual(shouldSendNotification("user-1", "user-2"), true);
  });
});
