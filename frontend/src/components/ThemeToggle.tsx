"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, ThemeMode } from "@/store/theme";

const cycle: ThemeMode[] = ["light", "dark", "system"];

export function ThemeToggle() {
    const { mode, setMode } = useTheme();
    const next = cycle[(cycle.indexOf(mode) + 1) % cycle.length];
    const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;

    return (
        <button
            onClick={() => setMode(next)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-[var(--color-surface-2)]"
            style={{ color: "var(--color-muted)" }}
            title={`Theme: ${mode} — click for ${next}`}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
}
