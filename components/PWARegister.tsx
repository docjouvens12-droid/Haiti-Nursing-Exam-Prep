"use client";

import { useEffect, useState } from "react";

const VERSION_STORAGE_KEY = "haiti-nursing-app-version";
const RELOAD_GUARD_KEY = "haiti-nursing-version-reload";

export default function PWARegister() {
  const [showSplash, setShowSplash] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    let reloadOnControllerChange = true;
    let checkingVersion = false;

    const checkAppVersion = async () => {
      if (!navigator.onLine || checkingVersion) return;
      checkingVersion = true;

      try {
        const response = await fetch(`/api/app-version?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!response.ok) return;

        const payload = (await response.json()) as { version?: string };
        const version = payload.version;
        if (!version || version === "development") return;

        const previousVersion = localStorage.getItem(VERSION_STORAGE_KEY);
        localStorage.setItem(VERSION_STORAGE_KEY, version);

        if (previousVersion && previousVersion !== version) {
          const reloadGuard = sessionStorage.getItem(RELOAD_GUARD_KEY);
          if (reloadGuard === version) return;

          sessionStorage.setItem(RELOAD_GUARD_KEY, version);
          const freshUrl = new URL(window.location.href);
          freshUrl.searchParams.set("pwa_refresh", Date.now().toString());
          window.location.replace(freshUrl.toString());
        }
      } catch (error) {
        console.error("Impossible de vérifier la version de l’application", error);
      } finally {
        checkingVersion = false;
      }
    };

    const removeRefreshParameter = () => {
      const url = new URL(window.location.href);
      if (!url.searchParams.has("pwa_refresh")) return;
      url.searchParams.delete("pwa_refresh");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    };

    removeRefreshParameter();

    if ("serviceWorker" in navigator) {
      const onControllerChange = () => {
        if (!reloadOnControllerChange) return;
        reloadOnControllerChange = false;
        if (sessionStorage.getItem("pwa-auto-reloaded") !== "1") {
          sessionStorage.setItem("pwa-auto-reloaded", "1");
          window.location.reload();
        }
      };

      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then(async (registration) => {
          await registration.update();

          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }

          registration.addEventListener("updatefound", () => {
            const worker = registration.installing;
            if (!worker) return;
            worker.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) {
                worker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          });
        })
        .catch((error) => {
          console.error("Échec de l’enregistrement du service worker", error);
        });

      void checkAppVersion();

      const clearReloadFlag = window.setTimeout(() => {
        sessionStorage.removeItem("pwa-auto-reloaded");
      }, 8000);

      const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
      if (!standalone) setShowSplash(false);
      timer = standalone ? window.setTimeout(() => setShowSplash(false), 950) : undefined;

      const updateConnection = () => {
        setOffline(!navigator.onLine);
        if (navigator.onLine) void checkAppVersion();
      };

      const onVisibilityChange = () => {
        if (document.visibilityState === "visible") void checkAppVersion();
      };

      updateConnection();
      window.addEventListener("online", updateConnection);
      window.addEventListener("offline", updateConnection);
      document.addEventListener("visibilitychange", onVisibilityChange);

      return () => {
        if (timer) window.clearTimeout(timer);
        window.clearTimeout(clearReloadFlag);
        window.removeEventListener("online", updateConnection);
        window.removeEventListener("offline", updateConnection);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      };
    }

    const updateConnection = () => {
      setOffline(!navigator.onLine);
      if (navigator.onLine) void checkAppVersion();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void checkAppVersion();
    };

    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    document.addEventListener("visibilitychange", onVisibilityChange);
    setShowSplash(false);

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <>
      {offline && <div role="status" aria-live="polite" style={{position:"fixed",left:12,right:12,bottom:"calc(76px + env(safe-area-inset-bottom))",zIndex:99998,margin:"0 auto",maxWidth:520,background:"#17213f",color:"white",borderRadius:12,padding:"11px 14px",boxShadow:"0 10px 30px rgba(0,0,0,.22)",fontSize:12,fontWeight:700,textAlign:"center"}}>Hors connexion — les nouvelles réponses ne peuvent pas être synchronisées.</div>}
      {showSplash && (
        <div className="pwa-splash" role="status" aria-label="Ouverture de Haiti Nursing Exam Prep">
          <div className="pwa-splash-glow glow-one" /><div className="pwa-splash-glow glow-two" />
          <div className="pwa-splash-content">
            <div className="pwa-splash-logo" aria-hidden="true"><svg viewBox="0 0 160 160" width="112" height="112"><path d="M35 78c17-8 31-7 45 2v46c-14-9-28-10-45-2V78Z" fill="#ffffff" /><path d="M125 78c-17-8-31-7-45 2v46c14-9 28-10 45-2V78Z" fill="#dff7ff" /><path d="M53 63c0-19 12-31 27-31s27 12 27 31v10H53V63Z" fill="#ffffff" /><rect x="72" y="40" width="16" height="26" rx="3" fill="#20c3bd" /><rect x="67" y="45" width="26" height="16" rx="3" fill="#20c3bd" /><path d="M80 80v46" stroke="#4f7df3" strokeWidth="6" strokeLinecap="round" /></svg></div>
            <div className="pwa-splash-title"><span>HAITI</span> <strong>NURSING</strong></div><div className="pwa-splash-subtitle">EXAM PREP</div><p>Préparez-vous. Pratiquez. Progressez.</p><div className="pwa-splash-loader" aria-hidden="true"><span /></div>
          </div>
          <small className="pwa-splash-footer">Préparation infirmière • Haïti</small>
          <style jsx>{`.pwa-splash{display:none;position:fixed;inset:0;z-index:99999;overflow:hidden;background:linear-gradient(155deg,#061636 0%,#0b2558 48%,#0b4d70 100%);color:#fff;text-align:center;padding:calc(24px + env(safe-area-inset-top)) 26px calc(22px + env(safe-area-inset-bottom));isolation:isolate}.pwa-splash-content{position:relative;z-index:2;margin:auto;display:flex;flex-direction:column;align-items:center;animation:splashRise .45s cubic-bezier(.2,.8,.2,1)}.pwa-splash-glow{position:absolute;border-radius:999px;filter:blur(8px);opacity:.22;z-index:0}.glow-one{width:310px;height:310px;background:#2f6df6;top:-110px;right:-130px}.glow-two{width:280px;height:280px;background:#20c3bd;bottom:-120px;left:-130px}.pwa-splash-logo{width:146px;height:146px;border-radius:38px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(255,255,255,.14),rgba(255,255,255,.05));box-shadow:0 26px 72px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.14);margin-bottom:28px}.pwa-splash-title{font-size:30px;line-height:1.05;letter-spacing:.9px;font-weight:850}.pwa-splash-title strong{color:#42d7cf}.pwa-splash-subtitle{font-size:17px;letter-spacing:5.5px;margin-top:7px;font-weight:700;color:#eef6ff}.pwa-splash p{margin:27px 0;color:#c9f2ef;font-size:14px}.pwa-splash-loader{width:132px;height:4px;background:rgba(255,255,255,.17);border-radius:99px;overflow:hidden}.pwa-splash-loader span{display:block;height:100%;width:46%;background:linear-gradient(90deg,#3e82ff,#4ce0d6);border-radius:99px;animation:pwaLoading .78s ease-in-out infinite}.pwa-splash-footer{position:relative;z-index:2;margin-top:auto;color:rgba(229,242,255,.66);font-size:11px}.pwa-splash::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 38%,rgba(255,255,255,.08),transparent 34%);pointer-events:none}@media (display-mode:standalone){.pwa-splash{display:flex;flex-direction:column;align-items:center;justify-content:center}}@keyframes pwaLoading{0%{transform:translateX(-115%)}100%{transform:translateX(215%)}}@keyframes splashRise{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}@media(prefers-reduced-motion:reduce){.pwa-splash-content,.pwa-splash-loader span{animation:none}.pwa-splash-loader span{width:100%}}`}</style>
        </div>
      )}
    </>
  );
}
