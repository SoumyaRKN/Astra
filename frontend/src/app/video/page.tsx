"use client";

import { useState } from "react";
import { Video, Loader2, Download, Wand2, Upload } from "lucide-react";
import { generateVideo, videoFromImage, storageUrl } from "@/lib/api";
import clsx from "clsx";

type Tab = "text" | "img2vid";

export default function VideoPage() {
    const [tab, setTab] = useState<Tab>("text");
    const [prompt, setPrompt] = useState("");
    const [steps, setSteps] = useState(40);
    const [frames, setFrames] = useState(24);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sourceFile, setSourceFile] = useState<File | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim() && tab === "text") return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let res;
            if (tab === "text") {
                res = await generateVideo(prompt, steps, frames);
            } else {
                if (!sourceFile) throw new Error("Select a source image");
                res = await videoFromImage(sourceFile, prompt, steps, frames);
            }
            setResult(storageUrl(res.url));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Generation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center gap-3 border-b border-border px-6 py-3">
                <Video className="h-5 w-5 text-accent" />
                <div>
                    <h1 className="text-lg font-semibold">Video Generation</h1>
                    <p className="text-xs text-muted">Create videos with AI</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="mx-auto max-w-2xl space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-1 rounded-xl bg-surface p-1">
                        <button
                            onClick={() => setTab("text")}
                            className={clsx(
                                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                tab === "text" ? "bg-accent/15 text-accent" : "text-muted hover:text-text"
                            )}
                        >
                            <Wand2 className="h-4 w-4" /> Text to Video
                        </button>
                        <button
                            onClick={() => setTab("img2vid")}
                            className={clsx(
                                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                tab === "img2vid" ? "bg-accent/15 text-accent" : "text-muted hover:text-text"
                            )}
                        >
                            <Upload className="h-4 w-4" /> Image to Video
                        </button>
                    </div>

                    {/* Prompt */}
                    <div>
                        <label className="mb-1.5 block text-sm text-muted">Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the video you want to generate..."
                            rows={3}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder-muted outline-none focus:border-accent/50"
                        />
                    </div>

                    {tab === "img2vid" && (
                        <div>
                            <label className="mb-1.5 block text-sm text-muted">Source Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSourceFile(e.target.files?.[0] || null)}
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text file:mr-3 file:rounded file:border-0 file:bg-accent/10 file:px-3 file:py-1 file:text-accent file:text-sm"
                            />
                        </div>
                    )}

                    {/* Controls */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm text-muted">Steps: {steps}</label>
                            <input
                                type="range"
                                min={10}
                                max={100}
                                value={steps}
                                onChange={(e) => setSteps(Number(e.target.value))}
                                className="w-full accent-accent"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm text-muted">Frames: {frames}</label>
                            <input
                                type="range"
                                min={8}
                                max={48}
                                value={frames}
                                onChange={(e) => setFrames(Number(e.target.value))}
                                className="w-full accent-accent"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        {loading ? "Generating..." : "Generate Video"}
                    </button>

                    {error && <p className="text-sm text-error">{error}</p>}

                    {result && (
                        <div className="overflow-hidden rounded-xl border border-border">
                            <video src={result} controls className="w-full" />
                            <div className="flex items-center justify-between bg-surface px-4 py-2">
                                <p className="text-xs text-muted truncate">{prompt}</p>
                                <a href={result} download className="flex items-center gap-1 text-xs text-accent hover:underline">
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
