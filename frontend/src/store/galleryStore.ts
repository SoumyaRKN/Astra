import { create } from "zustand";

export interface GeneratedImage {
    id: number;
    prompt: string;
    imagePath: string;
    generationTime: number;
    createdAt: string;
}

export interface GeneratedVideo {
    id: number;
    prompt: string;
    videoPath: string;
    duration: number;
    generationTime: number;
    createdAt: string;
}

export interface GeneratedSoundtrack {
    id: number;
    description: string;
    mood: string;
    soundtrackPath: string;
    duration: number;
    generationTime: number;
    createdAt: string;
}

interface GalleryStore {
    images: GeneratedImage[];
    videos: GeneratedVideo[];
    soundtracks: GeneratedSoundtrack[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setImages: (images: GeneratedImage[]) => void;
    addImage: (image: GeneratedImage) => void;
    removeImage: (id: number) => void;

    setVideos: (videos: GeneratedVideo[]) => void;
    addVideo: (video: GeneratedVideo) => void;
    removeVideo: (id: number) => void;

    setSoundtracks: (soundtracks: GeneratedSoundtrack[]) => void;
    addSoundtrack: (soundtrack: GeneratedSoundtrack) => void;
    removeSoundtrack: (id: number) => void;

    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clear: () => void;
}

export const useGalleryStore = create<GalleryStore>((set) => ({
    images: [],
    videos: [],
    soundtracks: [],
    isLoading: false,
    error: null,

    setImages: (images: GeneratedImage[]) => set({ images }),

    addImage: (image: GeneratedImage) =>
        set((state) => ({
            images: [image, ...state.images],
        })),

    removeImage: (id: number) =>
        set((state) => ({
            images: state.images.filter((img) => img.id !== id),
        })),

    setVideos: (videos: GeneratedVideo[]) => set({ videos }),

    addVideo: (video: GeneratedVideo) =>
        set((state) => ({
            videos: [video, ...state.videos],
        })),

    removeVideo: (id: number) =>
        set((state) => ({
            videos: state.videos.filter((vid) => vid.id !== id),
        })),

    setSoundtracks: (soundtracks: GeneratedSoundtrack[]) => set({ soundtracks }),

    addSoundtrack: (soundtrack: GeneratedSoundtrack) =>
        set((state) => ({
            soundtracks: [soundtrack, ...state.soundtracks],
        })),

    removeSoundtrack: (id: number) =>
        set((state) => ({
            soundtracks: state.soundtracks.filter((st) => st.id !== id),
        })),

    setLoading: (loading: boolean) => set({ isLoading: loading }),

    setError: (error: string | null) => set({ error }),

    clear: () =>
        set({
            images: [],
            videos: [],
            soundtracks: [],
            isLoading: false,
            error: null,
        }),
}));
