"use client";

import { useState } from "react";
import { Music, Loader2, Download, Wand2, Headphones, ArrowLeft } from "lucide-react";
import { enhanceAudio, generateMusic } from "@/lib/api";
import clsx from "clsx";

type Tab = "generate" | "enhance";

export default function AudioPage() {
    const [tab, setTab] = useState<Tab>("generate");
    const [prompt, setPrompt] = useState("");
    const [duration, setDuration] = useState(10);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            let res;
            if (tab === "generate") {
                if (!prompt.trim()) throw new Error("Enter a prompt");
                res = await generateMusic(prompt, duration);
            } else {
                if (!audioFile) throw new Error("Select an audio file");
                res = await enhanceAudio(audioFile);
            }
            setResult(`http://127.0.0.1:8000${res.url}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-col bg-[var(--color-bg)] transition-colors duration-500">
            <header className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <Music className="h-4 w-4 text-[var(--color-text)]" />
                    </div>
                    <div>
                        <h1 className="text-[14px] font-semibold tracking-tight text-[var(--color-text)]">Audio Studio</h1>
                        <p className="text-[11px] font-medium text-[var(--color-muted)]">Generate music &amp; enhance audio</p>
                    </div>
                </div>
                {result && (
                    <button onClick={() => setResult(null)} className="btn-ghost gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">New</span>
                    </button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
                {/* Result display */}
                {result && (
                    <div className="mx-auto max-w-2xl animate-in-scale">
                        <div className="card space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--color-accent-subtle)]">
                                    <Music className="h-5 w-5 text-[var(--color-accent)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-medium text-[var(--color-text)] truncate">{tab === "generate" ? prompt : "Enhanced audio"}</p>
                                    <p className="text-[11px] text-[var(--color-muted)]">{tab === "generate" ? `${duration}s · AI generated` : "Audio enhancement"}</p>
                                </div>
                            </div>
                            <audio src={result} controls className="w-full" />
                            <div className="flex justify-end">
                                <a href={result} download className="btn-primary !h-9 !px-4 !text-[13px]">
                                    <Download className="h-3.5 w-3.5" /> Download
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                {!result && (
                    <div className="mx-auto max-w-2xl space-y-6 animate-slide-up">
                        <div className="tab-bar">
                            <button onClick={() => setTab("generate")} className={clsx("tab-item", tab === "generate" && "tab-active")}>
                                <Wand2 className="h-4 w-4" />
                                <span>Generate Music</span>
                            </button>
                            <button onClick={() => setTab("enhance")} className={clsx("tab-item", tab === "enhance" && "tab-active")}>
                                <Headphones className="h-4 w-4" />
                                <span>Enhance Audio</span>
                            </button>
                        </div>

                        {tab === "generate" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Prompt</label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe the music style, mood, instruments..."
                                        rows={3}
                                        className="input-base !rounded-xl resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Duration: {duration}s</label>
                                    <input type="range" min={5} max={60} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full mt-1" />
                                </div>
                            </div>
                        )}

                        {tab === "enhance" && (
                            <div>
                                <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Audio File</label>
                                <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} className="file-input" />
                            </div>
                        )}

                        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full !py-3.5">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : tab === "generate" ? <Wand2 className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
                            {loading ? "Processing..." : tab === "generate" ? "Generate Music" : "Enhance Audio"}
                        </button>

                        {error && <div className="alert alert-error">{error}</div>}

                        {loading && (
                            <div className="card flex flex-col items-center gap-4 py-12 animate-in">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full blur-xl" style={{ background: 'rgba(109,90,254,0.2)', transform: 'scale(2)' }} />
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                                        <Music className="h-7 w-7 text-[var(--color-accent)] animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[14px] font-medium text-[var(--color-text)]">{tab === "generate" ? "Composing your music…" : "Enhancing audio…"}</p>
                                    <p className="text-[12px] text-[var(--color-muted)] mt-1">This may take a moment</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
