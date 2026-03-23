"use client";

import { useState, useEffect } from "react";
import { User, Upload, Loader2, Play, Camera } from "lucide-react";
import { uploadAvatar, getAvatarProfile, animateAvatar, storageUrl } from "@/lib/api";

export default function AvatarPage() {
    const [profile, setProfile] = useState<{ path: string; face_detected: boolean } | null>(null);
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [animText, setAnimText] = useState("");
    const [animDuration, setAnimDuration] = useState(5);
    const [animResult, setAnimResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAvatarProfile()
            .then(setProfile)
            .catch(() => { });
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        try {
            const result = await uploadAvatar(file);
            setProfile(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAnimate = async () => {
        setAnimating(true);
        setError(null);
        setAnimResult(null);
        try {
            const result = await animateAvatar(animText, animDuration);
            setAnimResult(storageUrl(result.url));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Animation failed");
        } finally {
            setAnimating(false);
        }
    };

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center gap-3 border-b border-border px-6 py-3">
                <User className="h-5 w-5 text-accent" />
                <div>
                    <h1 className="text-lg font-semibold">Avatar</h1>
                    <p className="text-xs text-muted">Create and animate your AI avatar</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="mx-auto max-w-2xl space-y-6">
                    {/* Upload Section */}
                    <div className="rounded-xl border border-border bg-surface p-6">
                        <h2 className="mb-4 text-sm font-medium">Avatar Photo</h2>

                        {profile ? (
                            <div className="flex items-center gap-6">
                                <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-accent/30">
                                    <img
                                        src={storageUrl(`/storage/avatars/profile.png`)}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm text-text">
                                        Face detected:{" "}
                                        <span className={profile.face_detected ? "text-success" : "text-warning"}>
                                            {profile.face_detected ? "Yes" : "No"}
                                        </span>
                                    </p>
                                    <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-text">
                                        <Camera className="h-3.5 w-3.5" />
                                        Change Photo
                                        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border py-12 transition-colors hover:border-accent/50">
                                {loading ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-muted" />
                                ) : (
                                    <Upload className="h-8 w-8 text-muted" />
                                )}
                                <p className="text-sm text-muted">
                                    {loading ? "Processing..." : "Upload a photo to create your avatar"}
                                </p>
                                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={loading} />
                            </label>
                        )}
                    </div>

                    {/* Animate Section */}
                    {profile && (
                        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
                            <h2 className="text-sm font-medium">Animate Avatar</h2>
                            <div>
                                <label className="mb-1.5 block text-sm text-muted">Text (for lip-sync)</label>
                                <input
                                    type="text"
                                    value={animText}
                                    onChange={(e) => setAnimText(e.target.value)}
                                    placeholder="Hello, I am your AI assistant!"
                                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder-muted outline-none focus:border-accent/50"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm text-muted">Duration: {animDuration}s</label>
                                <input
                                    type="range"
                                    min={2}
                                    max={15}
                                    value={animDuration}
                                    onChange={(e) => setAnimDuration(Number(e.target.value))}
                                    className="w-full accent-accent"
                                />
                            </div>
                            <button
                                onClick={handleAnimate}
                                disabled={animating}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                            >
                                {animating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                {animating ? "Animating..." : "Animate"}
                            </button>
                        </div>
                    )}

                    {error && <p className="text-sm text-error">{error}</p>}

                    {animResult && (
                        <div className="overflow-hidden rounded-xl border border-border">
                            <video src={animResult} controls autoPlay className="w-full" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
