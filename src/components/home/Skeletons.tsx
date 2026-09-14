"use client";

export function ComposerSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton-avatar" />
        <div className="flex-1">
          <div className="skeleton-line long" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton-line long" />
        <div className="skeleton-line medium" />
      </div>
    </div>
  );
}

export function DailyMomentSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="space-y-3">
        <div className="skeleton-line short" />
        <div className="skeleton-line long" />
        <div className="skeleton-line medium" />
      </div>
      <div className="mt-6 pt-4 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton-line short" style={{ width: "80px" }} />
            <div className="skeleton-line medium" style={{ width: "200px" }} />
          </div>
          <div className="skeleton-line" style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
        </div>
      </div>
    </div>
  );
}

export function PoemCardSkeleton() {
  return (
    <div className="py-6 border-b border-border-subtle">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton-avatar" style={{ width: "40px", height: "40px" }} />
        <div className="space-y-2">
          <div className="skeleton-line" style={{ width: "120px" }} />
          <div className="skeleton-line" style={{ width: "80px" }} />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="skeleton-line" style={{ width: "60%" }} />
        <div className="skeleton-line long" />
        <div className="skeleton-line medium" />
        <div className="skeleton-line short" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="skeleton-line" style={{ width: "60px", height: "24px", borderRadius: "9999px" }} />
        <div className="skeleton-line" style={{ width: "50px", height: "24px", borderRadius: "9999px" }} />
      </div>
      <div className="flex items-center gap-6">
        <div className="skeleton-line" style={{ width: "40px" }} />
        <div className="skeleton-line" style={{ width: "40px" }} />
        <div className="skeleton-line" style={{ width: "40px" }} />
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="skeleton-avatar" style={{ width: "32px", height: "32px" }} />
          <div className="flex-1 space-y-2">
            <div className="skeleton-line long" />
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WriterSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="skeleton-avatar" style={{ width: "40px", height: "40px" }} />
          <div className="flex-1 space-y-2">
            <div className="skeleton-line" style={{ width: "100px" }} />
            <div className="skeleton-line" style={{ width: "80px" }} />
          </div>
          <div className="skeleton-line" style={{ width: "60px", height: "32px", borderRadius: "9999px" }} />
        </div>
      ))}
    </div>
  );
}
