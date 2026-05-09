import type { Data } from "@puckeditor/core";
import { Render } from "@puckeditor/core";
import { config } from "../../puck.config";
import { supabase } from "@/lib/supabase";

type PuckPageData = {
  content: unknown[];
  root?: unknown;
};

function isPuckPageData(value: unknown): value is PuckPageData {
  return (
    typeof value === "object" &&
    value !== null &&
    "content" in value &&
    Array.isArray((value as { content?: unknown }).content)
  );
}

// Function to fetch Puck data server-side
async function getPuckData() {
  try {
    const { data: dbData } = await supabase
      .from("puck_pages")
      .select("data")
      .eq("path", "produits")
      .single();

    if (isPuckPageData(dbData?.data)) {
      return dbData.data;
    }
  } catch {
    console.error("No puck data found for products list page in DB");
  }
  
  // Default structure if no data exists
  return {
    content: [
      { type: "Hero", props: { id: "ProductsHero-1", variant: "compact", badge: "Catalogue", title: "Tous nos Produits", subtitle: "Découvrez tous nos livres et ressources." } },
      { type: "ProductGrid", props: { id: "ProductList-1", limit: 20 } }
    ],
    root: { props: { title: "Nos Produits" } },
  };
}

export default async function ProduitsPage() {
  const data = await getPuckData();

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Render config={config} data={data as Data} />
    </main>
  );
}
