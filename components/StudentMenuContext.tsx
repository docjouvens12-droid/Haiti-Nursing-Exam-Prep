"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const StudentMenuContext = createContext<{
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
} | null>(null);

export function StudentMenuProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <StudentMenuContext.Provider value={{ drawerOpen, setDrawerOpen }}>
      {children}
    </StudentMenuContext.Provider>
  );
}

export function useStudentMenu() {
  const menu = useContext(StudentMenuContext);
  if (!menu) throw new Error("StudentMenuProvider est requis.");
  return menu;
}

export function StudentMenuButton() {
  const { drawerOpen, setDrawerOpen } = useStudentMenu();
  return (
    <button
      type="button"
      className="menu-button"
      aria-label="Ouvrir le menu"
      aria-expanded={drawerOpen}
      aria-controls="student-menu"
      aria-haspopup="dialog"
      onClick={() => setDrawerOpen(true)}
    >
      <span aria-hidden="true">☰</span>
    </button>
  );
}
