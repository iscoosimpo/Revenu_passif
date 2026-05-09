import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-12 md:py-20 mt-auto bg-[var(--surface)]">
      <div className="w-full px-4 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 items-start text-center md:text-left">
          <div>
            <Link href="/" className="font-bold text-xl flex items-center gap-2 mb-4 justify-center md:justify-start">
              <span className="w-3 h-3 rounded-full bg-gradient-to-br from-[#8efcc4] to-[var(--primary)]"></span>
              Magassa Hub
            </Link>
            <p className="text-[var(--muted)] text-sm leading-relaxed">
              L'anglais pratique pour les francophones. Une méthode simple, axée sur la vie réelle.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white mb-2">Navigation</h4>
            <Link href="/" className="text-sm text-[var(--muted)] hover:text-white transition-colors">Accueil</Link>
            <Link href="/produits" className="text-sm text-[var(--muted)] hover:text-white transition-colors">Produits</Link>
            <Link href="/a-propos" className="text-sm text-[var(--muted)] hover:text-white transition-colors">À propos</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white mb-2">Légal</h4>
            <Link href="#" className="text-sm text-[var(--muted)] hover:text-white transition-colors">Mentions légales</Link>
            <Link href="#" className="text-sm text-[var(--muted)] hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/admin" className="text-xs opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1 justify-center md:justify-start mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Admin
            </Link>
          </div>
        </div>
        <div className="border-t border-[var(--border)] pt-8 text-center text-xs text-[var(--muted)]">
          <p>© {new Date().getFullYear()} Magassa Hub. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
