"use client";

import { useState } from "react";
import { videoAPI } from "@/lib/api";
import { useGalleryStore } from "@/store/galleryStore";
import { useUIStore } from "@/store/uiStore";

export default function VideoGallery() {
    const { videos, addVideo, removeVideo, setLoading } = useGalleryStore();
    const { addToast } = useUIStore();
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateVideo = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setLoading(true);
        try {
            const response = await videoAPI.generateVideo(prompt, "default-user");
            addVideo({
                id: response.video_id,
                prompt: response.prompt,
                videoPath: response.video_path,
                duration: response.duration,
                generationTime: response.generation_time,
                createdAt: new Date().toISOString(),
            });
            addToast("success", "Video generated successfully!");
            setPrompt("");
        } catch (error) {
            addToast("error", "Failed to generate video");
        } finally {
            setIsGenerating(false);
            setLoading(false);
        }
    };

    const handleDeleteVideo = async (videoId: number) => {
        try {
            await videoAPI.deleteVideo(videoId);
            removeVideo(videoId);
            addToast("success", "Video deleted");
        } catch (error) {
            addToast("error", "Failed to delete video");
        }
    };

    return (
        <div className="space-y-6">
            {/* Generation Form */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-100">Generate New Video 🎬</h3>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the video you want to generate... (e.g., 'A person dancing happily')"
                    className="input-field h-20 resize-none"
                    disabled={isGenerating}
                />
                <button
                    onClick={handleGenerateVideo}
                    disabled={isGenerating || !prompt.trim()}
                    className="btn-primary w-full"
                >
                    {isGenerating ? "Generating..." : "Generate Video"}
                </button>
                {isGenerating && (
                    <p className="text-sm text-red-400">
                        ⏳ This may take 30+ minutes on CPU (very slow)...
                    </p>
                )}
            </div>

            {/* Gallery */}
            <div>
                <h3 className="mb-3 font-semibold text-gray-100">
                    Generated Videos ({videos.length})
                </h3>
                {videos.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-600 bg-gray-800 p-6 text-center">
                        <p className="text-gray-400">No videos generated yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Generate your first video to see it here
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {videos.map((video) => (
                            <div
                                key={video.id}
                                className="group rounded-lg border border-gray-700 bg-gray-800 overflow-hidden hover:border-gray-500"
                            >
                                <div className="relative h-48 bg-gray-700 flex items-center justify-center">
                                    <video
                                        src={video.videoPath}
                                        className="h-full w-full object-cover"
                                        controls
                                    />
                                </div>
                                <div className="p-3">
                                    <p className="text-sm text-gray-300 line-clamp-2">
                                        {video.prompt}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        ⏱️ {video.duration.toFixed(1)}s • 🎬 {video.generationTime.toFixed(1)}s
                                    </p>
                                    <button
                                        onClick={() => handleDeleteVideo(video.id)}
                                        className="mt-2 btn-secondary w-full text-sm text-red-400 hover:text-red-300"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
