import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NightingaleChat from "@/components/NightingaleChat";

export default async function NightingalePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/connexion");

  return (
    <main className="container page">
      <div className="nav">
        <div>
          <div className="logo">Nightingale AI</div>
          <small className="muted">Votre assistante pédagogique en sciences infirmières.</small>
        </div>
        <Link href="/tableau-de-bord">Tableau de bord</Link>
      </div>
      <NightingaleChat />
    </main>
  );
}
