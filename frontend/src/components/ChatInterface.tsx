"use client";

import { useState, useRef, useEffect } from "react";
import { chatAPI } from "@/lib/api";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import ChatMessage from "./ChatMessage";

export default function ChatInterface() {
    const {
        getCurrentConversation,
        addMessage,
        setLoading,
        setError,
        isLoading,
        error,
    } = useChatStore();
    const { addToast } = useUIStore();
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const conversation = getCurrentConversation();

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation?.messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = inputValue.trim();
        setInputValue("");

        // Add user message to store
        addMessage({
            id: `msg_${Date.now()}`,
            role: "user",
            content: userMessage,
            timestamp: new Date(),
        });

        // Send to API
        setLoading(true);
        try {
            const response = await chatAPI.sendMessage(
                userMessage,
                conversation?.id
            );

            // Add assistant message to store
            addMessage({
                id: `msg_${Date.now()}_resp`,
                role: "assistant",
                content: response.assistant_response,
                timestamp: new Date(),
                processingTime: response.processing_time_ms,
            });

            addToast("success", "Message processed successfully");
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || "Failed to get response";
            setError(errorMessage);
            addToast("error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex h-full flex-col">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4">
                {conversation?.messages && conversation.messages.length > 0 ? (
                    <div className="space-y-3">
                        {conversation.messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-center">
                        <div>
                            <p className="text-3xl">💬</p>
                            <p className="mt-2 text-gray-400">Start a conversation</p>
                            <p className="text-sm text-gray-500">Type your message and press Enter</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="border-t border-red-500 bg-red-900/20 p-3">
                    <p className="text-sm text-red-300">⚠️ {error}</p>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-700 p-4">
                <div className="flex gap-2">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message... (Shift+Enter for new line)"
                        className="input-field flex-1 resize-none"
                        rows={3}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputValue.trim()}
                        className="btn-primary self-center"
                    >
                        {isLoading ? (
                            <>
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-100"></span>
                            </>
                        ) : (
                            "Send"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
