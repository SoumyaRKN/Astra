"use client";

import { useState, useEffect } from "react";
import { Settings, Sun, Moon, Monitor, Trash2, Server, Cpu, HardDrive, RefreshCw, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
        setInfo(null);
        try {
            await clearHistory(session);
            setSessions((prev) => prev.filter((s) => s !== session));
            setInfo(`Session "${session}" cleared successfully.`);
        } catch {
            setError("Failed to clear session. Please try again.");
        } finally {
            setClearing(null);
        }
    };

    const themes: { key: ThemeMode; label: string; icon: typeof Sun; desc: string }[] = [
        { key: "light", label: "Light", icon: Sun, desc: "Always light" },
        { key: "dark", label: "Dark", icon: Moon, desc: "Always dark" },
        { key: "system", label: "System", icon: Monitor, desc: "Follows OS" },
    ];

    const isOnline = systemInfo.status === "ok";

    return (
        <div className="flex h-full flex-col bg-[var(--color-bg)] transition-colors duration-500">
            {/* Header */}
            <header className="page-header border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl z-30">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <Settings className="h-4 w-4 text-[var(--color-text)]" />
                    </div>
                    <div>
                        <h1 className="text-[14px] font-semibold tracking-tight text-[var(--color-text)]">Settings</h1>
                        <p className="text-[11px] font-medium text-[var(--color-muted)]">Preferences &amp; system info</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
                <div className="mx-auto max-w-3xl space-y-6 animate-slide-up">

                    {/* Status alerts */}
                    {error && (
                        <div className="flex items-center gap-2.5 rounded-[12px] border border-[var(--color-error)]/20 bg-[var(--color-error)]/05 px-4 py-3 text-[14px] text-[var(--color-error)]">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}
                    {info && (
                        <div className="flex items-center gap-2.5 rounded-[12px] border border-[var(--color-success)]/20 bg-[var(--color-success)]/05 px-4 py-3 text-[14px] text-[var(--color-success)]">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            {info}
                        </div>
                    )}

                    {/* Appearance */}
                    <div className="card space-y-5">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sun className="h-4 w-4 text-[var(--color-text)]" />
                                <h2 className="text-[14px] font-semibold text-[var(--color-text)]">Appearance</h2>
                            </div>
                            <p className="text-[13px] text-[var(--color-muted)]">Choose your preferred interface theme</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {themes.map(({ key, label, icon: Icon, desc }) => (
                                <button
                                    key={key}
                                    onClick={() => setMode(key)}
                                    className={clsx(
                                        "flex flex-col items-center gap-2.5 rounded-[16px] p-5 text-sm font-medium transition-all duration-300 border",
                                        mode === key
                                            ? "border-[var(--color-border-hover)] bg-[var(--color-surface-2)] text-[var(--color-text)] shadow-sm"
                                            : "border-[var(--color-border)] bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] hover:border-[var(--color-border-hover)]"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <div className="text-center">
                                        <div className="text-[13px] font-medium">{label}</div>
                                        <div className="text-[11px] font-normal opacity-60 mt-0.5">{desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="card space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Server className="h-4 w-4 text-[var(--color-text)]" />
                                    <h2 className="text-[14px] font-semibold text-[var(--color-text)]">System Status</h2>
                                </div>
                                <p className="text-[13px] text-[var(--color-muted)]">Real-time backend information</p>
                            </div>
                            <div className={clsx("status-badge", isOnline ? "status-online" : "status-offline")}>
                                <span className={clsx("h-1.5 w-1.5 rounded-full", isOnline ? "bg-[var(--color-success)]" : "bg-[var(--color-error)]")} />
                                {isOnline ? "Online" : "Offline"}
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="rounded-[12px] p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] shimmer">
                                        <div className="h-3 w-16 rounded bg-[var(--color-surface-3)] mb-2" />
                                        <div className="h-4 w-24 rounded bg-[var(--color-surface-3)]" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { icon: Server, label: "Backend", value: systemInfo.status === "ok" ? "Connected" : "Disconnected" },
                                    { icon: Cpu, label: "LLM Model", value: systemInfo.llm_model || "mistral" },
                                    { icon: HardDrive, label: "Version", value: systemInfo.version || "1.0.0" },
                                    { icon: RefreshCw, label: "API", value: "127.0.0.1:8000" },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="rounded-[12px] p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Icon className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                                            <span className="text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wider">{label}</span>
                                        </div>
                                        <p className="text-[13px] font-semibold text-[var(--color-text)] truncate">{value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat Sessions */}
                    <div className="card space-y-5">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Trash2 className="h-4 w-4 text-[var(--color-text)]" />
                                <h2 className="text-[14px] font-semibold text-[var(--color-text)]">Chat Sessions</h2>
                            </div>
                            <p className="text-[13px] text-[var(--color-muted)]">Manage and clear conversation history</p>
                        </div>

                        {sessions.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-8 text-center rounded-[12px] border border-dashed border-[var(--color-border)]">
                                <div className="h-10 w-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center">
                                    <Trash2 className="h-5 w-5 text-[var(--color-muted)]" />
                                </div>
                                <div>
                                    <p className="text-[14px] font-medium text-[var(--color-text)]">No active sessions</p>
                                    <p className="text-[13px] text-[var(--color-muted)] mt-0.5">Sessions will appear here once you start chatting.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sessions.map((session) => (
                                    <div
                                        key={session}
                                        className="flex items-center justify-between rounded-[12px] px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] transition-all duration-200 hover:border-[var(--color-border-hover)]"
                                    >
                                        <span className="text-[14px] font-medium text-[var(--color-text)] truncate">{session}</span>
                                        <button
                                            onClick={() => handleClearSession(session)}
                                            disabled={clearing === session}
                                            className="btn-ghost !px-2.5 !py-1.5 !text-[13px] text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/08 shrink-0 ml-3 transition-all duration-200"
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
                    <div className="card space-y-4">
                        <h2 className="text-[14px] font-semibold text-[var(--color-text)]">About Astra</h2>
                        <p className="text-[14px] leading-relaxed text-[var(--color-muted)]">
                            Astra is a personal offline AI assistant powered by local LLMs via Ollama.
                            It supports text chat, voice interaction, image/video/audio generation,
                            avatar customization, and LoRA training — all running entirely on your machine.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            {["Open Source", "100% Local", "Privacy First"].map((tag) => (
                                <span key={tag} className="text-[11px] font-medium px-3 py-1 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-muted)]">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
