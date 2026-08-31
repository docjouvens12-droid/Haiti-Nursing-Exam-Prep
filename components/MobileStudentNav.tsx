"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/tableau-de-bord", label: "Accueil", icon: "⌂" },
  { href: "/pratique", label: "Questions", icon: "▤" },
  { href: "/examens", label: "Examens", icon: "▣" },
  { href: "/performance", label: "Progrès", icon: "⌁" },
  { href: "/profil", label: "Profil", icon: "○" },
];

export default function MobileStudentNav() {
  const pathname = usePathname();

  const hidden =
    pathname === "/" ||
    pathname.startsWith("/connexion") ||
    pathname.startsWith("/inscription") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/resultats/") ||
    /^\/examens\/\d+/.test(pathname);

  if (hidden) return null;

  return (
    <>
      <div className="mobile-student-nav-spacer" aria-hidden="true" />
      <nav className="mobile-student-nav" aria-label="Navigation étudiant mobile">
        {items.map((item) => {
          const active =
            item.href === "/tableau-de-bord"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link key={item.href} href={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
              <span className="mobile-student-nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
