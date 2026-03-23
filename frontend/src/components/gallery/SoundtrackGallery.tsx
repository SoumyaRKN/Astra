"use client";

import { useState, useEffect } from "react";
import { soundtrackAPI } from "@/lib/api";
import { useGalleryStore } from "@/store/galleryStore";
import { useUIStore } from "@/store/uiStore";

export default function SoundtrackGallery() {
    const { soundtracks, addSoundtrack, removeSoundtrack, setLoading } =
        useGalleryStore();
    const { addToast } = useUIStore();
    const [description, setDescription] = useState("");
    const [mood, setMood] = useState("calm");
    const [moods, setMoods] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadMoods();
    }, []);

    const loadMoods = async () => {
        try {
            const response = await soundtrackAPI.getMoods();
            setMoods(response.moods || []);
        } catch (error) {
            console.error("Failed to load moods");
        }
    };

    const handleGenerateSoundtrack = async () => {
        if (!description.trim()) return;

        setIsGenerating(true);
        setLoading(true);
        try {
            const response = await soundtrackAPI.generateSoundtrack(
                description,
                "default-user",
                { mood }
            );
            addSoundtrack({
                id: response.soundtrack_id,
                description: response.description,
                mood: response.mood,
                soundtrackPath: response.soundtrack_path,
                duration: response.duration,
                generationTime: response.generation_time,
                createdAt: new Date().toISOString(),
            });
            addToast("success", "Soundtrack generated successfully!");
            setDescription("");
        } catch (error) {
            addToast("error", "Failed to generate soundtrack");
        } finally {
            setIsGenerating(false);
            setLoading(false);
        }
    };

    const handleDeleteSoundtrack = async (soundtrackId: number) => {
        try {
            await soundtrackAPI.deleteSoundtrack(soundtrackId);
            removeSoundtrack(soundtrackId);
            addToast("success", "Soundtrack deleted");
        } catch (error) {
            addToast("error", "Failed to delete soundtrack");
        }
    };

    return (
        <div className="space-y-6">
            {/* Generation Form */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-100">Generate New Soundtrack 🎵</h3>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the soundtrack you want... (e.g., 'Uplifting music for a travel montage')"
                    className="input-field h-20 resize-none"
                    disabled={isGenerating}
                />
                <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="input-field"
                    disabled={isGenerating}
                >
                    <option value="">Select mood...</option>
                    {moods.map((m) => (
                        <option key={m} value={m}>
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleGenerateSoundtrack}
                    disabled={isGenerating || !description.trim()}
                    className="btn-primary w-full"
                >
                    {isGenerating ? "Generating..." : "Generate Soundtrack"}
                </button>
                {isGenerating && (
                    <p className="text-sm text-gray-400">
                        ⏳ Generating soundtrack (usually &lt; 1 minute)...
                    </p>
                )}
            </div>

            {/* Gallery */}
            <div>
                <h3 className="mb-3 font-semibold text-gray-100">
                    Generated Soundtracks ({soundtracks.length})
                </h3>
                {soundtracks.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-600 bg-gray-800 p-6 text-center">
                        <p className="text-gray-400">No soundtracks generated yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Generate your first soundtrack to see it here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {soundtracks.map((soundtrack) => (
                            <div
                                key={soundtrack.id}
                                className="rounded-lg border border-gray-700 bg-gray-800 p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-300">{soundtrack.description}</p>
                                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                                            <span>🎵 {soundtrack.mood}</span>
                                            <span>⏱️ {soundtrack.duration.toFixed(1)}s</span>
                                            <span>🔧 {soundtrack.generationTime.toFixed(1)}s</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <audio
                                            src={soundtrack.soundtrackPath}
                                            controls
                                            className="w-32"
                                        />
                                        <button
                                            onClick={() => handleDeleteSoundtrack(soundtrack.id)}
                                            className="btn-secondary px-3 py-1 text-sm text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
