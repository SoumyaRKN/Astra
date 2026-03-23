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
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-subtle">
                        <Mic className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-[15px] font-semibold">Voice Chat</h1>
                        <p className="text-[11px] text-muted">Speak with Astra</p>
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
                            <div className="absolute inset-0 rounded-full border border-accent/20 scale-[1.4]" />
                            <div className="absolute inset-0 rounded-full border border-accent/10 scale-[1.8]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Voice Chat</h2>
                            <p className="mt-2 max-w-xs text-sm text-muted leading-relaxed">
                                Press and hold the microphone to speak. Astra will listen, think, and respond.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mx-auto max-w-2xl space-y-3">
                        {messages.map((msg) => (
                            <div key={msg.id} className={clsx("flex items-start gap-3 animate-in", msg.role === "user" && "flex-row-reverse")}>
                                <div className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", msg.role === "user" ? "bg-surface-2 border border-border" : "gradient-accent")}>
                                    {msg.role === "user" ? <User className="h-4 w-4 text-muted" /> : <Bot className="h-4 w-4 text-white" />}
                                </div>
                                <div className={clsx("rounded-2xl px-4 py-2.5 text-sm max-w-[80%]", msg.role === "user" ? "gradient-accent text-white rounded-tr-lg" : "glass rounded-tl-lg text-text")}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="mx-4 md:mx-6 mb-2">
                    <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-2.5 text-sm text-error">{error}</div>
                </div>
            )}

            <div className="flex flex-col items-center gap-3 border-t border-border bg-surface/50 backdrop-blur-xl py-6 mb-[env(safe-area-inset-bottom)] md:mb-0">
                <div className="relative">
                    {recording && (
                        <>
                            <span className="absolute inset-0 rounded-full bg-error/20" style={{ animation: "pulse-ring 1.5s ease-out infinite" }} />
                            <span className="absolute inset-0 rounded-full bg-error/10" style={{ animation: "pulse-ring 1.5s ease-out infinite 0.5s" }} />
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
                                ? "bg-error text-white scale-110"
                                : processing
                                    ? "bg-surface-2 text-muted border border-border"
                                    : "gradient-accent text-white glow-accent hover:scale-105 active:scale-95"
                        )}
                        style={recording ? { boxShadow: "0 0 40px rgba(248,113,113,0.3)" } : undefined}
                    >
                        {processing ? <Loader2 className="h-7 w-7 animate-spin" /> : recording ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                    </button>
                </div>
                <p className="text-xs font-medium text-muted">
                    {recording ? "Listening... Release to send" : processing ? "Processing..." : "Hold to speak"}
                </p>
            </div>
        </div>
    );
}
