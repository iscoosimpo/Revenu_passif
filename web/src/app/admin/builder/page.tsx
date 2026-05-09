import type { Data } from "@puckeditor/core";
import { BuilderClient } from "./client";
import { supabase } from "@/lib/supabase";

type PuckPageData = {
  content: unknown[];
  root?: unknown;
};

function isPuckPageData(value: unknown): value is PuckPageData {
  return (
    typeof value === "object" &&
    value !== null &&
    "content" in value &&
    Array.isArray((value as { content?: unknown }).content)
  );
}

// Fetches the data on the Server
export default async function BuilderPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page || "home";

  let data: PuckPageData | null = null;

  try {
    const { data: dbData } = await supabase
      .from("puck_pages")
      .select("data")
      .eq("path", page)
      .maybeSingle();

    if (isPuckPageData(dbData?.data)) {
      data = dbData.data;
    }
  } catch {
    console.error("No puck data found in Supabase for " + page);
  }

  // If no data exists, load fallbacks
  if (!data || data.content.length === 0) {
    if (page === "home") {
      data = {
        content: [
          { type: "Hero", props: { id: "Hero-1", badge: "Rejoint par +80 000 apprenants", title: "Oubliez les cours d'anglais ennuyeux.", subtitle: "Des guides simples, pratiques et axés sur la vraie vie.", buttonLabel: "Voir nos programmes", buttonUrl: "/produits" } },
          { type: "Features", props: { id: "Features-1", title: "Pourquoi notre méthode fonctionne ?", subtitle: "La méthode scolaire classique ne marche pas pour tout le monde.", features: [{ title: "Zéro jargon inutile", description: "Les règles expliquées simplement.", icon: "1" }, { title: "Prêt à l'emploi", description: "Des phrases utiles au quotidien.", icon: "2" }, { title: "Pensé pour vous", description: "Cible les erreurs des francophones.", icon: "3" }] } },
          { type: "FeaturedProducts", props: { id: "FeaturedProducts-1", title: "Nos Ressources", subtitle: "Les outils indispensables pour votre réussite." } },
          { type: "Testimonials", props: { id: "Testimonials-1", title: "Ils ont franchi le cap", subtitle: "Rejoignez des milliers de personnes.", reviews: [{ author: "Sarah", role: "26 ans", content: "Super méthode !" }] } },
          { type: "FAQ", props: { id: "FAQ-1", title: "Questions fréquentes", questions: [{ question: "Le livre est pour quel niveau ?", answer: "Débutant à intermédiaire." }, { question: "Je reçois le livre comment ?", answer: "Par email." }] } }
        ],
        root: { props: { title: "Page d'Accueil" } },
      };
    } else if (page === "about") {
      data = {
        content: [
          { type: "Heading", props: { id: "h1", title: "À Propos de Magassa Hub", level: "h1", align: "center" } },
          { type: "Text", props: { id: "t1", content: "Bienvenue sur Magassa Hub, la plateforme dédiée à l'apprentissage de l'anglais pour la communauté francophone.", align: "center", size: "lg" } },
          { type: "Text", props: { id: "t2", content: "Avec plus de 80 000 abonnés sur TikTok, notre mission a toujours été de rendre l'apprentissage de l'anglais simple, accessible, et surtout, ancré dans la vie réelle.", align: "left", size: "base" } },
          { type: "Box", props: { id: "b1", title: "Notre Vision", content: "Nous croyons que tout le monde peut parler anglais avec confiance.", padding: "24px", borderRadius: "16px" } },
          { type: "Text", props: { id: "t3", content: "Derrière ces ressources se trouve une équipe passionnée.", align: "left", size: "base" } },
          { type: "Text", props: { id: "t4", content: "Si vous avez des questions, contactez-nous !", align: "left", size: "base" } }
        ],
        root: { props: { title: "Page À Propos" } },
      };
    } else if (page === "produits" || page === "products_list") {
      data = {
        content: [
          { type: "Hero", props: { id: "ProductsHero-1", badge: "Catalogue", title: "Tous nos Produits", subtitle: "Découvrez tous nos livres et ressources.", buttonLabel: "Retour Accueil", buttonUrl: "/" } },
          { type: "ProductGrid", props: { id: "ProductList-1", limit: 20 } }
        ],
        root: { props: { title: "Liste des Produits" } },
      };
    } else if (page === "product") {
      data = {
        content: [
          {
            type: "ProductPageLayout",
            props: {
              id: "ProductPageLayout-1",
              title: "Titre du produit (Modèle)",
              description: "Description du produit affichée ici.",
              price: "9 900 FCFA",
              featuresTitle: "Ce que vous allez apprendre :",
              buttonLabel: "Acheter Maintenant",
              securityText: "Paiement sécurisé via Mobile Money. Livraison immédiate par email."
            }
          }
        ],
        root: { props: { title: "Modèle Produit" } },
      };
    } else {
      data = { content: [], root: { props: { title: "Nouvelle page" } } };
    }
  }

  return <BuilderClient initialData={data as Data} page={page} />;
}
