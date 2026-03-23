"use client";

import { useState } from "react";
import ImageGallery from "@/components/gallery/ImageGallery";
import VideoGallery from "@/components/gallery/VideoGallery";
import SoundtrackGallery from "@/components/gallery/SoundtrackGallery";

type GalleryType = "images" | "videos" | "soundtracks";

export default function GalleryPage() {
    const [activeGallery, setActiveGallery] = useState<GalleryType>("images");

    const galleries: { id: GalleryType; label: string; icon: string }[] = [
        { id: "images", label: "Generated Images", icon: "🖼️" },
        { id: "videos", label: "Generated Videos", icon: "🎬" },
        { id: "soundtracks", label: "Generated Soundtracks", icon: "🎵" },
    ];

    return (
        <div className="min-h-full bg-gray-800 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-100">Media Gallery</h1>
                    <p className="mt-2 text-gray-400">Browse your generated content</p>
                </div>

                {/* Gallery Tabs */}
                <div className="mb-6 border-b border-gray-700">
                    <div className="flex gap-4">
                        {galleries.map((gallery) => (
                            <button
                                key={gallery.id}
                                onClick={() => setActiveGallery(gallery.id)}
                                className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${activeGallery === gallery.id
                                        ? "border-blue-500 text-blue-400"
                                        : "border-transparent text-gray-400 hover:text-gray-300"
                                    }`}
                            >
                                <span>{gallery.icon}</span>
                                <span>{gallery.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gallery Content */}
                <div className="rounded-lg border border-gray-700 bg-gray-750 p-6">
                    {activeGallery === "images" && <ImageGallery />}
                    {activeGallery === "videos" && <VideoGallery />}
                    {activeGallery === "soundtracks" && <SoundtrackGallery />}
                </div>
            </div>
        </div>
    );
}
