"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

type ProductRow = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  badge: string | null;
};

interface DynamicProductGridProps {
  limit?: number;
  hideWrapper?: boolean;
  productId?: string;
  columns?: "2" | "3" | "4";
}

export const DynamicProductGrid = ({ limit = 12, hideWrapper = false, productId, columns = "4" }: DynamicProductGridProps) => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToCart, buyNow } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase.from("products").select("*");
        if (productId) {
          query = query.eq("id", productId);
        } else {
          query = query.order("created_at", { ascending: false }).limit(Number(limit));
        }
        const { data, error } = await query;
        if (error) throw error;
        if (data) setProducts(data as unknown as ProductRow[]);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [limit, productId]);

  const gridColsClass = 
    columns === "2" ? "grid-cols-2" : 
    columns === "3" ? "grid-cols-2 lg:grid-cols-3" : 
    "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  if (loading) return (
    <div className={`grid ${gridColsClass} gap-4 md:gap-6`}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse bg-[var(--surface)] aspect-square rounded-2xl"></div>
      ))}
    </div>
  );

  const grid = (
    <div className={`grid ${gridColsClass} gap-4 md:gap-6`}>
      {products.map((p) => {
        const href = `/produits/${p.slug || p.id}`;
        const payload = {
          id: p.id,
          slug: p.slug,
          title: p.title,
          price: Number(p.price),
          image_url: p.image_url,
        };
        return (
          <div
            key={p.id}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden group hover:border-[var(--primary)]/50 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 flex flex-col w-full"
          >
            <Link href={href} className="block shrink-0 relative aspect-square w-full overflow-hidden bg-black/20">
              {p.badge && (
                <div className="absolute top-2.5 left-2.5 z-10 bg-[var(--primary)] text-white px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg pointer-events-none">
                  {p.badge}
                </div>
              )}
              <img
                src={p.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600"}
                alt={p.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            </Link>

            <div className="p-3 flex flex-col gap-2 flex-1">
              <Link href={href}>
                <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                  {p.title}
                </h3>
              </Link>

              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm font-black text-white">
                  {p.price.toLocaleString()}{" "}
                  <span className="text-[10px] font-bold">FCFA</span>
                </span>
                {p.compare_at_price != null && (
                  <span className="text-[10px] text-[var(--muted)] line-through opacity-50">
                    {p.compare_at_price.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5 mt-auto">
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    className="w-full border border-white/15 bg-transparent text-white py-2 rounded-lg font-black text-[8px] uppercase tracking-wider text-center transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-[0.98]"
                    onClick={() => addToCart(payload)}
                  >
                    Ajouter au panier
                  </button>
                  <button
                    type="button"
                    className="w-full bg-white text-black hover:bg-[var(--primary)] hover:text-white py-2 rounded-lg font-black text-[8px] uppercase tracking-wider text-center transition-all active:scale-[0.98]"
                    onClick={() => {
                      buyNow(payload);
                      router.push("/checkout");
                    }}
                  >
                    Acheter maintenant
                  </button>
                </div>
                <Link
                  href={href}
                  className="text-center text-[10px] font-bold text-[var(--muted)] hover:text-white underline-offset-4 hover:underline"
                >
                  Voir la fiche
                </Link>
              </div>
            </div>
          </div>
        );
      })}
      {products.length === 0 && (
        <div className="col-span-full text-center py-10 text-[var(--muted)] border border-dashed border-[var(--border)] rounded-3xl">
          Aucun produit n&apos;est encore disponible. Ajoutez-en un dans l&apos;admin !
        </div>
      )}
    </div>
  );

  if (hideWrapper) return grid;

  return (
    <div className="w-full">
      {grid}
    </div>
  );
};

export const DynamicHeroProduct = ({ productId }: { productId?: string }) => {
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      let query = supabase.from("products").select("*");
      if (productId) {
        query = query.eq("id", productId);
      } else {
        query = query.order("created_at", { ascending: false }).limit(1);
      }
      const { data } = await query.maybeSingle();
      if (data) setProduct(data as unknown as ProductRow);
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  if (loading) return <div className="animate-pulse bg-[var(--surface)] h-64 rounded-2xl"></div>;
  if (!product) return null;

  return (
    <div className="bg-[var(--surface)] p-5 md:p-8 rounded-2xl relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 rounded-bl-full blur-2xl"></div>
      <span className="text-[#8efcc4] text-sm font-bold tracking-wider mb-2 block uppercase">Produit Vedette</span>
      <h3 className="text-2xl font-bold mb-4 text-white line-clamp-1">{product.title}</h3>
      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-6 relative shadow-2xl border border-[var(--border)]/50">
        <img src={product.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600"} alt={product.title} className="object-cover w-full h-full" />
      </div>
      <Link href={`/produits/${product.slug || product.id}`} className="btn-primary w-full block text-center text-white px-6 py-4 rounded-xl font-bold text-lg">
        Découvrir ({product.price.toLocaleString()} FCFA)
      </Link>
    </div>
  );
};

export const DynamicProductDetail = ({ 
  productRef, 
  backLabel,
  categoryLabel,
  extraDescription,
  featuresTitle,
  benefits: manualBenefits,
  buttonLabel,
  trustSignal1,
  trustSignal2,
  securityText,
  _resolvedProduct
}: { 
  productRef?: string, 
  backLabel?: string, 
  categoryLabel?: string, 
  extraDescription?: string, 
  featuresTitle?: string,
  benefits?: { text: string }[],
  buttonLabel?: string,
  trustSignal1?: string,
  trustSignal2?: string,
  securityText?: string,
  _resolvedProduct?: any
}) => {
  const router = useRouter();
  const { addToCart, buyNow } = useCart();
  const [product, setProduct] = useState<ProductRow | null>(_resolvedProduct || null);
  const [loading, setLoading] = useState(!_resolvedProduct && !!productRef);

  useEffect(() => {
    // Only fetch if we don't have resolved data and we have a ref
    if (_resolvedProduct) {
      setProduct(_resolvedProduct);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      if (!productRef) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let query = supabase.from("products").select("*");
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        query = uuidRegex.test(productRef)
          ? query.eq("id", productRef)
          : query.eq("slug", productRef);

        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        setProduct((data ?? null) as unknown as ProductRow | null);
      } catch (err) {
        console.error("Error fetching product detail:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productRef, _resolvedProduct]);

  if (loading) {
    return (
      <div className="w-full grid md:grid-cols-2 gap-8 px-4 md:px-12 lg:px-20 py-16">
        <div className="animate-pulse bg-[var(--surface)] aspect-[4/5] rounded-3xl" />
        <div className="flex flex-col gap-6">
          <div className="animate-pulse bg-[var(--surface)] h-12 w-3/4 rounded-xl" />
          <div className="animate-pulse bg-[var(--surface)] h-32 rounded-xl" />
          <div className="animate-pulse bg-[var(--surface)] h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  const displayTitle = product?.title || "Produit non sélectionné";
  const displayDescription = product?.description || "Sélectionnez un produit dans les paramètres du bloc pour afficher ses détails.";
  const displayPriceValue = product ? Number(product.price).toLocaleString() : "";
  const displayCurrency =
    (product as unknown as { currency?: string })?.currency || "FCFA";
  const displayImage = product?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800";
  const displayBadge = product?.badge;
  const displayBenefits = (manualBenefits && manualBenefits.length > 0) ? manualBenefits : [
    { text: "Accès à vie au contenu numérique" },
    { text: "Méthode optimisée pour les francophones" },
    { text: "Support prioritaire 24/7" },
    { text: "Mises à jour gratuites à vie" }
  ];

  return (
    <div className="w-full min-h-screen bg-[var(--background)] overflow-x-hidden">
      {/* ─── Back Navigation ─── */}
      <div className="w-full px-4 sm:px-8 md:px-16 py-5 border-b border-white/5 bg-[var(--background)]/80 backdrop-blur-xl sticky top-0 z-40">
        <Link
          href="/produits"
          className="inline-flex items-center gap-3 text-[var(--muted)] hover:text-white transition-colors group w-fit cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[var(--primary)] transition-all shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </div>
          <span className="font-bold text-xs uppercase tracking-widest">{backLabel || "Retour au catalogue"}</span>
        </Link>
      </div>

      {/* ─── Main Content ─── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* ─── LEFT: Product Image ─── */}
          <div className="w-full lg:w-[45%] lg:sticky lg:top-28 shrink-0 overflow-hidden">
            <div className="relative w-full aspect-[4/5] max-h-[70vh] lg:max-h-none rounded-3xl overflow-hidden isolate bg-[#0d0d0f] shadow-2xl border border-white/5">
              <img
                src={displayImage}
                alt={displayTitle}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              {displayBadge && (
                <div className="absolute top-4 left-4 z-10 bg-[var(--primary)] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  {displayBadge}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT: Product Details ─── */}
          <div className="w-full lg:flex-1 flex flex-col gap-8">
            {/* Category + Title + Description */}
            <div>
              <span className="text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.3em] mb-3 block opacity-70">
                {categoryLabel || "Ressource Numérique"}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-4">
                {displayTitle}
              </h1>
              <p className="text-[var(--muted)] text-base leading-relaxed whitespace-pre-wrap">
                {displayDescription}
              </p>
              {extraDescription && (
                <p className="mt-4 text-[var(--muted)] text-sm leading-relaxed whitespace-pre-wrap italic border-l-2 border-[var(--primary)] pl-4">
                  {extraDescription}
                </p>
              )}
            </div>

            {/* Benefits List */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
              <h3 className="font-black text-white text-sm mb-5 flex items-center gap-3">
                <span className="w-1 h-5 bg-[var(--primary)] rounded-full shrink-0"></span>
                {featuresTitle || "Ce que vous allez recevoir"}
              </h3>
              <ul className="space-y-3">
                {displayBenefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-3 text-[var(--muted)] text-sm">
                    <div className="w-4 h-4 bg-[#8efcc4]/10 rounded-full flex items-center justify-center shrink-0">
                      <svg className="text-[#8efcc4]" xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span className="font-medium">{b.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price + CTA */}
            <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {displayPriceValue} <span className="text-base font-bold">{displayCurrency}</span>
                </span>
                {product?.compare_at_price && (
                  <span className="text-base text-[var(--muted)] line-through opacity-50 font-medium">
                    {Number(product.compare_at_price).toLocaleString()} {displayCurrency}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!product}
                  className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider border border-white/25 text-white hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                  onClick={() =>
                    product &&
                    addToCart({
                      id: product.id,
                      slug: product.slug,
                      title: product.title,
                      price: Number(product.price),
                      image_url: product.image_url,
                    })
                  }
                >
                  Ajouter au panier
                </button>
                <button
                  type="button"
                  disabled={!product}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-[var(--primary)] hover:text-white transition-all active:scale-[0.98] shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => {
                    if (!product) return;
                    buyNow({
                      id: product.id,
                      slug: product.slug,
                      title: product.title,
                      price: Number(product.price),
                      image_url: product.image_url,
                    });
                    router.push("/checkout");
                  }}
                >
                  {buttonLabel || "Acheter maintenant"}
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-4 opacity-50">
                  <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    {trustSignal1 || "Paiement Sécurisé"}
                  </span>
                  <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">{trustSignal2 || "Livraison Immédiate"}</span>
                </div>
                {securityText && (
                  <p className="text-[9px] text-center text-[var(--muted)] font-medium leading-relaxed max-w-[250px] mx-auto">
                    {securityText}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NewsletterForm = ({ buttonLabel, placeholder }: { buttonLabel: string, placeholder: string }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMsg(data.message || "Merci pour votre inscription !");
        setEmail("");
      } else {
        throw new Error(data.error || "Une erreur est survenue");
      }
    } catch (err: unknown) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  return (
    <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={handleSubmit}>
      <div className="flex-1 flex flex-col gap-1 text-left">
        <input
          type="email"
          required
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "success"}
          className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-50"
        />
        {msg && (
          <p className={`text-sm mt-2 font-medium ${status === "success" ? "text-green-400" : "text-red-400"}`}>
            {msg}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="btn-primary text-white px-8 py-4 h-fit rounded-xl font-bold shadow-lg shadow-[var(--primary)]/20 hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:transform-none"
      >
        {status === "loading" ? "Chargement..." : buttonLabel}
      </button>
    </form>
  );
};

type ProductOption = { id: string; slug: string | null; title: string };

export const ProductPickerField = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string) => void;
}) => {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    supabase
      .from("products")
      .select("id, slug, title")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) { setStatus("error"); return; }
        setOptions(data as ProductOption[]);
        setStatus("ready");
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ padding: "8px 0" }}>
      <label style={{ display: "block", fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#111827" }}>
        Choisir le produit
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14 }}
      >
        <option value="">(Dernier produit ajouté)</option>
        {options.map((p) => (
          <option key={p.id} value={p.slug || p.id}>
            {p.title}{p.slug ? ` — ${p.slug}` : ""}
          </option>
        ))}
      </select>
      <p style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
        {status === "loading" ? "Chargement..." : status === "error" ? "Erreur de chargement." : "Sélectionne un produit."}
      </p>
    </div>
  );
};
