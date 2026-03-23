"use client";

import { Message } from "@/store/chatStore";

interface ChatMessageProps {
    message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === "user";

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slideUp`}>
            <div
                className={`rounded-lg px-4 py-2 max-w-xs ${isUser
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-100"
                    }`}
            >
                <p className="text-sm">{message.content}</p>
                {message.processingTime && (
                    <p className="mt-1 text-xs opacity-70">
                        ⏱️ {(message.processingTime / 1000).toFixed(2)}s
                    </p>
                )}
            </div>
        </div>
    );
}
