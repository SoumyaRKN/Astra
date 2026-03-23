import { create } from "zustand";

interface UIStore {
    // Sidebar state
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;

    // Toast notifications
    toasts: Array<{
        id: string;
        type: "success" | "error" | "info" | "warning";
        message: string;
        duration?: number;
    }>;
    addToast: (type: "success" | "error" | "info" | "warning", message: string, duration?: number) => string;
    removeToast: (id: string) => void;

    // Modal state
    activeModal: string | null;
    setActiveModal: (modalId: string | null) => void;

    // Loading states
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    // Dark mode
    isDarkMode: boolean;
    setIsDarkMode: (dark: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => {
    let toastCounter = 0;

    return {
        sidebarOpen: true,
        setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        toasts: [],
        addToast: (type, message, duration = 5000) => {
            const id = `toast_${toastCounter++}`;
            set((state) => ({
                toasts: [...state.toasts, { id, type, message, duration }],
            }));

            if (duration > 0) {
                setTimeout(() => {
                    set((state) => ({
                        toasts: state.toasts.filter((t) => t.id !== id),
                    }));
                }, duration);
            }

            return id;
        },
        removeToast: (id: string) =>
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            })),

        activeModal: null,
        setActiveModal: (modalId: string | null) => set({ activeModal: modalId }),

        isLoading: false,
        setIsLoading: (loading: boolean) => set({ isLoading: loading }),

        isDarkMode: true,
        setIsDarkMode: (dark: boolean) => set({ isDarkMode: dark }),
    };
});
