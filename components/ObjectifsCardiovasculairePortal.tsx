"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ObjectifsCardiovasculaire from "./ObjectifsCardiovasculaire";

export default function ObjectifsCardiovasculairePortal() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const header = document.querySelector("main > header");
    if (!header) return;

    let host = document.getElementById("objectifs-cardiovasculaire-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "objectifs-cardiovasculaire-host";
      header.insertAdjacentElement("afterend", host);
    }
    setTarget(host);

    return () => {
      if (host && host.parentNode) host.parentNode.removeChild(host);
    };
  }, []);

  return target ? createPortal(<ObjectifsCardiovasculaire />, target) : null;
}
