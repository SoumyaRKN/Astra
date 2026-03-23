"use client";

import { useState } from "react";
import { Image as ImageIcon, Loader2, Download, Wand2, Upload, Sparkles } from "lucide-react";
import { generateImage, imageFromImage, imageFromTrained, getTrainedModels, storageUrl } from "@/lib/api";
import clsx from "clsx";

type Tab = "text" | "img2img" | "trained";

export default function ImagePage() {
    const [tab, setTab] = useState<Tab>("text");
    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("sd-1.5");
    const [steps, setSteps] = useState(30);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // img2img state
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [strength, setStrength] = useState(0.75);

    // trained state
    const [loraPath, setLoraPath] = useState("");
    const [triggerWord, setTriggerWord] = useState("astra_subject");

    const handleGenerate = async () => {
        if (!prompt.trim() && tab !== "img2img") return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let res;
            if (tab === "text") {
                res = await generateImage(prompt, model, steps);
            } else if (tab === "img2img") {
                if (!sourceFile) throw new Error("Select a source image");
                res = await imageFromImage(sourceFile, prompt, strength, steps);
            } else {
                if (!loraPath) throw new Error("Enter LoRA model path");
                res = await imageFromTrained(prompt, loraPath, triggerWord);
            }
            setResult(storageUrl(res.url));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Generation failed");
        } finally {
            setLoading(false);
        }
    };

    const tabs: { key: Tab; label: string; icon: typeof Wand2 }[] = [
        { key: "text", label: "Text to Image", icon: Wand2 },
        { key: "img2img", label: "Image to Image", icon: Upload },
        { key: "trained", label: "From Trained", icon: Sparkles },
    ];

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center gap-3 border-b border-border px-6 py-3">
                <ImageIcon className="h-5 w-5 text-accent" />
                <div>
                    <h1 className="text-lg font-semibold">Image Generation</h1>
                    <p className="text-xs text-muted">Create images with AI</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="mx-auto max-w-2xl space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-1 rounded-xl bg-surface p-1">
                        {tabs.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={clsx(
                                    "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                    tab === key ? "bg-accent/15 text-accent" : "text-muted hover:text-text"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Prompt */}
                    <div>
                        <label className="mb-1.5 block text-sm text-muted">Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the image you want to generate..."
                            rows={3}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder-muted outline-none focus:border-accent/50"
                        />
                    </div>

                    {/* Tab-specific controls */}
                    {tab === "text" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-sm text-muted">Model</label>
                                <select
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent/50"
                                >
                                    <option value="sd-1.5">Stable Diffusion 1.5</option>
                                    <option value="sd-2.1">Stable Diffusion 2.1</option>
                                    <option value="sdxl">SDXL</option>
                                    <option value="sdxl-turbo">SDXL Turbo (fast)</option>
                                </select>
                            </div>
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
                        </div>
                    )}

                    {tab === "img2img" && (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm text-muted">Source Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSourceFile(e.target.files?.[0] || null)}
                                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text file:mr-3 file:rounded file:border-0 file:bg-accent/10 file:px-3 file:py-1 file:text-accent file:text-sm"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm text-muted">Strength: {strength.toFixed(2)}</label>
                                <input
                                    type="range"
                                    min={0.1}
                                    max={1.0}
                                    step={0.05}
                                    value={strength}
                                    onChange={(e) => setStrength(Number(e.target.value))}
                                    className="w-full accent-accent"
                                />
                            </div>
                        </div>
                    )}

                    {tab === "trained" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-sm text-muted">LoRA Model Path</label>
                                <input
                                    type="text"
                                    value={loraPath}
                                    onChange={(e) => setLoraPath(e.target.value)}
                                    placeholder="storage/training/models/my_lora"
                                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder-muted outline-none focus:border-accent/50"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm text-muted">Trigger Word</label>
                                <input
                                    type="text"
                                    value={triggerWord}
                                    onChange={(e) => setTriggerWord(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent/50"
                                />
                            </div>
                        </div>
                    )}

                    {/* Generate button */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        {loading ? "Generating..." : "Generate"}
                    </button>

                    {error && <p className="text-sm text-error">{error}</p>}

                    {/* Result */}
                    {result && (
                        <div className="overflow-hidden rounded-xl border border-border">
                            <img src={result} alt="Generated" className="w-full" />
                            <div className="flex items-center justify-between bg-surface px-4 py-2">
                                <p className="text-xs text-muted truncate">{prompt}</p>
                                <a
                                    href={result}
                                    download
                                    className="flex items-center gap-1 text-xs text-accent hover:underline"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Download
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
