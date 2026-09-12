interface AdminTableProps {
  headers: string[];
  children: React.ReactNode;
}

export default function AdminTable({ headers, children }: AdminTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border-subtle">
            {headers.map((h) => (
              <th key={h} className="py-3 px-3 text-[10px] font-medium text-text-tertiary tracking-widest uppercase first:pl-0 last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

interface AdminTableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function AdminTableRow({ children, onClick }: AdminTableRowProps) {
  return (
    <tr
      className={`border-b border-border-subtle last:border-0 transition-colors ${onClick ? "cursor-pointer hover:bg-surface-hover" : ""}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function AdminTableCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-3 px-3 text-sm first:pl-0 last:pr-0 ${className}`}>{children}</td>;
}
