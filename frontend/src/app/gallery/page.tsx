"use client";

import { useState, useEffect } from "react";
import { Images, Image as ImageIcon, Video, Music, Loader2, Download, RefreshCw } from "lucide-react";
import { getGalleryImages, getGalleryVideos, getGalleryAudio, storageUrl } from "@/lib/api";
import clsx from "clsx";

type Tab = "images" | "videos" | "audio";

interface MediaItem {
    name: string;
    url: string;
    size: number;
    created: number;
}

export default function GalleryPage() {
    const [tab, setTab] = useState<Tab>("images");
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            let res;
            if (tab === "images") res = await getGalleryImages();
            else if (tab === "videos") res = await getGalleryVideos();
            else res = await getGalleryAudio();
            setItems(res.images || res.videos || res.audio || []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [tab]);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const formatDate = (ts: number) => new Date(ts * 1000).toLocaleDateString();

    const tabs: { key: Tab; label: string; icon: typeof ImageIcon }[] = [
        { key: "images", label: "Images", icon: ImageIcon },
        { key: "videos", label: "Videos", icon: Video },
        { key: "audio", label: "Audio", icon: Music },
    ];

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b border-border px-6 py-3">
                <div className="flex items-center gap-3">
                    <Images className="h-5 w-5 text-accent" />
                    <div>
                        <h1 className="text-lg font-semibold">Gallery</h1>
                        <p className="text-xs text-muted">Browse created media</p>
                    </div>
                </div>
                <button
                    onClick={load}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-text"
                >
                    <RefreshCw className={clsx("h-3.5 w-3.5", loading && "animate-spin")} />
                    Refresh
                </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="mx-auto max-w-4xl space-y-6">
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

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                            <Images className="h-10 w-10 text-muted/50" />
                            <p className="text-sm text-muted">No {tab} yet. Generate some!</p>
                        </div>
                    ) : tab === "images" ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {items.map((item) => (
                                <div key={item.name} className="group overflow-hidden rounded-xl border border-border">
                                    <img src={storageUrl(item.url)} alt={item.name} className="aspect-square w-full object-cover" />
                                    <div className="flex items-center justify-between bg-surface px-3 py-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs text-text">{item.name}</p>
                                            <p className="text-[10px] text-muted">{formatSize(item.size)} • {formatDate(item.created)}</p>
                                        </div>
                                        <a href={storageUrl(item.url)} download className="text-accent">
                                            <Download className="h-3.5 w-3.5" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : tab === "videos" ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {items.map((item) => (
                                <div key={item.name} className="overflow-hidden rounded-xl border border-border">
                                    <video src={storageUrl(item.url)} controls className="w-full" />
                                    <div className="flex items-center justify-between bg-surface px-3 py-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs text-text">{item.name}</p>
                                            <p className="text-[10px] text-muted">{formatSize(item.size)}</p>
                                        </div>
                                        <a href={storageUrl(item.url)} download className="text-accent">
                                            <Download className="h-3.5 w-3.5" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.name} className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3">
                                    <Music className="h-5 w-5 text-accent shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-text truncate">{item.name}</p>
                                        <p className="text-xs text-muted">{formatSize(item.size)} • {formatDate(item.created)}</p>
                                    </div>
                                    <audio src={storageUrl(item.url)} controls className="h-8 w-48" />
                                    <a href={storageUrl(item.url)} download className="text-accent shrink-0">
                                        <Download className="h-4 w-4" />
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
