"use client";

import { CommentWithAuthor } from "@/lib/types";

interface CommentSectionProps {
  comments: CommentWithAuthor[];
}

export default function CommentSection({ comments }: CommentSectionProps) {
  return (
    <div className="mt-12 pt-8 border-t border-border-subtle">
      <h3 className="font-poem text-lg font-medium text-text-primary mb-6">Leave a note</h3>

      <div className="space-y-5">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-brand text-[10px] font-display font-medium">{comment.profiles.display_name[0]}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-text-primary">@{comment.profiles.username}</span>
                <span className="text-xs text-text-tertiary">{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
