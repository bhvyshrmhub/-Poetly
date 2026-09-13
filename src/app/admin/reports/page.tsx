"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Database } from "@/lib/database.types";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";
import Toast from "@/components/Toast";

type Report = Database["public"]["Tables"]["reports"]["Row"];

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed" | "resolved" | "dismissed">("pending");
  const [selected, setSelected] = useState<Report | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [confirm, setConfirm] = useState<{ action: string; reportId: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logActivity = useCallback(async (action: string, targetId: string, details?: string) => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("admin_activity_log").insert({
      admin_id: user.id,
      action,
      target_type: "report",
      target_id: targetId,
      details: details || null,
    });
  }, [user]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase.from("reports").select("*").order("created_at", { ascending: false });
      if (filter !== "all") {
        query = query.eq("status", filter);
      }
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setReports((data as Report[]) || []);
    } catch (err) {
      setError("Failed to load reports. Please try again.");
      console.error("Fetch reports error:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleAction = async (action: string, reportId: string) => {
    setConfirm(null);
    const report = reports.find((r) => r.id === reportId);
    if (!report || !user) return;
    const supabase = createClient();

    try {
      switch (action) {
        case "resolve": {
          const { error } = await supabase.from("reports").update({
            status: "resolved",
            admin_note: adminNote || null,
            resolved_by: user.id,
            resolved_at: new Date().toISOString(),
          }).eq("id", reportId);
          if (error) throw error;
          await logActivity("resolved_report", reportId, `${report.target_type}: ${report.reason.slice(0, 50)}`);
          setToast("Report resolved.");
          break;
        }
        case "dismiss": {
          const { error } = await supabase.from("reports").update({
            status: "dismissed",
            admin_note: adminNote || null,
            resolved_by: user.id,
            resolved_at: new Date().toISOString(),
          }).eq("id", reportId);
          if (error) throw error;
          await logActivity("dismissed_report", reportId, `${report.target_type}: ${report.reason.slice(0, 50)}`);
          setToast("Report dismissed.");
          break;
        }
        case "hide": {
          if (report.target_type === "poem") {
            const { error: poemErr } = await supabase.from("poems").update({ status: "hidden" }).eq("id", report.target_id);
            if (poemErr) throw poemErr;
          }
          const { error } = await supabase.from("reports").update({
            status: "resolved",
            admin_note: `Content hidden. ${adminNote || ""}`.trim(),
            resolved_by: user.id,
            resolved_at: new Date().toISOString(),
          }).eq("id", reportId);
          if (error) throw error;
          await logActivity("hidden_content_via_report", reportId, `${report.target_type} ${report.target_id}`);
          setToast("Content hidden and report resolved.");
          break;
        }
        case "remove": {
          if (report.target_type === "poem") {
            const { error: poemErr } = await supabase.from("poems").update({ status: "removed" }).eq("id", report.target_id);
            if (poemErr) throw poemErr;
          }
          const { error } = await supabase.from("reports").update({
            status: "resolved",
            admin_note: `Content removed. ${adminNote || ""}`.trim(),
            resolved_by: user.id,
            resolved_at: new Date().toISOString(),
          }).eq("id", reportId);
          if (error) throw error;
          await logActivity("removed_content_via_report", reportId, `${report.target_type} ${report.target_id}`);
          setToast("Content removed and report resolved.");
          break;
        }
      }

      setSelected(null);
      setAdminNote("");
      fetchReports();
    } catch (err) {
      setToast("Action failed. Please try again.");
      console.error("Report action error:", err);
    }
  };

  const filters = [
    { id: "pending" as const, label: "Pending" },
    { id: "all" as const, label: "All" },
    { id: "reviewed" as const, label: "Reviewed" },
    { id: "resolved" as const, label: "Resolved" },
    { id: "dismissed" as const, label: "Dismissed" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-text-primary mb-1">Reports</h1>
        <p className="text-sm text-text-secondary">Review and moderate reported content.</p>
      </div>

      <div className="flex gap-1 mb-6 bg-surface-secondary rounded-[var(--radius-full)] p-1 max-w-fit">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filter === f.id ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-error-subtle border border-error/20 rounded-[var(--radius-md)] p-4 mb-6">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {loading ? (
        <AdminSkeleton rows={6} />
      ) : reports.length > 0 ? (
        <div className="space-y-0">
          {reports.map((report) => (
            <div
              key={report.id}
              className="py-4 border-b border-border-subtle cursor-pointer hover:bg-surface-hover -mx-5 px-5 transition-colors"
              onClick={() => { setSelected(report); setAdminNote(report.admin_note || ""); }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-text-primary capitalize">{report.target_type}</span>
                    <StatusBadge status={report.status} />
                    {report.report_category && (
                      <span className="text-[10px] text-text-tertiary">{report.report_category}</span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-1">{report.reason}</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    Reported {new Date(report.created_at).toLocaleDateString()}
                    {report.resolved_at && ` — Resolved ${new Date(report.resolved_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          title={filter === "pending" ? "No reports require your attention." : "No reports found."}
          description={filter === "pending" ? "All clear." : `No ${filter} reports.`}
        />
      )}

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-surface border border-border-subtle rounded-[var(--radius-lg)] p-6 max-w-lg w-full shadow-xl animate-fade-in max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-medium text-text-primary mb-4">Report Details</h3>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-[10px] text-text-tertiary tracking-widest uppercase mb-1">Type</p>
                <p className="text-sm text-text-primary capitalize">{selected.target_type}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-tertiary tracking-widest uppercase mb-1">Reason</p>
                <p className="text-sm text-text-primary">{selected.reason}</p>
              </div>
              {selected.report_category && (
                <div>
                  <p className="text-[10px] text-text-tertiary tracking-widest uppercase mb-1">Category</p>
                  <p className="text-sm text-text-primary">{selected.report_category}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-text-tertiary tracking-widest uppercase mb-1">Target ID</p>
                <p className="text-xs text-text-tertiary font-mono">{selected.target_id}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-tertiary tracking-widest uppercase mb-1">Reported</p>
                <p className="text-sm text-text-primary">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              {selected.admin_note && (
                <div>
                  <p className="text-[10px] text-text-tertiary tracking-widest uppercase mb-1">Admin Note</p>
                  <p className="text-sm text-text-secondary">{selected.admin_note}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="text-[10px] text-text-tertiary tracking-widest uppercase mb-1 block">Admin Note</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note about this decision..."
                className="w-full bg-surface-secondary border border-border-subtle rounded-[var(--radius-sm)] px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand resize-none"
                rows={3}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setConfirm({ action: "resolve", reportId: selected.id })}
                className="px-4 py-2 text-xs font-medium bg-success text-white rounded-[var(--radius-sm)] hover:bg-success/90 transition-colors"
              >
                Resolve
              </button>
              <button
                onClick={() => setConfirm({ action: "dismiss", reportId: selected.id })}
                className="px-4 py-2 text-xs font-medium bg-surface-secondary text-text-secondary rounded-[var(--radius-sm)] hover:bg-surface-hover transition-colors"
              >
                Dismiss
              </button>
              {selected.target_type === "poem" && (
                <>
                  <button
                    onClick={() => setConfirm({ action: "hide", reportId: selected.id })}
                    className="px-4 py-2 text-xs font-medium bg-warning-subtle text-warning rounded-[var(--radius-sm)] hover:bg-warning/10 transition-colors"
                  >
                    Hide Content
                  </button>
                  <button
                    onClick={() => setConfirm({ action: "remove", reportId: selected.id })}
                    className="px-4 py-2 text-xs font-medium bg-error-subtle text-error rounded-[var(--radius-sm)] hover:bg-error/10 transition-colors"
                  >
                    Remove Content
                  </button>
                </>
              )}
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-xs text-text-tertiary hover:text-text-primary transition-colors ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={
            confirm.action === "resolve" ? "Resolve this report?" :
            confirm.action === "dismiss" ? "Dismiss this report?" :
            confirm.action === "hide" ? "Hide this content?" :
            "Remove this content?"
          }
          message={
            confirm.action === "remove"
              ? "This will permanently remove the reported content from Poetly."
              : confirm.action === "hide"
              ? "This will hide the reported content from public view."
              : "Mark this report as handled?"
          }
          confirmLabel={
            confirm.action === "resolve" ? "Resolve" :
            confirm.action === "dismiss" ? "Dismiss" :
            confirm.action === "hide" ? "Hide" :
            "Remove"
          }
          danger={confirm.action === "remove"}
          onConfirm={() => handleAction(confirm.action, confirm.reportId)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
