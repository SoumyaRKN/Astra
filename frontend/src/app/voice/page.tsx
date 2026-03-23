"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, Volume2, MessageSquare } from "lucide-react";
import { sendVoice, textToSpeech } from "@/lib/api";
import clsx from "clsx";

interface VoiceMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
    audio?: string;
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

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.current.push(e.data);
            };

            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunks.current, { type: "audio/webm" });
                await processVoice(blob);
            };

            mediaRecorder.current = recorder;
            recorder.start();
            setRecording(true);
        } catch {
            setError("Microphone access denied. Please allow microphone access.");
        }
    };

    const stopRecording = () => {
        mediaRecorder.current?.stop();
        setRecording(false);
    };

    const processVoice = async (blob: Blob) => {
        setProcessing(true);
        try {
            const result = await sendVoice(blob);
            setMessages((prev) => [
                ...prev,
                { id: `u-${Date.now()}`, role: "user", text: result.transcription || "..." },
                { id: `a-${Date.now()}`, role: "assistant", text: result.response || "..." },
            ]);

            // Play response audio
            if (result.response) {
                try {
                    const audioBlob = await textToSpeech(result.response);
                    const url = URL.createObjectURL(audioBlob);
                    const audio = new Audio(url);
                    audio.play();
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
            <header className="flex items-center gap-3 border-b border-border px-6 py-3">
                <Mic className="h-5 w-5 text-accent" />
                <div>
                    <h1 className="text-lg font-semibold">Voice Chat</h1>
                    <p className="text-xs text-muted">Speak with your AI assistant</p>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                            <Mic className="h-10 w-10 text-accent" />
                        </div>
                        <h2 className="text-xl font-semibold">Voice Chat</h2>
                        <p className="max-w-md text-sm text-muted">
                            Press and hold the microphone button to speak. Astra will transcribe your speech,
                            generate a response, and read it back to you.
                        </p>
                    </div>
                ) : (
                    <div className="mx-auto max-w-2xl space-y-3">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={clsx(
                                    "flex gap-3 animate-in",
                                    msg.role === "user" ? "flex-row-reverse" : ""
                                )}
                            >
                                <div
                                    className={clsx(
                                        "rounded-2xl px-4 py-2.5 text-sm max-w-[80%]",
                                        msg.role === "user"
                                            ? "bg-accent text-white rounded-tr-md"
                                            : "bg-surface text-text rounded-tl-md"
                                    )}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="border-t border-error/30 bg-error/5 px-6 py-2">
                    <p className="text-sm text-error">{error}</p>
                </div>
            )}

            {/* Record Button */}
            <div className="flex flex-col items-center gap-3 border-t border-border py-6">
                <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    disabled={processing}
                    className={clsx(
                        "flex h-16 w-16 items-center justify-center rounded-full transition-all",
                        recording
                            ? "bg-error text-white scale-110 shadow-lg shadow-error/30"
                            : processing
                                ? "bg-surface-2 text-muted"
                                : "bg-accent text-white hover:bg-accent-hover hover:scale-105"
                    )}
                >
                    {processing ? (
                        <Loader2 className="h-7 w-7 animate-spin" />
                    ) : recording ? (
                        <MicOff className="h-7 w-7" />
                    ) : (
                        <Mic className="h-7 w-7" />
                    )}
                </button>
                <p className="text-xs text-muted">
                    {recording ? "Listening... Release to send" : processing ? "Processing..." : "Hold to speak"}
                </p>
            </div>
        </div>
    );
}
