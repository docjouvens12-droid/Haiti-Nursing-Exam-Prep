"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function normalizePercent() {
  const doc = document.documentElement;
  const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
  return Math.max(0, Math.min(100, Math.round((window.scrollY / maxScroll) * 100)));
}

export default function CourseProgressTracker() {
  const pathname = usePathname();
  const lastSaved = useRef(0);
  const userId = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === "/cours-revisions") return;
    if (!pathname.startsWith("/cours-revisions/")) return;

    const supabase = createClient();
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function save(percent: number) {
      if (!active || !userId.current) return;
      const bounded = Math.max(5, Math.min(100, percent));
      if (bounded < 100 && bounded <= lastSaved.current + 4) return;

      const status = bounded >= 95 ? "termine" : "en_cours";
      const finalPercent = status === "termine" ? 100 : bounded;
      const now = new Date().toISOString();
      const title = document.querySelector("h1")?.textContent?.trim() || pathname.split("/").filter(Boolean).pop() || "Module";

      const payload: Record<string, unknown> = {
        user_id: userId.current,
        module_key: pathname,
        module_title: title,
        status,
        progress_percent: finalPercent,
        updated_at: now,
      };
      if (lastSaved.current === 0) payload.started_at = now;
      if (status === "termine") payload.completed_at = now;

      const { error } = await supabase
        .from("learning_module_progress")
        .upsert(payload, { onConflict: "user_id,module_key" });

      if (!error) lastSaved.current = finalPercent;
    }

    async function init() {
      const { data: auth } = await supabase.auth.getUser();
      if (!active || !auth.user) return;
      userId.current = auth.user.id;

      const { data } = await supabase
        .from("learning_module_progress")
        .select("progress_percent")
        .eq("user_id", auth.user.id)
        .eq("module_key", pathname)
        .maybeSingle();

      lastSaved.current = Number(data?.progress_percent ?? 0);
      await save(Math.max(lastSaved.current, 5));
    }

    function onScroll() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const percent = normalizePercent();
        void save(percent);
      }, 500);
    }

    void init();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return null;
}
