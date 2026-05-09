import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type PuckDataShape = {
  content?: unknown[];
  root?: unknown;
};

function extractProductRef(data: PuckDataShape): string | null {
  if (!Array.isArray(data.content)) return null;
  for (const block of data.content) {
    if (
      typeof block === "object" &&
      block !== null &&
      (block as { type?: unknown }).type === "ProductPageLayout"
    ) {
      const props = (block as { props?: unknown }).props;
      if (
        typeof props === "object" &&
        props !== null &&
        typeof (props as { productRef?: unknown }).productRef === "string" &&
        (props as { productRef: string }).productRef.trim().length > 0
      ) {
        return (props as { productRef: string }).productRef.trim();
      }
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "home";
    const data = (await req.json()) as PuckDataShape;

    const productRef = page === "product" ? extractProductRef(data) : null;
    const path = productRef ? `product:${productRef}` : page;

    const { error } = await supabase
      .from("puck_pages")
      .upsert({ path, data: data, updated_at: new Date().toISOString() });

    if (error) throw error;

    return NextResponse.json({ success: true, path });
  } catch (error: unknown) {
    console.error("Supabase Save Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
