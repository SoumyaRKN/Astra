"use client";

import { useState } from "react";
import { Music, Loader2, Download, Wand2, Upload, Volume2 } from "lucide-react";
import { generateMusic, enhanceAudio, storageUrl } from "@/lib/api";
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

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            if (tab === "generate") {
                if (!prompt.trim()) throw new Error("Enter a prompt");
                const res = await generateMusic(prompt, duration);
                setResult(storageUrl(res.url));
            } else {
                if (!audioFile) throw new Error("Select an audio file");
                const blob = await enhanceAudio(audioFile);
                setResult(URL.createObjectURL(blob));
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center gap-3 border-b border-border px-6 py-3">
                <Music className="h-5 w-5 text-accent" />
                <div>
                    <h1 className="text-lg font-semibold">Audio & Music</h1>
                    <p className="text-xs text-muted">Generate music or enhance audio</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="mx-auto max-w-2xl space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-1 rounded-xl bg-surface p-1">
                        <button
                            onClick={() => setTab("generate")}
                            className={clsx(
                                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                tab === "generate" ? "bg-accent/15 text-accent" : "text-muted hover:text-text"
                            )}
                        >
                            <Wand2 className="h-4 w-4" /> Generate Music
                        </button>
                        <button
                            onClick={() => setTab("enhance")}
                            className={clsx(
                                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                tab === "enhance" ? "bg-accent/15 text-accent" : "text-muted hover:text-text"
                            )}
                        >
                            <Volume2 className="h-4 w-4" /> Enhance Audio
                        </button>
                    </div>

                    {tab === "generate" ? (
                        <>
                            <div>
                                <label className="mb-1.5 block text-sm text-muted">Prompt</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe the music you want... e.g., 'calm ambient piano melody'"
                                    rows={3}
                                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder-muted outline-none focus:border-accent/50"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm text-muted">Duration: {duration}s</label>
                                <input
                                    type="range"
                                    min={5}
                                    max={30}
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="w-full accent-accent"
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="mb-1.5 block text-sm text-muted">Audio File</label>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text file:mr-3 file:rounded file:border-0 file:bg-accent/10 file:px-3 file:py-1 file:text-accent file:text-sm"
                            />
                            <p className="mt-2 text-xs text-muted">Reduces noise and normalizes volume</p>
                        </div>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : tab === "generate" ? <Wand2 className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        {loading ? "Processing..." : tab === "generate" ? "Generate Music" : "Enhance Audio"}
                    </button>

                    {error && <p className="text-sm text-error">{error}</p>}

                    {result && (
                        <div className="rounded-xl border border-border bg-surface p-4">
                            <audio src={result} controls className="w-full" />
                            <div className="mt-2 flex justify-end">
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
