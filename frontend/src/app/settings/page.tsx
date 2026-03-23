"use client";

import { useState, useEffect } from "react";
import { Settings, Wifi, WifiOff, Trash2, RefreshCw, Info } from "lucide-react";
import { getHealth, getInfo, getSessions, clearHistory } from "@/lib/api";

interface SystemInfo {
    name: string;
    version: string;
    features: string[];
    ollama: { url: string; model: string; timeout: number };
    llm: { context: number; temperature: number; max_tokens: number };
}

export default function SettingsPage() {
    const [health, setHealth] = useState<{ status: string; ollama: boolean; model: string } | null>(null);
    const [info, setInfo] = useState<SystemInfo | null>(null);
    const [sessions, setSessions] = useState<string[]>([]);
    const [clearing, setClearing] = useState<string | null>(null);

    const refresh = async () => {
        try {
            const [h, i, s] = await Promise.all([getHealth(), getInfo(), getSessions()]);
            setHealth(h);
            setInfo(i);
            setSessions(s.sessions || []);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        refresh();
    }, []);

    const handleClear = async (session: string) => {
        setClearing(session);
        try {
            await clearHistory(session);
            await refresh();
        } catch { /* ignore */ }
        setClearing(null);
    };

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b border-border px-6 py-3">
                <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-accent" />
                    <div>
                        <h1 className="text-lg font-semibold">Settings</h1>
                        <p className="text-xs text-muted">System configuration and status</p>
                    </div>
                </div>
                <button
                    onClick={refresh}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-text"
                >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="mx-auto max-w-2xl space-y-6">
                    {/* System Status */}
                    <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
                        <h2 className="text-sm font-medium flex items-center gap-2">
                            <Info className="h-4 w-4 text-accent" /> System Status
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-bg px-4 py-3">
                                <p className="text-xs text-muted">Status</p>
                                <div className="mt-1 flex items-center gap-2">
                                    {health?.ollama ? (
                                        <Wifi className="h-4 w-4 text-success" />
                                    ) : (
                                        <WifiOff className="h-4 w-4 text-error" />
                                    )}
                                    <p className="text-sm font-medium capitalize">{health?.status || "Unknown"}</p>
                                </div>
                            </div>
                            <div className="rounded-lg bg-bg px-4 py-3">
                                <p className="text-xs text-muted">Model</p>
                                <p className="mt-1 text-sm font-medium">{health?.model || "—"}</p>
                            </div>
                            <div className="rounded-lg bg-bg px-4 py-3">
                                <p className="text-xs text-muted">Version</p>
                                <p className="mt-1 text-sm font-medium">{info?.version || "—"}</p>
                            </div>
                            <div className="rounded-lg bg-bg px-4 py-3">
                                <p className="text-xs text-muted">Features</p>
                                <p className="mt-1 text-sm font-medium">{info?.features?.length || 0} active</p>
                            </div>
                        </div>
                    </div>

                    {/* LLM Configuration */}
                    {info && (
                        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
                            <h2 className="text-sm font-medium">LLM Configuration</h2>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between rounded-lg bg-bg px-4 py-2.5">
                                    <span className="text-sm text-muted">Ollama URL</span>
                                    <span className="text-sm text-text font-mono">{info.ollama.url}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-bg px-4 py-2.5">
                                    <span className="text-sm text-muted">Model</span>
                                    <span className="text-sm text-text font-mono">{info.ollama.model}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-bg px-4 py-2.5">
                                    <span className="text-sm text-muted">Temperature</span>
                                    <span className="text-sm text-text">{info.llm.temperature}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-bg px-4 py-2.5">
                                    <span className="text-sm text-muted">Context Length</span>
                                    <span className="text-sm text-text">{info.llm.context}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-bg px-4 py-2.5">
                                    <span className="text-sm text-muted">Max Tokens</span>
                                    <span className="text-sm text-text">{info.llm.max_tokens}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-bg px-4 py-2.5">
                                    <span className="text-sm text-muted">Timeout</span>
                                    <span className="text-sm text-text">{info.ollama.timeout}s</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Features */}
                    {info?.features && (
                        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
                            <h2 className="text-sm font-medium">Available Features</h2>
                            <div className="flex flex-wrap gap-2">
                                {info.features.map((f) => (
                                    <span
                                        key={f}
                                        className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent capitalize"
                                    >
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Sessions */}
                    {sessions.length > 0 && (
                        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
                            <h2 className="text-sm font-medium">Chat Sessions</h2>
                            <div className="space-y-2">
                                {sessions.map((s) => (
                                    <div key={s} className="flex items-center justify-between rounded-lg bg-bg px-4 py-2.5">
                                        <span className="text-sm text-text">{s}</span>
                                        <button
                                            onClick={() => handleClear(s)}
                                            disabled={clearing === s}
                                            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-error hover:bg-error/10 disabled:opacity-50"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            {clearing === s ? "Clearing..." : "Clear"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
