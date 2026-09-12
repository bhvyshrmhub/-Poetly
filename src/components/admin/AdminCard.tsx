interface AdminCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export default function AdminCard({ label, value, sub }: AdminCardProps) {
  return (
    <div className="bg-surface border border-border-subtle rounded-[var(--radius-md)] p-4">
      <p className="text-[10px] font-medium text-text-tertiary tracking-widest uppercase mb-1">{label}</p>
      <p className="text-2xl font-medium text-text-primary">{value}</p>
      {sub && <p className="text-xs text-text-tertiary mt-0.5">{sub}</p>}
    </div>
  );
}
