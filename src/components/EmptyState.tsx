"use client";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <p className="font-serif text-xl text-text-tertiary italic mb-3">
        {title}
      </p>
      <p className="text-sm text-text-tertiary mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
