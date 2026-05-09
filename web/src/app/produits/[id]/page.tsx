import type { Data } from "@puckeditor/core";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import PuckRender from "@/components/PuckRender";

type PuckPageData = { content: unknown[]; root?: unknown };

function isPuckPageData(value: unknown): value is PuckPageData {
  return (
    typeof value === "object" &&
    value !== null &&
    "content" in value &&
    Array.isArray((value as { content?: unknown }).content)
  );
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  type ProductData = {
    id: string;
    title: string;
    description: string | null;
    price: number;
    image_url: string | null;
    slug: string | null;
    compare_at_price?: number | null;
    badge?: string | null;
  };

  let productData: ProductData | null = null;

  const { data: bySlug } = await supabase
    .from("products")
    .select("id, title, description, price, image_url, slug, compare_at_price, badge")
    .eq("slug", id)
    .maybeSingle();

  if (bySlug) {
    productData = bySlug;
  } else {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      const { data: byId } = await supabase
        .from("products")
        .select("id, title, description, price, image_url, slug, compare_at_price, badge")
        .eq("id", id)
        .maybeSingle();
      productData = byId;
    }
  }

  if (!productData) return notFound();

  // If a fully customized Puck page exists for this product, render it instead.
  const { data: puckRow } = await supabase
    .from("puck_pages")
    .select("data")
    .eq("path", `product:${productData.slug || productData.id}`)
    .maybeSingle();

  if (isPuckPageData(puckRow?.data)) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <PuckRender data={puckRow.data as Data} />
      </main>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[var(--background)] overflow-x-hidden">

      {/* ─── Back Navigation ─── */}
      <div className="w-full px-4 sm:px-8 md:px-16 py-5 border-b border-white/5 bg-[var(--background)]/80 backdrop-blur-xl sticky top-14 z-40">
        <Link href="/produits" className="inline-flex items-center gap-3 text-[var(--muted)] hover:text-white transition-colors group w-fit">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[var(--primary)] transition-all shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <span className="font-bold text-xs uppercase tracking-widest">Retour au catalogue</span>
        </Link>
      </div>

      {/* ─── Main Content ─── */}
      {/* Mobile: vertical stack | Desktop: 2 columns */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

          {/* ─── LEFT: Product Image ─── */}
          <div className="w-full lg:w-[45%] lg:sticky lg:top-28 shrink-0 overflow-hidden">
            {/* Image Container — fixed 4:5 ratio, no overflow possible */}
            <div className="relative w-full aspect-[4/5] max-h-[70vh] lg:max-h-none rounded-3xl overflow-hidden isolate bg-[#0d0d0f] shadow-2xl border border-white/5">
              <img
                src={productData.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800"}
                alt={productData.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Vignette */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              {/* Badge — inside image, always visible */}
              {productData.badge && (
                <div className="absolute top-4 left-4 z-10 bg-[var(--primary)] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  {productData.badge}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT: Product Details ─── */}
          <div className="w-full lg:flex-1 flex flex-col gap-8">

            {/* Category + Title + Description */}
            <div>
              <span className="text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.3em] mb-3 block opacity-70">
                Ressource Numérique
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-4">
                {productData.title}
              </h1>
              <p className="text-[var(--muted)] text-base leading-relaxed">
                {productData.description}
              </p>
            </div>

            {/* Benefits List */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
              <h3 className="font-black text-white text-sm mb-5 flex items-center gap-3">
                <span className="w-1 h-5 bg-[var(--primary)] rounded-full shrink-0"></span>
                Ce que vous allez recevoir
              </h3>
              <ul className="space-y-3">
                {[
                  "Accès à vie au contenu numérique",
                  "Méthode optimisée pour les francophones",
                  "Support prioritaire 24/7",
                  "Mises à jour gratuites à vie",
                ].map((b, i) => (
                  <li key={i} className="flex items-center gap-3 text-[var(--muted)] text-sm">
                    <div className="w-4 h-4 bg-[#8efcc4]/10 rounded-full flex items-center justify-center shrink-0">
                      <svg className="text-[#8efcc4]" xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="font-medium">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ─── Price + CTA ─── */}
            {/* Sticky on mobile so it stays accessible */}
            <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-6 flex flex-col gap-5">
              {/* Price row */}
              <div className="flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {productData.price.toLocaleString()} <span className="text-base font-bold">FCFA</span>
                </span>
                {productData.compare_at_price && (
                  <span className="text-base text-[var(--muted)] line-through opacity-50 font-medium">
                    {productData.compare_at_price.toLocaleString()} FCFA
                  </span>
                )}
              </div>

              {/* CTA Button */}
              <button className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[var(--primary)] hover:text-white transition-all active:scale-95 shadow-xl">
                Acheter Maintenant
              </button>

              {/* Trust signals */}
              <div className="flex items-center justify-center gap-4 opacity-50">
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Paiement Sécurisé
                </span>
                <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Livraison Immédiate</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
