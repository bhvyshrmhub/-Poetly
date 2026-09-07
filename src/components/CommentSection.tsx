"use client";

import { Comment } from "@/lib/types";

interface CommentSectionProps {
  comments: Comment[];
}

export default function CommentSection({ comments }: CommentSectionProps) {
  return (
    <div className="mt-12 pt-8 border-t border-border-subtle">
      <h3 className="font-poem text-lg font-medium text-text-primary mb-6">
        Leave a note
      </h3>

      <div className="mb-8">
        <div className="relative">
          <textarea
            placeholder="Write a note..."
            className="w-full bg-surface-secondary border border-border-subtle focus:border-brand rounded-[var(--radius-md)] outline-none py-3 px-4 text-sm text-text-primary placeholder:text-text-tertiary resize-none font-sans transition-colors"
            rows={2}
          />
        </div>
        <div className="flex justify-end mt-2">
          <button className="text-xs font-medium text-brand hover:text-brand-hover transition-colors px-3 py-1">
            Post
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-brand-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-brand text-[10px] font-display font-medium">
                {comment.author.name[0]}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-text-primary">
                  {comment.author.handle}
                </span>
                <span className="text-xs text-text-tertiary">
                  {comment.createdAt}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
