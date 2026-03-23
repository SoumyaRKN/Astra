"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, Image as ImageIcon, Video, Music, Loader2, Download, Trash2 } from "lucide-react";
import { getGalleryImages, getGalleryVideos, getGalleryAudio } from "@/lib/api";
import clsx from "clsx";

type Tab = "images" | "videos" | "audio";

interface MediaItem {
    id: number;
    filename: string;
    url: string;
    prompt?: string;
    media_type: string;
    created_at: string;
}

export default function GalleryPage() {
    const [tab, setTab] = useState<Tab>("images");
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = async (t: Tab) => {
        setLoading(true);
        setError(null);
        try {
            const fetcher = t === "images" ? getGalleryImages : t === "videos" ? getGalleryVideos : getGalleryAudio;
            const data = await fetcher();
            setItems(Array.isArray(data) ? data : data.items ?? []);
        } catch {
            setError("Failed to load gallery");
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(tab); }, [tab]);

    const baseUrl = "http://127.0.0.1:8000";

    const tabs: { key: Tab; label: string; icon: typeof ImageIcon }[] = [
        { key: "images", label: "Images", icon: ImageIcon },
        { key: "videos", label: "Videos", icon: Video },
        { key: "audio", label: "Audio", icon: Music },
    ];

    return (
        <div className="flex h-full flex-col">
            <header className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-subtle">
                        <LayoutGrid className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-[15px] font-semibold">Gallery</h1>
                        <p className="text-[11px] text-muted">Browse your generated media</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
                <div className="mx-auto max-w-5xl space-y-5 animate-slide-up">
                    <div className="tab-bar">
                        {tabs.map(({ key, label, icon: Icon }) => (
                            <button key={key} onClick={() => setTab(key)} className={clsx("tab-item", tab === key && "tab-active")}>
                                <Icon className="h-4 w-4" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-6 w-6 animate-spin text-accent" />
                        </div>
                    )}

                    {error && <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-2.5 text-sm text-error">{error}</div>}

                    {!loading && !error && items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-muted">
                            <LayoutGrid className="h-10 w-10 mb-3 opacity-30" />
                            <p className="text-sm">No {tab} yet</p>
                            <p className="text-xs mt-1 opacity-60">Generate some content to see it here</p>
                        </div>
                    )}

                    {!loading && items.length > 0 && tab === "images" && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {items.map((item) => (
                                <div key={item.id} className="group card overflow-hidden !p-0 animate-in-scale">
                                    <div className="relative aspect-square">
                                        <img src={`${baseUrl}${item.url}`} alt={item.prompt || ""} className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                            <a href={`${baseUrl}${item.url}`} download className="btn-ghost !px-2 !py-1 !text-[11px] !bg-white/10">
                                                <Download className="h-3 w-3" /> Save
                                            </a>
                                        </div>
                                    </div>
                                    {item.prompt && <p className="px-3 py-2 text-[11px] text-muted truncate">{item.prompt}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && items.length > 0 && tab === "videos" && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {items.map((item) => (
                                <div key={item.id} className="card overflow-hidden !p-0 animate-in-scale">
                                    <video src={`${baseUrl}${item.url}`} controls className="w-full aspect-video" />
                                    <div className="flex items-center justify-between px-3 py-2">
                                        <p className="text-[11px] text-muted truncate flex-1 mr-2">{item.prompt || item.filename}</p>
                                        <a href={`${baseUrl}${item.url}`} download className="btn-ghost !px-2 !py-1 !text-[11px]">
                                            <Download className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && items.length > 0 && tab === "audio" && (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="card flex items-center gap-4 animate-in-scale">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-subtle">
                                        <Music className="h-4 w-4 text-accent" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{item.prompt || item.filename}</p>
                                        <audio src={`${baseUrl}${item.url}`} controls className="w-full mt-2 h-8" />
                                    </div>
                                    <a href={`${baseUrl}${item.url}`} download className="btn-ghost !px-2 !py-1.5">
                                        <Download className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
