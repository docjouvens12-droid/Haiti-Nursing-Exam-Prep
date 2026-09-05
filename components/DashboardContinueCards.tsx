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
    <div className="dashboard-model3-grid" aria-label="Reprendre votre préparation">
      <Link href="/pratique" className="model3-card model3-practice">
        <span className="model3-illustration practice-illustration" aria-hidden="true">
          <span className="sheet"><i /><i /><i /></span>
          <span className="pencil">✎</span>
        </span>
        <span className="model3-copy">
          <small>ENTRAÎNEMENT</small>
          <strong>Continuer à pratiquer</strong>
          <p>Entraînez-vous avec des QCM adaptés à votre préparation.</p>
          <span className="model3-action">Commencer maintenant →</span>
        </span>
        <span className="model3-metric">
          <b>{totalQuestions.toLocaleString("fr-FR")}</b>
          <em>questions</em>
        </span>
      </Link>

      <Link href="/pratique" className="model3-card model3-resume">
        <span className="model3-illustration books-illustration" aria-hidden="true">
          <span className="book one" />
          <span className="book two" />
          <span className="book three" />
        </span>
        <span className="model3-copy">
          <small>DERNIÈRE ACTIVITÉ</small>
          <strong>Continuer là où vous vous êtes arrêté</strong>
          <p>
            {loading
              ? "Recherche de votre dernière activité…"
              : activity
                ? activity.category
                : "Commencez votre première série de QCM."}
          </p>
          <span className="model3-action resume-action">{activity ? "Reprendre ma session →" : "Commencer →"}</span>
        </span>
        <span className="model3-last-badge">{activity ? "À reprendre" : "Nouveau"}</span>
      </Link>

      <style jsx>{`
        .dashboard-model3-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:0 0 16px}
        .model3-card{min-width:0;display:grid;grid-template-columns:82px minmax(0,1fr) auto;gap:16px;align-items:center;border:2px solid #2474ff;border-radius:22px;padding:20px;text-decoration:none;overflow:hidden;position:relative;box-shadow:0 12px 28px rgba(20,45,85,.08);transition:transform .16s ease,box-shadow .16s ease}
        .model3-card:hover{transform:translateY(-1px);box-shadow:0 16px 34px rgba(20,45,85,.11)}
        .model3-practice{background:linear-gradient(135deg,#1d78e8,#3e94f2);color:#fff}
        .model3-resume{background:linear-gradient(135deg,#fff9ef,#fff3dd);color:#21314f}
        .model3-illustration{width:82px;height:82px;display:grid;place-items:center;position:relative;flex:0 0 auto}
        .practice-illustration{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.55);border-radius:20px}
        .sheet{width:42px;height:52px;background:#fff;border:2px solid #2474ff;border-radius:8px;display:grid;align-content:center;gap:6px;padding:0 9px;box-shadow:0 8px 16px rgba(0,0,0,.08);transform:rotate(-4deg)}
        .sheet i{height:4px;background:#b9d8ff;border-radius:99px}.sheet i:nth-child(2){width:78%}.sheet i:nth-child(3){width:62%}
        .pencil{position:absolute;right:10px;bottom:9px;width:30px;height:30px;border:2px solid #2474ff;border-radius:10px;background:#ffd969;color:#2f5e9c;display:grid;place-items:center;font-size:18px;font-weight:900;box-shadow:0 5px 12px rgba(0,0,0,.08)}
        .books-illustration{border:2px solid #2474ff;border-radius:20px;background:#fff3d3}
        .book{position:absolute;width:46px;height:14px;border:1px solid #2474ff;border-radius:5px;box-shadow:0 4px 8px rgba(110,75,20,.08)}
        .book.one{background:#4e8fe7;transform:translateY(17px) rotate(2deg)}
        .book.two{background:#f4a84b;transform:translateY(1px) rotate(-2deg)}
        .book.three{background:#71b88c;transform:translateY(-15px) rotate(3deg)}
        .model3-copy{min-width:0}
        .model3-copy small{display:block;font-size:9px;font-weight:900;letter-spacing:.8px;margin-bottom:5px;opacity:.78}
        .model3-copy strong{display:block;font-size:17px;line-height:1.2;font-weight:900}
        .model3-copy p{margin:7px 0 0;font-size:11px;line-height:1.45;max-width:540px;opacity:.86}
        .model3-action{display:inline-block;margin-top:12px;background:#fff;color:#1768cb;border:2px solid #2474ff;border-radius:10px;padding:9px 12px;font-size:10px;font-weight:900;box-shadow:0 5px 12px rgba(8,56,120,.08)}
        .resume-action{background:#243a63;color:#fff;box-shadow:none}
        .model3-metric{min-width:82px;text-align:center;background:rgba(255,255,255,.14);border:2px solid #8fc2ff;border-radius:16px;padding:12px 10px}
        .model3-metric b,.model3-metric em{display:block}.model3-metric b{font-size:20px;line-height:1;font-weight:900}.model3-metric em{margin-top:4px;font-size:9px;font-style:normal;opacity:.82}
        .model3-last-badge{align-self:start;background:#fff6df;color:#1768cb;border:2px solid #2474ff;border-radius:999px;padding:7px 10px;font-size:9px;font-weight:900;white-space:nowrap}
        @media(max-width:800px){
          .dashboard-model3-grid{grid-template-columns:1fr;gap:11px;margin:0 0 14px}
          .model3-card{grid-template-columns:68px minmax(0,1fr) auto;gap:13px;padding:16px;border-radius:19px}
          .model3-illustration{width:68px;height:68px;border-radius:17px}
          .sheet{width:36px;height:46px;padding:0 8px;gap:5px}.pencil{width:25px;height:25px;right:7px;bottom:7px;font-size:15px}
          .book{width:39px;height:12px}
          .model3-copy strong{font-size:14px}.model3-copy p{font-size:10px;margin-top:5px}.model3-copy small{font-size:8px}
          .model3-action{font-size:9px;padding:8px 10px;margin-top:9px}
          .model3-metric{min-width:65px;padding:10px 8px;border-radius:13px}.model3-metric b{font-size:16px}.model3-metric em{font-size:8px}
          .model3-last-badge{font-size:8px;padding:6px 8px}
        }
        @media(max-width:390px){
          .model3-card{grid-template-columns:60px minmax(0,1fr);align-items:start}
          .model3-illustration{width:60px;height:60px}
          .model3-metric,.model3-last-badge{grid-column:2;justify-self:start;margin-top:-2px}
        }
        @media(prefers-reduced-motion:reduce){.model3-card{transition:none}}
      `}</style>
    </div>,
    host,
  );
}
