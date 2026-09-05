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

      if (q) setActivity({ category: q.categorie || "Questions d’entraînement" });
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
    <div className="hn-continue-wrap" aria-label="Reprendre votre préparation">
      <Link href="/pratique" className="hn-continue-card hn-practice-card">
        <span className="hn-practice-art" aria-hidden="true">
          <span className="hn-paper"><i /><i /><i /></span>
          <span className="hn-pen">✎</span>
        </span>

        <span className="hn-card-copy">
          <small>ENTRAÎNEMENT</small>
          <strong>Continuer à pratiquer</strong>
          <p>Entraînez-vous avec des QCM adaptés à votre préparation.</p>
          <span className="hn-practice-action">Commencer maintenant →</span>
        </span>

        <span className="hn-question-count">
          <b>{totalQuestions.toLocaleString("fr-FR")}</b>
          <em>questions<br />disponibles</em>
        </span>
      </Link>

      <Link href="/pratique" className="hn-continue-card hn-resume-card">
        <span className="hn-books-art" aria-hidden="true">
          <span className="hn-book hn-blue" />
          <span className="hn-book hn-gold" />
          <span className="hn-book hn-navy" />
        </span>

        <span className="hn-card-copy hn-resume-copy">
          <small>DERNIÈRE ACTIVITÉ</small>
          <strong>Continuer là où vous vous êtes arrêté</strong>
          <p>{loading ? "Recherche de votre dernière activité…" : activity ? activity.category : "Commencez votre première série de QCM."}</p>
          <span className="hn-resume-action">{activity ? "Reprendre ma session →" : "Commencer →"}</span>
        </span>

        <span className="hn-last-session">
          <span className="hn-clock">◷</span>
          <span><small>Dernière session</small><b>{activity ? "À reprendre" : "Nouveau"}</b></span>
        </span>
      </Link>

      <style jsx global>{`
        .modern-nav a[href="/categories"]{display:none!important}
        #dashboard-continue-cards-host{width:100%;display:block}
        .hn-continue-wrap{display:grid!important;grid-template-columns:1fr!important;gap:14px!important;margin:0 0 16px!important;width:100%!important}
        .hn-continue-card{width:100%!important;box-sizing:border-box!important;display:grid!important;grid-template-columns:118px minmax(0,1fr) 170px!important;gap:22px!important;align-items:center!important;border-radius:24px!important;padding:24px 26px!important;text-decoration:none!important;overflow:hidden!important;position:relative!important;box-shadow:0 12px 30px rgba(20,45,85,.08)!important}
        .hn-practice-card{background:linear-gradient(135deg,#2f82f6 0%,#1768df 100%)!important;color:#fff!important;border:0!important}
        .hn-resume-card{background:#fff!important;color:#122554!important;border:1px solid #e4eaf2!important}
        .hn-practice-art,.hn-books-art{width:96px!important;height:96px!important;border-radius:24px!important;display:grid!important;place-items:center!important;position:relative!important}
        .hn-practice-art{background:rgba(255,255,255,.10)!important}
        .hn-paper{width:54px!important;height:66px!important;border-radius:11px!important;background:#fff!important;display:grid!important;align-content:center!important;gap:7px!important;padding:0 11px!important;box-shadow:0 10px 20px rgba(4,42,104,.18)!important;transform:rotate(-5deg)!important}
        .hn-paper i{height:5px!important;border-radius:999px!important;background:#8cc0ff!important}.hn-paper i:nth-child(2){width:80%!important}.hn-paper i:nth-child(3){width:62%!important}
        .hn-pen{position:absolute!important;right:7px!important;bottom:10px!important;font-size:25px!important;transform:rotate(-12deg)!important;color:#f3bd31!important}
        .hn-books-art{background:#eef5ff!important;border-radius:50%!important}
        .hn-book{position:absolute!important;width:58px!important;height:16px!important;border-radius:6px!important;box-shadow:0 5px 10px rgba(25,55,90,.10)!important}
        .hn-book.hn-blue{background:#2f7fea!important;transform:translateY(-18px) rotate(-3deg)!important}.hn-book.hn-gold{background:#f6b23b!important;transform:translateY(0) rotate(2deg)!important}.hn-book.hn-navy{background:#173f85!important;transform:translateY(18px) rotate(-2deg)!important}
        .hn-card-copy{min-width:0!important;display:block!important}.hn-card-copy small{display:block!important;margin-bottom:6px!important;font-size:11px!important;font-weight:900!important;letter-spacing:.8px!important;opacity:.84!important}.hn-card-copy strong{display:block!important;font-size:21px!important;line-height:1.2!important;font-weight:900!important}.hn-card-copy p{margin:8px 0 0!important;font-size:13px!important;line-height:1.45!important;opacity:.92!important}
        .hn-practice-action,.hn-resume-action{display:inline-block!important;margin-top:14px!important;border-radius:12px!important;padding:11px 16px!important;font-size:12px!important;font-weight:900!important}
        .hn-practice-action{background:#fff!important;color:#1768df!important;box-shadow:0 7px 16px rgba(4,42,104,.12)!important}.hn-resume-action{background:#2474ff!important;color:#fff!important;box-shadow:0 7px 16px rgba(36,116,255,.16)!important}
        .hn-question-count{min-width:130px!important;text-align:left!important;border-left:1px solid rgba(255,255,255,.30)!important;padding-left:24px!important}.hn-question-count b,.hn-question-count em{display:block!important}.hn-question-count b{font-size:34px!important;line-height:1!important;font-weight:900!important}.hn-question-count em{margin-top:8px!important;font-size:12px!important;line-height:1.35!important;font-style:normal!important;opacity:.94!important}
        .hn-last-session{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:10px!important;color:#61708a!important}.hn-clock{width:44px!important;height:44px!important;border-radius:50%!important;display:grid!important;place-items:center!important;background:#f1f5fb!important;color:#3e5d8f!important;font-size:22px!important}.hn-last-session>span:last-child small,.hn-last-session>span:last-child b{display:block!important}.hn-last-session>span:last-child small{font-size:10px!important;font-weight:600!important}.hn-last-session>span:last-child b{margin-top:3px!important;font-size:11px!important;color:#34425f!important}
        @media(max-width:800px){
          .hn-continue-wrap{gap:12px!important;margin-bottom:14px!important}
          .hn-continue-card{grid-template-columns:82px minmax(0,1fr)!important;gap:14px!important;padding:17px!important;border-radius:20px!important}
          .hn-practice-art,.hn-books-art{width:76px!important;height:76px!important;border-radius:19px!important}
          .hn-books-art{border-radius:50%!important}
          .hn-paper{width:42px!important;height:52px!important;padding:0 9px!important;gap:5px!important}.hn-paper i{height:4px!important}.hn-pen{font-size:20px!important;right:5px!important;bottom:7px!important}
          .hn-book{width:45px!important;height:12px!important}.hn-book.hn-blue{transform:translateY(-14px) rotate(-3deg)!important}.hn-book.hn-navy{transform:translateY(14px) rotate(-2deg)!important}
          .hn-card-copy small{font-size:9px!important}.hn-card-copy strong{font-size:17px!important}.hn-card-copy p{font-size:11px!important;margin-top:5px!important}
          .hn-practice-action,.hn-resume-action{font-size:10px!important;padding:10px 13px!important;margin-top:11px!important}
          .hn-question-count,.hn-last-session{grid-column:2!important;justify-self:start!important;margin-top:1px!important}
          .hn-question-count{border-left:0!important;border-top:1px solid rgba(255,255,255,.28)!important;padding:10px 0 0!important;display:flex!important;gap:8px!important;align-items:baseline!important;min-width:0!important}
          .hn-question-count b{font-size:22px!important}.hn-question-count em{font-size:9px!important;margin:0!important;line-height:1.2!important}
          .hn-last-session{justify-content:flex-start!important}.hn-clock{width:38px!important;height:38px!important;font-size:18px!important}
        }
        @media(max-width:430px){
          .hn-continue-card{grid-template-columns:68px minmax(0,1fr)!important;gap:12px!important;padding:16px!important}
          .hn-practice-art,.hn-books-art{width:64px!important;height:64px!important}
          .hn-paper{width:35px!important;height:44px!important}.hn-pen{font-size:17px!important}
          .hn-book{width:38px!important;height:11px!important}.hn-book.hn-blue{transform:translateY(-12px) rotate(-3deg)!important}.hn-book.hn-navy{transform:translateY(12px) rotate(-2deg)!important}
          .hn-card-copy strong{font-size:15px!important}.hn-card-copy p{font-size:10px!important}.hn-practice-action,.hn-resume-action{font-size:9px!important;padding:9px 11px!important}
          .hn-question-count b{font-size:20px!important}.hn-question-count em{font-size:8px!important}
        }
      `}</style>
    </div>,
    host,
  );
}
