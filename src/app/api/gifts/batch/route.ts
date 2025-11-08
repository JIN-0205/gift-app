import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { ids }: { ids: string[] } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: "Invalid gift IDs" }, { status: 400 });
    }

    const { data: gifts, error } = await supabaseAdmin
      .from("gifts")
      .select("*")
      .in("id", ids);

    if (error) {
      console.error("Gifts fetch error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(gifts || []);
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
