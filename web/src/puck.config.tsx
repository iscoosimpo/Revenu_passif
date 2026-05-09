import React from "react";
import type { Config } from "@puckeditor/core";
import Link from "next/link";
import {
  DynamicProductGrid,
  NewsletterForm,
  DynamicHeroProduct,
  DynamicProductDetail,
  ProductPickerField,
} from "./components/client-blocks";
import { PuckSection, PuckColumns } from "./components/puck-layout";
import { supabase } from "@/lib/supabase";

// --- UTILS & COMPONENTS ---

const UniversalMediaPicker = ({ value, onChange, label = "Média" }: { value: string | undefined; onChange: (val: string) => void; label?: string }) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const id = React.useId();

  return (
    <div className="py-4 space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label} - Lien Externe</label>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Lien (YouTube, TikTok, URL image...)"
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
        />
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-[9px] uppercase font-black text-gray-400 bg-transparent">
          <span className="px-2 bg-gray-50">OU</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Importer un fichier</label>
        <input
          type="file"
          id={id}
          className="hidden"
          accept="image/*,video/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            
            try {
              const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });
              const data = await res.json();
              if (data.url) {
                onChange(data.url);
              }
            } catch (err) {
              console.error("Upload error:", err);
            } finally {
              setIsUploading(false);
            }
          }}
        />
        <div className="flex gap-2">
          <label
            htmlFor={id}
            className={`
              flex-1 py-2.5 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest text-center cursor-pointer transition-all border
              ${isUploading ? "bg-gray-100 text-gray-400 border-gray-200 cursor-wait" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 shadow-sm"}
            `}
          >
            {isUploading ? "Chargement..." : "Choisir sur l'appareil"}
          </label>
          {value && (
            <button 
              onClick={() => onChange("")}
              className="px-3 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors"
              title="Supprimer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
        {value && value.startsWith("http") && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
             <div className="text-[9px] text-blue-600 font-bold truncate">Aperçu : {value}</div>
          </div>
        )}
      </div>
    </div>
  );
};

type Props = {
  Heading: { title: string; subtitle?: string; align?: "left" | "center" | "right"; level?: "h1" | "h2" | "h3"; color?: "white" | "primary" | "gradient" };
  Button: { label: string; url: string; variant?: "primary" | "secondary" | "outline"; size?: "sm" | "md" | "lg"; align?: "left" | "center" | "right"; fullWidth?: boolean; icon?: "none" | "arrow" | "external" };
  Spacer: { height: number; mobileHeight?: number };
  Columns: { distribution: "1/1" | "1/2" | "2/1" };
  ProductGrid: { limit: number; columns?: "2" | "3" | "4"; title?: string; showAll?: boolean };
  Section: { padding: "none" | "sm" | "md" | "lg"; background: "transparent" | "surface" | "dark" };
  
  // --- ULTRA COMPLETE BLOCKS ---
  SectionHero: { 
    title: string; 
    subtitle: string; 
    badge?: string;
    mediaUrl: string;
    mediaType: "image" | "video";
    primaryButton: { label: string; url: string };
    secondaryButton?: { label: string; url: string };
    overlayOpacity?: number;
    height?: "full" | "medium" | "compact";
  };
  SectionContent: { 
    title: string; 
    description: string; 
    badge?: string;
    mediaUrl: string;
    mediaType: "image" | "video";
    mediaPosition: "left" | "right";
    primaryButton?: { label: string; url: string };
    secondaryButton?: { label: string; url: string };
    background: "none" | "glass" | "surface";
  };
  SectionFeatures: { 
    title: string; 
    subtitle?: string; 
    columns: "2" | "3" | "4";
    items: { title: string; description: string; icon: string; image?: string }[] 
  };
  SectionTestimonials: { 
    title: string; 
    reviews: { author: string; role: string; content: string; rating: number; avatar?: string }[] 
  };
  SectionComparison: { 
    title: string; 
    headers: { text: string }[]; 
    rows: { feature: string; values: { text: string }[] }[] 
  };
  SectionPricing: { 
    title: string; 
    plans: { name: string; price: string; description: string; features: { text: string }[]; isPopular?: boolean; buttonLabel: string; buttonUrl: string }[] 
  };
  SectionTrust: { 
    title?: string; 
    logos: { url: string; alt?: string }[];
    variant?: "grid" | "marquee";
  };
  SectionFAQ: { 
    title: string; 
    items: { question: string; answer: string }[] 
  };
  SectionCountdown: { 
    title: string; 
    targetDate: string; 
    label?: string;
    bgColor?: "primary" | "dark" | "red";
  };
  SectionNewsletter: { 
    title: string; 
    subtitle: string; 
    buttonLabel: string; 
    placeholder: string;
  };

  ProductPageLayout: {
    productRef?: string;
    backLabel?: string;
    categoryLabel?: string;
    featuresTitle?: string;
    buttonLabel?: string;
    trustSignal1?: string;
    trustSignal2?: string;
    securityText?: string;
    benefits?: { text: string }[];
    _resolvedProduct?: any;
  };
  Divider: { style?: "solid" | "dashed" | "gradient"; color?: "border" | "primary" | "white"; thickness?: number; spacing?: "sm" | "md" | "lg" };
  Banner: { text: string; link?: string; linkLabel?: string; color?: "primary" | "warning" | "success" | "info" };
  Stats: { title?: string; items: { value: string; label: string; icon?: string }[] };
  Box: { title: string; content: string; padding: string; borderRadius: string };
  Media: { type: "image" | "video"; url: string; alt: string; caption: string; borderRadius: string; maxWidth: string };
  // --- LEGACY HOME PAGE BLOCKS (used by page.tsx) ---
  Hero: { title: string; subtitle: string; badge: string; buttonLabel: string; buttonUrl: string; variant?: "full" | "compact"; productId?: string; titleSize?: "normal" | "large" | "xl"; textAlign?: "left" | "center" };
  Features: { title: string; subtitle: string; features: { title: string; description: string; icon: string }[] };
  FeaturedProducts: { title: string; subtitle: string; limit?: number; showViewAll?: boolean };
  Testimonials: { title: string; subtitle: string; reviews: { author: string; content: string; role: string; rating?: number }[] };
  FAQ: { title: string; questions: { question: string; answer: string }[] };
};

export const config: Config<Props> = {
  components: {
    SectionHero: {
      fields: {
        badge: { type: "text" },
        title: { type: "text" },
        subtitle: { type: "textarea" },
        mediaUrl: {
          type: "custom",
          render: ({ value, onChange }) => <UniversalMediaPicker value={value} onChange={onChange} label="Média Principal" />
        },
        mediaType: {
          type: "radio",
          options: [{ label: "Image", value: "image" }, { label: "Vidéo", value: "video" }]
        },
        primaryButton: {
          type: "object",
          objectFields: { label: { type: "text" }, url: { type: "text" } }
        },
        secondaryButton: {
          type: "object",
          objectFields: { label: { type: "text" }, url: { type: "text" } }
        },
        height: {
          type: "radio",
          options: [{ label: "Plein Écran", value: "full" }, { label: "Moyen", value: "medium" }, { label: "Compact", value: "compact" }]
        },
        overlayOpacity: { type: "number" }
      },
      defaultProps: {
        title: "L'Anglais pour la Vraie Vie",
        subtitle: "Rejoignez une communauté de 80,000+ apprenants et transformez votre futur avec notre méthode éprouvée.",
        mediaType: "video",
        mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-people-working-in-a-sunny-office-4338-large.mp4",
        primaryButton: { label: "Commencer Maintenant", url: "/produits" },
        height: "medium",
        overlayOpacity: 0.6
      },
      render: ({ title, subtitle, badge, mediaUrl, mediaType, primaryButton, secondaryButton, height = "medium", overlayOpacity = 0.6 }) => {
        const heightClass = height === "full" ? "h-screen" : height === "medium" ? "h-[80vh] min-h-[600px]" : "h-[60vh] min-h-[400px]";
        return (
          <section className={`relative w-full ${heightClass} flex items-center justify-center overflow-hidden`}>
            {mediaUrl && (
              mediaType === "video" ? (
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                  <source src={mediaUrl} type="video/mp4" />
                </video>
              ) : (
                <img src={mediaUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
              )
            )}
            <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-8">
              {badge && (
                <span className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-black uppercase tracking-widest animate-pulse">
                  {badge}
                </span>
              )}
              <h1 className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl">
                {title}
              </h1>
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto font-medium">
                {subtitle}
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-4">
                {primaryButton.label && (
                  <Link href={primaryButton.url || "#"} className="btn-primary text-white px-12 py-6 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-[var(--primary)]/40">
                    {primaryButton.label}
                  </Link>
                )}
                {secondaryButton?.label && (
                  <Link href={secondaryButton.url || "#"} className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-12 py-6 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-white/20 transition-all">
                    {secondaryButton.label}
                  </Link>
                )}
              </div>
            </div>
          </section>
        );
      }
    },
    SectionContent: {
      fields: {
        badge: { type: "text" },
        title: { type: "text" },
        description: { type: "textarea" },
        mediaUrl: {
          type: "custom",
          render: ({ value, onChange }) => <UniversalMediaPicker value={value} onChange={onChange} label="Image/Vidéo d'accompagnement" />
        },
        mediaType: {
          type: "radio",
          options: [{ label: "Image", value: "image" }, { label: "Vidéo", value: "video" }]
        },
        mediaPosition: {
          type: "radio",
          options: [{ label: "Gauche", value: "left" }, { label: "Droite", value: "right" }]
        },
        background: {
          type: "radio",
          options: [{ label: "Aucun", value: "none" }, { label: "Effet Verre", value: "glass" }, { label: "Surface", value: "surface" }]
        },
        primaryButton: {
          type: "object",
          objectFields: { label: { type: "text" }, url: { type: "text" } }
        },
        secondaryButton: {
          type: "object",
          objectFields: { label: { type: "text" }, url: { type: "text" } }
        }
      },
      defaultProps: {
        badge: "Qualité Premium",
        title: "Notre Engagement pour l'Excellence",
        description: "Nous croyons que chaque produit doit raconter une histoire de passion et de savoir-faire. C'est pourquoi nous sélectionnons rigoureusement chaque pièce.",
        mediaType: "image",
        mediaUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200",
        mediaPosition: "right",
        background: "none"
      },
      render: ({ badge, title, description, mediaUrl, mediaType, mediaPosition, background, primaryButton, secondaryButton }) => {
        const isReversed = mediaPosition === "left";
        const bgClass = background === "glass" ? "bg-white/[0.02] backdrop-blur-xl border-y border-white/5" : background === "surface" ? "bg-[var(--surface)]" : "bg-transparent";
        return (
          <section className={`w-full py-24 px-4 md:px-12 lg:px-20 ${bgClass}`}>
            <div className={`max-w-7xl mx-auto flex flex-col ${isReversed ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-16 lg:gap-24`}>
              <div className="flex-1 space-y-8 text-left">
                {badge && <span className="text-[var(--primary)] text-xs font-black uppercase tracking-[0.3em]">{badge}</span>}
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">{title}</h2>
                <p className="text-[var(--muted)] text-xl leading-relaxed">{description}</p>
                <div className="flex flex-wrap gap-6 pt-4">
                  {primaryButton?.label && (
                    <Link href={primaryButton.url || "#"} className="btn-primary text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[var(--primary)]/20 hover:-translate-y-1 transition-all">
                      {primaryButton.label}
                    </Link>
                  )}
                  {secondaryButton?.label && (
                    <Link href={secondaryButton.url || "#"} className="bg-white/5 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">
                      {secondaryButton.label}
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex-1 w-full relative group">
                <div className="relative aspect-square md:aspect-[4/3] lg:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 isolate group-hover:scale-[1.02] transition-transform duration-700">
                  {mediaUrl && (
                    mediaType === "image" ? (
                      <img src={mediaUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-black flex items-center justify-center">
                        {mediaUrl.includes("youtube") ? (
                          <iframe className="w-full h-full" src={mediaUrl.replace("watch?v=", "embed/")} frameBorder="0" allowFullScreen />
                        ) : (
                          <video src={mediaUrl} controls className="w-full h-full object-cover" />
                        )}
                      </div>
                    )
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className={`absolute -z-10 w-80 h-80 bg-[var(--primary)]/20 blur-[120px] rounded-full ${isReversed ? "-left-20 -bottom-20" : "-right-20 -bottom-20"}`} />
              </div>
            </div>
          </section>
        );
      }
    },
    SectionFeatures: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        columns: {
          type: "radio",
          options: [{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }]
        },
        items: {
          type: "array",
          getItemSummary: (item) => item.title,
          arrayFields: {
            title: { type: "text" },
            description: { type: "textarea" },
            icon: { type: "text", label: "Icône (SVG ou Emoji)" },
            image: {
              type: "custom",
              render: ({ value, onChange }) => <UniversalMediaPicker value={value} onChange={onChange} label="Illustration (Optionnelle)" />
            }
          }
        }
      },
      defaultProps: {
        title: "Pourquoi nous choisir ?",
        subtitle: "L'excellence au service de votre apprentissage et de votre succès quotidien.",
        columns: "3",
        items: [
          { title: "Rapide", description: "Apprenez en un temps record avec notre méthode optimisée.", icon: "⚡" },
          { title: "Pratique", description: "Axé sur le quotidien réel pour une application immédiate.", icon: "💡" },
          { title: "Support", description: "Une équipe d'experts à votre écoute 24h/24 et 7j/7.", icon: "📞" }
        ]
      },
      render: ({ title, subtitle, columns = "3", items }) => (
        <section className="w-full py-24 px-4 md:px-12 lg:px-20 bg-transparent">
          <div className="max-w-7xl mx-auto text-center">
            {title && <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">{title}</h2>}
            {subtitle && <p className="text-xl text-[var(--muted)] mb-20 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-10`}>
              {items.map((item, i) => (
                <div key={i} className="group p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-[var(--primary)]/30 transition-all duration-500 hover:-translate-y-3 relative overflow-hidden text-left">
                  {item.image && <img src={item.image} className="w-full h-40 object-cover rounded-2xl mb-8 opacity-80 group-hover:opacity-100 transition-opacity" alt="" />}
                  {!item.image && <div className="text-5xl mb-8 group-hover:scale-125 transition-transform duration-500 inline-block drop-shadow-lg">{item.icon}</div>}
                  <h3 className="text-2xl font-black text-white mb-4 group-hover:text-[var(--primary)] transition-colors">{item.title}</h3>
                  <p className="text-[var(--muted)] leading-relaxed text-lg">{item.description}</p>
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-8xl font-black">{i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    },
    SectionPricing: {
      fields: {
        title: { type: "text" },
        plans: {
          type: "array",
          arrayFields: {
            name: { type: "text" },
            price: { type: "text" },
            description: { type: "text" },
            features: { type: "array", arrayFields: { text: { type: "text" } } },
            isPopular: { type: "radio", options: [{ label: "Non", value: false }, { label: "Oui", value: true }] },
            buttonLabel: { type: "text" },
            buttonUrl: { type: "text" }
          }
        }
      },
      defaultProps: {
        title: "Nos Plans d'Abonnement",
        plans: [
          { name: "Essentiel", price: "29€", description: "Pour débuter sereinement", features: [{ text: "Accès à 5 cours" }, { text: "Support par email" }, { text: "Ebook offert" }], buttonLabel: "Choisir Essentiel", buttonUrl: "#" },
          { name: "Premium", price: "59€", description: "Le meilleur rapport qualité/prix", features: [{ text: "Accès illimité" }, { text: "Support Prioritaire" }, { text: "Webinaires mensuels" }, { text: "Certificat inclus" }], isPopular: true, buttonLabel: "Devenir Premium", buttonUrl: "#" },
          { name: "Elite", price: "99€", description: "Pour les plus ambitieux", features: [{ text: "Tout le Premium" }, { text: "Coaching 1:1" }, { text: "Accès VIP événements" }], buttonLabel: "Rejoindre l'Elite", buttonUrl: "#" }
        ]
      },
      render: ({ title, plans }) => (
        <section className="w-full py-24 px-4 md:px-12 lg:px-20 bg-transparent text-center">
          <div className="max-w-7xl mx-auto">
            {title && <h2 className="text-4xl md:text-6xl font-black text-white mb-20 tracking-tighter">{title}</h2>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-end">
              {plans.map((plan, i) => (
                <div key={i} className={`relative p-10 rounded-[3rem] border ${plan.isPopular ? "bg-[var(--primary)]/5 border-[var(--primary)] shadow-2xl shadow-[var(--primary)]/20 scale-105 z-10 py-16" : "bg-white/[0.02] border-white/10"} flex flex-col group transition-all duration-500`}>
                  {plan.isPopular && <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--primary)] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-lg">Le plus populaire</span>}
                  <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{plan.name}</h3>
                  <p className="text-[var(--muted)] text-sm mb-8 font-medium">{plan.description}</p>
                  <div className="flex justify-center items-baseline gap-1 mb-10">
                    <span className="text-6xl font-black text-white tracking-tighter">{plan.price}</span>
                    <span className="text-[var(--muted)] font-bold">/mois</span>
                  </div>
                  <ul className="space-y-5 mb-12 text-left flex-1">
                    {plan.features.map((f: any, j: number) => (
                      <li key={j} className="flex items-center gap-4 text-white/90">
                        <div className="bg-green-500/20 p-1 rounded-full">
                           <svg className="text-green-400 shrink-0" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <span className="text-sm font-semibold">{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.buttonUrl || "#"} className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm transition-all duration-300 ${plan.isPopular ? "bg-[var(--primary)] text-white hover:brightness-110 shadow-xl shadow-[var(--primary)]/30" : "bg-white/10 text-white hover:bg-white/20 border border-white/10"}`}>
                    {plan.buttonLabel}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    },
    SectionComparison: {
      fields: {
        title: { type: "text" },
        headers: { type: "array", arrayFields: { text: { type: "text" } } },
        rows: {
          type: "array",
          arrayFields: {
            feature: { type: "text" },
            values: { type: "array", arrayFields: { text: { type: "text" } } }
          }
        }
      },
      defaultProps: {
        title: "Pourquoi nous surpassons la concurrence",
        headers: [{ text: "Fonctionnalité" }, { text: "Notre Solution" }, { text: "Standard" }, { text: "Autre" }],
        rows: [
          { feature: "Méthode Interactive", values: [{ text: "Oui" }, { text: "Non" }, { text: "Partiel" }] },
          { feature: "Support 24/7", values: [{ text: "Oui" }, { text: "Non" }, { text: "Email" }] },
          { feature: "Accès à Vie", values: [{ text: "Oui" }, { text: "Abonnement" }, { text: "Abonnement" }] },
          { feature: "Mises à jour", values: [{ text: "Gratuites" }, { text: "Payantes" }, { text: "Non" }] }
        ]
      },
      render: ({ title, headers, rows }) => (
        <section className="w-full py-24 px-4 md:px-12 lg:px-20 overflow-x-auto">
          <div className="max-w-5xl mx-auto">
            {title && <h2 className="text-4xl font-black text-white text-center mb-16 tracking-tighter uppercase">{title}</h2>}
            <div className="w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/[0.01] backdrop-blur-sm shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    {headers.map((h: any, i: number) => (
                      <th key={i} className="p-8 text-xs font-black text-white uppercase tracking-[0.3em]">
                        {h.text}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="p-8 text-white font-bold text-sm tracking-tight">{row.feature}</td>
                      {row.values.map((v: any, j: number) => (
                        <td key={j} className={`p-8 text-sm font-medium ${j === 0 ? "text-[var(--primary)] font-black" : "text-[var(--muted)]"}`}>
                          {v.text === "Oui" || v.text === "true" ? (
                            <svg className="text-green-400" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          ) : v.text === "Non" || v.text === "false" ? (
                            <svg className="text-red-400/50" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                          ) : v.text}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )
    },
    SectionTestimonials: {
      fields: {
        title: { type: "text" },
        reviews: {
          type: "array",
          arrayFields: {
            author: { type: "text" },
            role: { type: "text" },
            content: { type: "textarea" },
            rating: { type: "number" },
            avatar: {
               type: "custom",
               render: ({ value, onChange }) => <UniversalMediaPicker value={value} onChange={onChange} label="Avatar" />
            }
          }
        }
      },
      defaultProps: {
        title: "Ce que disent nos apprenants",
        reviews: [
          { author: "Marc D.", role: "CEO @ TechFlow", content: "Cette méthode a littéralement changé ma façon d'apprendre. C'est intuitif et extrêmement rapide.", rating: 5, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200" },
          { author: "Sarah L.", role: "Freelance", content: "Le support est incroyable et le contenu est d'une qualité rare. Je recommande à 1000%.", rating: 5, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" }
        ]
      },
      render: ({ title, reviews }) => (
        <section className="w-full py-24 px-4 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-20 tracking-tighter">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((rev, i) => (
                <div key={i} className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 text-left relative overflow-hidden group hover:border-[var(--primary)]/30 transition-all duration-500">
                  <div className="flex gap-1 mb-6 text-yellow-500">
                    {[...Array(5)].map((_, j) => (
                       <svg key={j} width="16" height="16" fill={j < rev.rating ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    ))}
                  </div>
                  <p className="text-[var(--muted)] text-lg italic leading-relaxed mb-10 relative z-10">&ldquo;{rev.content}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <img src={rev.avatar || "https://ui-avatars.com/api/?name=" + rev.author} className="w-14 h-14 rounded-full border-2 border-[var(--primary)]/30 object-cover" alt={rev.author} />
                    <div>
                      <h4 className="text-white font-black">{rev.author}</h4>
                      <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest">{rev.role}</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                     <svg width="150" height="150" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C15.4647 8 15.017 8.44772 15.017 9V12C15.017 12.5523 14.5693 13 14.017 13H13.017C12.4647 13 12.017 12.5523 12.017 12V9C12.017 7.34315 13.3601 6 15.017 6H19.017C20.6738 6 22.017 7.34315 22.017 9V15C22.017 16.6569 20.6738 18 19.017 18H16.017V21H14.017ZM2.01697 21L2.01697 18C2.01697 16.8954 2.91241 16 4.01697 16H7.01697C7.56925 16 8.01697 15.5523 8.01697 15V9C8.01697 8.44772 7.56925 8 7.01697 8H4.01697C3.46468 8 3.01697 8.44772 3.01697 9V12C3.01697 12.5523 2.56925 13 2.01697 13H1.01697C0.464684 13 0.0169678 12.5523 0.0169678 12V9C0.0169678 7.34315 1.36011 6 3.01697 6H7.01697C8.67383 6 10.017 7.34315 10.017 9V15C10.017 16.6569 8.67383 18 7.01697 18H4.01697V21H2.01697Z"/></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    },
    SectionTrust: {
      fields: {
        title: { type: "text" },
        variant: { type: "radio", options: [{ label: "Grille", value: "grid" }, { label: "Défilé", value: "marquee" }] },
        logos: {
          type: "array",
          arrayFields: {
            url: {
               type: "custom",
               render: ({ value, onChange }) => <UniversalMediaPicker value={value} onChange={onChange} label="Logo" />
            },
            alt: { type: "text" }
          }
        }
      },
      defaultProps: {
        title: "ILS NOUS FONT CONFIANCE",
        variant: "marquee",
        logos: [
          { url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", alt: "Amazon" },
          { url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", alt: "Google" },
          { url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", alt: "Netflix" },
          { url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg", alt: "Slack" }
        ]
      },
      render: ({ title, logos, variant = "marquee" }) => (
        <section className="w-full py-16 overflow-hidden">
          {title && <h3 className="text-center text-xs font-black text-white/30 uppercase tracking-[0.5em] mb-12">{title}</h3>}
          {variant === "marquee" ? (
             <div className="flex w-full overflow-hidden group">
               <div className="flex gap-20 animate-marquee items-center group-hover:pause grayscale brightness-200 contrast-0 opacity-40">
                 {[...logos, ...logos].map((logo, i) => (
                   <img key={i} src={logo.url} alt={logo.alt} className="h-8 md:h-10 object-contain flex-shrink-0" />
                 ))}
               </div>
             </div>
          ) : (
             <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-12 md:gap-24 grayscale brightness-200 contrast-0 opacity-40 px-6">
                {logos.map((logo, i) => (
                   <img key={i} src={logo.url} alt={logo.alt} className="h-8 md:h-12 object-contain" />
                 ))}
             </div>
          )}
        </section>
      )
    },
    SectionFAQ: {
      fields: {
        title: { type: "text" },
        items: {
          type: "array",
          getItemSummary: (item) => item.question,
          arrayFields: {
            question: { type: "text" },
            answer: { type: "textarea" }
          }
        }
      },
      defaultProps: {
        title: "Questions Fréquentes",
        items: [
          { question: "Comment ça marche ?", answer: "Notre plateforme est conçue pour être la plus simple possible. Vous choisissez votre cours, vous réglez et vous accédez immédiatement au contenu." },
          { question: "Est-ce sécurisé ?", answer: "Oui, tous les paiements sont cryptés et sécurisés via nos partenaires bancaires certifiés." }
        ]
      },
      render: ({ title, items }) => (
        <section className="w-full py-24 px-4 md:px-12 lg:px-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-white text-center mb-16 tracking-tight">{title}</h2>
            <div className="space-y-4">
              {items.map((item, i) => (
                <details key={i} className="group bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all">
                  <summary className="p-8 text-xl font-bold text-white cursor-pointer list-none flex justify-between items-center group-open:bg-white/[0.02]">
                    {item.question}
                    <svg className="group-open:rotate-180 transition-transform duration-300" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                  </summary>
                  <div className="p-8 pt-0 text-[var(--muted)] leading-relaxed text-lg whitespace-pre-wrap">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )
    },
    SectionCountdown: {
      fields: {
        title: { type: "text" },
        label: { type: "text" },
        targetDate: { type: "text" },
        bgColor: { type: "radio", options: [{ label: "Primaire", value: "primary" }, { label: "Sombre", value: "dark" }, { label: "Rouge", value: "red" }] }
      },
      defaultProps: {
        title: "⚡ OFFRE LIMITÉE",
        label: "DÉPÊCHEZ-VOUS, L'OFFRE SE TERMINE DANS :",
        targetDate: new Date(Date.now() + 172800000).toISOString(),
        bgColor: "primary"
      },
      render: ({ title, label, targetDate, bgColor = "primary" }) => {
        const bgClass = bgColor === "primary" ? "bg-[var(--primary)]" : bgColor === "red" ? "bg-red-600" : "bg-black/40 backdrop-blur-xl border border-white/10";
        return (
          <section className="w-full py-16 px-4 md:px-12 lg:px-20 text-center">
            <div className={`${bgClass} rounded-[3rem] p-12 md:p-16 shadow-2xl relative overflow-hidden`}>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter italic uppercase">{title}</h2>
              <p className="text-white/80 font-black uppercase tracking-[0.3em] text-xs mb-10">{label}</p>
              <div className="flex justify-center items-center gap-4 md:gap-10">
                {["02", "14", "55", "08"].map((v, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-4xl md:text-8xl font-black text-white tabular-nums tracking-tighter drop-shadow-xl">{v}</div>
                    <div className="text-[10px] md:text-xs font-black text-white/50 uppercase mt-2 tracking-[0.2em]">
                      {["Jours", "Heures", "Min", "Sec"][i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }
    },
    SectionNewsletter: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        buttonLabel: { type: "text" },
        placeholder: { type: "text" },
      },
      defaultProps: {
        title: "Rejoignez l'élite",
        subtitle: "Recevez nos meilleurs conseils et des offres exclusives directement dans votre boîte mail.",
        buttonLabel: "S'inscrire Maintenant",
        placeholder: "votre@email.com",
      },
      render: ({ title, subtitle, buttonLabel, placeholder }) => (
        <section className="py-24 px-4 md:px-12 lg:px-20">
          <div className="bg-gradient-to-br from-black via-gray-900 to-black rounded-[4rem] p-16 md:p-24 text-center border border-white/5 shadow-2xl relative overflow-hidden isolate">
            <div className="absolute top-0 left-0 w-full h-full bg-[var(--primary)] opacity-[0.03] pointer-events-none" />
            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter">{title}</h2>
            <p className="text-xl text-[var(--muted)] mb-12 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
            <div className="max-w-md mx-auto relative z-10">
              <NewsletterForm buttonLabel={buttonLabel} placeholder={placeholder} />
            </div>
            <div className="mt-8 text-[10px] text-white/20 font-bold uppercase tracking-widest">Désinscription possible à tout moment • Pas de spam</div>
          </div>
        </section>
      )
    },

    // --- BASE BLOCKS ---
    Heading: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        level: {
          type: "radio",
          options: [{ label: "H1", value: "h1" }, { label: "H2", value: "h2" }, { label: "H3", value: "h3" }]
        },
        align: {
          type: "radio",
          options: [{ label: "Gauche", value: "left" }, { label: "Centre", value: "center" }, { label: "Droite", value: "right" }]
        },
        color: {
          type: "radio",
          options: [{ label: "Blanc", value: "white" }, { label: "Primaire", value: "primary" }, { label: "Dégradé", value: "gradient" }]
        }
      },
      defaultProps: { title: "Titre de la Section", align: "center", level: "h2", color: "white" },
      render: ({ title, subtitle, align = "center", level = "h2", color = "white" }) => {
        const Tag = level;
        const alignClass = align === "center" ? "text-center mx-auto" : align === "right" ? "text-right ml-auto" : "text-left";
        const colorClass = color === "primary" ? "text-[var(--primary)]" : color === "gradient" ? "text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-purple-400 font-black" : "text-white";
        return (
          <div className={`w-full px-4 md:px-12 lg:px-20 ${alignClass} py-12`}>
            <Tag className={`${level === "h1" ? "text-5xl md:text-8xl" : level === "h2" ? "text-4xl md:text-6xl" : "text-2xl md:text-4xl"} font-black mb-6 leading-tight tracking-tighter ${colorClass}`}>
              {title}
            </Tag>
            {subtitle && <p className="text-xl md:text-2xl text-[var(--muted)] max-w-3xl leading-relaxed mx-auto font-medium">{subtitle}</p>}
          </div>
        );
      }
    },
    Button: {
      fields: {
        label: { type: "text" },
        url: { type: "text" },
        variant: {
          type: "radio",
          options: [{ label: "Primaire", value: "primary" }, { label: "Secondaire", value: "secondary" }, { label: "Outline", value: "outline" }]
        },
        size: {
          type: "radio",
          options: [{ label: "Petit", value: "sm" }, { label: "Moyen", value: "md" }, { label: "Grand", value: "lg" }]
        },
        align: {
          type: "radio",
          options: [{ label: "Gauche", value: "left" }, { label: "Centre", value: "center" }, { label: "Droite", value: "right" }]
        },
        fullWidth: { type: "radio", options: [{ label: "Non", value: false }, { label: "Oui", value: true }] }
      },
      defaultProps: { label: "Cliquez ici", url: "#", variant: "primary", size: "md", align: "center" },
      render: ({ label, url, variant = "primary", size = "md", align = "center", fullWidth }) => {
        const baseClass = "inline-flex items-center justify-center font-black uppercase tracking-widest transition-all duration-300 rounded-2xl";
        const variantClass = variant === "primary" ? "bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20 hover:scale-105" : variant === "secondary" ? "bg-white text-black hover:bg-gray-100" : "border-2 border-white/20 text-white hover:bg-white/5";
        const sizeClass = size === "sm" ? "px-6 py-3 text-xs" : size === "md" ? "px-10 py-5 text-sm" : "px-16 py-7 text-lg";
        const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
        return (
          <div className={`w-full px-4 md:px-12 lg:px-20 py-4 ${alignClass}`}>
            <Link href={url || "#"} className={`${baseClass} ${variantClass} ${sizeClass} ${fullWidth ? "w-full" : ""}`}>
              {label}
            </Link>
          </div>
        );
      }
    },
    ProductGrid: {
      fields: {
        title: { type: "text" },
        limit: { type: "number" },
        columns: {
          type: "radio",
          options: [{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }]
        },
        showAll: { type: "radio", options: [{ label: "Oui", value: true }, { label: "Non", value: false }] }
      },
      defaultProps: { title: "Nos Produits Vedettes", limit: 6, columns: "3", showAll: true },
      render: ({ title, limit, columns = "3", showAll }) => (
        <section className="w-full py-20 px-4 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            {title && <h2 className="text-4xl md:text-6xl font-black text-white text-center mb-16 tracking-tighter">{title}</h2>}
            <DynamicProductGrid limit={limit} columns={columns as any} />
            {showAll && (
               <div className="text-center mt-16">
                 <Link href="/produits" className="inline-block border-b-2 border-[var(--primary)] text-[var(--primary)] font-black uppercase tracking-[0.3em] pb-1 hover:opacity-70 transition-opacity">
                    Voir tout le catalogue
                 </Link>
               </div>
            )}
          </div>
        </section>
      )
    },
    Banner: {
      fields: {
        text: { type: "text" },
        link: { type: "text" },
        linkLabel: { type: "text" },
        color: {
          type: "radio",
          options: [
            { label: "Primaire", value: "primary" },
            { label: "Alerte", value: "warning" },
            { label: "Succès", value: "success" },
            { label: "Info", value: "info" },
          ]
        }
      },
      defaultProps: { text: "🎉 Offre spéciale — 50% de réduction aujourd'hui seulement !", link: "/produits", linkLabel: "En profiter →", color: "primary" },
      render: ({ text, link, linkLabel, color = "primary" }) => {
        const bgClass = color === "warning" ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
          : color === "success" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
            : color === "info" ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
              : "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]";
        return (
          <div className={`w-full border-b ${bgClass} py-4 px-4 text-center text-sm font-black uppercase tracking-widest`}>
            <span>{text}</span>
            {link && linkLabel && (
              <Link href={link || "#"} className="ml-4 underline underline-offset-4 decoration-2 hover:opacity-70 transition-opacity">
                {linkLabel}
              </Link>
            )}
          </div>
        );
      }
    },
    Stats: {
      fields: {
        title: { type: "text" },
        items: {
          type: "array",
          getItemSummary: (item: { value: string; label: string; icon?: string }) => item.label || "Stat",
          arrayFields: {
            value: { type: "text" },
            label: { type: "text" },
            icon: { type: "text" },
          }
        }
      },
      defaultProps: {
        title: "",
        items: [
          { value: "80 000+", label: "Apprenants", icon: "👥" },
          { value: "4.9★", label: "Note moyenne", icon: "⭐" },
          { value: "50+", label: "Ressources", icon: "📚" },
          { value: "98%", label: "Satisfaction", icon: "✅" },
        ]
      },
      render: ({ title, items }) => (
        <section className="w-full py-16 px-4 md:px-12 lg:px-20">
          {title && <h2 className="text-3xl font-black text-white text-center mb-16 tracking-tighter">{title}</h2>}
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {items.map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-10 text-center hover:border-[var(--primary)]/30 transition-all hover:-translate-y-2 group">
                {item.icon && <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">{item.icon}</div>}
                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">{item.value}</div>
                <div className="text-xs text-[var(--muted)] font-black uppercase tracking-[0.2em]">{item.label}</div>
              </div>
            ))}
          </div>
        </section>
      )
    },
    Divider: {
      fields: {
        style: { type: "radio", options: [{ label: "Plein", value: "solid" }, { label: "Tirés", value: "dashed" }, { label: "Dégradé", value: "gradient" }] },
        color: { type: "radio", options: [{ label: "Bordure", value: "border" }, { label: "Primaire", value: "primary" }, { label: "Blanc", value: "white" }] },
        thickness: { type: "number" },
        spacing: { type: "radio", options: [{ label: "Petit", value: "sm" }, { label: "Moyen", value: "md" }, { label: "Grand", value: "lg" }] }
      },
      defaultProps: { style: "solid", color: "border", thickness: 1, spacing: "md" },
      render: ({ style = "solid", color = "border", thickness = 1, spacing = "md" }) => {
        const spacingClass = spacing === "sm" ? "py-4" : spacing === "lg" ? "py-20" : "py-10";
        const colorClass = color === "primary" ? "bg-[var(--primary)]" : color === "white" ? "bg-white" : "bg-[var(--border)]";
        if (style === "gradient") {
           return (
             <div className={`w-full px-4 md:px-12 lg:px-20 ${spacingClass}`}>
               <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
             </div>
           );
        }
        return (
          <div className={`w-full px-4 md:px-12 lg:px-20 ${spacingClass}`}>
            <div className={`w-full ${style === "dashed" ? "border-t border-dashed" : "h-[1px]"} ${colorClass}`} style={style === "solid" ? { height: thickness } : {}} />
          </div>
        );
      }
    },
    ProductPageLayout: {
      fields: {
        productRef: {
          type: "custom",
          render: ({ value, onChange }) => (
            <ProductPickerField value={value} onChange={onChange} />
          )
        },
        backLabel: { type: "text" },
        categoryLabel: { type: "text" },
        featuresTitle: { type: "text" },
        buttonLabel: { type: "text" },
        trustSignal1: { type: "text" },
        trustSignal2: { type: "text" },
        securityText: { type: "textarea" },
        benefits: {
          type: "array",
          arrayFields: {
            text: { type: "text" }
          }
        }
      },
      defaultProps: {
        backLabel: "Retour au catalogue",
        categoryLabel: "Produit Numérique",
        featuresTitle: "Ce que vous allez apprendre",
        buttonLabel: "Acheter Maintenant",
        trustSignal1: "Accès Immédiat",
        trustSignal2: "Paiement Sécurisé",
        securityText: "Paiement sécurisé via Mobile Money. Livraison immédiate par email."
      },
      resolveData: async ({ props }, { changed }) => {
        if (!props.productRef) return { props };
        if (changed && !changed.productRef && props._resolvedProduct) {
          return { props };
        }
        try {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          let query = supabase.from("products").select("*");
          if (uuidRegex.test(props.productRef)) {
            query = query.eq("id", props.productRef);
          } else {
            query = query.eq("slug", props.productRef);
          }
          const { data } = await query.maybeSingle();
          if (!data) return { props };
          const autoProps = { ...props };
          if (!props.benefits || props.benefits.length === 0) {
            autoProps.benefits = [
              { text: "Accès à vie au contenu numérique" },
              { text: "Support communautaire premium" },
              { text: "Mises à jour gratuites à vie" }
            ];
          }
          if (!props.categoryLabel) {
            autoProps.categoryLabel = data.category === "Ebook" ? "Ressource Numérique" : data.category || "Produit";
          }
          if (!props.backLabel) autoProps.backLabel = "Retour au catalogue";
          if (!props.trustSignal1) autoProps.trustSignal1 = "Paiement Sécurisé";
          if (!props.trustSignal2) autoProps.trustSignal2 = "Livraison Immédiate";
          return {
            props: {
              ...autoProps,
              _resolvedProduct: data
            }
          };
        } catch (e) {
          console.error("Error resolving product data:", e);
          return { props };
        }
      },
      render: (props) => (
        <section className="w-full bg-[var(--background)]">
          <DynamicProductDetail {...props} _resolvedProduct={props._resolvedProduct} />
        </section>
      )
    },
    Box: {
      fields: {
        title: { type: "text" },
        content: { type: "textarea" },
        padding: { type: "text" },
        borderRadius: { type: "text" },
      },
      defaultProps: {
        title: "Titre de la boîte",
        content: "Contenu de la boîte ici...",
        padding: "24px",
        borderRadius: "16px",
      },
      render: ({ title, content, padding, borderRadius }: Props["Box"]) => (
        <div className="w-full px-4 md:px-12 lg:px-20 my-8">
          <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] shadow-xl" style={{ padding, borderRadius }}>
            {title && <h2 className="text-3xl font-black text-white mb-6 tracking-tight">{title}</h2>}
            <p className="text-[var(--muted)] leading-relaxed whitespace-pre-wrap text-lg">{content}</p>
          </div>
        </div>
      )
    },
    Media: {
      fields: {
        type: { type: "radio", options: [{ label: "Image", value: "image" }, { label: "Vidéo", value: "video" }] },
        url: {
          type: "custom",
          render: ({ value, onChange }: { value: string | undefined; onChange: (val: string) => void }) => <UniversalMediaPicker value={value} onChange={onChange} label="Média Principal" />
        },
        alt: { type: "text" },
        caption: { type: "text" },
        borderRadius: { type: "text" },
        maxWidth: { type: "text" },
      },
      defaultProps: { type: "image", url: "", alt: "Description", caption: "", borderRadius: "2rem", maxWidth: "100%" },
      render: ({ type, url, alt, caption, borderRadius, maxWidth }: Props["Media"]) => (
        <div className="w-full px-4 md:px-12 lg:px-20 flex flex-col items-center my-12">
          <div className="overflow-hidden shadow-2xl w-full border border-white/5" style={{ borderRadius, maxWidth }}>
            {url ? (
              type === "image" ? (
                <img src={url} alt={alt} className="w-full h-auto" />
              ) : (
                <video src={url} controls className="w-full h-auto" />
              )
            ) : (
              <div className="bg-white/[0.02] p-24 text-center text-white/10 border border-dashed border-white/10 rounded-[2rem] font-black uppercase tracking-[0.3em]">
                Aucun média sélectionné
              </div>
            )}
          </div>
          {caption && <p className="text-sm text-[var(--muted)] mt-6 italic text-center font-medium tracking-wide">{caption}</p>}
        </div>
      )
    },

    Spacer: {
      fields: {
        height: { type: "number" },
        mobileHeight: { type: "number" }
      },
      defaultProps: { height: 48, mobileHeight: 24 },
      render: ({ height, mobileHeight }) => (
        <div style={{ height: `${mobileHeight || height}px` }} className="md:hidden" />
      )
    },
    Columns: {
      fields: {
        distribution: {
          type: "radio",
          options: [
            { label: "50 / 50", value: "1/1" },
            { label: "33 / 66", value: "1/2" },
            { label: "66 / 33", value: "2/1" }
          ]
        }
      },
      defaultProps: { distribution: "1/1" },
      render: ({ distribution }) => (
        <div className={`w-full px-4 md:px-12 lg:px-20 grid gap-8 ${distribution === "1/2" ? "md:grid-cols-[1fr_2fr]" : distribution === "2/1" ? "md:grid-cols-[2fr_1fr]" : "md:grid-cols-2"}`} />
      )
    },
    Section: {
      fields: {
        padding: {
          type: "radio",
          options: [
            { label: "Aucun", value: "none" },
            { label: "Petit", value: "sm" },
            { label: "Moyen", value: "md" },
            { label: "Grand", value: "lg" }
          ]
        },
        background: {
          type: "radio",
          options: [
            { label: "Transparent", value: "transparent" },
            { label: "Surface", value: "surface" },
            { label: "Sombre", value: "dark" }
          ]
        }
      },
      defaultProps: { padding: "md", background: "transparent" },
      render: ({ padding, background }) => {
        const padClass = padding === "none" ? "" : padding === "sm" ? "py-8" : padding === "lg" ? "py-32" : "py-16";
        const bgClass = background === "surface" ? "bg-[var(--surface)]" : background === "dark" ? "bg-black" : "bg-transparent";
        return <div className={`w-full ${padClass} ${bgClass}`} />;
      }
    },

    // =============================================
    // LEGACY HOME PAGE BLOCKS — Ne pas modifier
    // Ces blocs sont utilisés par src/app/page.tsx
    // =============================================
    Hero: {
      fields: {
        badge: { type: "text" },
        title: { type: "text" },
        subtitle: { type: "textarea" },
        buttonLabel: { type: "text" },
        buttonUrl: { type: "text" },
        variant: {
          type: "radio",
          options: [{ label: "Complet", value: "full" }, { label: "Compact", value: "compact" }]
        },
        textAlign: {
          type: "radio",
          options: [{ label: "Gauche", value: "left" }, { label: "Centre", value: "center" }]
        },
        titleSize: {
          type: "radio",
          options: [{ label: "Normal", value: "normal" }, { label: "Large", value: "large" }, { label: "XL", value: "xl" }]
        },
        productId: { type: "text" }
      },
      defaultProps: {
        badge: "Rejoint par +80 000 apprenants",
        title: "Oubliez les cours d'anglais ennuyeux.",
        subtitle: "Des guides simples, pratiques et axés sur la vraie vie.",
        buttonLabel: "Voir nos programmes",
        buttonUrl: "/produits",
        variant: "full",
        textAlign: "left",
        titleSize: "xl"
      },
      render: ({ badge, title, subtitle, buttonLabel, buttonUrl, variant = "full", textAlign = "left", titleSize = "xl", productId }) => {
        const titleSizeClass = titleSize === "xl" ? "text-5xl md:text-7xl lg:text-8xl" : titleSize === "large" ? "text-4xl md:text-6xl" : "text-3xl md:text-5xl";
        const alignClass = textAlign === "center" ? "text-center items-center" : "text-left items-start";
        return (
          <section className="w-full relative overflow-hidden py-16 md:py-24 lg:py-32 px-4 md:px-12 lg:px-20">
            <div className={`max-w-7xl mx-auto flex flex-col ${alignClass} gap-8 ${variant === "full" ? "md:flex-row md:items-center" : ""}`}>
              <div className={`flex-1 flex flex-col ${alignClass} gap-6`}>
                {badge && (
                  <span className="inline-block text-xs font-black uppercase tracking-[0.3em] text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-4 py-2 rounded-full">
                    {badge}
                  </span>
                )}
                <h1 className={`${titleSizeClass} font-black text-white leading-tight tracking-tighter`}>
                  {title}
                </h1>
                <p className="text-xl md:text-2xl text-[var(--muted)] max-w-2xl leading-relaxed font-medium">
                  {subtitle}
                </p>
                <Link href={buttonUrl || "#"} className="inline-block btn-primary text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-[var(--primary)]/30 self-start mt-2">
                  {buttonLabel}
                </Link>
              </div>
              {variant === "full" && (
                <div className="w-full md:flex-1">
                  <div className="md:hidden w-full">
                    <DynamicHeroProduct productId={productId} />
                  </div>
                  <div className="hidden md:block">
                    <div className="animated-border rounded-2xl md:float-card">
                      <DynamicHeroProduct productId={productId} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      }
    },
    Features: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        features: {
          type: "array",
          getItemSummary: (item) => item.title,
          arrayFields: {
            title: { type: "text" },
            description: { type: "textarea" },
            icon: { type: "text" }
          }
        }
      },
      defaultProps: {
        title: "Pourquoi notre méthode fonctionne ?",
        subtitle: "La méthode scolaire classique ne marche pas pour tout le monde.",
        features: [
          { title: "Zéro jargon inutile", description: "Les règles expliquées simplement.", icon: "1" },
          { title: "Prêt à l'emploi", description: "Des phrases utiles au quotidien.", icon: "2" },
          { title: "Pensé pour vous", description: "Cible les erreurs des francophones.", icon: "3" }
        ]
      },
      render: ({ title, subtitle, features }) => (
        <section className="w-full py-20 px-4 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto text-center">
            {title && <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">{title}</h2>}
            {subtitle && <p className="text-xl text-[var(--muted)] mb-16 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-[var(--primary)]/30 transition-all hover:-translate-y-2 text-left group">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-black text-xl mb-8 group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-4 group-hover:text-[var(--primary)] transition-colors">{f.title}</h3>
                  <p className="text-[var(--muted)] leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    },
    FeaturedProducts: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        limit: { type: "number" },
        showViewAll: { type: "radio", options: [{ label: "Oui", value: true }, { label: "Non", value: false }] }
      },
      defaultProps: {
        title: "Nos Meilleures Ressources",
        subtitle: "Sélectionnées pour vous aider à progresser rapidement.",
        limit: 4,
        showViewAll: true
      },
      render: ({ title, subtitle, limit = 4, showViewAll }) => (
        <section className="w-full py-20 px-4 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            {title && <h2 className="text-4xl font-black text-white text-center mb-4 tracking-tighter">{title}</h2>}
            {subtitle && <p className="text-[var(--muted)] text-center mb-16 max-w-xl mx-auto">{subtitle}</p>}
            <DynamicProductGrid limit={limit} />
            {showViewAll && (
              <div className="text-center mt-12">
                <Link href="/produits" className="inline-block border-b-2 border-[var(--primary)] text-[var(--primary)] font-black uppercase tracking-[0.3em] pb-1 hover:opacity-70 transition-opacity">
                  Voir tout le catalogue
                </Link>
              </div>
            )}
          </div>
        </section>
      )
    },
    Testimonials: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        reviews: {
          type: "array",
          getItemSummary: (item) => item.author,
          arrayFields: {
            author: { type: "text" },
            role: { type: "text" },
            content: { type: "textarea" },
            rating: { type: "number" }
          }
        }
      },
      defaultProps: {
        title: "Ils ont franchi le cap",
        subtitle: "Rejoignez des milliers de personnes qui ont déjà transformé leur apprentissage avec Magassa Hub.",
        reviews: [
          { author: "Sarah", role: "Étudiante en Business", content: "Grâce à English Mastery, j'ai enfin pu passer mes entretiens en anglais avec confiance.", rating: 5 },
          { author: "Marc", role: "Ingénieur", content: "Le meilleur investissement que j'ai fait cette année. Les phrases sont prêtes à l'emploi.", rating: 5 },
          { author: "Julie", role: "Voyageuse", content: "Fini la peur de parler ! Le guide m'a donné les bases solides dont j'avais besoin.", rating: 5 }
        ]
      },
      render: ({ title, subtitle, reviews }) => (
        <section className="w-full py-20 px-4 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto text-center">
            {title && <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">{title}</h2>}
            {subtitle && <p className="text-xl text-[var(--muted)] mb-16 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((rev, i) => (
                <div key={i} className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 text-left hover:border-[var(--primary)]/20 transition-all">
                  <div className="flex gap-1 mb-6 text-yellow-500">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="16" height="16" fill={j < (rev.rating ?? 5) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[var(--muted)] text-lg italic leading-relaxed mb-8">&ldquo;{rev.content}&rdquo;</p>
                  <div>
                    <h4 className="text-white font-black">{rev.author}</h4>
                    <p className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mt-1">{rev.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    },
    FAQ: {
      fields: {
        title: { type: "text" },
        questions: {
          type: "array",
          getItemSummary: (item) => item.question,
          arrayFields: {
            question: { type: "text" },
            answer: { type: "textarea" }
          }
        }
      },
      defaultProps: {
        title: "Questions fréquentes",
        questions: [
          { question: "Le livre est pour quel niveau ?", answer: "Notre méthode est conçue pour les niveaux débutants à intermédiaires qui souhaitent débloquer leur expression orale." },
          { question: "Je reçois le livre comment ?", answer: "Dès la validation de votre paiement, vous recevez un lien de téléchargement immédiat par email." },
          { question: "Puis-je lire le livre sur mon téléphone ?", answer: "Oui, le livre est au format PDF optimisé, lisible sur smartphone, tablette et ordinateur." },
          { question: "Quels sont les modes de paiement ?", answer: "Nous acceptons les paiements sécurisés par Mobile Money (Orange, Moov, MTN) et carte bancaire." }
        ]
      },
      render: ({ title, questions }) => (
        <section className="w-full py-20 px-4 md:px-12 lg:px-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-white text-center mb-16 tracking-tighter">{title}</h2>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <details key={i} className="group bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all">
                  <summary className="p-8 text-lg font-bold text-white cursor-pointer list-none flex justify-between items-center group-open:bg-white/[0.02]">
                    {q.question}
                    <svg className="group-open:rotate-180 transition-transform duration-300 shrink-0 ml-4" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="p-8 pt-0 text-[var(--muted)] leading-relaxed text-base">
                    {q.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )
    },
  },
  root: {
    render: ({ children }) => {
      return (
        <div className="puck-root bg-[var(--background)] min-h-screen font-sans selection:bg-[var(--primary)] selection:text-white">
          <div className="max-w-[2000px] mx-auto">
            {children}
          </div>
        </div>
      );
    }
  }
};
