"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, Image as ImageIcon, Video, Music, Loader2, Download, RefreshCw } from "lucide-react";
import { getGalleryImages, getGalleryVideos, getGalleryAudio } from "@/lib/api";
import clsx from "clsx";

type Tab = "images" | "videos" | "audio";

interface MediaItem {
    name: string;
    url: string;
    size?: number;
    created?: number;
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
            // Backend returns { images: [...] }, { videos: [...] }, or { audio: [...] }
            setItems(data[t] ?? data.items ?? (Array.isArray(data) ? data : []));
        } catch {
            setError("Failed to load gallery");
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(tab); }, [tab]);

    const baseUrl = "http://127.0.0.1:8000";

    const tabs: { key: Tab; label: string; icon: typeof ImageIcon; count: number }[] = [
        { key: "images", label: "Images", icon: ImageIcon, count: tab === "images" ? items.length : 0 },
        { key: "videos", label: "Videos", icon: Video, count: tab === "videos" ? items.length : 0 },
        { key: "audio", label: "Audio", icon: Music, count: tab === "audio" ? items.length : 0 },
    ];

    return (
        <div className="flex h-full flex-col bg-[var(--color-bg)] transition-colors duration-500">
            <header className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <LayoutGrid className="h-4 w-4 text-[var(--color-text)]" />
                    </div>
                    <div>
                        <h1 className="text-[14px] font-semibold tracking-tight text-[var(--color-text)]">Gallery</h1>
                        <p className="text-[11px] font-medium text-[var(--color-muted)]">
                            {loading ? "Loading…" : `${items.length} ${tab}`}
                        </p>
                    </div>
                </div>
                <button onClick={() => fetchItems(tab)} className="btn-ghost gap-1.5" title="Refresh">
                    <RefreshCw className={clsx("h-3.5 w-3.5", loading && "animate-spin")} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
                <div className="space-y-6 animate-slide-up">
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
                            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
                        </div>
                    )}

                    {error && <div className="alert alert-error">{error}</div>}

                    {!loading && !error && items.length === 0 && (
                        <div className="empty-state">
                            <LayoutGrid className="h-10 w-10 mb-3 opacity-20" />
                            <p className="text-[14px] font-medium text-[var(--color-text)]">No {tab} yet</p>
                            <p className="text-[13px] text-[var(--color-muted)] mt-1">Generate some content to see it here</p>
                        </div>
                    )}

                    {!loading && items.length > 0 && tab === "images" && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {items.map((item, i) => (
                                <div key={item.name + i} className="group overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-300 animate-in-scale">
                                    <div className="relative aspect-square overflow-hidden">
                                        <img src={`${baseUrl}${item.url}`} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                                            <a href={`${baseUrl}${item.url}`} download className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition-colors">
                                                <Download className="h-3.5 w-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                    <p className="px-3 py-2 text-[11px] truncate text-[var(--color-muted)]">{item.name}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && items.length > 0 && tab === "videos" && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((item, i) => (
                                <div key={item.name + i} className="overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)] transition-all duration-300 animate-in-scale">
                                    <video src={`${baseUrl}${item.url}`} controls className="w-full aspect-video" />
                                    <div className="flex items-center justify-between px-3 py-2.5 border-t border-[var(--color-border)]">
                                        <p className="text-[12px] font-medium truncate flex-1 mr-2 text-[var(--color-text)]">{item.name}</p>
                                        <a href={`${baseUrl}${item.url}`} download className="btn-ghost !px-2 !py-1 !text-[11px]">
                                            <Download className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && items.length > 0 && tab === "audio" && (
                        <div className="mx-auto max-w-2xl space-y-3">
                            {items.map((item, i) => (
                                <div key={item.name + i} className="card flex items-center gap-4 animate-in-scale">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--color-accent-subtle)]">
                                        <Music className="h-4 w-4 text-[var(--color-accent)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium truncate text-[var(--color-text)]">{item.name}</p>
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
