"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import AdminEmptyState from "@/components/admin/EmptyState";

export default function AdminCollectionsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-text-primary mb-1">Collections</h1>
        <p className="text-sm text-text-secondary">Manage poem collections.</p>
      </div>

      <div className="bg-surface border border-border-subtle rounded-[var(--radius-md)] p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary font-medium">Collection Management</p>
            <p className="text-xs text-text-tertiary mt-0.5">View and manage collections from the public collections page.</p>
          </div>
          <Link
            href="/collections"
            className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors"
          >
            Go to Collections <ExternalLink size={12} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <AdminEmptyState
        title="Collections are managed from the public interface."
        description="Use the Collections page to view and manage user collections."
      />
    </div>
  );
}
