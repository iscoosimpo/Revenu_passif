import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const email = "sirikisuv@gmail.com";
  const password = "71638080Ss#";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "admin"
      }
    }
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ 
    message: "Compte admin créé avec succès !", 
    details: "Tu peux maintenant te connecter sur /admin/login. Pense à vérifier tes emails si la confirmation est activée dans Supabase." 
  });
}
