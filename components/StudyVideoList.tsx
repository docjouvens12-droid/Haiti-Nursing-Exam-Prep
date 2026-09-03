"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { StudyVideo } from "@/lib/study-videos";
import styles from "./StudyVideoList.module.css";

export default function StudyVideoList({ videos }: { videos: readonly StudyVideo[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const root = useRef<HTMLDetailsElement>(null);
  const playerId = useId();
  const activeVideo = videos.find((video) => video.id === activeId);

  // Stop playback when this list, its topic, or its category is collapsed.
  useEffect(() => {
    const ancestors: HTMLDetailsElement[] = [];
    let element: HTMLElement | null = root.current;
    while (element) {
      if (element instanceof HTMLDetailsElement) ancestors.push(element);
      element = element.parentElement;
    }
    const stopWhenClosed = () => {
      if (ancestors.some((details) => !details.open)) setActiveId(null);
    };
    ancestors.forEach((details) => details.addEventListener("toggle", stopWhenClosed));
    return () => ancestors.forEach((details) => details.removeEventListener("toggle", stopWhenClosed));
  }, []);

  return (
    <details ref={root} className={styles.videos}>
      <summary className={styles.summary}>
        <span aria-hidden="true">▷ </span>
        {videos.length === 1 ? "1 vidéo explicative" : `${videos.length} vidéos explicatives`}
      </summary>
      <p className={styles.note}>Capsules explicatives et démonstrations de soins. Le titre précise l’aspect abordé ; les gestes techniques suivent les protocoles de l’établissement auteur.</p>
      <div className={styles.choices}>
        {videos.map((video) => (
          <div key={video.id} className={styles.choice}>
            <strong>{video.title}</strong>
            <span className={styles.metadata}>
              {Math.floor(video.durationSeconds / 60)} min {String(video.durationSeconds % 60).padStart(2, "0")} s · {video.language}
            </span>
            <div className={styles.actions}>
              <button type="button" aria-controls={playerId} aria-pressed={activeId === video.id}
                onClick={() => setActiveId((current) => current === video.id ? null : video.id)}>
                {activeId === video.id ? "Fermer la vidéo" : "Voir la vidéo"}
                <span className={styles.srOnly}> : {video.title}</span>
              </button>
              <a href={video.sourceUrl} target="_blank" rel="noopener noreferrer">Source ↗<span className={styles.srOnly}> : {video.publisher} (nouvel onglet)</span></a>
              <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">YouTube ↗<span className={styles.srOnly}> (nouvel onglet)</span></a>
            </div>
            <p className={styles.credit}>
              {video.publisher} · Source et durée contrôlées le {video.checkedAt.split("-").reverse().join("/")}.
            </p>
          </div>
        ))}
      </div>
      <div id={playerId} className={styles.player}>
        {activeVideo ? (
          <>
            <p className={styles.nowPlaying} role="status">Lecteur : {activeVideo.title}</p>
            <iframe key={activeVideo.id}
              src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?rel=0&playsinline=1`}
              title={activeVideo.title}
              allow="encrypted-media; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
            <p className={styles.note}>Si le lecteur ne s’affiche pas, ouvrez la vidéo avec le lien YouTube ci-dessus.</p>
          </>
        ) : null}
      </div>
    </details>
  );
}
