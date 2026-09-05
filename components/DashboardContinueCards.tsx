"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type LastActivity = {
  category: string;
};

export default function DashboardContinueCards() {
  const pathname = usePathname();
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [activity, setActivity] = useState<LastActivity | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname !== "/tableau-de-bord") return;
    const welcome = document.querySelector(".modern-welcome");
    if (!welcome?.parentNode) return;

    const oldButton = welcome.querySelector<HTMLElement>(".continue-button");
    if (oldButton) oldButton.style.display = "none";

    const existing = document.getElementById("dashboard-continue-cards-host");
    if (existing) {
      setHost(existing as HTMLDivElement);
      return;
    }

    const element = document.createElement("div");
    element.id = "dashboard-continue-cards-host";
    welcome.parentNode.insertBefore(element, welcome.nextSibling);
    setHost(element);

    return () => {
      if (oldButton) oldButton.style.display = "";
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

      const [{ data: last }, { count: questionCount }] = await Promise.all([
        supabase
          .from("user_answers")
          .select("answered_at,questions(categorie)")
          .eq("user_id", auth.user.id)
          .order("answered_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("questions").select("id", { count: "exact", head: true }),
      ]);

      if (!active) return;

      const q: any = Array.isArray((last as any)?.questions)
        ? (last as any)?.questions?.[0]
        : (last as any)?.questions;

      if (q) {
        setActivity({ category: q.categorie || "Questions d’entraînement" });
      }
      setTotalQuestions(questionCount ?? 0);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [pathname]);

  if (pathname !== "/tableau-de-bord" || !host) return null;

  return createPortal(
    <div className="continue-premium-grid" aria-label="Reprendre votre préparation">
      <Link href="/pratique" className="continue-premium-card practice-card">
        <span className="practice-art" aria-hidden="true">
          <span className="paper"><i /><i /><i /></span>
          <span className="pen">✎</span>
        </span>
        <span className="premium-copy">
          <small>ENTRAÎNEMENT</small>
          <strong>Continuer à pratiquer</strong>
          <p>Entraînez-vous avec des QCM adaptés à votre préparation.</p>
          <span className="practice-action">Commencer maintenant →</span>
        </span>
        <span className="question-count">
          <b>{totalQuestions.toLocaleString("fr-FR")}</b>
          <em>questions<br />disponibles</em>
        </span>
      </Link>

      <Link href="/pratique" className="continue-premium-card resume-card">
        <span className="books-art" aria-hidden="true">
          <span className="book blue" />
          <span className="book gold" />
          <span className="book navy" />
        </span>
        <span className="premium-copy resume-copy">
          <small>DERNIÈRE ACTIVITÉ</small>
          <strong>Continuer là où vous vous êtes arrêté</strong>
          <p>
            {loading
              ? "Recherche de votre dernière activité…"
              : activity
                ? activity.category
                : "Commencez votre première série de QCM."}
          </p>
          <span className="resume-action">{activity ? "Reprendre ma session →" : "Commencer →"}</span>
        </span>
        <span className="resume-status" aria-hidden="true">↻</span>
      </Link>

      <style jsx>{`
        .continue-premium-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:0 0 16px}
        .continue-premium-card{min-width:0;display:grid;grid-template-columns:96px minmax(0,1fr) auto;gap:18px;align-items:center;border-radius:22px;padding:22px;text-decoration:none;overflow:hidden;position:relative;box-shadow:0 12px 30px rgba(20,45,85,.08);transition:transform .16s ease,box-shadow .16s ease}
        .continue-premium-card:hover{transform:translateY(-1px);box-shadow:0 16px 34px rgba(20,45,85,.11)}
        .practice-card{background:linear-gradient(135deg,#2c81f6 0%,#1768df 100%);color:#fff}
        .resume-card{background:#fff;color:#122554;border:1px solid #e4eaf2}
        .practice-art,.books-art{width:96px;height:96px;border-radius:24px;display:grid;place-items:center;position:relative}
        .practice-art{background:rgba(255,255,255,.08)}
        .paper{width:52px;height:64px;border-radius:10px;background:#fff;display:grid;align-content:center;gap:7px;padding:0 11px;box-shadow:0 10px 20px rgba(4,42,104,.18);transform:rotate(-5deg)}
        .paper i{height:5px;border-radius:999px;background:#8cc0ff}.paper i:nth-child(2){width:80%}.paper i:nth-child(3){width:62%}
        .pen{position:absolute;right:8px;bottom:12px;font-size:25px;transform:rotate(-12deg)}
        .books-art{background:#eef5ff}
        .book{position:absolute;width:56px;height:15px;border-radius:5px;box-shadow:0 5px 10px rgba(25,55,90,.10)}
        .book.blue{background:#2f7fea;transform:translateY(-17px) rotate(-3deg)}
        .book.gold{background:#f6b23b;transform:translateY(0) rotate(2deg)}
        .book.navy{background:#173f85;transform:translateY(17px) rotate(-2deg)}
        .premium-copy{min-width:0}
        .premium-copy small{display:block;margin-bottom:5px;font-size:9px;font-weight:900;letter-spacing:.8px;opacity:.82}
        .premium-copy strong{display:block;font-size:18px;line-height:1.2;font-weight:900}
        .premium-copy p{margin:7px 0 0;font-size:11px;line-height:1.45;opacity:.9}
        .practice-action,.resume-action{display:inline-block;margin-top:13px;border-radius:11px;padding:10px 14px;font-size:10px;font-weight:900}
        .practice-action{background:#fff;color:#1768df;box-shadow:0 7px 16px rgba(4,42,104,.12)}
        .resume-action{background:#2474ff;color:#fff;box-shadow:0 7px 16px rgba(36,116,255,.16)}
        .question-count{min-width:110px;text-align:center;border-left:1px solid rgba(255,255,255,.28);padding-left:20px}
        .question-count b,.question-count em{display:block}.question-count b{font-size:28px;line-height:1;font-weight:900}.question-count em{margin-top:8px;font-size:10px;line-height:1.35;font-style:normal;opacity:.9}
        .resume-status{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:#eef4ff;color:#2474ff;font-size:24px;font-weight:900}
        @media(max-width:800px){
          .continue-premium-grid{grid-template-columns:1fr;gap:12px;margin:0 0 14px}
          .continue-premium-card{grid-template-columns:76px minmax(0,1fr) auto;gap:14px;padding:17px;border-radius:20px}
          .practice-art,.books-art{width:76px;height:76px;border-radius:19px}
          .paper{width:42px;height:52px;padding:0 9px;gap:5px}.paper i{height:4px}.pen{font-size:21px;right:5px;bottom:7px}
          .book{width:45px;height:12px}.book.blue{transform:translateY(-14px) rotate(-3deg)}.book.navy{transform:translateY(14px) rotate(-2deg)}
          .premium-copy small{font-size:8px}.premium-copy strong{font-size:15px}.premium-copy p{font-size:10px;margin-top:5px}
          .practice-action,.resume-action{font-size:9px;padding:9px 11px;margin-top:10px}
          .question-count{min-width:82px;padding-left:14px}.question-count b{font-size:20px}.question-count em{font-size:8px;margin-top:5px}
          .resume-status{width:38px;height:38px;font-size:20px}
        }
        @media(max-width:430px){
          .continue-premium-card{grid-template-columns:64px minmax(0,1fr);gap:12px;padding:16px}
          .practice-art,.books-art{width:64px;height:64px;border-radius:17px}
          .paper{width:35px;height:44px}.pen{font-size:18px}
          .book{width:38px;height:11px}.book.blue{transform:translateY(-12px) rotate(-3deg)}.book.navy{transform:translateY(12px) rotate(-2deg)}
          .question-count{grid-column:2;border-left:0;border-top:1px solid rgba(255,255,255,.25);padding:10px 0 0;margin-top:2px;text-align:left;display:flex;gap:7px;align-items:baseline;min-width:0}
          .question-count b{font-size:18px}.question-count em{font-size:8px;margin:0;line-height:1.2}
          .resume-status{grid-column:2;justify-self:start;margin-top:2px}
        }
        @media(prefers-reduced-motion:reduce){.continue-premium-card{transition:none}}
      `}</style>
    </div>,
    host,
  );
}
