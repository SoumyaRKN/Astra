import { create } from "zustand";

export interface VoiceProfile {
    id: number;
    voiceName: string;
    numSamples: number;
    trainedAt: string;
    sampleRate: number;
}

export interface VoiceSample {
    id: number;
    profileId: number;
    duration: number;
    uploadedAt: string;
    filePath: string;
}

interface VoiceStore {
    profiles: VoiceProfile[];
    currentProfileId: number | null;
    isRecording: boolean;
    recordedAudio: Blob | null;
    isTraining: boolean;
    error: string | null;

    // Actions
    setProfiles: (profiles: VoiceProfile[]) => void;
    setCurrentProfile: (id: number | null) => void;
    addProfile: (profile: VoiceProfile) => void;
    removeProfile: (id: number) => void;
    setRecording: (recording: boolean) => void;
    setRecordedAudio: (audio: Blob | null) => void;
    setTraining: (training: boolean) => void;
    setError: (error: string | null) => void;
    clear: () => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
    profiles: [],
    currentProfileId: null,
    isRecording: false,
    recordedAudio: null,
    isTraining: false,
    error: null,

    setProfiles: (profiles: VoiceProfile[]) => set({ profiles }),

    setCurrentProfile: (id: number | null) => set({ currentProfileId: id }),

    addProfile: (profile: VoiceProfile) =>
        set((state) => ({
            profiles: [...state.profiles, profile],
        })),

    removeProfile: (id: number) =>
        set((state) => ({
            profiles: state.profiles.filter((p) => p.id !== id),
            currentProfileId: state.currentProfileId === id ? null : state.currentProfileId,
        })),

    setRecording: (recording: boolean) => set({ isRecording: recording }),

    setRecordedAudio: (audio: Blob | null) => set({ recordedAudio: audio }),

    setTraining: (training: boolean) => set({ isTraining: training }),

    setError: (error: string | null) => set({ error }),

    clear: () =>
        set({
            profiles: [],
            currentProfileId: null,
            isRecording: false,
            recordedAudio: null,
            isTraining: false,
            error: null,
        }),
}));
