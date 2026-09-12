"use client";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-text-primary mb-1">Settings</h1>
        <p className="text-sm text-text-secondary">Admin configuration.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-surface border border-border-subtle rounded-[var(--radius-md)] p-5">
          <h2 className="text-sm font-medium text-text-primary mb-2">Authentication</h2>
          <p className="text-xs text-text-tertiary leading-relaxed">
            Admin authentication is currently disabled. When authentication is restored,
            the admin panel will be protected by Supabase Auth with server-side role verification.
          </p>
        </div>

        <div className="bg-surface border border-border-subtle rounded-[var(--radius-md)] p-5">
          <h2 className="text-sm font-medium text-text-primary mb-2">Admin Roles</h2>
          <p className="text-xs text-text-tertiary leading-relaxed mb-3">
            Roles determine what actions an admin can perform. The role system is stored
            in the <code className="text-brand bg-brand-subtle px-1 py-0.5 rounded text-[11px]">admin_users</code> table.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-text-primary w-20">Admin</span>
              <span className="text-xs text-text-tertiary">Full access to all moderation and management features.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-text-primary w-20">Moderator</span>
              <span className="text-xs text-text-tertiary">Can review reports and moderate content. Cannot manage users or settings.</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-[var(--radius-md)] p-5">
          <h2 className="text-sm font-medium text-text-primary mb-2">Activity Log</h2>
          <p className="text-xs text-text-tertiary leading-relaxed">
            All admin actions are logged in the <code className="text-brand bg-brand-subtle px-1 py-0.5 rounded text-[11px]">admin_activity_log</code> table
            for audit purposes. This log cannot be modified or deleted by admins.
          </p>
        </div>

        <div className="bg-surface border border-border-subtle rounded-[var(--radius-md)] p-5">
          <h2 className="text-sm font-medium text-text-primary mb-2">Future Admin ID</h2>
          <p className="text-xs text-text-tertiary leading-relaxed">
            When you provide the Community Admin&apos;s Supabase user ID, it will be added to
            the <code className="text-brand bg-brand-subtle px-1 py-0.5 rounded text-[11px]">admin_users</code> table
            with role = &quot;admin&quot;. No frontend code changes will be needed.
          </p>
        </div>
      </div>
    </div>
  );
}
