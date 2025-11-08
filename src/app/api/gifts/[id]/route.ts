import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: gift, error } = await supabaseAdmin
      .from("gifts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Gift fetch error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!gift) {
      return Response.json({ error: "Gift not found" }, { status: 404 });
    }

    return Response.json(gift);
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
