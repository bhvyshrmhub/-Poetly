"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import AdminEmptyState from "@/components/admin/EmptyState";

export default function AdminPromptsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-text-primary mb-1">Prompts</h1>
        <p className="text-sm text-text-secondary">Manage writing prompts.</p>
      </div>

      <div className="bg-surface border border-border-subtle rounded-[var(--radius-md)] p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary font-medium">Prompt Management</p>
            <p className="text-xs text-text-tertiary mt-0.5">Create, edit, and manage writing prompts from the public prompts page.</p>
          </div>
          <Link
            href="/prompts"
            className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors"
          >
            Go to Prompts <ExternalLink size={12} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <AdminEmptyState
        title="Prompts are managed from the public interface."
        description="Use the Prompts page to create and manage writing prompts. Prompt activation and archiving can be controlled from there."
      />
    </div>
  );
}
