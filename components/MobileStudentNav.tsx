"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const items = [
  { href: "/tableau-de-bord", label: "Accueil", icon: "⌂" },
  { href: "/pratique", label: "Questions", icon: "▤" },
  { href: "/examens", label: "Examens", icon: "▣" },
  { href: "/performance", label: "Progrès", icon: "⌁" },
  { href: "/profil", label: "Profil", icon: "○" },
];

const drawerItems = [
  { href: "/tableau-de-bord", label: "Accueil", icon: "⌂" },
  { href: "/pratique", label: "Questions", icon: "▤" },
  { href: "/categories", label: "Catégories & thématiques", icon: "▦" },
  { href: "/examens", label: "Examens", icon: "▣" },
  { href: "/historique", label: "Plan d’étude", icon: "▥" },
  { href: "/performance", label: "Performance", icon: "⌁" },
  { href: "/questions-incorrectes", label: "Questions incorrectes", icon: "◴" },
  { href: "/favoris", label: "Favoris", icon: "♡" },
  { href: "/nightingale", label: "Nightingale AI", icon: "✦" },
  { href: "/questions-reelles", label: "Ressources", icon: "▧" },
  { href: "/profil", label: "Profil", icon: "○" },
];

export default function MobileStudentNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    function handleMenuClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".menu-button")) {
        event.preventDefault();
        setDrawerOpen(true);
      }
    }
    document.addEventListener("click", handleMenuClick);
    return () => document.removeEventListener("click", handleMenuClick);
  }, [hidden]);

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

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") setDrawerOpen(false); }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

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
          <aside className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu principal">
            <div className="mobile-drawer-head">
              <div><strong>Haiti Nursing</strong><span>Exam Prep</span></div>
              <button className="mobile-drawer-close" aria-label="Fermer" onClick={() => setDrawerOpen(false)}>×</button>
            </div>
            <nav className="mobile-drawer-nav" aria-label="Menu mobile complet">
              {drawerItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/tableau-de-bord" && pathname.startsWith(`${item.href}/`));
                return (
                  <Link key={item.href} href={item.href} className={active ? "active" : ""} onClick={() => setDrawerOpen(false)}>
                    <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>
                  </Link>
                );
              })}
              {isAdmin && (
                <Link href="/admin" className="mobile-drawer-admin" onClick={() => setDrawerOpen(false)}>
                  <span aria-hidden="true">⚙</span><span>Administration</span>
                </Link>
              )}
            </nav>
            <button className="mobile-drawer-logout" onClick={deconnecter}>Se déconnecter</button>
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
      </nav>
      <style jsx global>{`
        .mobile-drawer-layer{display:none}
        @media(max-width:800px){
          .mobile-drawer-layer{display:block;position:fixed;inset:0;z-index:1000}
          .mobile-drawer-backdrop{position:absolute;inset:0;border:0;background:rgba(5,16,45,.48);padding:0}
          .mobile-drawer{position:absolute;top:0;left:0;width:min(86vw,340px);height:100%;background:#fff;box-shadow:18px 0 45px rgba(7,27,80,.22);padding:20px 16px calc(24px + env(safe-area-inset-bottom));display:flex;flex-direction:column;overflow-y:auto;animation:drawerIn .18s ease-out}
          .mobile-drawer-head{display:flex;align-items:center;justify-content:space-between;padding:6px 6px 18px;border-bottom:1px solid #e8edf5}
          .mobile-drawer-head strong{display:block;color:#0b1f59;font-size:18px}.mobile-drawer-head span{display:block;color:#71809e;font-size:11px;margin-top:2px}
          .mobile-drawer-close{border:0;background:#f1f5fb;color:#0b1f59;width:38px;height:38px;border-radius:50%;font-size:27px;line-height:1;cursor:pointer}
          .mobile-drawer-nav{display:grid;gap:5px;padding:14px 0}.mobile-drawer-nav a{display:flex;align-items:center;gap:13px;padding:13px 14px;border-radius:11px;color:#172442;font-size:14px;font-weight:700}
          .mobile-drawer-nav a>span:first-child{width:24px;text-align:center;color:#4561e8;font-size:18px}.mobile-drawer-nav a.active{background:#eef4ff;color:#1f5fe8}
          .mobile-drawer-nav a.mobile-drawer-admin{background:#eff8f3;color:#137a4d;margin-top:6px}.mobile-drawer-nav a.mobile-drawer-admin>span:first-child{color:#137a4d}
          .mobile-drawer-logout{margin-top:auto;width:100%;border:1px solid #d7dfeb;background:#fff;color:#b42318;border-radius:11px;padding:13px 14px;font-weight:800;cursor:pointer}
          @keyframes drawerIn{from{transform:translateX(-16px);opacity:.7}to{transform:translateX(0);opacity:1}}
        }
      `}</style>
    </>
  );
}
