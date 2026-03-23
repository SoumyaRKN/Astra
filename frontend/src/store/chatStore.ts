import { create } from "zustand";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    processingTime?: number;
    error?: string;
}

export interface Conversation {
    id: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

interface ChatStore {
    conversations: Map<string, Conversation>;
    currentConversationId: string;
    isLoading: boolean;
    error: string | null;

    // Actions
    createConversation: (id: string) => void;
    setCurrentConversation: (id: string) => void;
    addMessage: (message: Message, conversationId?: string) => void;
    removeMessage: (messageId: string, conversationId?: string) => void;
    clearMessages: (conversationId?: string) => void;
    deleteConversation: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    getCurrentConversation: () => Conversation | undefined;
    getMessages: (conversationId?: string) => Message[];
}

export const useChatStore = create<ChatStore>((set, get) => ({
    conversations: new Map(),
    currentConversationId: "default",
    isLoading: false,
    error: null,

    createConversation: (id: string) =>
        set((state) => {
            if (!state.conversations.has(id)) {
                state.conversations.set(id, {
                    id,
                    messages: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
            return { currentConversationId: id };
        }),

    setCurrentConversation: (id: string) =>
        set(() => {
            const state = get();
            if (!state.conversations.has(id)) {
                state.createConversation(id);
            }
            return { currentConversationId: id };
        }),

    addMessage: (message: Message, conversationId?: string) =>
        set((state) => {
            const id = conversationId || state.currentConversationId;
            const conversation = state.conversations.get(id);
            if (conversation) {
                conversation.messages.push(message);
                conversation.updatedAt = new Date();
            }
            return { conversations: new Map(state.conversations) };
        }),

    removeMessage: (messageId: string, conversationId?: string) =>
        set((state) => {
            const id = conversationId || state.currentConversationId;
            const conversation = state.conversations.get(id);
            if (conversation) {
                conversation.messages = conversation.messages.filter((msg) => msg.id !== messageId);
                conversation.updatedAt = new Date();
            }
            return { conversations: new Map(state.conversations) };
        }),

    clearMessages: (conversationId?: string) =>
        set((state) => {
            const id = conversationId || state.currentConversationId;
            const conversation = state.conversations.get(id);
            if (conversation) {
                conversation.messages = [];
                conversation.updatedAt = new Date();
            }
            return { conversations: new Map(state.conversations) };
        }),

    deleteConversation: (id: string) =>
        set((state) => {
            state.conversations.delete(id);
            return {
                conversations: new Map(state.conversations),
                currentConversationId: id === state.currentConversationId ? "default" : state.currentConversationId,
            };
        }),

    setLoading: (loading: boolean) => set({ isLoading: loading }),

    setError: (error: string | null) => set({ error }),

    getCurrentConversation: () => {
        const state = get();
        return state.conversations.get(state.currentConversationId);
    },

    getMessages: (conversationId?: string) => {
        const state = get();
        const id = conversationId || state.currentConversationId;
        return state.conversations.get(id)?.messages || [];
    },
}));
