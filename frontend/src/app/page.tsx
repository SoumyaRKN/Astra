"use client";

import { useEffect, useState, useRef } from "react";
import { useChat, Message } from "@/store/chat";
import { sendMessage, getHealth } from "@/lib/api";
import { Send, Loader2, Bot, User, Sparkles, Trash2, Zap, Code, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import clsx from "clsx";

interface Health {
    status: string;
    ollama: boolean;
    model: string;
}

const suggestions = [
    { icon: Brain, text: "Explain quantum computing", color: "text-purple-400" },
    { icon: Code, text: "Write a Python sort function", color: "text-emerald-400" },
    { icon: Zap, text: "What are the benefits of meditation?", color: "text-amber-400" },
];

export default function Home() {
    const { messages, session, loading, error, addMessage, setLoading, setError, clearMessages } = useChat();
    const [input, setInput] = useState("");
    const [health, setHealth] = useState<Health | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const check = async () => {
            try { setHealth(await getHealth()); }
            catch { setHealth({ status: "offline", ollama: false, model: "unknown" }); }
        };
        check();
        const interval = setInterval(check, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;
        setInput("");
        setError(null);

        addMessage({ id: `u-${Date.now()}`, role: "user", content: text, timestamp: new Date() });
        setLoading(true);

        try {
            const res = await sendMessage(text, session);
            addMessage({ id: `a-${Date.now()}`, role: "assistant", content: res.response, time_ms: res.time_ms, timestamp: new Date() });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const isConnected = health?.ollama === true;

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <header className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-accent">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>Astra</h1>
                        <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>Local AI Assistant</p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className={clsx("status-badge", isConnected ? "status-online" : "status-offline")}>
                        <span className={clsx("h-1.5 w-1.5 rounded-full", isConnected ? "bg-[var(--color-success)]" : "bg-[var(--color-error)]")} />
                        {isConnected ? health?.model : "Offline"}
                    </div>

                    {messages.length > 0 && (
                        <button onClick={clearMessages} className="btn-ghost !px-2.5 !py-1.5" title="Clear chat">
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto pb-2">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center animate-slide-up">
                        <div className="relative">
                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl gradient-accent glow-accent-strong animate-float">
                                <Sparkles className="h-9 w-9 text-white" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text)" }}>
                                Hey, I&apos;m <span className="gradient-text">Astra</span>
                            </h2>
                            <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                                Your private local AI assistant. Everything runs on your machine — no data ever leaves.
                            </p>
                        </div>

                        <div className="mt-2 grid w-full max-w-md gap-2.5 sm:grid-cols-3">
                            {suggestions.map(({ icon: Icon, text, color }, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setInput(text); inputRef.current?.focus(); }}
                                    className="group glass glass-hover flex flex-col items-start gap-2.5 rounded-xl p-3.5 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Icon className={clsx("h-4 w-4", color)} />
                                    <span className="text-xs leading-snug" style={{ color: "var(--color-muted)" }}>{text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mx-auto max-w-3xl space-y-1 px-4 py-6 md:px-6">
                        {messages.map((msg) => (
                            <ChatBubble key={msg.id} message={msg} />
                        ))}

                        {loading && (
                            <div className="flex items-start gap-3 py-4 animate-in">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl gradient-accent">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex items-center gap-1.5 pt-2">
                                    <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" style={{ animation: "typing 1.4s infinite 0s" }} />
                                    <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" style={{ animation: "typing 1.4s infinite 0.2s" }} />
                                    <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" style={{ animation: "typing 1.4s infinite 0.4s" }} />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="mx-auto w-full max-w-3xl px-4">
                    <div className="alert alert-error">{error}</div>
                </div>
            )}

            {/* Input area */}
            <div className="border-t px-4 py-3 md:px-6" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <div className="mx-auto flex max-w-3xl items-end gap-2.5">
                    <div className="relative flex-1">
                        <TextareaAutosize
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder={isConnected ? "Ask Astra anything..." : "Waiting for Ollama..."}
                            disabled={loading || !isConnected}
                            minRows={1}
                            maxRows={5}
                            className="input-base !rounded-xl !py-3 !pr-4 resize-none"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim() || !isConnected}
                        className={clsx(
                            "flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                            input.trim() && isConnected && !loading
                                ? "gradient-accent text-white glow-accent hover:scale-105 active:scale-95"
                                : "border text-[var(--color-muted)]"
                        )}
                        style={!(input.trim() && isConnected && !loading) ? { background: "var(--color-surface-2)", borderColor: "var(--color-border)" } : undefined}
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-[18px] w-[18px]" />}
                    </button>
                </div>
                <p className="mx-auto mt-2 max-w-3xl text-center text-[11px]" style={{ color: "var(--color-muted)", opacity: 0.5 }}>
                    100% local and private — your data never leaves your machine
                </p>
            </div>
        </div>
    );
}

function ChatBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";

    return (
        <div className={clsx("flex items-start gap-3 py-3 animate-in", isUser && "flex-row-reverse")}>
            <div
                className={clsx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                    isUser ? "border" : "gradient-accent"
                )}
                style={isUser ? { background: "var(--color-surface-2)", borderColor: "var(--color-border)" } : undefined}
            >
                {isUser
                    ? <User className="h-4 w-4" style={{ color: "var(--color-muted)" }} />
                    : <Bot className="h-4 w-4 text-white" />
                }
            </div>

            <div className={clsx("min-w-0 max-w-[85%]", isUser && "text-right")}>
                <div className={clsx(
                    "inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isUser
                        ? "gradient-accent text-white rounded-tr-lg"
                        : "glass rounded-tl-lg"
                )}
                    style={!isUser ? { color: "var(--color-text)" } : undefined}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-sm max-w-none [&_p]:my-1.5 [&_pre]:my-2 [&_pre]:rounded-lg [&_ul]:my-1 [&_ol]:my-1 [&_code]:text-[var(--color-accent)] [&_code]:bg-[var(--color-accent-subtle)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_a]:text-[var(--color-accent)] [&_a]:no-underline hover:[&_a]:underline [&_pre]:bg-[var(--color-bg)]" style={{ color: "var(--color-text)" }}>
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                    )}
                </div>
                {message.time_ms != null && (
                    <p className={clsx("mt-1.5 text-[11px]", isUser ? "text-right" : "text-left")} style={{ color: "var(--color-muted)", opacity: 0.6 }}>
                        {(message.time_ms / 1000).toFixed(1)}s
                    </p>
                )}
            </div>
        </div>
    );
}
