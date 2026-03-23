"use client";

import { useState, useRef, useEffect } from "react";
import { useVoiceStore } from "@/store/voiceStore";
import { useUIStore } from "@/store/uiStore";
import { voiceAPI } from "@/lib/api";

export default function VoiceControl() {
    const { isRecording, setRecording, recordedAudio, setRecordedAudio } = useVoiceStore();
    const { addToast } = useUIStore();
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const [isPlayingRecording, setIsPlayingRecording] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.onstart = () => {
                setRecording(true);
            };

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                setRecordedAudio(audioBlob);
                setRecording(false);

                // Stop all streams
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
        } catch (error) {
            addToast("error", "Failed to start recording");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    const playRecording = () => {
        if (recordedAudio && audioRef.current) {
            const url = URL.createObjectURL(recordedAudio);
            audioRef.current.src = url;
            audioRef.current.play();
            setIsPlayingRecording(true);
        }
    };

    const discardRecording = () => {
        setRecordedAudio(null);
        setIsPlayingRecording(false);
    };

    const uploadRecording = async () => {
        if (!recordedAudio) return;

        try {
            const file = new File([recordedAudio], "voice-sample.wav", { type: "audio/wav" });
            const response = await voiceAPI.uploadSample(file, "default-user");
            addToast("success", "Voice sample uploaded successfully");
            discardRecording();
        } catch (error) {
            addToast("error", "Failed to upload voice sample");
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-gray-100">🎤 Voice Recording</h3>

            {!recordedAudio ? (
                <div className="flex gap-2">
                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                            <span className="text-lg">🎙️</span>
                            Start Recording
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={stopRecording}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 active:bg-red-800 flex items-center justify-center gap-2"
                            >
                                <span className="h-2 w-2 animate-pulse rounded-full bg-red-300"></span>
                                Stop Recording
                            </button>
                            <div className="flex items-center px-3 py-2 rounded-lg bg-gray-700 text-sm text-gray-300">
                                Recording...
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    <audio
                        ref={audioRef}
                        onended={() => setIsPlayingRecording(false)}
                    />
                    <div className="rounded-lg bg-gray-700 p-3">
                        <p className="text-sm text-gray-300">✅ Recording ready</p>
                        <p className="text-xs text-gray-400 mt-1">
                            Size: {(recordedAudio.size / 1024).toFixed(2)} KB
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={playRecording}
                            className="flex-1 btn-secondary flex items-center justify-center gap-2"
                            disabled={isPlayingRecording}
                        >
                            <span className="text-lg">▶️</span>
                            {isPlayingRecording ? "Playing..." : "Play"}
                        </button>
                        <button
                            onClick={discardRecording}
                            className="flex-1 btn-secondary flex items-center justify-center gap-2"
                        >
                            <span className="text-lg">🗑️</span>
                            Discard
                        </button>
                        <button
                            onClick={uploadRecording}
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                            <span className="text-lg">📤</span>
                            Upload
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
