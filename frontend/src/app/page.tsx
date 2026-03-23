"use client";

import { useEffect, useState, useRef } from "react";
import { useChat, Message } from "@/store/chat";
import { sendMessage, getHealth, getHistory, getSessions, clearHistory } from "@/lib/api";
import { Send, Loader2, User, Sparkles, Trash2, Zap, Code, Brain, ArrowUp, ChevronDown, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import clsx from "clsx";

interface Health {
    status: string;
    ollama: boolean;
    model: string;
}

const suggestions = [
    {
        icon: Brain,
        label: "Explain a concept",
        text: "Explain quantum computing in simple terms",
        color: "text-violet-400",
        bg: "bg-violet-500/08",
    },
    {
        icon: Code,
        label: "Write code",
        text: "Write a Python function to sort a list of dicts by a key",
        color: "text-teal-400",
        bg: "bg-teal-500/08",
    },
    {
        icon: Zap,
        label: "Quick answer",
        text: "What are the benefits of mindfulness meditation?",
        color: "text-amber-400",
        bg: "bg-amber-500/08",
    },
];

export default function Home() {
    const { messages, session, loading, error, addMessage, setLoading, setError, clearMessages, setSession } = useChat();
    const [input, setInput] = useState("");
    const [health, setHealth] = useState<Health | null>(null);
    const [sessions, setSessions] = useState<string[]>([]);
    const [showSessions, setShowSessions] = useState(false);
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

    // Load history from backend on mount and session change
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await getHistory(session);
                const msgs = (data.messages || []).map((m: { role: string; content: string; timestamp: string }, i: number) => ({
                    id: `h-${i}-${Date.now()}`,
                    role: m.role as "user" | "assistant",
                    content: m.content,
                    timestamp: new Date(m.timestamp),
                }));
                if (msgs.length > 0) clearMessages();
                msgs.forEach((m: Message) => addMessage(m));
            } catch { /* no history yet */ }
        };
        loadHistory();
    }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

    // Load available sessions
    useEffect(() => {
        const loadSessions = async () => {
            try {
                const data = await getSessions();
                setSessions(Array.isArray(data) ? data : data.sessions ?? []);
            } catch { /* ignore */ }
        };
        loadSessions();
    }, [messages.length]);

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

    const handleClear = async () => {
        try { await clearHistory(session); } catch { /* ignore */ }
        clearMessages();
    };

    const handleNewChat = () => {
        const newId = `chat_${Date.now()}`;
        setSession(newId);
        setShowSessions(false);
    };

    const isConnected = health?.ollama === true;
    const hasMessages = messages.length > 0;

    return (
        <div className="relative flex h-full flex-col bg-[var(--color-bg)] transition-colors duration-500" style={{ overflow: 'hidden' }}>

            {/* ── Header ─────────────────────────────────── */}
            <header className="page-header shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <MessageSquare className="h-4 w-4 text-[var(--color-text)]" />
                    </div>
                    <div>
                        <h1 className="text-[14px] font-semibold tracking-tight text-[var(--color-text)] leading-none">
                            {hasMessages ? "Chat" : "New Chat"}
                        </h1>
                        <p className="text-[11px] font-medium text-[var(--color-muted)] mt-0.5">
                            {hasMessages
                                ? `${messages.length} ${messages.length === 1 ? "message" : "messages"}`
                                : "Powered by Ollama"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Session switcher */}
                    {sessions.length > 1 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowSessions(!showSessions)}
                                className="btn-ghost gap-1.5"
                            >
                                <span className="hidden sm:inline text-[12px] truncate max-w-[100px]">{session}</span>
                                <ChevronDown className={clsx("h-3 w-3 transition-transform", showSessions && "rotate-180")} />
                            </button>
                            {showSessions && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowSessions(false)} />
                                    <div className="absolute right-0 top-full mt-1 w-52 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-xl p-1.5 z-50 animate-in-scale">
                                        <button
                                            onClick={handleNewChat}
                                            className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[var(--color-accent)] hover:bg-[var(--color-hover)] transition-colors"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" /> New Chat
                                        </button>
                                        <div className="h-px bg-[var(--color-border)] my-1" />
                                        {sessions.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => { setSession(s); setShowSessions(false); }}
                                                className={clsx(
                                                    "flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-colors truncate",
                                                    s === session
                                                        ? "bg-[var(--color-surface-3)] text-[var(--color-text)]"
                                                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Connection badge */}
                    <div className={clsx("status-badge", isConnected ? "status-online" : "status-offline")}>
                        <span className={clsx(
                            "h-1.5 w-1.5 rounded-full",
                            isConnected
                                ? "bg-[var(--color-success)] shadow-[0_0_6px_var(--color-success)]"
                                : "bg-[var(--color-error)]"
                        )} />
                        <span className="truncate max-w-[100px]">
                            {isConnected ? (health?.model ?? "Connected") : "Offline"}
                        </span>
                    </div>

                    {hasMessages && (
                        <button
                            onClick={handleClear}
                            className="btn-ghost gap-1.5"
                            title="Clear chat"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    )}
                </div>
            </header>

            {/* ── Messages / Empty state ──────────────────── */}
            <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
                {!hasMessages ? (
                    /* ── Empty / Welcome state ── */
                    <div className="flex h-full flex-col items-center justify-center px-6 py-12">
                        {/* Brand mark */}
                        <div className="relative mb-8 animate-in-scale">
                            {/* Glow halo */}
                            <div
                                className="absolute inset-0 rounded-[32px] blur-2xl"
                                style={{
                                    background: 'radial-gradient(ellipse, rgba(109,90,254,0.3) 0%, transparent 70%)',
                                    transform: 'scale(2)',
                                }}
                            />
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-[24px] bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-[0_8px_32px_rgba(0,0,0,0.2)] animate-float">
                                <Sparkles className="h-9 w-9 text-[var(--color-text)]" style={{ opacity: 0.9 }} />
                            </div>
                        </div>

                        {/* Wordmark */}
                        <div className="text-center mb-10 animate-slide-up" style={{ animationDelay: '60ms' }}>
                            <h2 className="text-[32px] font-bold tracking-tight text-[var(--color-text)] leading-none mb-3"
                                style={{ fontWeight: 700, letterSpacing: '-0.04em' }}>
                                What can I help<br />
                                <span className="gradient-text">you with today?</span>
                            </h2>
                            <p className="text-[15px] text-[var(--color-text-secondary)] max-w-sm leading-relaxed">
                                Astra runs entirely on your machine.
                                No cloud, no tracking — just intelligence.
                            </p>
                        </div>

                        {/* Suggestion cards */}
                        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {suggestions.map(({ icon: Icon, label, text, color, bg }, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setInput(text); setTimeout(() => inputRef.current?.focus(), 50); }}
                                    className="group flex flex-col items-start gap-3 rounded-[14px] p-5 text-left border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 animate-slide-up"
                                    style={{ animationDelay: `${120 + i * 60}ms` }}
                                >
                                    <div className={clsx("flex h-9 w-9 items-center justify-center rounded-[10px] transition-transform duration-300 group-hover:scale-110", bg, color)}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1" style={{ letterSpacing: '0.06em' }}>{label}</p>
                                        <p className="text-[13px] font-medium text-[var(--color-text)] leading-snug">{text}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Subtle footer note */}
                        <p className="mt-8 text-[12px] text-[var(--color-muted)] animate-slide-up" style={{ animationDelay: '300ms' }}>
                            Press <kbd className="px-1.5 py-0.5 rounded-[4px] bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[11px] font-mono">Enter</kbd> to send &nbsp;·&nbsp;
                            <kbd className="px-1.5 py-0.5 rounded-[4px] bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[11px] font-mono">Shift+Enter</kbd> for new line
                        </p>
                    </div>
                ) : (
                    /* ── Message list ── */
                    <div className="px-4 py-6 md:px-8 space-y-1" style={{ paddingBottom: '180px' }}>
                        {messages.map((msg, idx) => (
                            <ChatBubble
                                key={msg.id}
                                message={msg}
                                isFirst={idx === 0 || messages[idx - 1].role !== msg.role}
                                isLast={idx === messages.length - 1 || messages[idx + 1].role !== msg.role}
                            />
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex items-end gap-3 py-2 animate-in max-w-3xl">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] mb-0.5">
                                    <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                                </div>
                                <div className="flex items-center gap-1.5 rounded-[16px] rounded-bl-[4px] bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 shadow-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted)]" style={{ animation: "typing 1.2s infinite 0s" }} />
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted)]" style={{ animation: "typing 1.2s infinite 0.2s" }} />
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted)]" style={{ animation: "typing 1.2s infinite 0.4s" }} />
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} className="h-px" />
                    </div>
                )}
            </div>

            {/* ── Error banner ────────────────────────────── */}
            {error && (
                <div className="absolute left-4 right-4 md:left-8 md:right-8 z-20"
                    style={{ bottom: hasMessages ? '160px' : '120px' }}>
                    <div className="alert alert-error text-[13px]">{error}</div>
                </div>
            )}

            {/* ── Input dock ──────────────────────────────── */}
            <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
                style={{ background: 'linear-gradient(to top, var(--color-bg) 65%, transparent)' }}>
                <div className="pointer-events-auto px-4 pb-6 pt-8 md:px-8">
                    <div className="mx-auto max-w-3xl">
                        {/* Input container */}
                        <div className={clsx(
                            "flex items-end gap-0 rounded-[18px] border bg-[var(--color-surface)] shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-all duration-300",
                            "focus-within:shadow-[0_4px_32px_rgba(109,90,254,0.12)] focus-within:border-[var(--color-accent-border)]",
                            "border-[var(--color-border)]"
                        )}>
                            <TextareaAutosize
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder={isConnected ? "Message Astra…" : "Connecting to Ollama…"}
                                disabled={loading || !isConnected}
                                minRows={1}
                                maxRows={8}
                                className="flex-1 resize-none bg-transparent px-5 py-4 text-[15px] font-medium text-[var(--color-text)] placeholder-[var(--color-placeholder)] outline-none disabled:opacity-40 leading-relaxed"
                                style={{ letterSpacing: '-0.01em' }}
                            />

                            {/* Send button */}
                            <div className="p-2 shrink-0">
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim() || !isConnected}
                                    className={clsx(
                                        "flex h-10 w-10 items-center justify-center rounded-[12px] transition-all duration-300",
                                        input.trim() && isConnected && !loading
                                            ? "bg-[var(--color-text)] text-[var(--color-bg)] hover:scale-105 hover:shadow-lg active:scale-95"
                                            : "bg-[var(--color-surface-2)] text-[var(--color-muted)] opacity-40 cursor-not-allowed"
                                    )}
                                >
                                    {loading
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <ArrowUp className="h-4 w-4" />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Subtext */}
                        <p className="mt-2.5 text-center text-[11px] font-medium text-[var(--color-muted)]" style={{ opacity: 0.6 }}>
                            Astra · 100% local · No data shared · <kbd className="font-mono">Enter</kbd> to send
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── ChatBubble component ─────────────────────────────────────────── */
function ChatBubble({ message, isFirst, isLast }: {
    message: Message;
    isFirst: boolean;
    isLast: boolean;
}) {
    const isUser = message.role === "user";

    return (
        <div className={clsx(
            "flex items-end gap-3 animate-in",
            isUser ? "flex-row-reverse" : "flex-row",
            !isLast && !isUser && "mb-0.5",
            !isLast && isUser && "mb-0.5",
            isFirst && "mt-2",
        )}>
            {/* Avatar — only show on the last bubble in a group */}
            <div className="shrink-0 w-7">
                {isLast && (
                    <div className={clsx(
                        "flex h-7 w-7 items-center justify-center rounded-full",
                        isUser
                            ? "bg-[var(--color-surface-3)] border border-[var(--color-border)]"
                            : "bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                    )}>
                        {isUser
                            ? <User className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                            : <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                        }
                    </div>
                )}
            </div>

            {/* Bubble */}
            <div className={clsx("flex flex-col max-w-[min(85%,680px)]", isUser ? "items-end" : "items-start")}>
                <div className={clsx(
                    "text-[15px] leading-relaxed transition-colors duration-300",
                    isUser
                        ? [
                            "bg-[var(--color-surface-2)] text-[var(--color-text)] px-4 py-3",
                            "border border-[var(--color-border)] shadow-sm",
                            isFirst ? "rounded-[18px] rounded-br-[6px]" : "rounded-[18px] rounded-r-[6px]",
                            isLast && isFirst ? "rounded-[18px] rounded-br-[6px]" : "",
                        ]
                        : [
                            "text-[var(--color-text)] py-1",
                            "w-full",
                        ]
                )}>
                    {isUser ? (
                        <p className="whitespace-pre-wrap font-medium" style={{ letterSpacing: '-0.01em' }}>
                            {message.content}
                        </p>
                    ) : (
                        <div className="astra-prose max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Timing */}
                {isLast && message.time_ms != null && (
                    <p className={clsx(
                        "mt-1.5 text-[11px] font-medium text-[var(--color-muted)]",
                        isUser ? "mr-1" : "ml-1"
                    )}>
                        {(message.time_ms / 1000).toFixed(1)}s
                    </p>
                )}
            </div>
        </div>
    );
}
