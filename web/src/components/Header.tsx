"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full px-4 md:px-12 lg:px-20 h-14 md:h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg md:text-xl flex items-center gap-2 shrink-0">
          <span className="w-3 h-3 rounded-full bg-gradient-to-br from-[#8efcc4] to-[var(--primary)] shadow-[0_0_10px_rgba(123,141,255,0.5)]"></span>
          Magassa Hub
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link href="/" className="text-sm font-medium hover:text-[var(--primary)] transition-colors relative group">
            Accueil
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/produits" className="text-sm font-medium hover:text-[var(--primary)] transition-colors relative group">
            Produits
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/a-propos" className="text-sm font-medium hover:text-[var(--primary)] transition-colors relative group">
            À propos
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full"></span>
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/checkout"
            className="relative p-2 rounded-lg text-[var(--muted)] hover:text-white hover:bg-white/5 transition-colors shrink-0"
            aria-label={`Panier${totalItems ? ` (${totalItems} articles)` : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-9.15h-15" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--primary)] text-[10px] font-black leading-[18px] text-center text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          <Link href="/produits" className="btn-primary text-white px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition-transform hover:scale-105 active:scale-95 whitespace-nowrap">
            Commencer
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-1.5 text-[var(--muted)] hover:text-white transition-colors" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[var(--background)] border-b border-[var(--border)] py-6 px-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-medium py-2 border-b border-[var(--border)]/30">Accueil</Link>
          <Link href="/produits" onClick={() => setIsOpen(false)} className="text-lg font-medium py-2 border-b border-[var(--border)]/30">Produits</Link>
          <Link href="/checkout" onClick={() => setIsOpen(false)} className="text-lg font-medium py-2 border-b border-[var(--border)]/30 flex items-center justify-between">
            Panier {totalItems > 0 ? <span className="text-sm font-black text-[var(--primary)]">({totalItems})</span> : null}
          </Link>
          <Link href="/a-propos" onClick={() => setIsOpen(false)} className="text-lg font-medium py-2 border-b border-[var(--border)]/30">À propos</Link>
        </div>
      )}
    </header>
  );
}
