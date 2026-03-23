import { create } from "zustand";

export interface AvatarProfile {
    id: number;
    userId: string;
    avatarName: string;
    photoCount: number;
    createdAt: string;
    videoCount: number;
}

export interface AvatarVideo {
    id: number;
    avatarId: number;
    videoPath: string;
    duration: number;
    status: string;
    generationTime: number;
}

interface AvatarStore {
    profiles: AvatarProfile[];
    currentProfileId: number | null;
    generatedVideos: AvatarVideo[];
    isGenerating: boolean;
    error: string | null;

    // Actions
    setProfiles: (profiles: AvatarProfile[]) => void;
    setCurrentProfile: (id: number | null) => void;
    addProfile: (profile: AvatarProfile) => void;
    removeProfile: (id: number) => void;
    setGeneratedVideos: (videos: AvatarVideo[]) => void;
    addGeneratedVideo: (video: AvatarVideo) => void;
    setGenerating: (generating: boolean) => void;
    setError: (error: string | null) => void;
    clear: () => void;
}

export const useAvatarStore = create<AvatarStore>((set) => ({
    profiles: [],
    currentProfileId: null,
    generatedVideos: [],
    isGenerating: false,
    error: null,

    setProfiles: (profiles: AvatarProfile[]) => set({ profiles }),

    setCurrentProfile: (id: number | null) => set({ currentProfileId: id }),

    addProfile: (profile: AvatarProfile) =>
        set((state) => ({
            profiles: [...state.profiles, profile],
        })),

    removeProfile: (id: number) =>
        set((state) => ({
            profiles: state.profiles.filter((p) => p.id !== id),
            currentProfileId: state.currentProfileId === id ? null : state.currentProfileId,
        })),

    setGeneratedVideos: (videos: AvatarVideo[]) => set({ generatedVideos: videos }),

    addGeneratedVideo: (video: AvatarVideo) =>
        set((state) => ({
            generatedVideos: [...state.generatedVideos, video],
        })),

    setGenerating: (generating: boolean) => set({ isGenerating: generating }),

    setError: (error: string | null) => set({ error }),

    clear: () =>
        set({
            profiles: [],
            currentProfileId: null,
            generatedVideos: [],
            isGenerating: false,
            error: null,
        }),
}));
