import { test, describe } from "node:test";
import assert from "node:assert";

function validateUsername(username: string): { valid: boolean; error?: string } {
  const normalized = username.toLowerCase().trim();
  if (!normalized) {
    return { valid: false, error: "Username is required." };
  }
  if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
    return {
      valid: false,
      error: "Username must be 3-20 characters: lowercase letters, numbers, and underscores only.",
    };
  }
  return { valid: true };
}

function generateCandidateUsername(
  metaUsername: string | null | undefined,
  email: string | null | undefined,
  userId: string,
  existingUsernames: Set<string>
): string {
  let base = (metaUsername || (email ? email.split("@")[0] : "") || "writer").toLowerCase();
  base = base.replace(/[^a-z0-9_]/g, "");
  if (base.length < 3) {
    base = `writer_${userId.substring(0, 6).replace(/[^a-z0-9_]/g, "")}`;
  }
  base = base.slice(0, 15);

  let candidate = base;
  let counter = 0;
  while (existingUsernames.has(candidate)) {
    counter++;
    candidate = `${base.slice(0, 14)}_${counter}`;
  }
  return candidate;
}

describe("Profile Validation & Candidate Generation", () => {
  test("valid usernames pass validation", () => {
    assert.strictEqual(validateUsername("emily_dickinson").valid, true);
    assert.strictEqual(validateUsername("poet123").valid, true);
    assert.strictEqual(validateUsername("rumi").valid, true);
  });

  test("invalid characters are rejected", () => {
    assert.strictEqual(validateUsername("poet@ly").valid, false);
    assert.strictEqual(validateUsername("keats.john").valid, false);
    assert.strictEqual(validateUsername("hello world").valid, false);
    assert.strictEqual(validateUsername("poet!").valid, false);
  });

  test("usernames shorter than 3 characters are rejected", () => {
    assert.strictEqual(validateUsername("ab").valid, false);
    assert.strictEqual(validateUsername("").valid, false);
  });

  test("usernames longer than 20 characters are rejected", () => {
    assert.strictEqual(validateUsername("this_username_is_way_too_long_for_poetly").valid, false);
  });

  test("sanitizes email to valid candidate username", () => {
    const existing = new Set<string>();
    const username = generateCandidateUsername(null, "sylvia.plath@example.com", "uuid-1234", existing);
    assert.strictEqual(username, "sylviaplath");
  });

  test("resolves collision when candidate username is already taken", () => {
    const existing = new Set<string>(["maya_angelou"]);
    const username = generateCandidateUsername("maya_angelou", "maya@example.com", "uuid-5678", existing);
    assert.strictEqual(username, "maya_angelou_1");
  });

  test("resolves multiple collisions sequentially", () => {
    const existing = new Set<string>(["poet", "poet_1", "poet_2"]);
    const username = generateCandidateUsername("poet", null, "uuid-9999", existing);
    assert.strictEqual(username, "poet_3");
  });
});
