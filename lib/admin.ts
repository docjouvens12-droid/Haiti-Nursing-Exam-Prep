import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function exigerAdmin() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  const userId = String(claimsData.claims.sub);
  const { data: profil } = await supabase.from("profiles").select("id,nom_complet,role").eq("id", userId).single();
  if (!profil || profil.role !== "admin") redirect("/tableau-de-bord");
  return { supabase, profil };
}
