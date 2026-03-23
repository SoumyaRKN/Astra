import { create } from "zustand";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    time_ms?: number;
    timestamp: Date;
}

interface ChatState {
    messages: Message[];
    session: string;
    loading: boolean;
    error: string | null;
    addMessage: (msg: Message) => void;
    setLoading: (v: boolean) => void;
    setError: (v: string | null) => void;
    setSession: (s: string) => void;
    clearMessages: () => void;
}

export const useChat = create<ChatState>((set) => ({
    messages: [],
    session: "default",
    loading: false,
    error: null,
    addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setSession: (session) => set({ session, messages: [] }),
    clearMessages: () => set({ messages: [] }),
}));
