import { Suspense } from "react";
import CheckoutContent from "./CheckoutContent";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-24 text-center text-[var(--muted)]">
          Chargement du paiement…
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
