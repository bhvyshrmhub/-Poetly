import { test, describe } from "node:test";
import assert from "node:assert";

describe("Social Features & Permissions", () => {
  describe("Likes System", () => {
    test("prevents duplicate likes using composite key", () => {
      const likes = new Set<string>();
      const addLike = (userId: string, poemId: string): boolean => {
        const key = `${userId}:${poemId}`;
        if (likes.has(key)) return false;
        likes.add(key);
        return true;
      };

      assert.strictEqual(addLike("user-1", "poem-A"), true);
      assert.strictEqual(addLike("user-1", "poem-A"), false); // Duplicate prevented
      assert.strictEqual(addLike("user-2", "poem-A"), true); // Different user succeeds
    });

    test("unlike accurately decrements and removes like", () => {
      const likes = new Map<string, Set<string>>(); // poemId -> Set of userIds
      const toggleLike = (userId: string, poemId: string): { isLiked: boolean; count: number } => {
        if (!likes.has(poemId)) likes.set(poemId, new Set());
        const userSet = likes.get(poemId)!;
        if (userSet.has(userId)) {
          userSet.delete(userId);
          return { isLiked: false, count: userSet.size };
        } else {
          userSet.add(userId);
          return { isLiked: true, count: userSet.size };
        }
      };

      const res1 = toggleLike("user-1", "poem-1");
      assert.strictEqual(res1.isLiked, true);
      assert.strictEqual(res1.count, 1);

      const res2 = toggleLike("user-1", "poem-1");
      assert.strictEqual(res2.isLiked, false);
      assert.strictEqual(res2.count, 0);
    });
  });

  describe("Follow Relationships", () => {
    test("prevents self-following", () => {
      const canFollow = (followerId: string, followingId: string): boolean => {
        return Boolean(followerId && followingId && followerId !== followingId);
      };

      assert.strictEqual(canFollow("user-1", "user-1"), false);
      assert.strictEqual(canFollow("user-1", "user-2"), true);
    });
  });

  describe("Comment Moderation Rules", () => {
    const poemAuthorId = "author-1";
    const commentAuthorId = "commenter-2";
    const bystanderId = "stranger-3";

    const canDeleteComment = (
      userId: string,
      comment: { author_id: string; poem_author_id: string }
    ): boolean => {
      // Allowed if user is the comment's author OR the poem's author (moderation)
      return userId === comment.author_id || userId === comment.poem_author_id;
    };

    const comment = { author_id: commentAuthorId, poem_author_id: poemAuthorId };

    test("comment author can delete their comment", () => {
      assert.strictEqual(canDeleteComment(commentAuthorId, comment), true);
    });

    test("poem author can delete any comment on their poem", () => {
      assert.strictEqual(canDeleteComment(poemAuthorId, comment), true);
    });

    test("unrelated bystander cannot delete comment", () => {
      assert.strictEqual(canDeleteComment(bystanderId, comment), false);
    });
  });

  describe("Collections Management", () => {
    test("only collection owner can add/remove poems", () => {
      const collection = { id: "col-1", user_id: "user-owner" };
      const canManage = (userId: string): boolean => userId === collection.user_id;

      assert.strictEqual(canManage("user-owner"), true);
      assert.strictEqual(canManage("other-user"), false);
    });
  });
});
