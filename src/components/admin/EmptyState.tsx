interface AdminEmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function AdminEmptyState({ title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="text-center py-16">
      <p className="text-sm font-medium text-text-primary mb-1">{title}</p>
      {description && <p className="text-xs text-text-tertiary mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
