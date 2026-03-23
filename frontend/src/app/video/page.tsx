"use client";

import { useState } from "react";
import { Video, Loader2, Download, Wand2, Upload } from "lucide-react";
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
                res = await videoFromImage(sourceFile, prompt, numFrames);
            }
            setResult(`http://127.0.0.1:8000${res.url}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Generation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-col">
            <header className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-subtle">
                        <Video className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-[15px] font-semibold">Video Generation</h1>
                        <p className="text-[11px] text-muted">Create videos with AI</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
                <div className="mx-auto max-w-2xl space-y-5 animate-slide-up">
                    {/* Tabs */}
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

                    {/* Prompt */}
                    <div>
                        <label className="mb-1.5 block text-sm text-muted">Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the video you want..."
                            rows={3}
                            className="input-base !rounded-xl resize-none"
                        />
                    </div>

                    {tab === "text" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-sm text-muted">Model</label>
                                <select value={model} onChange={(e) => setModel(e.target.value)} className="input-base">
                                    <option value="zeroscope">Zeroscope</option>
                                    <option value="modelscope">ModelScope</option>
                                    <option value="svd">Stable Video Diffusion</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm text-muted">Frames: {numFrames}</label>
                                <input type="range" min={8} max={64} step={4} value={numFrames} onChange={(e) => setNumFrames(Number(e.target.value))} className="w-full mt-2" />
                            </div>
                        </div>
                    )}

                    {tab === "img2vid" && (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm text-muted">Source Image</label>
                                <input type="file" accept="image/*" onChange={(e) => setSourceFile(e.target.files?.[0] || null)} className="file-input" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm text-muted">Frames: {numFrames}</label>
                                <input type="range" min={8} max={64} step={4} value={numFrames} onChange={(e) => setNumFrames(Number(e.target.value))} className="w-full mt-1" />
                            </div>
                        </div>
                    )}

                    <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full !py-3">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        {loading ? "Generating..." : "Generate"}
                    </button>

                    {error && <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-2.5 text-sm text-error">{error}</div>}

                    {result && (
                        <div className="overflow-hidden rounded-xl border border-border animate-in-scale">
                            <video src={result} controls className="w-full" />
                            <div className="flex items-center justify-between bg-surface px-4 py-3">
                                <p className="text-xs text-muted truncate flex-1 mr-4">{prompt}</p>
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
