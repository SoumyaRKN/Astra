"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, User, Sparkles, Trash2 } from "lucide-react";
import { sendVoice } from "@/lib/api";
import clsx from "clsx";

interface VoiceMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
}

export default function VoicePage() {
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [messages, setMessages] = useState<VoiceMessage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll on new messages
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    // Recording timer
    useEffect(() => {
        if (recording) {
            setElapsed(0);
            timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setElapsed(0);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [recording]);

    const toggleRecording = async () => {
        if (recording) {
            mediaRecorder.current?.stop();
            setRecording(false);
            return;
        }
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunks.current = [];
            recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                await processVoice(new Blob(chunks.current, { type: "audio/webm" }));
            };
            mediaRecorder.current = recorder;
            recorder.start();
            setRecording(true);
        } catch {
            setError("Microphone access denied. Please allow microphone permissions.");
        }
    };

    const processVoice = async (blob: Blob) => {
        setProcessing(true);
        try {
            const result = await sendVoice(blob);
            setMessages((prev) => [
                ...prev,
                { id: `u-${Date.now()}`, role: "user", text: result.user_text || "..." },
                { id: `a-${Date.now() + 1}`, role: "assistant", text: result.response || "..." },
            ]);
            // Play the returned audio (base64 WAV)
            if (result.audio) {
                try {
                    const binaryStr = atob(result.audio);
                    const bytes = new Uint8Array(binaryStr.length);
                    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
                    const audioBlob = new Blob([bytes], { type: "audio/wav" });
                    new Audio(URL.createObjectURL(audioBlob)).play();
                } catch { /* audio playback optional */ }
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Voice processing failed");
        } finally {
            setProcessing(false);
        }
    };

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    const hasMessages = messages.length > 0;

    return (
        <div className="flex h-full flex-col bg-[var(--color-bg)] transition-colors duration-500">
            {/* Header */}
            <header className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <Mic className="h-4 w-4 text-[var(--color-text)]" />
                    </div>
                    <div>
                        <h1 className="text-[14px] font-semibold tracking-tight text-[var(--color-text)]">Voice Chat</h1>
                        <p className="text-[11px] font-medium text-[var(--color-muted)]">
                            {recording ? `Recording ${formatTime(elapsed)}` : `${messages.length} messages`}
                        </p>
                    </div>
                </div>
                {hasMessages && (
                    <button onClick={() => setMessages([])} className="btn-ghost gap-1.5" title="Clear conversation">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Clear</span>
                    </button>
                )}
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
                {!hasMessages ? (
                    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                        {/* Animated Mic orb */}
                        <div className="relative animate-in-scale">
                            <div className="absolute inset-0 rounded-full blur-2xl" style={{
                                background: recording ? 'rgba(244,63,94,0.15)' : 'rgba(109,90,254,0.12)',
                                transform: 'scale(2.5)',
                                transition: 'background 0.5s',
                            }} />
                            {recording && (
                                <>
                                    <span className="absolute -inset-4 rounded-full border border-[var(--color-error)]/30 animate-ping" />
                                    <span className="absolute -inset-8 rounded-full border border-[var(--color-error)]/15 animate-ping" style={{ animationDelay: '0.3s' }} />
                                    <span className="absolute -inset-12 rounded-full border border-[var(--color-error)]/08 animate-ping" style={{ animationDelay: '0.6s' }} />
                                </>
                            )}
                            <div className={clsx(
                                "relative flex h-28 w-28 items-center justify-center rounded-full border transition-all duration-500",
                                recording
                                    ? "border-[var(--color-error)]/40 bg-[var(--color-error)]/10 scale-110"
                                    : "border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl animate-float"
                            )}>
                                <Mic className={clsx("h-12 w-12 transition-colors duration-300", recording ? "text-[var(--color-error)]" : "text-[var(--color-text)]")} />
                            </div>
                        </div>

                        <div className="space-y-2 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                                {recording ? `Listening… ${formatTime(elapsed)}` : processing ? "Processing…" : "Voice Mode"}
                            </h2>
                            <p className="max-w-xs text-[15px] leading-relaxed text-[var(--color-muted)]">
                                {recording
                                    ? "Tap the button again to send your message."
                                    : processing
                                        ? "Transcribing your speech and generating a response…"
                                        : "Tap the microphone and speak. Astra will listen, then respond."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 mx-auto max-w-3xl" style={{ paddingBottom: '100px' }}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={clsx("flex items-start gap-3 animate-in", msg.role === "user" && "flex-row-reverse")}>
                                <div className={clsx(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-1",
                                    msg.role === "user"
                                        ? "bg-[var(--color-surface-3)] border border-[var(--color-border)]"
                                        : "bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                                )}>
                                    {msg.role === "user"
                                        ? <User className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                                        : <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                                    }
                                </div>
                                <div className={clsx(
                                    "max-w-[80%] px-4 py-3 text-[15px] leading-relaxed break-words shadow-sm border border-[var(--color-border)]",
                                    msg.role === "user"
                                        ? "bg-[var(--color-surface-2)] text-[var(--color-text)] rounded-[18px] rounded-tr-[6px]"
                                        : "bg-[var(--color-surface)] text-[var(--color-text)] rounded-[18px] rounded-tl-[6px]"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Processing indicator */}
                        {processing && (
                            <div className="flex items-start gap-3 animate-in">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-1 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                                    <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                                </div>
                                <div className="flex items-center gap-1.5 rounded-[18px] rounded-tl-[6px] bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 shadow-sm">
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

            {error && (
                <div className="mx-4 md:mx-8 mb-3">
                    <div className="alert alert-error">{error}</div>
                </div>
            )}

            {/* Record button — tap to toggle */}
            <div className="flex flex-col items-center gap-3 border-t border-[var(--color-border)] py-6 bg-[var(--color-glass)] backdrop-blur-xl">
                <div className="relative">
                    {recording && (
                        <span className="absolute -inset-2 rounded-full border-2 border-[var(--color-error)]/30 animate-ping" />
                    )}
                    <button
                        onClick={toggleRecording}
                        disabled={processing}
                        className={clsx(
                            "relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 shadow-lg border",
                            recording
                                ? "bg-[var(--color-error)] border-[var(--color-error)] text-white scale-110 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
                                : processing
                                    ? "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-muted)] opacity-60"
                                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:scale-105 hover:shadow-xl hover:border-[var(--color-border-hover)] active:scale-95"
                        )}
                    >
                        {processing
                            ? <Loader2 className="h-6 w-6 animate-spin" />
                            : recording
                                ? <Square className="h-5 w-5 fill-current" />
                                : <Mic className="h-6 w-6" />
                        }
                    </button>
                </div>
                <p className="text-[12px] font-medium text-[var(--color-muted)]">
                    {recording ? "Tap to stop & send" : processing ? "Processing your voice…" : "Tap to speak"}
                </p>
            </div>
        </div>
    );
}
