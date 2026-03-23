"use client";

import { useState, useRef, useEffect } from "react";
import { User, Loader2, Camera, Play, Sparkles } from "lucide-react";
import { uploadAvatar, getAvatarProfile, animateAvatar } from "@/lib/api";

export default function AvatarPage() {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [animatedUrl, setAnimatedUrl] = useState<string | null>(null);
    const [animationText, setAnimationText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        setLoading(true);
        setError(null);
        setInfo(null);
        try {
            const res = await uploadAvatar(file);
            // Backend returns { path: "storage/avatars/profile.png", ... }
            if (res.path) {
                setAvatarUrl(`http://127.0.0.1:8000/${res.path}`);
            }
            setInfo("Avatar uploaded successfully");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAnimate = async () => {
        if (!animationText.trim()) return;
        setAnimating(true);
        setError(null);
        try {
            const res = await animateAvatar(animationText);
            setAnimatedUrl(`http://127.0.0.1:8000${res.url}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Animation failed");
        } finally {
            setAnimating(false);
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await getAvatarProfile();
                // Backend returns { path: "storage/avatars/profile.png", ... }
                if (profile.path) setAvatarUrl(`http://127.0.0.1:8000/${profile.path}`);
            } catch { }
        };
        loadProfile();
    }, []);

    return (
        <div className="flex h-full flex-col bg-[var(--color-bg)] transition-colors duration-500">
            <header className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <User className="h-4 w-4 text-[var(--color-text)]" />
                    </div>
                    <div>
                        <h1 className="text-[14px] font-semibold tracking-tight text-[var(--color-text)]">Avatar</h1>
                        <p className="text-[11px] font-medium text-[var(--color-muted)]">Customize your AI persona</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
                <div className="mx-auto max-w-2xl space-y-6 animate-slide-up">
                    {/* Avatar upload */}
                    <div className="flex flex-col items-center py-4">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-full border-2 border-[var(--color-border)] overflow-hidden flex items-center justify-center bg-[var(--color-surface)] shadow-[0_4px_24px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:border-[var(--color-border-hover)] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-12 w-12 text-[var(--color-muted)] opacity-30" />
                                )}
                            </div>
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full gradient-accent text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                            />
                        </div>
                        {loading && (
                            <div className="flex items-center gap-2 mt-3 text-[13px] font-medium text-[var(--color-muted)]">
                                <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                            </div>
                        )}
                        {!loading && !avatarUrl && (
                            <p className="mt-3 text-[12px] text-[var(--color-muted)]">Click to upload your avatar image</p>
                        )}
                    </div>

                    {info && <div className="alert alert-success">{info}</div>}
                    {error && <div className="alert alert-error">{error}</div>}

                    {/* Animate section */}
                    <div className="card space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                            <h2 className="text-[14px] font-semibold text-[var(--color-text)]">Animate Avatar</h2>
                        </div>
                        <p className="text-[13px] text-[var(--color-muted)]">Make your avatar speak with lip-sync animation</p>
                        <textarea
                            value={animationText}
                            onChange={(e) => setAnimationText(e.target.value)}
                            placeholder="Enter text for lip-sync animation..."
                            rows={3}
                            className="input-base !rounded-xl resize-none"
                        />
                        <button onClick={handleAnimate} disabled={animating || !animationText.trim()} className="btn-primary w-full">
                            {animating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                            {animating ? "Animating…" : "Animate"}
                        </button>
                    </div>

                    {animatedUrl && (
                        <div className="overflow-hidden rounded-[16px] border border-[var(--color-border)] shadow-[0_8px_32px_rgba(0,0,0,0.15)] animate-in-scale">
                            <video src={animatedUrl} controls className="w-full" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
