"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "sda:completed-lessons:v1";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

type ProgressValue = {
  completed: Set<string>;
  toggle: (slug: string) => void;
  isComplete: (slug: string) => boolean;
};

const ProgressContext = createContext<ProgressValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => "[]");
  const completed = useMemo(() => {
    try {
      return new Set<string>(JSON.parse(snapshot));
    } catch {
      return new Set<string>();
    }
  }, [snapshot]);

  const toggle = useCallback(
    (slug: string) => {
      const next = new Set(completed);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      listeners.forEach((listener) => listener());
    },
    [completed],
  );

  const value = useMemo(
    () => ({ completed, toggle, isComplete: (slug: string) => completed.has(slug) }),
    [completed, toggle],
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress must be used within ProgressProvider");
  return value;
}
