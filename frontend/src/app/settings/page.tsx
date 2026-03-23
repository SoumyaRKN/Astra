"use client";

import { useState, useEffect } from "react";
import { Settings, Sun, Moon, Monitor, Trash2, Server, Cpu, HardDrive, RefreshCw, Loader2 } from "lucide-react";
import { useTheme, ThemeMode } from "@/store/theme";
import { getHealth, getInfo, getSessions, clearHistory } from "@/lib/api";
import clsx from "clsx";

interface SystemInfo {
    status?: string;
    llm_model?: string;
    version?: string;
    uptime?: string;
}

export default function SettingsPage() {
    const { mode, setMode } = useTheme();
    const [systemInfo, setSystemInfo] = useState<SystemInfo>({});
    const [sessions, setSessions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [clearing, setClearing] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [health, infoRes, sessRes] = await Promise.allSettled([
                    getHealth(),
                    getInfo(),
                    getSessions(),
                ]);
                if (health.status === "fulfilled") {
                    setSystemInfo((prev) => ({ ...prev, status: health.value.status }));
                }
                if (infoRes.status === "fulfilled") {
                    setSystemInfo((prev) => ({ ...prev, ...infoRes.value }));
                }
                if (sessRes.status === "fulfilled") {
                    const data = sessRes.value;
                    setSessions(Array.isArray(data) ? data : data.sessions ?? []);
                }
            } catch {
                setError("Failed to load system info");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleClearSession = async (session: string) => {
        setClearing(session);
        setError(null);
        try {
            await clearHistory(session);
            setSessions((prev) => prev.filter((s) => s !== session));
            setInfo(`Cleared session: ${session}`);
        } catch {
            setError("Failed to clear session");
        } finally {
            setClearing(null);
        }
    };

    const themes: { key: ThemeMode; label: string; icon: typeof Sun }[] = [
        { key: "light", label: "Light", icon: Sun },
        { key: "dark", label: "Dark", icon: Moon },
        { key: "system", label: "System", icon: Monitor },
    ];

    return (
        <div className="flex h-full flex-col">
            <header className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--color-accent-subtle)" }}>
                        <Settings className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div>
                        <h1 className="text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>Settings</h1>
                        <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>Preferences &amp; system info</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
                <div className="mx-auto max-w-2xl space-y-6 animate-slide-up">
                    {error && <div className="alert alert-error">{error}</div>}
                    {info && <div className="alert alert-success">{info}</div>}

                    {/* Theme */}
                    <div className="card space-y-4">
                        <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Appearance</h2>
                        </div>
                        <p className="text-xs" style={{ color: "var(--color-muted)" }}>Choose your preferred theme mode</p>
                        <div className="grid grid-cols-3 gap-2">
                            {themes.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setMode(key)}
                                    className={clsx(
                                        "flex flex-col items-center gap-2 rounded-xl p-4 text-xs font-medium transition-all border",
                                        mode === key
                                            ? "border-transparent shadow-md"
                                            : "hover:scale-[1.02]"
                                    )}
                                    style={{
                                        borderColor: mode === key ? "var(--color-accent)" : "var(--color-border)",
                                        background: mode === key ? "var(--color-accent-subtle)" : "var(--color-surface)",
                                        color: mode === key ? "var(--color-accent)" : "var(--color-muted)",
                                    }}
                                >
                                    <Icon className="h-5 w-5" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="card space-y-4">
                        <div className="flex items-center gap-2">
                            <Server className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>System Status</h2>
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--color-accent)" }} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-lg p-3" style={{ background: "var(--color-surface-2)" }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={clsx("h-2 w-2 rounded-full", systemInfo.status === "ok" ? "bg-green-400" : "bg-red-400")} />
                                        <span className="text-xs font-medium" style={{ color: "var(--color-text)" }}>Backend</span>
                                    </div>
                                    <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>{systemInfo.status === "ok" ? "Connected" : "Disconnected"}</p>
                                </div>
                                <div className="rounded-lg p-3" style={{ background: "var(--color-surface-2)" }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Cpu className="h-3 w-3" style={{ color: "var(--color-accent)" }} />
                                        <span className="text-xs font-medium" style={{ color: "var(--color-text)" }}>LLM Model</span>
                                    </div>
                                    <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>{systemInfo.llm_model || "mistral"}</p>
                                </div>
                                <div className="rounded-lg p-3" style={{ background: "var(--color-surface-2)" }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <HardDrive className="h-3 w-3" style={{ color: "var(--color-accent)" }} />
                                        <span className="text-xs font-medium" style={{ color: "var(--color-text)" }}>Version</span>
                                    </div>
                                    <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>{systemInfo.version || "1.0.0"}</p>
                                </div>
                                <div className="rounded-lg p-3" style={{ background: "var(--color-surface-2)" }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <RefreshCw className="h-3 w-3" style={{ color: "var(--color-accent)" }} />
                                        <span className="text-xs font-medium" style={{ color: "var(--color-text)" }}>API</span>
                                    </div>
                                    <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>http://127.0.0.1:8000</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sessions */}
                    <div className="card space-y-4">
                        <div className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Chat Sessions</h2>
                        </div>
                        <p className="text-xs" style={{ color: "var(--color-muted)" }}>Manage and clear conversation history</p>
                        {sessions.length === 0 ? (
                            <p className="text-xs py-4 text-center" style={{ color: "var(--color-muted)" }}>No active sessions</p>
                        ) : (
                            <div className="space-y-2">
                                {sessions.map((session) => (
                                    <div
                                        key={session}
                                        className="flex items-center justify-between rounded-lg px-3 py-2.5"
                                        style={{ background: "var(--color-surface-2)" }}
                                    >
                                        <span className="text-sm truncate" style={{ color: "var(--color-text)" }}>{session}</span>
                                        <button
                                            onClick={() => handleClearSession(session)}
                                            disabled={clearing === session}
                                            className="btn-ghost !px-2 !py-1 !text-xs text-red-400 hover:text-red-300"
                                        >
                                            {clearing === session ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* About */}
                    <div className="card space-y-3">
                        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>About Astra</h2>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                            Astra is a personal offline AI assistant powered by local LLMs via Ollama.
                            It supports text chat, voice interaction, image/video/audio generation,
                            avatar customization, and LoRA training — all running locally on your machine.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent)" }}>
                                Open Source
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent)" }}>
                                100% Local
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent)" }}>
                                Privacy First
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
