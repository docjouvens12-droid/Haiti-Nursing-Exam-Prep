"use client";

import { useEffect, useState } from "react";

export default function PWARegister() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Échec de l’enregistrement du service worker", error);
      });
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

    if (standalone) {
      setShowSplash(true);
      const timer = window.setTimeout(() => setShowSplash(false), 1200);
      return () => window.clearTimeout(timer);
    }
  }, []);

  if (!showSplash) return null;

  return (
    <div className="pwa-splash" role="status" aria-label="Ouverture de Haiti Nursing Exam Prep">
      <div className="pwa-splash-logo" aria-hidden="true">
        <svg viewBox="0 0 160 160" width="116" height="116">
          <path d="M35 78c17-8 31-7 45 2v46c-14-9-28-10-45-2V78Z" fill="#fff" />
          <path d="M125 78c-17-8-31-7-45 2v46c14-9 28-10 45-2V78Z" fill="#dff7ff" />
          <path d="M53 63c0-19 12-31 27-31s27 12 27 31v10H53V63Z" fill="#fff" />
          <rect x="72" y="40" width="16" height="26" rx="3" fill="#20c3bd" />
          <rect x="67" y="45" width="26" height="16" rx="3" fill="#20c3bd" />
          <path d="M80 80v46" stroke="#4f7df3" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
      <div className="pwa-splash-title"><span>HAITI</span> <strong>NURSING</strong></div>
      <div className="pwa-splash-subtitle">EXAM PREP</div>
      <p>Préparez-vous. Pratiquez. Progressez.</p>
      <div className="pwa-splash-loader"><span /></div>

      <style jsx>{`
        .pwa-splash{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(160deg,#071a44 0%,#0b2f67 52%,#0a4971 100%);color:#fff;text-align:center;padding:28px;animation:pwaFadeIn .18s ease-out}.pwa-splash-logo{width:150px;height:150px;border-radius:42px;display:grid;place-items:center;background:rgba(255,255,255,.08);box-shadow:0 24px 70px rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.12);margin-bottom:28px}.pwa-splash-title{font-size:31px;letter-spacing:.8px;font-weight:800}.pwa-splash-title strong{color:#36d1c7}.pwa-splash-subtitle{font-size:18px;letter-spacing:5px;margin-top:4px;font-weight:700}.pwa-splash p{margin:28px 0 30px;color:#c8f2ee;font-size:15px}.pwa-splash-loader{width:126px;height:4px;background:rgba(255,255,255,.16);border-radius:99px;overflow:hidden}.pwa-splash-loader span{display:block;height:100%;width:42%;background:#43d7cd;border-radius:99px;animation:pwaLoading .9s ease-in-out infinite alternate}@keyframes pwaLoading{from{transform:translateX(-10%)}to{transform:translateX(150%)}}@keyframes pwaFadeIn{from{opacity:0}to{opacity:1}}
      `}</style>
    </div>
  );
}
