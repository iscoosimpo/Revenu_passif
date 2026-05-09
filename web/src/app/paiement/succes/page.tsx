import Link from "next/link";

export default function PaiementSuccesPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)]/20 text-2xl">
        ✓
      </div>
      <h1 className="text-2xl font-black text-white tracking-tight">
        Paiement reçu
      </h1>
      <p className="mt-4 text-[var(--muted)] text-sm leading-relaxed">
        Merci pour votre commande. Si le paiement est validé par GeniusPay,
        votre accès ou votre confirmation sera envoyée par e-mail lorsque votre
        compte sera entièrement configuré (dont webhooks et commandes).
      </p>
      <Link
        href="/"
        className="mt-8 inline-block btn-primary text-white px-8 py-3 rounded-xl text-sm font-bold"
      >
        Retour à l&apos;accueil
      </Link>
      <Link
        href="/produits"
        className="mt-4 block text-sm font-bold text-[var(--primary)] hover:underline"
      >
        Continuer vos achats
      </Link>
    </div>
  );
}
