"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Loader2, User, Sparkles } from "lucide-react";
import { sendVoice, textToSpeech } from "@/lib/api";
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
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);

    const startRecording = async () => {
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

    const stopRecording = () => { mediaRecorder.current?.stop(); setRecording(false); };

    const processVoice = async (blob: Blob) => {
        setProcessing(true);
        try {
            const result = await sendVoice(blob);
            setMessages((prev) => [
                ...prev,
                { id: `u-${Date.now()}`, role: "user", text: result.transcription || "..." },
                { id: `a-${Date.now()}`, role: "assistant", text: result.response || "..." },
            ]);
            if (result.response) {
                try {
                    const audioBlob = await textToSpeech(result.response);
                    new Audio(URL.createObjectURL(audioBlob)).play();
                } catch { /* TTS optional */ }
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Voice processing failed");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex h-full flex-col bg-[var(--color-bg)] transition-colors duration-500">
            {/* Header */}
            <header className="page-header border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl z-30">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <Mic className="h-4 w-4 text-[var(--color-text)]" />
                    </div>
                    <div>
                        <h1 className="text-[14px] font-semibold tracking-tight text-[var(--color-text)]">Voice Chat</h1>
                        <p className="text-[11px] font-medium text-[var(--color-muted)]">Speak with Astra</p>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
                        {/* Animated Mic orb */}
                        <div className="relative animate-in-scale">
                            <div className="absolute inset-0 rounded-full bg-[var(--color-accent)]/20 blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
                            {recording && (
                                <>
                                    <span className="absolute -inset-4 rounded-full border border-[var(--color-error)]/30 animate-ping" />
                                    <span className="absolute -inset-8 rounded-full border border-[var(--color-error)]/15 animate-ping" style={{ animationDelay: '0.3s' }} />
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
                                {recording ? "Listening…" : "Voice Mode"}
                            </h2>
                            <p className="max-w-xs text-[15px] leading-relaxed text-[var(--color-muted)]">
                                {recording ? "Release to send your message." : "Hold the button below and speak. Astra will respond."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 mx-auto max-w-3xl">
                        {messages.map((msg) => (
                            <div key={msg.id} className={clsx("flex items-start gap-4 animate-in", msg.role === "user" && "flex-row-reverse")}>
                                <div className={clsx(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-1",
                                    msg.role === "user"
                                        ? "bg-[var(--color-surface-2)] border border-[var(--color-border)] hidden sm:flex"
                                        : "bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm"
                                )}>
                                    {msg.role === "user"
                                        ? <User className="h-4 w-4 text-[var(--color-muted)]" />
                                        : <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                                    }
                                </div>
                                <div className={clsx(
                                    "max-w-[85%] px-5 py-3 text-[15px] leading-relaxed break-words rounded-[20px] shadow-sm border border-[var(--color-border)]",
                                    msg.role === "user"
                                        ? "bg-[var(--color-surface-2)] text-[var(--color-text)] rounded-tr-[4px]"
                                        : "bg-[var(--color-surface)] text-[var(--color-text)] rounded-tl-[4px]"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="mx-4 md:mx-8 mb-3">
                    <div className="alert alert-error">{error}</div>
                </div>
            )}

            {/* Record button */}
            <div className="flex flex-col items-center gap-4 border-t border-[var(--color-border)] py-8 bg-[var(--color-surface)]/80 backdrop-blur-xl">
                <div className="relative">
                    <button
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        disabled={processing}
                        className={clsx(
                            "relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 shadow-lg border",
                            recording
                                ? "bg-[var(--color-error)]/10 border-[var(--color-error)]/40 text-[var(--color-error)] scale-110"
                                : processing
                                    ? "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-muted)] opacity-60"
                                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:scale-105 hover:shadow-xl hover:border-[var(--color-border-hover)] active:scale-95"
                        )}
                    >
                        {processing
                            ? <Loader2 className="h-8 w-8 animate-spin" />
                            : recording
                                ? <MicOff className="h-8 w-8" />
                                : <Mic className="h-8 w-8" />
                        }
                    </button>
                </div>
                <p className="text-[13px] font-medium text-[var(--color-muted)]">
                    {recording ? "Listening — release to send" : processing ? "Processing…" : "Hold to speak"}
                </p>
            </div>
        </div>
    );
}
