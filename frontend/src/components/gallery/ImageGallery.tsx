"use client";

import { useState } from "react";
import { imageAPI } from "@/lib/api";
import { useGalleryStore } from "@/store/galleryStore";
import { useUIStore } from "@/store/uiStore";

export default function ImageGallery() {
    const { images, addImage, removeImage, setLoading } = useGalleryStore();
    const { addToast } = useUIStore();
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateImage = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setLoading(true);
        try {
            const response = await imageAPI.generateImage(prompt, "default-user");
            addImage({
                id: response.image_id,
                prompt: response.prompt,
                imagePath: response.image_path,
                generationTime: response.generation_time,
                createdAt: new Date().toISOString(),
            });
            addToast("success", "Image generated successfully!");
            setPrompt("");
        } catch (error) {
            addToast("error", "Failed to generate image");
        } finally {
            setIsGenerating(false);
            setLoading(false);
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        try {
            await imageAPI.deleteImage(imageId);
            removeImage(imageId);
            addToast("success", "Image deleted");
        } catch (error) {
            addToast("error", "Failed to delete image");
        }
    };

    return (
        <div className="space-y-6">
            {/* Generation Form */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-100">Generate New Image 🎨</h3>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate... (e.g., 'A person at the beach at sunset')"
                    className="input-field h-20 resize-none"
                    disabled={isGenerating}
                />
                <button
                    onClick={handleGenerateImage}
                    disabled={isGenerating || !prompt.trim()}
                    className="btn-primary w-full"
                >
                    {isGenerating ? "Generating..." : "Generate Image"}
                </button>
                {isGenerating && (
                    <p className="text-sm text-gray-400">
                        ⏳ This may take 1-3 minutes on CPU...
                    </p>
                )}
            </div>

            {/* Gallery */}
            <div>
                <h3 className="mb-3 font-semibold text-gray-100">
                    Generated Images ({images.length})
                </h3>
                {images.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-600 bg-gray-800 p-6 text-center">
                        <p className="text-gray-400">No images generated yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Generate your first image to see it here
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className="group rounded-lg border border-gray-700 bg-gray-800 overflow-hidden hover:border-gray-500"
                            >
                                <div className="relative h-48 bg-gray-700">
                                    <img
                                        src={image.imagePath}
                                        alt={image.prompt}
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        onClick={() => handleDeleteImage(image.id)}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity btn-icon bg-red-600 text-white"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm text-gray-300 line-clamp-2">
                                        {image.prompt}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        ⏱️ {image.generationTime.toFixed(1)}s
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
