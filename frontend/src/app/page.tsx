"use client";

import { useState, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import AvatarDisplay from "@/components/AvatarDisplay";
import VoiceControl from "@/components/VoiceControl";
import SystemStatus from "@/components/SystemStatus";
import { apiClient } from "@/lib/api";

interface HealthStatus {
    status: string;
    ollama_connected: boolean;
    database_connected: boolean;
    model: string;
}

export default function Home() {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check system health on mount
        const checkHealth = async () => {
            try {
                const response = await apiClient.get("/health");
                setHealth(response.data);
            } catch (error) {
                console.error("Failed to check health:", error);
            } finally {
                setLoading(false);
            }
        };

        checkHealth();

        // Poll health status every 30 seconds
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-blue-300"></div>
                    </div>
                    <p className="text-lg text-gray-300">Loading Personal AI Assistant...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full gap-4 p-4">
            {/* Left side: Chat Interface */}
            <div className="flex flex-1 flex-col gap-4">
                {/* System Status */}
                {health && <SystemStatus health={health} />}

                {/* Chat Interface - Main Component */}
                <div className="flex-1 rounded-lg border border-gray-700 bg-gray-750 shadow-lg">
                    <ChatInterface />
                </div>

                {/* Voice Control */}
                <div className="rounded-lg border border-gray-700 bg-gray-750 p-4 shadow-lg">
                    <VoiceControl />
                </div>
            </div>

            {/* Right side: Avatar Display */}
            <div className="w-80 rounded-lg border border-gray-700 bg-gray-750 shadow-lg">
                <AvatarDisplay />
            </div>
        </div>
    );
}
