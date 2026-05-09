import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const { error } = await supabase
      .from("leads")
      .insert([{ email, source: "newsletter" }]);

    if (error) {
      if (error.code === "23505") { // Duplicate email
        return NextResponse.json({ message: "Déjà inscrit !" });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Newsletter Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
