import { test, describe } from "node:test";
import assert from "node:assert";

interface PoemRecord {
  id: string;
  author_id: string;
  title: string;
  content: string;
  status: "draft" | "published" | "archived" | "hidden" | "removed";
  visibility: "public" | "private" | "unlisted";
  prompt_id: string | null;
  created_at: string;
  published_at: string | null;
}

function validatePoemPayload(payload: { title?: string; content?: string }): { valid: boolean; error?: string } {
  if (!payload.content || !payload.content.trim()) {
    return { valid: false, error: "Poem content is required." };
  }
  return { valid: true };
}

function calculatePoemStats(content: string): { words: number; characters: number } {
  const trimmed = content.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  return { words, characters: content.length };
}

function canUserViewPoem(poem: PoemRecord, currentUserId: string | null): boolean {
  if (poem.status === "published" && poem.visibility === "public") {
    return true;
  }
  // Drafts and private poems visible only to author
  return Boolean(currentUserId && poem.author_id === currentUserId);
}

function canUserModifyPoem(poem: PoemRecord, currentUserId: string | null): boolean {
  return Boolean(currentUserId && poem.author_id === currentUserId);
}

describe("Poem Business Invariants & Permissions", () => {
  const authorId = "author-uuid-1";
  const otherUserId = "reader-uuid-2";

  const publicPoem: PoemRecord = {
    id: "poem-1",
    author_id: authorId,
    title: "Ode to the Stars",
    content: "The stars align across the deep night sky.",
    status: "published",
    visibility: "public",
    prompt_id: null,
    created_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  };

  const draftPoem: PoemRecord = {
    id: "poem-2",
    author_id: authorId,
    title: "Unfinished Thoughts",
    content: "Words forming in the dusk...",
    status: "draft",
    visibility: "public",
    prompt_id: null,
    created_at: new Date().toISOString(),
    published_at: null,
  };

  test("rejects poem without content", () => {
    assert.strictEqual(validatePoemPayload({ title: "Empty", content: "   " }).valid, false);
    assert.strictEqual(validatePoemPayload({ title: "No body", content: "" }).valid, false);
  });

  test("accepts poem with valid content", () => {
    assert.strictEqual(validatePoemPayload({ title: "My Poem", content: "Lines of prose." }).valid, true);
  });

  test("calculates word and character counts accurately", () => {
    const stats = calculatePoemStats("Two roads diverged in a yellow wood");
    assert.strictEqual(stats.words, 7);
    assert.strictEqual(stats.characters, 35);
  });

  test("public published poem is viewable by anyone", () => {
    assert.strictEqual(canUserViewPoem(publicPoem, null), true); // Unauthenticated
    assert.strictEqual(canUserViewPoem(publicPoem, otherUserId), true); // Another user
  });

  test("draft poem is hidden from other users and unauthenticated visitors", () => {
    assert.strictEqual(canUserViewPoem(draftPoem, null), false);
    assert.strictEqual(canUserViewPoem(draftPoem, otherUserId), false);
  });

  test("draft poem is visible to its author", () => {
    assert.strictEqual(canUserViewPoem(draftPoem, authorId), true);
  });

  test("only author can modify or delete owned poem", () => {
    assert.strictEqual(canUserModifyPoem(publicPoem, authorId), true);
    assert.strictEqual(canUserModifyPoem(publicPoem, otherUserId), false);
    assert.strictEqual(canUserModifyPoem(publicPoem, null), false);
  });
});
