"use client";

import { useState } from "react";
import { useUIStore } from "@/store/uiStore";

export default function AvatarDisplay() {
    const { addToast } = useUIStore();
    const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);

    const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatarImageUrl(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            addToast("success", "Avatar photo selected");
        } catch (error) {
            addToast("error", "Failed to upload avatar photo");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-6 h-full">
            <h3 className="font-semibold text-gray-100">🎭 Avatar</h3>

            {avatarImageUrl ? (
                <div className="relative w-full">
                    <img
                        src={avatarImageUrl}
                        alt="Avatar"
                        className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                        onClick={() => setAvatarImageUrl(null)}
                        className="absolute top-2 right-2 btn-icon bg-red-600 text-white"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <div className="w-full h-64 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-700">
                    <span className="text-4xl">🖼️</span>
                </div>
            )}

            {!avatarImageUrl && (
                <label className="btn-primary cursor-pointer w-full text-center">
                    📸 Upload Photo
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadPhoto}
                        className="hidden"
                    />
                </label>
            )}

            {avatarImageUrl && (
                <button className="btn-primary w-full">✨ Create Avatar</button>
            )}

            <div className="text-xs text-gray-400 text-center mt-4">
                <p>Upload a photo to create an animated avatar.</p>
                <p>Use this for realistic responses with your own face.</p>
            </div>
        </div>
    );
}
