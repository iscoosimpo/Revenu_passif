import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, slug")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      products: (data ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
      })),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

