import { create } from "zustand";

export interface UserSettings {
    userId: string;
    userName: string;
    defaultVoiceProfileId: number | null;
    defaultAvatarId: number | null;
    autoPlayResponses: boolean;
    enableNotifications: boolean;
    theme: "dark" | "light";
    language: string;
}

interface SettingsStore {
    settings: UserSettings | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setSettings: (settings: UserSettings) => void;
    updateSettings: (partial: Partial<UserSettings>) => void;
    loadSettings: (userId: string) => void;
    saveSettings: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

const defaultSettings: UserSettings = {
    userId: "",
    userName: "User",
    defaultVoiceProfileId: null,
    defaultAvatarId: null,
    autoPlayResponses: true,
    enableNotifications: true,
    theme: "dark",
    language: "en",
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
    settings: defaultSettings,
    isLoading: false,
    error: null,

    setSettings: (settings: UserSettings) => set({ settings }),

    updateSettings: (partial: Partial<UserSettings>) =>
        set((state) => {
            if (state.settings) {
                return { settings: { ...state.settings, ...partial } };
            }
            return {};
        }),

    loadSettings: (userId: string) => {
        set({ isLoading: true });
        try {
            const stored = localStorage.getItem(`settings_${userId}`);
            if (stored) {
                const settings = JSON.parse(stored);
                set({ settings, isLoading: false });
            } else {
                set({ settings: { ...defaultSettings, userId }, isLoading: false });
            }
        } catch (error) {
            set({ error: "Failed to load settings", isLoading: false });
        }
    },

    saveSettings: () => {
        const state = get();
        if (state.settings) {
            localStorage.setItem(`settings_${state.settings.userId}`, JSON.stringify(state.settings));
        }
    },

    setLoading: (loading: boolean) => set({ isLoading: loading }),

    setError: (error: string | null) => set({ error }),

    reset: () => set({ settings: defaultSettings, error: null, isLoading: false }),
}));
