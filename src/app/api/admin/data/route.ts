import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  // Session verification
  const sessionCookie = request.cookies.get("admin-session")?.value;
  if (!sessionCookie || !(await verifyAdminSession(sessionCookie))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "dashboard";

  try {
    const supabase = createAdminClient();

    switch (type) {
      case "dashboard": {
        const [users, poems, publishedPoems, draftPoems, reports, pendingReports, comments, featured, activityRes] =
          await Promise.all([
            supabase.from("profiles").select("id", { count: "exact", head: true }),
            supabase.from("poems").select("id", { count: "exact", head: true }),
            supabase.from("poems").select("id", { count: "exact", head: true }).eq("status", "published"),
            supabase.from("poems").select("id", { count: "exact", head: true }).eq("status", "draft"),
            supabase.from("reports").select("id", { count: "exact", head: true }),
            supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
            supabase.from("comments").select("id", { count: "exact", head: true }),
            supabase.from("featured_content").select("id", { count: "exact", head: true }),
            supabase.from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(10),
          ]);

        return NextResponse.json({
          stats: {
            users: users.count || 0,
            poems: poems.count || 0,
            publishedPoems: publishedPoems.count || 0,
            draftPoems: draftPoems.count || 0,
            reports: reports.count || 0,
            pendingReports: pendingReports.count || 0,
            comments: comments.count || 0,
            featured: featured.count || 0,
          },
          activity: activityRes.data || [],
        });
      }

      case "users": {
        const page = parseInt(searchParams.get("page") || "0", 10);
        const search = searchParams.get("search") || "";
        const pageSize = 20;
        const offset = page * pageSize;

        let query = supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (search.trim()) {
          query = query.or(`display_name.ilike.%${search}%,username.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({
          users: data || [],
          hasMore: (data?.length || 0) === pageSize,
        });
      }

      case "poems": {
        const page = parseInt(searchParams.get("page") || "0", 10);
        const filter = searchParams.get("filter") || "all";
        const pageSize = 20;
        const offset = page * pageSize;

        let query = supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .order("created_at", { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (filter !== "all") {
          query = query.eq("status", filter as "published" | "draft" | "hidden" | "removed" | "archived");
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({
          poems: data || [],
          hasMore: (data?.length || 0) === pageSize,
        });
      }

      case "reports": {
        const filter = searchParams.get("filter") || "pending";

        let query = supabase.from("reports").select("*").order("created_at", { ascending: false });

        if (filter !== "all") {
          query = query.eq("status", filter as "pending" | "reviewed" | "resolved" | "dismissed");
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ reports: data || [] });
      }

      case "comments": {
        const page = parseInt(searchParams.get("page") || "0", 10);
        const search = searchParams.get("search") || "";
        const pageSize = 20;
        const offset = page * pageSize;

        let query = supabase
          .from("comments")
          .select("*, profiles!inner(*)")
          .order("created_at", { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (search.trim()) {
          query = query.ilike("content", `%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({
          comments: data || [],
          hasMore: (data?.length || 0) === pageSize,
        });
      }

      case "featured": {
        const { data: featured, error: fetchError } = await supabase
          .from("featured_content")
          .select("*")
          .order("position", { ascending: true });

        if (fetchError) throw fetchError;
        const featuredList = (featured as Array<{ id: string; content_type: string; content_id: string; position: number }>) || [];

        const poemIds = featuredList.filter((f) => f.content_type === "poem").map((f) => f.content_id);
        const promptIds = featuredList.filter((f) => f.content_type === "prompt").map((f) => f.content_id);

        const [poemsRes, promptsRes, availablePoemsRes, availablePromptsRes] = await Promise.all([
          poemIds.length > 0 ? supabase.from("poems").select("*").in("id", poemIds) : { data: [] },
          promptIds.length > 0 ? supabase.from("prompts").select("*").in("id", promptIds) : { data: [] },
          supabase.from("poems").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(30),
          supabase.from("prompts").select("*").order("created_at", { ascending: false }).limit(30),
        ]);

        const poemsMap = new Map(((poemsRes.data as Array<{ id: string }> | null) || []).map((p) => [p.id, p]));
        const promptsMap = new Map(((promptsRes.data as Array<{ id: string }> | null) || []).map((p) => [p.id, p]));

        const enriched = featuredList.map((f) => ({
          ...f,
          poem: f.content_type === "poem" ? poemsMap.get(f.content_id) : undefined,
          prompt: f.content_type === "prompt" ? promptsMap.get(f.content_id) : undefined,
        }));

        return NextResponse.json({
          items: enriched,
          availablePoems: availablePoemsRes.data || [],
          availablePrompts: availablePromptsRes.data || [],
        });
      }

      case "activity": {
        const page = parseInt(searchParams.get("page") || "0", 10);
        const pageSize = 30;
        const offset = page * pageSize;

        const { data, error } = await supabase
          .from("admin_activity_log")
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (error) throw error;

        return NextResponse.json({
          entries: data || [],
          hasMore: (data?.length || 0) === pageSize,
        });
      }

      case "settings": {
        const { data, error } = await supabase
          .from("admin_users")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;
        return NextResponse.json({ admins: data || [] });
      }

      case "collections": {
        const { data, error } = await supabase
          .from("collections")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return NextResponse.json({ collections: data || [] });
      }

      case "prompts": {
        const { data, error } = await supabase
          .from("prompts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return NextResponse.json({ prompts: data || [] });
      }

      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
