import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
    mode: ThemeMode;
    resolved: "light" | "dark";
    setMode: (mode: ThemeMode) => void;
    setResolved: (resolved: "light" | "dark") => void;
}

export const useTheme = create<ThemeState>((set) => ({
    mode: "system",
    resolved: "dark",
    setMode: (mode) => set({ mode }),
    setResolved: (resolved) => set({ resolved }),
}));
