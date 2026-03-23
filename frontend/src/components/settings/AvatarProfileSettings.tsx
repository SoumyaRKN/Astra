"use client";

import { useState, useEffect } from "react";
import { useAvatarStore, AvatarProfile } from "@/store/avatarStore";
import { avatarAPI } from "@/lib/api";
import { useUIStore } from "@/store/uiStore";

export default function AvatarProfileSettings() {
    const { profiles, setProfiles, currentProfileId, setCurrentProfile } =
        useAvatarStore();
    const { addToast } = useUIStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        try {
            setLoading(true);
            const response = await avatarAPI.getProfiles("default-user");
            setProfiles(response.profiles || []);
        } catch (error) {
            addToast("error", "Failed to load avatar profiles");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAvatar = async (avatarId: number) => {
        try {
            await avatarAPI.deleteAvatar(avatarId);
            addToast("success", "Avatar deleted");
            loadProfiles();
        } catch (error) {
            addToast("error", "Failed to delete avatar");
        }
    };

    if (loading) {
        return <div className="text-center text-gray-400">Loading...</div>;
    }

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-gray-100">Your Avatars</h4>

            {profiles.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-600 bg-gray-800 p-6 text-center">
                    <p className="text-gray-400">No avatars yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Upload photos to create an avatar profile
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {profiles.map((profile) => (
                        <div
                            key={profile.id}
                            className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4"
                        >
                            <div>
                                <p className="font-medium text-gray-100">{profile.avatarName}</p>
                                <p className="text-sm text-gray-400">
                                    {profile.photoCount} photos • {profile.videoCount} videos
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentProfile(profile.id)}
                                    className={`btn-secondary px-4 py-2 text-sm ${currentProfileId === profile.id ? "bg-blue-600 text-white" : ""
                                        }`}
                                >
                                    {currentProfileId === profile.id ? "✓ Selected" : "Select"}
                                </button>
                                <button
                                    onClick={() => handleDeleteAvatar(profile.id)}
                                    className="btn-secondary px-4 py-2 text-sm text-red-400 hover:text-red-300"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button className="btn-primary w-full">
                📸 Upload New Avatar Photos
            </button>
        </div>
    );
}
