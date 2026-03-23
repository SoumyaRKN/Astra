"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Loader2, Bot, User } from "lucide-react";
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
            setError("Microphone access denied.");
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
        <div className="flex h-full flex-col">
            <header className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--color-accent-subtle)" }}>
                        <Mic className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div>
                        <h1 className="text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>Voice Chat</h1>
                        <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>Speak with Astra</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-6 text-center animate-slide-up">
                        <div className="relative">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-accent glow-accent-strong animate-float">
                                <Mic className="h-10 w-10 text-white" />
                            </div>
                            <div className="absolute inset-0 rounded-full border scale-[1.4]" style={{ borderColor: "rgba(124, 92, 252, 0.15)" }} />
                            <div className="absolute inset-0 rounded-full border scale-[1.8]" style={{ borderColor: "rgba(124, 92, 252, 0.08)" }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>Voice Chat</h2>
                            <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                                Press and hold the microphone to speak. Astra will listen, think, and respond.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mx-auto max-w-2xl space-y-3">
                        {messages.map((msg) => (
                            <div key={msg.id} className={clsx("flex items-start gap-3 animate-in", msg.role === "user" && "flex-row-reverse")}>
                                <div
                                    className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", msg.role === "user" ? "border" : "gradient-accent")}
                                    style={msg.role === "user" ? { background: "var(--color-surface-2)", borderColor: "var(--color-border)" } : undefined}
                                >
                                    {msg.role === "user" ? <User className="h-4 w-4" style={{ color: "var(--color-muted)" }} /> : <Bot className="h-4 w-4 text-white" />}
                                </div>
                                <div
                                    className={clsx("rounded-2xl px-4 py-2.5 text-sm max-w-[80%]", msg.role === "user" ? "gradient-accent text-white rounded-tr-lg" : "glass rounded-tl-lg")}
                                    style={msg.role !== "user" ? { color: "var(--color-text)" } : undefined}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="mx-4 md:mx-6 mb-2">
                    <div className="alert alert-error">{error}</div>
                </div>
            )}

            <div className="flex flex-col items-center gap-3 border-t py-6" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <div className="relative">
                    {recording && (
                        <>
                            <span className="absolute inset-0 rounded-full" style={{ background: "rgba(248,113,113,0.15)", animation: "pulse-ring 1.5s ease-out infinite" }} />
                            <span className="absolute inset-0 rounded-full" style={{ background: "rgba(248,113,113,0.08)", animation: "pulse-ring 1.5s ease-out infinite 0.5s" }} />
                        </>
                    )}
                    <button
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        disabled={processing}
                        className={clsx(
                            "relative flex h-[72px] w-[72px] items-center justify-center rounded-full transition-all duration-300",
                            recording
                                ? "bg-[var(--color-error)] text-white scale-110"
                                : processing
                                    ? "border text-[var(--color-muted)]"
                                    : "gradient-accent text-white glow-accent hover:scale-105 active:scale-95"
                        )}
                        style={
                            recording ? { boxShadow: "0 0 40px rgba(248,113,113,0.3)" }
                                : processing ? { background: "var(--color-surface-2)", borderColor: "var(--color-border)" }
                                    : undefined
                        }
                    >
                        {processing ? <Loader2 className="h-7 w-7 animate-spin" /> : recording ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                    </button>
                </div>
                <p className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
                    {recording ? "Listening... Release to send" : processing ? "Processing..." : "Hold to speak"}
                </p>
            </div>
        </div>
    );
}
