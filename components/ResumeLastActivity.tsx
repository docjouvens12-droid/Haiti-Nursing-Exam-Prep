"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type LastActivity = {
  category: string;
  question: string;
  answeredAt: string | null;
};

export default function ResumeLastActivity() {
  const pathname = usePathname();
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [activity, setActivity] = useState<LastActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname !== "/tableau-de-bord") return;

    const welcome = document.querySelector(".modern-welcome");
    if (!welcome?.parentNode) return;

    const existing = document.getElementById("resume-last-activity-host");
    if (existing) {
      setHost(existing as HTMLDivElement);
      return;
    }

    const element = document.createElement("div");
    element.id = "resume-last-activity-host";
    welcome.parentNode.insertBefore(element, welcome.nextSibling);
    setHost(element);

    return () => {
      element.remove();
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/tableau-de-bord") return;

    let active = true;
    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        if (active) setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_answers")
        .select("answered_at,questions(categorie,question)")
        .eq("user_id", auth.user.id)
        .order("answered_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;
      const q: any = Array.isArray((data as any)?.questions)
        ? (data as any)?.questions?.[0]
        : (data as any)?.questions;

      if (q) {
        setActivity({
          category: q.categorie || "Questions d’entraînement",
          question: q.question || "Continuez votre entraînement là où vous vous êtes arrêté.",
          answeredAt: (data as any)?.answered_at || null,
        });
      }
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [pathname]);

  if (pathname !== "/tableau-de-bord" || !host) return null;

  const content = (
    <section className="resume-activity-card" aria-label="Continuer la dernière activité">
      <div className="resume-activity-icon">↻</div>
      <div className="resume-activity-copy">
        <small>CONTINUER LÀ OÙ VOUS VOUS ÊTES ARRÊTÉ</small>
        {loading ? (
          <strong>Recherche de votre dernière activité…</strong>
        ) : activity ? (
          <>
            <strong>{activity.category}</strong>
            <p>{activity.question}</p>
          </>
        ) : (
          <>
            <strong>Commencez votre première série de QCM</strong>
            <p>Votre dernière activité apparaîtra ici automatiquement.</p>
          </>
        )}
      </div>
      <Link href="/pratique" className="resume-activity-button">
        {activity ? "Reprendre →" : "Commencer →"}
      </Link>

      <style jsx>{`
        .resume-activity-card{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:14px;align-items:center;background:linear-gradient(135deg,#0d67d6,#1654ad);color:#fff;border-radius:17px;padding:16px 18px;margin:0 0 14px;box-shadow:0 12px 28px rgba(20,91,184,.16)}
        .resume-activity-icon{width:44px;height:44px;border-radius:13px;background:rgba(255,255,255,.14);display:grid;place-items:center;font-size:22px;font-weight:900}
        .resume-activity-copy{min-width:0}.resume-activity-copy small{display:block;font-size:9px;font-weight:900;letter-spacing:.7px;color:#d9eaff;margin-bottom:4px}.resume-activity-copy strong{display:block;font-size:14px}.resume-activity-copy p{margin:4px 0 0;font-size:10px;line-height:1.45;color:#e5efff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:720px}
        .resume-activity-button{background:#fff;color:#0e5fc6;border-radius:10px;padding:10px 13px;font-size:10px;font-weight:900;white-space:nowrap}
        @media(max-width:800px){.resume-activity-card{grid-template-columns:40px minmax(0,1fr);padding:15px;border-radius:17px;gap:11px}.resume-activity-icon{width:40px;height:40px;border-radius:12px}.resume-activity-copy small{font-size:8px}.resume-activity-copy strong{font-size:13px}.resume-activity-copy p{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:10px}.resume-activity-button{grid-column:1/-1;text-align:center;padding:11px}}
      `}</style>
    </section>
  );

  return createPortal(content, host);
}
