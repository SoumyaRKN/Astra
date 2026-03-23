"use client";

import { useEffect } from "react";
import { useTheme, ThemeMode } from "@/store/theme";

const STORAGE_KEY = "astra-theme";

function getSystemTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: "light" | "dark") {
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { mode, setMode, setResolved } = useTheme();

    // Initialize from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        if (saved && ["light", "dark", "system"].includes(saved)) {
            setMode(saved);
        }
    }, [setMode]);

    // Apply theme whenever mode changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, mode);
        const resolved = mode === "system" ? getSystemTheme() : mode;
        setResolved(resolved);
        applyTheme(resolved);
    }, [mode, setResolved]);

    // Listen for system theme changes when in system mode
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            if (useTheme.getState().mode === "system") {
                const resolved = mq.matches ? "dark" : "light";
                setResolved(resolved);
                applyTheme(resolved);
            }
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [setResolved]);

    return <>{children}</>;
}
