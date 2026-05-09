"use client";

import { Puck, Data } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import { config } from "../../../puck.config";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function BuilderClient({
  initialData,
  page,
}: {
  initialData: Data | null;
  page: string;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  return (
    <div className="h-screen w-full relative">
      <Puck
        key={page}
        config={config}
        data={initialData ?? { content: [], root: {} }}
        overrides={{
          headerActions: ({ children }) => (
            <>
              <select
                className="bg-[var(--surface)] text-white border border-[var(--border)] rounded px-4 py-2 text-sm mr-4 outline-none cursor-pointer focus:border-[var(--primary)] font-bold shadow-lg"
                value={page}
                onChange={(e) => {
                  window.location.href = `/admin/builder?page=${e.target.value}`;
                }}
              >
                <option value="home">Page: Accueil</option>
                <option value="about">Page: À propos</option>
                <option value="products_list">Page: Liste des produits</option>
                <option value="product">Page: Modèle Produit</option>
              </select>

              <button
                onClick={async () => {
                  const { supabase } = await import("@/lib/supabase");
                  await supabase.auth.signOut();
                  window.location.href = "/admin/login";
                }}
                className="bg-red-500/10 text-red-500 border border-red-500/30 rounded px-4 py-2 text-sm mr-4 font-bold hover:bg-red-500/20 transition-colors shadow-lg"
              >
                Déconnexion
              </button>
              {children}
            </>
          )
        }}
        onPublish={async (data) => {
          setStatus("saving");
          try {
            const res = await fetch(`/api/puck?page=${page}`, {
              method: "POST",
              body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save");
            
            setStatus("success");
            setTimeout(() => setStatus("idle"), 3000);
          } catch (error) {
            console.error("Save error:", error);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 5000);
          }
        }}
      />

      {/* Premium Notification Toast */}
      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-0 left-1/2 z-[9999] pointer-events-none"
          >
            <div className={`
              px-6 py-3 rounded-full border shadow-2xl backdrop-blur-xl flex items-center gap-3
              ${status === "saving" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : ""}
              ${status === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : ""}
              ${status === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : ""}
            `}>
              {status === "saving" && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              {status === "success" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
              {status === "error" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              )}
              <span className="text-sm font-bold uppercase tracking-widest">
                {status === "saving" ? "Publication en cours..." : ""}
                {status === "success" ? "Publié avec succès !" : ""}
                {status === "error" ? "Erreur lors de la publication" : ""}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
