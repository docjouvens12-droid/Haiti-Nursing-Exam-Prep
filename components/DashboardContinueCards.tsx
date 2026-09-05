"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const DAILY_GOAL = 25;

type LastActivity = {
  category: string;
  question: string;
};

export default function DashboardContinueCards() {
  const pathname = usePathname();
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [activity, setActivity] = useState<LastActivity | null>(null);
  const [todayCount, setTodayCount] = useState(0);
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

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [{ data: last }, { count: todayAnswers }, { count: questionCount }] = await Promise.all([
        supabase
          .from("user_answers")
          .select("answered_at,questions(categorie,question)")
          .eq("user_id", auth.user.id)
          .order("answered_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("user_answers")
          .select("question_id", { count: "exact", head: true })
          .eq("user_id", auth.user.id)
          .gte("answered_at", today.toISOString()),
        supabase.from("questions").select("id", { count: "exact", head: true }),
      ]);

      if (!active) return;

      const q: any = Array.isArray((last as any)?.questions)
        ? (last as any)?.questions?.[0]
        : (last as any)?.questions;

      if (q) {
        setActivity({
          category: q.categorie || "Questions d’entraînement",
          question: q.question || "Continuez votre entraînement là où vous vous êtes arrêté.",
        });
      }
      setTodayCount(todayAnswers ?? 0);
      setTotalQuestions(questionCount ?? 0);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [pathname]);

  if (pathname !== "/tableau-de-bord" || !host) return null;

  const progress = Math.min(100, Math.round((todayCount / DAILY_GOAL) * 100));

  return createPortal(
    <div className="dashboard-continue-grid" aria-label="Reprendre votre préparation">
      <Link href="/pratique" className="dashboard-continue-card practice-card">
        <span className="dashboard-card-icon practice-icon" aria-hidden="true">▶</span>
        <span className="dashboard-card-copy">
          <small>CONTINUER À PRATIQUER</small>
          <strong>{todayCount} / {DAILY_GOAL} questions aujourd’hui</strong>
          <span className="dashboard-card-progress"><i style={{ width: `${progress}%` }} /></span>
          <em>{progress}% · {totalQuestions.toLocaleString("fr-FR")} questions disponibles</em>
        </span>
        <span className="dashboard-card-arrow" aria-hidden="true">›</span>
      </Link>

      <Link href="/pratique" className="dashboard-continue-card resume-card">
        <span className="dashboard-card-icon resume-icon" aria-hidden="true">↻</span>
        <span className="dashboard-card-copy">
          <small>CONTINUER LÀ OÙ VOUS VOUS ÊTES ARRÊTÉ</small>
          {loading ? (
            <strong>Recherche de votre dernière activité…</strong>
          ) : activity ? (
            <>
              <strong>{activity.category}</strong>
              <em className="last-question">{activity.question}</em>
            </>
          ) : (
            <>
              <strong>Commencez votre première série de QCM</strong>
              <em>Votre dernière activité apparaîtra ici automatiquement.</em>
            </>
          )}
        </span>
        <span className="dashboard-card-arrow" aria-hidden="true">›</span>
      </Link>

      <style jsx>{`
        .dashboard-continue-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:0 0 16px}
        .dashboard-continue-card{min-width:0;display:grid;grid-template-columns:48px minmax(0,1fr) 34px;gap:14px;align-items:center;border-radius:20px;padding:18px 18px;text-decoration:none;border:1px solid transparent;box-shadow:0 10px 28px rgba(25,55,100,.07);transition:transform .16s ease,box-shadow .16s ease}
        .dashboard-continue-card:hover{transform:translateY(-1px);box-shadow:0 14px 32px rgba(25,55,100,.1)}
        .practice-card{background:linear-gradient(135deg,#f0f7ff,#e8f3ff);border-color:#d8e9fb;color:#102457}
        .resume-card{background:linear-gradient(135deg,#f0fbf6,#e6f8ef);border-color:#d4efe1;color:#143b2b}
        .dashboard-card-icon{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;font-size:19px;font-weight:900}
        .practice-icon{background:#fff;color:#2474ff;box-shadow:0 5px 14px rgba(36,116,255,.12)}
        .resume-icon{background:#fff;color:#19a866;box-shadow:0 5px 14px rgba(25,168,102,.12)}
        .dashboard-card-copy{min-width:0;display:block}
        .dashboard-card-copy small{display:block;font-size:9px;font-weight:900;letter-spacing:.75px;color:#687891;margin-bottom:5px}
        .dashboard-card-copy strong{display:block;font-size:15px;line-height:1.25;color:inherit}
        .dashboard-card-copy em{display:block;margin-top:6px;font-size:10px;line-height:1.35;font-style:normal;color:#70809a}
        .resume-card .dashboard-card-copy em{color:#618171}
        .last-question{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .dashboard-card-progress{display:block;height:7px;margin-top:9px;background:rgba(36,116,255,.12);border-radius:999px;overflow:hidden}
        .dashboard-card-progress i{display:block;height:100%;background:linear-gradient(90deg,#2c9cff,#2474ff);border-radius:999px}
        .dashboard-card-arrow{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#fff;font-size:24px;font-weight:600;box-shadow:0 4px 12px rgba(20,55,90,.08)}
        .practice-card .dashboard-card-arrow{color:#2474ff}.resume-card .dashboard-card-arrow{color:#19a866}
        @media(max-width:800px){
          .dashboard-continue-grid{grid-template-columns:1fr;gap:11px;margin:0 0 14px}
          .dashboard-continue-card{grid-template-columns:44px minmax(0,1fr) 32px;gap:11px;padding:15px;border-radius:18px}
          .dashboard-card-icon{width:44px;height:44px;border-radius:13px;font-size:17px}
          .dashboard-card-copy small{font-size:8px;letter-spacing:.6px}
          .dashboard-card-copy strong{font-size:13px}
          .dashboard-card-copy em{font-size:9px;margin-top:5px}
          .dashboard-card-progress{height:6px;margin-top:8px}
          .dashboard-card-arrow{width:32px;height:32px;font-size:21px}
          .last-question{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        }
        @media(prefers-reduced-motion:reduce){.dashboard-continue-card{transition:none}}
      `}</style>
    </div>,
    host,
  );
}
