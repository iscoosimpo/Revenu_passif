"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";

type ProductRow = {
  id: string;
  slug: string | null;
  title: string;
  price: number;
  image_url: string | null;
};

const CURRENCY_LABEL = "FCFA";

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lines, subtotal, setQuantity, removeLine, clearCart, buyNow } =
    useCart();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [payStatus, setPayStatus] = useState<
    "idle" | "submitting" | "error"
  >("idle");
  const [payMessage, setPayMessage] = useState<string | null>(null);
  const buyNowHandled = useRef(false);

  useEffect(() => {
    const ref = searchParams.get("buyNow");
    if (!ref || buyNowHandled.current) return;
    buyNowHandled.current = true;

    let cancelled = false;
    (async () => {
      try {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        let query = supabase.from("products").select("*").limit(1);
        query = uuidRegex.test(ref)
          ? query.eq("id", ref)
          : query.eq("slug", ref);
        const { data, error } = await query.maybeSingle();
        if (cancelled) return;
        if (error || !data) {
          setPayMessage(
            "Ce produit n’est plus disponible ou le lien est invalide."
          );
          router.replace("/checkout", { scroll: false });
          return;
        }
        const p = data as ProductRow;
        buyNow({
          id: p.id,
          slug: p.slug,
          title: p.title,
          price: Number(p.price),
          image_url: p.image_url,
        });
        router.replace("/checkout", { scroll: false });
      } catch {
        if (!cancelled) {
          setPayMessage("Impossible de charger ce produit.");
          router.replace("/checkout", { scroll: false });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, buyNow, router]);

  const handlePay = useCallback(async () => {
    if (!email.trim()) {
      setPayStatus("error");
      setPayMessage("Veuillez saisir une adresse e-mail pour la facturation.");
      return;
    }
    if (lines.length === 0) {
      setPayStatus("error");
      setPayMessage("Votre panier est vide.");
      return;
    }

    setPayStatus("submitting");
    setPayMessage(null);

    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim() || null,
          lines: lines.map((l) => ({
            productId: l.productId,
            slug: l.slug,
            title: l.title,
            price: l.price,
            quantity: l.quantity,
          })),
          subtotal,
          currency: CURRENCY_LABEL,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        paymentUrl?: string;
      };

      if (!res.ok || !data.ok) {
        setPayStatus("error");
        setPayMessage(
          data.error || "Une erreur est survenue. Réessayez plus tard."
        );
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      setPayStatus("idle");
      setPayMessage(
        "Commande enregistrée (mode démo). L’agrégateur de paiement sera connecté pour finaliser."
      );
    } catch {
      setPayStatus("error");
      setPayMessage("Impossible de contacter le serveur.");
    }
  }, [email, phone, lines, subtotal]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-12 md:py-16">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Paiement
          </h1>
          <p className="text-[var(--muted)] text-sm mt-2">
            Vérifiez votre commande puis finalisez le paiement.
          </p>
        </div>
        <Link
          href="/produits"
          className="text-sm font-bold text-[var(--primary)] hover:underline"
        >
          Continuer vos achats
        </Link>
      </div>

      {payMessage && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
            payStatus === "error"
              ? "border-red-500/50 bg-red-500/10 text-red-300"
              : "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[#8efcc4]"
          }`}
        >
          {payMessage}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
        <section className="lg:col-span-3 space-y-4">
          <h2 className="font-black text-xs uppercase tracking-widest text-[var(--muted)]">
            Panier
          </h2>
          {lines.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--muted)]">
              <p>Votre panier est vide.</p>
              <Link
                href="/produits"
                className="inline-block mt-4 btn-primary text-white px-6 py-3 rounded-xl text-sm font-bold"
              >
                Voir les produits
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/30 shrink-0 border border-white/10">
                    <img
                      src={
                        line.image_url ||
                        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200"
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex justify-between gap-2 items-start">
                      <p className="font-bold text-white text-sm truncate">
                        {line.title}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeLine(line.productId)}
                        className="text-[10px] font-black uppercase text-[var(--muted)] hover:text-red-400 shrink-0"
                      >
                        Retirer
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-black text-white">
                        {(line.price * line.quantity).toLocaleString()}{" "}
                        {CURRENCY_LABEL}
                      </span>
                      <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/30">
                        <button
                          type="button"
                          className="px-2 py-1 text-white hover:bg-white/10"
                          onClick={() =>
                            setQuantity(line.productId, line.quantity - 1)
                          }
                          aria-label="Diminuer"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-white tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="px-2 py-1 text-white hover:bg-white/10"
                          onClick={() =>
                            setQuantity(line.productId, line.quantity + 1)
                          }
                          aria-label="Augmenter"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <h2 className="font-black text-xs uppercase tracking-widest text-[var(--muted)]">
              Coordonnées
            </h2>
            <label className="block text-xs font-bold text-[var(--muted)]">
              E-mail
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                placeholder="vous@example.com"
              />
            </label>
            <label className="block text-xs font-bold text-[var(--muted)]">
              Téléphone (optionnel)
              <input
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                placeholder="+237 …"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex justify-between text-sm font-bold text-[var(--muted)]">
              <span>Sous-total</span>
              <span className="text-white tabular-nums">
                {subtotal.toLocaleString()} {CURRENCY_LABEL}
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              Frais ou taxes affichés éventuellement à l&apos;étape suivante du
              prestataire de paiement.
            </p>
            <button
              type="button"
              disabled={payStatus === "submitting" || lines.length === 0}
              onClick={handlePay}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-white text-black hover:bg-[var(--primary)] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {payStatus === "submitting" ? "Préparation…" : "Payer"}
            </button>
            {lines.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setPayMessage(null);
                }}
                className="w-full text-xs font-bold text-[var(--muted)] hover:text-white"
              >
                Vider le panier
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
