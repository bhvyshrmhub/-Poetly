import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  // Session verification
  const sessionCookie = request.cookies.get("admin-session")?.value;
  if (!sessionCookie || !(await verifyAdminSession(sessionCookie))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action as string;
  if (!action) {
    return NextResponse.json({ error: "Missing action field" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    // Helper to log admin activity
    const logActivity = async (
      activityAction: string,
      targetType: string | null = null,
      targetId: string | null = null,
      details: string | null = null
    ) => {
      try {
        await supabase.from("admin_activity_log").insert({
          admin_id: null,
          action: activityAction,
          target_type: targetType,
          target_id: targetId,
          details,
        });
      } catch (logErr) {
        console.error("Failed to insert admin activity log:", logErr);
      }
    };

    switch (action) {
      case "update_user_status": {
        const userId = body.userId as string;
        const newStatus = body.status as "active" | "suspended" | "banned";
        const userName = (body.userName as string) || "user";

        if (!userId || !newStatus) {
          return NextResponse.json({ error: "Missing userId or status" }, { status: 400 });
        }

        const { error } = await supabase
          .from("profiles")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (error) throw error;

        await logActivity(`${newStatus}_user`, "user", userId, `Changed ${userName} to ${newStatus}`);
        return NextResponse.json({ success: true });
      }

      case "set_poem_status": {
        const poemId = body.poemId as string;
        const newStatus = body.status as "draft" | "published" | "archived" | "hidden" | "removed";
        const poemTitle = (body.poemTitle as string) || "poem";

        if (!poemId || !newStatus) {
          return NextResponse.json({ error: "Missing poemId or status" }, { status: 400 });
        }

        const { error } = await supabase
          .from("poems")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", poemId);

        if (error) throw error;

        await logActivity(`${newStatus}_poem`, "poem", poemId, `Changed "${poemTitle}" to ${newStatus}`);
        return NextResponse.json({ success: true });
      }

      case "resolve_report": {
        const reportId = body.reportId as string;
        const status = (body.status as "resolved" | "dismissed") || "resolved";
        const adminNote = (body.adminNote as string) || null;
        const hideContent = Boolean(body.hideContent);

        if (!reportId) {
          return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
        }

        // Fetch report target
        const { data: reportData } = await supabase
          .from("reports")
          .select("*")
          .eq("id", reportId)
          .single();

        const report = reportData as { target_type?: string; target_id?: string; reason?: string } | null;

        if (hideContent && report && report.target_type === "poem" && report.target_id) {
          await supabase
            .from("poems")
            .update({ status: "hidden", updated_at: new Date().toISOString() })
            .eq("id", report.target_id);
        }

        const { error } = await supabase
          .from("reports")
          .update({
            status,
            admin_note: adminNote,
            resolved_by: null,
            resolved_at: new Date().toISOString(),
          })
          .eq("id", reportId);

        if (error) throw error;

        await logActivity(
          `${status}_report`,
          "report",
          reportId,
          report ? `${report.target_type}: ${(report.reason || "").slice(0, 50)}` : null
        );
        return NextResponse.json({ success: true });
      }

      case "delete_comment": {
        const commentId = body.commentId as string;
        const content = (body.content as string) || "";

        if (!commentId) {
          return NextResponse.json({ error: "Missing commentId" }, { status: 400 });
        }

        const { error } = await supabase.from("comments").delete().eq("id", commentId);
        if (error) throw error;

        await logActivity("deleted_comment", "comment", commentId, content.slice(0, 50));
        return NextResponse.json({ success: true });
      }

      case "add_featured": {
        const contentType = body.contentType as "poem" | "prompt" | "collection";
        const contentId = body.contentId as string;

        if (!contentType || !contentId) {
          return NextResponse.json({ error: "Missing contentType or contentId" }, { status: 400 });
        }

        // Determine next position
        const { data: existing } = await supabase
          .from("featured_content")
          .select("position")
          .order("position", { ascending: false })
          .limit(1);

        const nextPosition = (((existing as Array<{ position: number }> | null)?.[0]?.position) ?? -1) + 1;

        const { error } = await supabase.from("featured_content").insert({
          content_type: contentType,
          content_id: contentId,
          position: nextPosition,
        });

        if (error) throw error;

        await logActivity("added_featured", "featured_content", contentId, contentType);
        return NextResponse.json({ success: true });
      }

      case "remove_featured": {
        const id = body.id as string;
        if (!id) {
          return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const { error } = await supabase.from("featured_content").delete().eq("id", id);
        if (error) throw error;

        await logActivity("removed_featured", "featured_content", id);
        return NextResponse.json({ success: true });
      }

      case "reorder_featured": {
        const items = body.items as { id: string; position: number }[];
        if (!Array.isArray(items)) {
          return NextResponse.json({ error: "Items must be an array" }, { status: 400 });
        }

        const updatePromises = items.map(async (item) => {
          const { error } = await supabase
            .from("featured_content")
            .update({ position: item.position })
            .eq("id", item.id);
          if (error) throw error;
        });
        await Promise.all(updatePromises);

        return NextResponse.json({ success: true });
      }

      case "log_activity": {
        const activityAction = body.activityAction as string;
        const targetType = (body.targetType as string) || null;
        const targetId = (body.targetId as string) || null;
        const details = (body.details as string) || null;

        if (!activityAction) {
          return NextResponse.json({ error: "Missing activityAction" }, { status: 400 });
        }

        await logActivity(activityAction, targetType, targetId, details);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
