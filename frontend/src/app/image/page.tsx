"use client";

import { useState } from "react";
import { Image as ImageIcon, Loader2, Download, Wand2, Upload, Sparkles, ArrowLeft } from "lucide-react";
import { generateImage, imageFromImage, imageFromTrained } from "@/lib/api";
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
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [strength, setStrength] = useState(0.75);
    const [loraPath, setLoraPath] = useState("");
    const [triggerWord, setTriggerWord] = useState("astra_subject");

    const handleGenerate = async () => {
        if (!prompt.trim() && tab !== "img2img") return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            let res;
            if (tab === "text") res = await generateImage(prompt, model, steps);
            else if (tab === "img2img") {
                if (!sourceFile) throw new Error("Select a source image");
                res = await imageFromImage(sourceFile, prompt, strength, steps);
            } else {
                if (!loraPath) throw new Error("Enter LoRA model path");
                res = await imageFromTrained(prompt, loraPath, triggerWord);
            }
            setResult(`http://127.0.0.1:8000${res.url}`);
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
        <div className="flex h-full flex-col bg-[var(--color-bg)] transition-colors duration-500">
            <header className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <ImageIcon className="h-4 w-4 text-[var(--color-text)]" />
                    </div>
                    <div>
                        <h1 className="text-[14px] font-semibold tracking-tight text-[var(--color-text)]">Image Generation</h1>
                        <p className="text-[11px] font-medium text-[var(--color-muted)]">Create images with AI</p>
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
                {/* Result display — full width, immersive */}
                {result && (
                    <div className="mx-auto max-w-4xl animate-in-scale">
                        <div className="overflow-hidden rounded-[16px] border border-[var(--color-border)] shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                            <img src={result} alt="Generated" className="w-full" />
                            <div className="flex items-center justify-between px-5 py-4 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="text-[13px] font-medium text-[var(--color-text)] truncate">{prompt || "Generated image"}</p>
                                    <p className="text-[11px] text-[var(--color-muted)] mt-0.5">{model} · {steps} steps</p>
                                </div>
                                <a href={result} download className="btn-primary !h-9 !px-4 !text-[13px] shrink-0">
                                    <Download className="h-3.5 w-3.5" /> Download
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form — constrained, centered */}
                {!result && (
                    <div className="mx-auto max-w-2xl space-y-6 animate-slide-up">
                        <div className="tab-bar">
                            {tabs.map(({ key, label, icon: Icon }) => (
                                <button key={key} onClick={() => setTab(key)} className={clsx("tab-item", tab === key && "tab-active")}>
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the image you want to generate..."
                                rows={3}
                                className="input-base !rounded-xl resize-none"
                            />
                        </div>

                        {tab === "text" && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Model</label>
                                    <select value={model} onChange={(e) => setModel(e.target.value)} className="input-base">
                                        <option value="sd-1.5">Stable Diffusion 1.5</option>
                                        <option value="sd-2.1">Stable Diffusion 2.1</option>
                                        <option value="sdxl">SDXL</option>
                                        <option value="sdxl-turbo">SDXL Turbo (fast)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Steps: {steps}</label>
                                    <input type="range" min={10} max={100} value={steps} onChange={(e) => setSteps(Number(e.target.value))} className="w-full mt-2" />
                                </div>
                            </div>
                        )}

                        {tab === "img2img" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Source Image</label>
                                    <input type="file" accept="image/*" onChange={(e) => setSourceFile(e.target.files?.[0] || null)} className="file-input" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Strength: {strength.toFixed(2)}</label>
                                    <input type="range" min={0.1} max={1.0} step={0.05} value={strength} onChange={(e) => setStrength(Number(e.target.value))} className="w-full mt-1" />
                                </div>
                            </div>
                        )}

                        {tab === "trained" && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">LoRA Model Path</label>
                                    <input type="text" value={loraPath} onChange={(e) => setLoraPath(e.target.value)} placeholder="storage/training/models/my_lora" className="input-base" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Trigger Word</label>
                                    <input type="text" value={triggerWord} onChange={(e) => setTriggerWord(e.target.value)} className="input-base" />
                                </div>
                            </div>
                        )}

                        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full !py-3.5">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            {loading ? "Generating..." : "Generate"}
                        </button>

                        {error && <div className="alert alert-error">{error}</div>}

                        {/* Loading state with anticipation */}
                        {loading && (
                            <div className="card flex flex-col items-center gap-4 py-12 animate-in">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full blur-xl" style={{ background: 'rgba(109,90,254,0.2)', transform: 'scale(2)' }} />
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                                        <Wand2 className="h-7 w-7 text-[var(--color-accent)] animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[14px] font-medium text-[var(--color-text)]">Creating your image…</p>
                                    <p className="text-[12px] text-[var(--color-muted)] mt-1">This may take a moment depending on your hardware</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
