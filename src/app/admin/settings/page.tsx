"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Database } from "@/lib/database.types";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import Toast from "@/components/Toast";

type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];

export default function AdminSettingsPage() {
  const { user, adminRole } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from("admin_users").select("*").order("created_at", { ascending: true });
      setAdmins((data as AdminUser[]) || []);
    } catch (err) {
      console.error("Fetch admins error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-text-primary mb-1">Settings</h1>
        <p className="text-sm text-text-secondary">Admin configuration.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-surface border border-border-subtle rounded-[var(--radius-md)] p-5">
          <h2 className="text-sm font-medium text-text-primary mb-2">Your Role</h2>
          <p className="text-xs text-text-tertiary leading-relaxed">
            You are signed in as{" "}
            <span className="text-brand font-medium">{adminRole || "admin"}</span>.
            {adminRole === "moderator" && " You can review reports and moderate content, but cannot manage users or settings."}
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
          <h2 className="text-sm font-medium text-text-primary mb-3">Current Admins</h2>
          {loading ? (
            <AdminSkeleton rows={2} />
          ) : (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-subtle flex items-center justify-center">
                      <span className="text-[10px] font-medium text-brand">{admin.user_id.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text-primary">{admin.user_id === user?.id ? "You" : admin.user_id.slice(0, 8) + "..."}</p>
                      <p className="text-[10px] text-text-tertiary capitalize">{admin.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-text-tertiary">
                    Added {new Date(admin.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border-subtle rounded-[var(--radius-md)] p-5">
          <h2 className="text-sm font-medium text-text-primary mb-2">Activity Log</h2>
          <p className="text-xs text-text-tertiary leading-relaxed">
            All admin actions are logged in the <code className="text-brand bg-brand-subtle px-1 py-0.5 rounded text-[11px]">admin_activity_log</code> table
            for audit purposes. View the full log in the Activity tab.
          </p>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
