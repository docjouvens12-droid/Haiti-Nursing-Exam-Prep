"use client";

import { useStudentMenu } from "./StudentMenuContext";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const items = [
  { href: "/tableau-de-bord", label: "Accueil", icon: "⌂" },
  { href: "/pratique", label: "QCM", icon: "▤" },
  { href: "/examens", label: "Examens", icon: "▣" },
  { href: "/cours-revisions", label: "Cours", icon: "▥" },
];

const groups = [
  {
    title: "APPRENDRE",
    subtitle: "Construisez votre réussite",
    tone: "learn",
    items: [
      { href: "/tableau-de-bord", label: "Accueil", icon: "⌂" },
      { href: "/cours-revisions", label: "Cours & Révisions", icon: "▥" },
      { href: "/pratique", label: "Questions", icon: "▤" },
      { href: "/examens", label: "Examens", icon: "▣" },
    ],
  },
  {
    title: "SUIVI",
    subtitle: "Progressez chaque jour",
    tone: "follow",
    items: [
      { href: "/historique", label: "Plan d’étude", icon: "▦" },
      { href: "/performance", label: "Performance", icon: "▥" },
      { href: "/questions-incorrectes", label: "Questions incorrectes", icon: "×" },
      { href: "/favoris", label: "Favoris", icon: "♥" },
    ],
  },
  {
    title: "OUTILS",
    subtitle: "Des ressources pour aller plus loin",
    tone: "tools",
    items: [
      { href: "/nightingale", label: "Nightingale AI", icon: "✦" },
      { href: "/questions-reelles", label: "Ressources", icon: "▧" },
      { href: "/profil", label: "Profil", icon: "○" },
    ],
  },
];

export default function MobileStudentNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { drawerOpen, setDrawerOpen } = useStudentMenu();
  const drawerRef = useRef<HTMLElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const hidden =
    pathname === "/" ||
    pathname.startsWith("/connexion") ||
    pathname.startsWith("/inscription") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/resultats/") ||
    /^\/examens\/\d+/.test(pathname);

  useEffect(() => {
    if (hidden) return;
    let active = true;
    async function loadRole() {
      try {
        const supabase = createClient();
        const { data: claimsData } = await supabase.auth.getClaims();
        const userId = claimsData?.claims?.sub ? String(claimsData.claims.sub) : "";
        if (!userId) return;
        const { data: profil } = await supabase.from("profiles").select("role").eq("id", userId).single();
        if (active) setIsAdmin(profil?.role === "admin");
      } catch {
        if (active) setIsAdmin(false);
      }
    }
    loadRole();
    return () => { active = false; };
  }, [hidden, pathname]);

  useEffect(() => { setDrawerOpen(false); }, [pathname, setDrawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const drawer = drawerRef.current;
    drawer?.querySelector<HTMLButtonElement>("button")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
      if (event.key !== "Tab" || !drawer) return;
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [drawerOpen, setDrawerOpen]);

  async function deconnecter() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setDrawerOpen(false);
    router.push("/");
    router.refresh();
  }

  if (hidden) return null;

  return (
    <>
      {drawerOpen && (
        <div className="mobile-drawer-layer" role="presentation">
          <button className="mobile-drawer-backdrop" aria-label="Fermer le menu" onClick={() => setDrawerOpen(false)} />
          <aside id="student-menu" ref={drawerRef} className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu principal">
            <div className="mobile-drawer-head premium-head">
              <div className="brand-lockup">
                <div className="brand-h" aria-hidden="true"><span>H</span><i>◡</i></div>
                <div className="brand-copy">
                  <strong>Haiti Nursing</strong>
                  <strong>Exam Prep</strong>
                  <small>Étudier · S’entraîner · Réussir</small>
                </div>
              </div>
              <button className="mobile-drawer-close" aria-label="Fermer" onClick={() => setDrawerOpen(false)}>×</button>
            </div>

            <nav className="mobile-drawer-nav premium-nav" aria-label="Menu mobile complet">
              {groups.map((group) => (
                <section key={group.title} className={`drawer-group ${group.tone}`}>
                  <div className="drawer-group-title">
                    <strong>{group.title}</strong>
                    <span>{group.subtitle}</span>
                  </div>
                  <div className="drawer-group-card">
                    {group.items.map((item) => {
                      const active = pathname === item.href || (item.href !== "/tableau-de-bord" && pathname.startsWith(`${item.href}/`));
                      return (
                        <Link key={item.href} href={item.href} className={active ? "active" : ""} onClick={() => setDrawerOpen(false)}>
                          <span className="drawer-icon" aria-hidden="true">{item.icon}</span>
                          <span className="drawer-label">{item.label}</span>
                          <span className="drawer-chevron" aria-hidden="true">›</span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}

              {isAdmin && (
                <Link href="/admin" className="mobile-drawer-admin premium-admin" onClick={() => setDrawerOpen(false)}>
                  <span className="drawer-icon" aria-hidden="true">⚙</span>
                  <span>Administration</span>
                  <span className="drawer-chevron" aria-hidden="true">›</span>
                </Link>
              )}
            </nav>

            <button className="mobile-drawer-logout premium-logout" onClick={deconnecter}>
              <span aria-hidden="true">⇥</span> Se déconnecter
            </button>
          </aside>
        </div>
      )}

      <div className="mobile-student-nav-spacer" aria-hidden="true" />
      <nav className="mobile-student-nav" aria-label="Navigation étudiant mobile">
        {items.map((item) => {
          const active = item.href === "/tableau-de-bord" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
              <span className="mobile-student-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
            </Link>
          );
        })}
        <button type="button" className={drawerOpen ? "active" : ""} onClick={() => setDrawerOpen(true)} aria-label="Plus d’options">
          <span className="mobile-student-nav-icon" aria-hidden="true">•••</span><span>Plus</span>
        </button>
      </nav>

      <style jsx global>{`
        .menu-button{min-width:44px;min-height:44px;cursor:pointer;touch-action:manipulation}
        .menu-button:focus-visible{outline:3px solid #2474ff;outline-offset:2px;border-radius:8px}
        .mobile-drawer-layer{display:block;position:fixed;inset:0;z-index:1000}
        .mobile-drawer-backdrop{position:absolute;inset:0;border:0;background:rgba(5,16,45,.55);padding:0;backdrop-filter:blur(2px)}
        .mobile-drawer{position:absolute;top:0;left:0;width:min(88vw,370px);height:100%;background:#fbfdff;box-shadow:22px 0 55px rgba(7,27,80,.24);padding:calc(18px + env(safe-area-inset-top)) 16px calc(22px + env(safe-area-inset-bottom));display:flex;flex-direction:column;overflow-y:auto;animation:drawerIn .18s ease-out}

        .premium-head{display:flex;align-items:flex-start;justify-content:space-between;padding:6px 2px 18px;border-bottom:0}
        .brand-lockup{display:flex;align-items:center;gap:12px;min-width:0}
        .brand-h{position:relative;width:58px;height:58px;border-radius:17px;background:linear-gradient(145deg,#0b2e7d,#1f66e5);box-shadow:0 10px 24px rgba(25,79,184,.20);display:grid;place-items:center;flex:0 0 auto;color:white}
        .brand-h span{font-family:Georgia,serif;font-size:38px;font-weight:800;line-height:1;letter-spacing:-3px}
        .brand-h i{position:absolute;right:7px;bottom:6px;font-size:17px;font-style:normal;color:#dbe8ff;transform:rotate(-10deg)}
        .brand-copy{min-width:0;padding-top:2px}.brand-copy strong{display:block;color:#0a225f;font-size:18px;line-height:1.08;letter-spacing:-.2px}.brand-copy small{display:block;color:#7184aa;font-size:10.5px;margin-top:7px;white-space:nowrap}
        .mobile-drawer-close{border:0;background:#eef4ff;color:#0b2c70;width:42px;height:42px;border-radius:50%;font-size:29px;line-height:1;cursor:pointer;flex:0 0 auto;box-shadow:inset 0 0 0 1px #e0e8f6}

        .premium-nav{display:grid;gap:12px;padding:2px 0 12px}
        .drawer-group{border-radius:18px;padding:11px;background:#f5f9ff;border:1px solid #dce9fb}
        .drawer-group.follow{background:#f3fbf7;border-color:#dcefe5}
        .drawer-group.tools{background:#f8f6ff;border-color:#e7e0ff}
        .drawer-group-title{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:1px 2px 9px}
        .drawer-group-title strong{font-size:12px;letter-spacing:.4px;color:#145adf}.drawer-group.follow .drawer-group-title strong{color:#148257}.drawer-group.tools .drawer-group-title strong{color:#5e3bdd}
        .drawer-group-title span{font-size:9.5px;color:#7890b1;text-align:right}
        .drawer-group-card{background:rgba(255,255,255,.88);border-radius:14px;overflow:hidden;box-shadow:0 3px 12px rgba(31,72,132,.05)}
        .drawer-group-card a{display:flex;align-items:center;gap:11px;min-height:50px;padding:8px 10px;color:#15264a;font-size:13.5px;font-weight:750;border-bottom:1px solid #edf1f7;transition:background .15s ease,transform .15s ease}
        .drawer-group-card a:last-child{border-bottom:0}
        .drawer-group-card a.active{background:linear-gradient(90deg,#e6f1ff,#edf5ff);color:#155dd8}
        .drawer-group-card a:active{transform:scale(.995)}
        .drawer-icon{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;flex:0 0 auto;background:#e7f0ff;color:#1c63db;font-size:18px;font-weight:800}
        .drawer-group.follow .drawer-icon{background:#def5e9;color:#0f945d}.drawer-group.follow a:nth-child(2) .drawer-icon{background:#eee6ff;color:#6b3ee7}.drawer-group.follow a:nth-child(3) .drawer-icon{background:#ffe8e7;color:#d93835}.drawer-group.follow a:nth-child(4) .drawer-icon{background:#ffe8ee;color:#e42e60}
        .drawer-group.tools .drawer-icon{background:#ebe6ff;color:#6845e8}.drawer-group.tools a:nth-child(2) .drawer-icon{background:#e4f0ff;color:#2873df}.drawer-group.tools a:nth-child(3) .drawer-icon{background:#ececff;color:#6169d8}
        .drawer-label{min-width:0;flex:1}.drawer-chevron{margin-left:auto;color:#6481ad;font-size:24px;font-weight:400;line-height:1}

        .premium-admin{display:flex;align-items:center;gap:11px;min-height:54px;padding:10px 12px;border-radius:15px;background:linear-gradient(90deg,#e8f7ef,#effaf4);color:#117a4c;font-size:14px;font-weight:800;border:1px solid #d5eddf;margin-top:1px}
        .premium-admin .drawer-icon{background:#d9f1e4;color:#0f8b57}.premium-admin .drawer-chevron{color:#16945e}
        .premium-logout{margin-top:2px;width:100%;border:1.5px solid #ef5350;background:#fff;color:#d52f2c;border-radius:15px;padding:13px 14px;font-weight:850;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px}
        .premium-logout span{font-size:20px}

        @keyframes drawerIn{from{transform:translateX(-18px);opacity:.72}to{transform:translateX(0);opacity:1}}
        @media(prefers-reduced-motion:reduce){.mobile-drawer{animation:none}.drawer-group-card a{transition:none}}
      `}</style>
    </>
  );
}
