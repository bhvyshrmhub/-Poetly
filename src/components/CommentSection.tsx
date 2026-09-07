"use client";

import { Comment } from "@/lib/types";

interface CommentSectionProps {
  comments: Comment[];
}

export default function CommentSection({ comments }: CommentSectionProps) {
  return (
    <div className="mt-12 pt-8 border-t border-border-light">
      <h3 className="font-serif text-lg text-foreground mb-6">
        Leave a note
      </h3>

      <div className="mb-8">
        <textarea
          placeholder="Write a note..."
          className="w-full bg-transparent border-b border-border focus:border-accent outline-none py-3 text-sm text-foreground placeholder:text-text-tertiary resize-none font-sans"
          rows={2}
        />
        <div className="flex justify-end mt-2">
          <button className="text-xs font-medium text-accent hover:text-accent-light transition-colors">
            Post
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-accent text-[10px] font-serif font-semibold">
                {comment.author.name[0]}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-foreground">
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
