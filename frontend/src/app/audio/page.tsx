"use client";

import { useState } from "react";
import { Music, Loader2, Download, Wand2, Upload, Headphones } from "lucide-react";
import { enhanceAudio, generateMusic } from "@/lib/api";
import clsx from "clsx";
import { ThemeToggle } from "@/components/ThemeToggle";

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
        <div className="flex h-full flex-col">
            <header className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--color-accent-subtle)" }}>
                        <Music className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div>
                        <h1 className="text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>Audio Studio</h1>
                        <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>Generate music &amp; enhance audio</p>
                    </div>
                </div>
                <ThemeToggle />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
                <div className="space-y-6 animate-slide-up">
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
                                <label className="mb-1.5 block text-sm" style={{ color: "var(--color-muted)" }}>Prompt</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe the music style, mood, instruments..."
                                    rows={3}
                                    className="input-base !rounded-xl resize-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm" style={{ color: "var(--color-muted)" }}>Duration: {duration}s</label>
                                <input type="range" min={5} max={60} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full mt-1" />
                            </div>
                        </div>
                    )}

                    {tab === "enhance" && (
                        <div>
                            <label className="mb-1.5 block text-sm" style={{ color: "var(--color-muted)" }}>Audio File</label>
                            <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} className="file-input" />
                        </div>
                    )}

                    <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full !py-3.5">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : tab === "generate" ? <Wand2 className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
                        {loading ? "Processing..." : tab === "generate" ? "Generate Music" : "Enhance Audio"}
                    </button>

                    {error && <div className="alert alert-error">{error}</div>}

                    {result && (
                        <div className="card p-4 space-y-3 animate-in-scale">
                            <audio src={result} controls className="w-full" />
                            <div className="flex items-center justify-between">
                                <p className="text-xs truncate flex-1 mr-4" style={{ color: "var(--color-muted)" }}>{tab === "generate" ? prompt : "Enhanced audio"}</p>
                                <a href={result} download className="btn-ghost !px-3 !py-1.5 !text-xs">
                                    <Download className="h-3.5 w-3.5" /> Download
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
