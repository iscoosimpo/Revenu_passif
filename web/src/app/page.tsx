import type { Data } from "@puckeditor/core";
import { Render } from "@puckeditor/core";
import { config } from "../puck.config";
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

// Function to fetch Puck data server-side
async function getPuckData() {
  try {
    const { data: dbData } = await supabase
      .from("puck_pages")
      .select("data")
      .eq("path", "home")
      .single();

    if (isPuckPageData(dbData?.data)) {
      return dbData.data;
    }
  } catch {
    console.error("No puck data found in Supabase, using default");
  }

  // Default structure if no data exists
  return {
    content: [
      { type: "Hero", props: { id: "Hero-1", badge: "Rejoint par +80 000 apprenants", title: "Oubliez les cours d'anglais ennuyeux.", subtitle: "Des guides simples, pratiques et axés sur la vraie vie.", buttonLabel: "Voir nos programmes", buttonUrl: "/produits" } },
      { type: "Features", props: { id: "Features-1", title: "Pourquoi notre méthode fonctionne ?", subtitle: "La méthode scolaire classique ne marche pas pour tout le monde.", features: [{ title: "Zéro jargon inutile", description: "Les règles expliquées simplement.", icon: "1" }, { title: "Prêt à l'emploi", description: "Des phrases utiles au quotidien.", icon: "2" }, { title: "Pensé pour vous", description: "Cible les erreurs des francophones.", icon: "3" }] } },
      {
        type: "Testimonials", props: {
          id: "Testimonials-1", title: "Ils ont franchi le cap", subtitle: "Rejoignez des milliers de personnes qui ont déjà transformé leur apprentissage avec Magassa Hub.", reviews: [
            { author: "Sarah", role: "Étudiante en Business", content: "Grâce à English Mastery, j'ai enfin pu passer mes entretiens en anglais avec confiance. La méthode est incroyablement directe et sans superflu." },
            { author: "Marc", role: "Ingénieur", content: "Le meilleur investissement que j'ai fait cette année. Les phrases sont prêtes à l'emploi et j'ai vu des progrès dès la première semaine." },
            { author: "Julie", role: "Voyageuse", content: "Fini la peur de parler ! Le guide m'a donné les bases solides dont j'avais besoin pour me faire comprendre partout dans le monde." }
          ]
        }
      },
      {
        type: "FAQ", props: {
          id: "FAQ-1", title: "Questions fréquentes", questions: [
            { question: "Le livre est pour quel niveau ?", answer: "Notre méthode est conçue pour les niveaux débutants à intermédiaires qui souhaitent débloquer leur expression orale." },
            { question: "Je reçois le livre comment ?", answer: "Dès la validation de votre paiement, vous recevez un lien de téléchargement immédiat par email." },
            { question: "Puis-je lire le livre sur mon téléphone ?", answer: "Oui, le livre est au format PDF optimisé, lisible sur smartphone, tablette et ordinateur." },
            { question: "Quels sont les modes de paiement ?", answer: "Nous acceptons les paiements sécurisés par Mobile Money (Orange, Moov, MTN) et carte bancaire." }
          ]
        }
      }
    ],
    root: {},
  };
}

export default async function Home() {
  const data = await getPuckData();

  return (
    <div className="w-full">
      <Render config={config} data={data as Data} />
    </div>
  );
}
