"use client";

import { useEffect, useState, useRef } from "react";
import { useChat, Message } from "@/store/chat";
import { sendMessage, getHealth } from "@/lib/api";
import { Send, Loader2, Bot, User, Sparkles, Wifi, WifiOff, Trash2, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import clsx from "clsx";

interface Health {
    status: string;
    ollama: boolean;
    model: string;
}

export default function Home() {
    const { messages, session, loading, error, addMessage, setLoading, setError, clearMessages } = useChat();
    const [input, setInput] = useState("");
    const [health, setHealth] = useState<Health | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Health check
    useEffect(() => {
        const check = async () => {
            try {
                setHealth(await getHealth());
            } catch {
                setHealth({ status: "offline", ollama: false, model: "unknown" });
            }
        };
        check();
        const interval = setInterval(check, 30000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input on load
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;

        setInput("");
        setError(null);

        const userMsg: Message = {
            id: `u-${Date.now()}`,
            role: "user",
            content: text,
            timestamp: new Date(),
        };
        addMessage(userMsg);

        setLoading(true);
        try {
            const res = await sendMessage(text, session);
            const assistantMsg: Message = {
                id: `a-${Date.now()}`,
                role: "assistant",
                content: res.response,
                time_ms: res.time_ms,
                timestamp: new Date(),
            };
            addMessage(assistantMsg);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong";
            setError(msg);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isConnected = health?.ollama === true;

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border px-6 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                        <Sparkles className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Astra</h1>
                        <p className="text-xs text-muted">Local AI Assistant</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Status */}
                    <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs">
                        {isConnected ? (
                            <>
                                <Wifi className="h-3.5 w-3.5 text-success" />
                                <span className="text-muted">{health?.model}</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="h-3.5 w-3.5 text-error" />
                                <span className="text-muted">Offline</span>
                            </>
                        )}
                    </div>

                    {/* Clear chat */}
                    {messages.length > 0 && (
                        <button
                            onClick={clearMessages}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-text"
                            title="Clear chat"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Clear
                        </button>
                    )}
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                            <MessageSquare className="h-8 w-8 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Start a conversation</h2>
                            <p className="mt-1 text-sm text-muted">
                                Type a message below to chat with your local AI
                            </p>
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {[
                                "Explain quantum computing simply",
                                "Write a Python function to sort a list",
                                "What are the benefits of meditation?",
                            ].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => {
                                        setInput(suggestion);
                                        inputRef.current?.focus();
                                    }}
                                    className="rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-text"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mx-auto max-w-3xl space-y-1 px-4 py-6">
                        {messages.map((msg) => (
                            <ChatBubble key={msg.id} message={msg} />
                        ))}

                        {loading && (
                            <div className="flex items-start gap-3 py-4 animate-in">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                                    <Bot className="h-4 w-4 text-accent" />
                                </div>
                                <div className="flex items-center gap-1.5 pt-1">
                                    <span className="h-2 w-2 rounded-full bg-muted" style={{ animation: "typing 1.4s infinite 0s" }} />
                                    <span className="h-2 w-2 rounded-full bg-muted" style={{ animation: "typing 1.4s infinite 0.2s" }} />
                                    <span className="h-2 w-2 rounded-full bg-muted" style={{ animation: "typing 1.4s infinite 0.4s" }} />
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="border-t border-error/30 bg-error/5 px-6 py-2.5">
                    <p className="text-sm text-error">{error}</p>
                </div>
            )}

            {/* Input */}
            <div className="border-t border-border px-4 py-3">
                <div className="mx-auto flex max-w-3xl items-end gap-3">
                    <TextareaAutosize
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder={isConnected ? "Type a message..." : "Waiting for Ollama..."}
                        disabled={loading || !isConnected}
                        minRows={1}
                        maxRows={6}
                        className="flex-1 resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder-muted outline-none transition-colors focus:border-accent/50 disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim() || !isConnected}
                        className={clsx(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all",
                            input.trim() && isConnected && !loading
                                ? "bg-accent text-white hover:bg-accent-hover"
                                : "bg-surface-2 text-muted"
                        )}
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </button>
                </div>
                <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted/60">
                    Astra runs locally — your data never leaves your machine
                </p>
            </div>
        </div>
    );
}

function ChatBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";

    return (
        <div className={clsx("flex items-start gap-3 py-4 animate-in", isUser && "flex-row-reverse")}>
            <div
                className={clsx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    isUser ? "bg-surface-2" : "bg-accent/10"
                )}
            >
                {isUser ? (
                    <User className="h-4 w-4 text-muted" />
                ) : (
                    <Bot className="h-4 w-4 text-accent" />
                )}
            </div>

            <div className={clsx("min-w-0 max-w-[85%]", isUser && "text-right")}>
                <div
                    className={clsx(
                        "inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        isUser
                            ? "bg-accent text-white rounded-tr-md"
                            : "bg-surface text-text rounded-tl-md"
                    )}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_pre]:my-2 [&_ul]:my-1 [&_ol]:my-1">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {message.time_ms && (
                    <p className={clsx("mt-1 text-xs text-muted/60", isUser ? "text-right" : "text-left")}>
                        {(message.time_ms / 1000).toFixed(1)}s
                    </p>
                )}
            </div>
        </div>
    );
}
