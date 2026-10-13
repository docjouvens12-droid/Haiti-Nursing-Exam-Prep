import type { ReactNode } from "react";
export type StudentNavIconName = "home" | "qcm" | "exams" | "books" | "more";
/** Uniform line icons; no emoji or external icon dependency in the mobile bar. */
export default function StudentNavIcon({ name }: { name: StudentNavIconName }) {
  let graphic: ReactNode;
  switch (name) {
    case "home":
      graphic = <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z"/><path d="M9 21v-8h6v8"/></>; break;
    case "qcm":
      graphic = <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m7.5 9 1.5 1.5L12 7.5M14 9h3M7.5 15l1.5 1.5 3-3M14 15h3"/></>; break;
    case "exams":
      graphic = <><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V3h6v2M8 10h8M8 14h4m2 0 1.5 1.5L18 13"/></>; break;
    case "books":
      graphic = <><path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1ZM12 6v14"/></>; break;
    default:
      graphic = <><circle cx="5" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.8" fill="currentColor" stroke="none"/></>;
  }
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" aria-hidden="true" focusable="false">{graphic}</svg>;
}
