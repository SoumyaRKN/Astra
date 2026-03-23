"use client";

import { useEffect, useState } from "react";
import { chatAPI } from "@/lib/api";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";

interface HealthResponse {
    status: string;
    ollama_connected: boolean;
    database_connected: boolean;
    model: string;
}

export default function SystemStatus({ health }: { health: HealthResponse }) {
    const { addToast } = useUIStore();

    const getStatusColor = (connected: boolean) => {
        return connected ? "text-green-400" : "text-red-400";
    };

    const getStatusIcon = (connected: boolean) => {
        return connected ? "✅" : "❌";
    };

    return (
        <div className="flex gap-3 rounded-lg border border-gray-700 bg-gray-750 p-3">
            {/* Overall Status */}
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-gray-800 px-3 py-2">
                <span className={`text-lg ${health.status === "healthy" ? "text-green-400" : "text-yellow-400"}`}>
                    {health.status === "healthy" ? "✅" : "⚠️"}
                </span>
                <div>
                    <p className="text-xs text-gray-400">System Status</p>
                    <p className="font-medium capitalize text-gray-100">{health.status}</p>
                </div>
            </div>

            {/* Ollama Status */}
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-gray-800 px-3 py-2">
                <span className={getStatusIcon(health.ollama_connected)}>
                    {getStatusIcon(health.ollama_connected)}
                </span>
                <div>
                    <p className="text-xs text-gray-400">Ollama</p>
                    <p className={`font-medium ${getStatusColor(health.ollama_connected)}`}>
                        {health.ollama_connected ? "Connected" : "Offline"}
                    </p>
                </div>
            </div>

            {/* Database Status */}
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-gray-800 px-3 py-2">
                <span className={getStatusIcon(health.database_connected)}>
                    {getStatusIcon(health.database_connected)}
                </span>
                <div>
                    <p className="text-xs text-gray-400">Database</p>
                    <p className={`font-medium ${getStatusColor(health.database_connected)}`}>
                        {health.database_connected ? "Connected" : "Offline"}
                    </p>
                </div>
            </div>

            {/* Model Info */}
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-gray-800 px-3 py-2">
                <span className="text-lg">🧠</span>
                <div>
                    <p className="text-xs text-gray-400">Model</p>
                    <p className="font-medium text-gray-100">{health.model}</p>
                </div>
            </div>
        </div>
    );
}
