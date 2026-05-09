import Link from "next/link";

export default function PaiementEchecPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-2xl text-red-300">
        !
      </div>
      <h1 className="text-2xl font-black text-white tracking-tight">
        Paiement non finalisé
      </h1>
      <p className="mt-4 text-[var(--muted)] text-sm leading-relaxed">
        Le paiement a été annulé ou a échoué. Aucune somme n&apos;a été
        débitée. Vous pouvez réessayer depuis le panier.
      </p>
      <Link
        href="/checkout"
        className="mt-8 inline-block btn-primary text-white px-8 py-3 rounded-xl text-sm font-bold"
      >
        Retour au paiement
      </Link>
      <Link
        href="/produits"
        className="mt-4 block text-sm font-bold text-[var(--primary)] hover:underline"
      >
        Voir les produits
      </Link>
    </div>
  );
}
