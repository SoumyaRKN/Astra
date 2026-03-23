"use client";

import { useState } from "react";
import { Video, Loader2, Download, Wand2, Upload, ArrowLeft } from "lucide-react";
import { generateVideo, videoFromImage } from "@/lib/api";
import clsx from "clsx";

type Tab = "text" | "img2vid";

export default function VideoPage() {
    const [tab, setTab] = useState<Tab>("text");
    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("zeroscope");
    const [numFrames, setNumFrames] = useState(24);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sourceFile, setSourceFile] = useState<File | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            let res;
            if (tab === "text") {
                if (!prompt.trim()) throw new Error("Enter a prompt");
                res = await generateVideo(prompt, model, numFrames);
            } else {
                if (!sourceFile) throw new Error("Select a source image");
                res = await videoFromImage(sourceFile, prompt, 40, numFrames);
            }
            setResult(`http://127.0.0.1:8000${res.url}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Generation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-col bg-[var(--color-bg)] transition-colors duration-500">
            <header className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <Video className="h-4 w-4 text-[var(--color-text)]" />
                    </div>
                    <div>
                        <h1 className="text-[14px] font-semibold tracking-tight text-[var(--color-text)]">Video Generation</h1>
                        <p className="text-[11px] font-medium text-[var(--color-muted)]">Create videos with AI</p>
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
                    <div className="mx-auto max-w-4xl animate-in-scale">
                        <div className="overflow-hidden rounded-[16px] border border-[var(--color-border)] shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                            <video src={result} controls className="w-full" />
                            <div className="flex items-center justify-between px-5 py-4 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="text-[13px] font-medium text-[var(--color-text)] truncate">{prompt || "Generated video"}</p>
                                    <p className="text-[11px] text-[var(--color-muted)] mt-0.5">{model} · {numFrames} frames</p>
                                </div>
                                <a href={result} download className="btn-primary !h-9 !px-4 !text-[13px] shrink-0">
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
                            <button onClick={() => setTab("text")} className={clsx("tab-item", tab === "text" && "tab-active")}>
                                <Wand2 className="h-4 w-4" />
                                <span>Text to Video</span>
                            </button>
                            <button onClick={() => setTab("img2vid")} className={clsx("tab-item", tab === "img2vid" && "tab-active")}>
                                <Upload className="h-4 w-4" />
                                <span>Image to Video</span>
                            </button>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the video you want..."
                                rows={3}
                                className="input-base !rounded-xl resize-none"
                            />
                        </div>

                        {tab === "text" && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Model</label>
                                    <select value={model} onChange={(e) => setModel(e.target.value)} className="input-base">
                                        <option value="zeroscope">Zeroscope</option>
                                        <option value="modelscope">ModelScope</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Frames: {numFrames}</label>
                                    <input type="range" min={8} max={64} step={4} value={numFrames} onChange={(e) => setNumFrames(Number(e.target.value))} className="w-full mt-2" />
                                </div>
                            </div>
                        )}

                        {tab === "img2vid" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Source Image</label>
                                    <input type="file" accept="image/*" onChange={(e) => setSourceFile(e.target.files?.[0] || null)} className="file-input" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Frames: {numFrames}</label>
                                    <input type="range" min={8} max={64} step={4} value={numFrames} onChange={(e) => setNumFrames(Number(e.target.value))} className="w-full mt-1" />
                                </div>
                            </div>
                        )}

                        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full !py-3.5">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            {loading ? "Generating..." : "Generate"}
                        </button>

                        {error && <div className="alert alert-error">{error}</div>}

                        {loading && (
                            <div className="card flex flex-col items-center gap-4 py-12 animate-in">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full blur-xl" style={{ background: 'rgba(109,90,254,0.2)', transform: 'scale(2)' }} />
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                                        <Video className="h-7 w-7 text-[var(--color-accent)] animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[14px] font-medium text-[var(--color-text)]">Creating your video…</p>
                                    <p className="text-[12px] text-[var(--color-muted)] mt-1">Video generation takes longer than images</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
