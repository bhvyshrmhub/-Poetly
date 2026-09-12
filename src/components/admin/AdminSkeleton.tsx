export default function AdminSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-border-subtle">
          <div className="w-8 h-8 skeleton rounded-[var(--radius-sm)]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 skeleton rounded" />
            <div className="h-3 w-32 skeleton rounded" />
          </div>
          <div className="h-6 w-16 skeleton rounded-full" />
        </div>
      ))}
    </div>
  );
}
