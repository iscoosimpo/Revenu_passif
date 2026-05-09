import type { Data } from "@puckeditor/core";
import { Render } from "@puckeditor/core";
import { config } from "../../puck.config";
import fs from "fs";
import path from "path";

// Function to fetch Puck data server-side
async function getPuckData() {
  try {
    const filePath = path.join(process.cwd(), "puck_about.data.json");
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("No puck data found for about page");
  }
  
  // Default structure if no data exists
  return {
    content: [
      { type: "Heading", props: { id: "h1", title: "À Propos de Magassa Hub", level: "h1", align: "center" } },
      { type: "Text", props: { id: "t1", content: "Bienvenue sur Magassa Hub, la plateforme dédiée à l'apprentissage de l'anglais pour la communauté francophone.", align: "center", size: "lg" } },
      { type: "Text", props: { id: "t2", content: "Avec plus de 80 000 abonnés sur TikTok, notre mission a toujours été de rendre l'apprentissage de l'anglais simple, accessible, et surtout, ancré dans la vie réelle.", align: "left", size: "base" } },
      { type: "Box", props: { id: "b1", title: "Notre Vision", content: "Nous croyons que tout le monde peut parler anglais avec confiance.", padding: "24px", borderRadius: "16px" } },
      { type: "Text", props: { id: "t3", content: "Derrière ces ressources se trouve une équipe passionnée.", align: "left", size: "base" } },
      { type: "Text", props: { id: "t4", content: "Si vous avez des questions, contactez-nous !", align: "left", size: "base" } }
    ],
    root: { props: { title: "À Propos" } },
  };
}

export default async function AboutPage() {
  const data = await getPuckData();

  return (
    <div className="flex flex-col items-center w-full">
      <Render config={config} data={data as Data} />
    </div>
  );
}
