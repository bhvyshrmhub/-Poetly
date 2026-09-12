"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import StatusBadge from "@/components/admin/StatusBadge";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setUsers((data as Profile[]) || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-text-primary mb-1">Users</h1>
        <p className="text-sm text-text-secondary">Manage user accounts.</p>
      </div>

      <div className="bg-surface border border-border-subtle rounded-[var(--radius-md)] p-4 mb-6">
        <p className="text-xs text-text-tertiary">
          User management (suspend, restore, ban) will become fully available when authentication is enabled.
          Currently showing profiles from the database.
        </p>
      </div>

      {loading ? (
        <AdminSkeleton rows={8} />
      ) : users.length > 0 ? (
        <div className="space-y-0">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-4 py-4 border-b border-border-subtle">
              <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-surface-secondary flex items-center justify-center shrink-0 overflow-hidden">
                {user.profile_image ? (
                  <img src={user.profile_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-medium text-text-tertiary">{user.display_name?.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user.display_name}</p>
                <p className="text-xs text-text-tertiary">@{user.username}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={user.status || "active"} />
                <span className="text-xs text-text-tertiary">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          title="User management will become available when authentication is enabled."
          description="No user profiles are currently in the database."
        />
      )}
    </div>
  );
}
