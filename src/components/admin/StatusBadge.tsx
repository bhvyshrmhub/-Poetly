interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  published: { bg: "bg-success-subtle", text: "text-success", label: "Published" },
  draft: { bg: "bg-surface-secondary", text: "text-text-tertiary", label: "Draft" },
  archived: { bg: "bg-surface-secondary", text: "text-text-tertiary", label: "Archived" },
  hidden: { bg: "bg-warning-subtle", text: "text-warning", label: "Hidden" },
  removed: { bg: "bg-error-subtle", text: "text-error", label: "Removed" },
  public: { bg: "bg-success-subtle", text: "text-success", label: "Public" },
  private: { bg: "bg-surface-secondary", text: "text-text-tertiary", label: "Private" },
  unlisted: { bg: "bg-warning-subtle", text: "text-warning", label: "Unlisted" },
  pending: { bg: "bg-warning-subtle", text: "text-warning", label: "Pending" },
  reviewed: { bg: "bg-brand-subtle", text: "text-brand", label: "Reviewed" },
  resolved: { bg: "bg-success-subtle", text: "text-success", label: "Resolved" },
  rejected: { bg: "bg-surface-secondary", text: "text-text-tertiary", label: "Rejected" },
  dismissed: { bg: "bg-surface-secondary", text: "text-text-tertiary", label: "Dismissed" },
  active: { bg: "bg-success-subtle", text: "text-success", label: "Active" },
  suspended: { bg: "bg-warning-subtle", text: "text-warning", label: "Suspended" },
  banned: { bg: "bg-error-subtle", text: "text-error", label: "Banned" },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: "bg-surface-secondary", text: "text-text-tertiary", label: status };
  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span className={`${config.bg} ${config.text} ${sizeClasses} rounded-full font-medium`}>
      {config.label}
    </span>
  );
}
