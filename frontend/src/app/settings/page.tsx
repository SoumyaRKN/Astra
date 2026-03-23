"use client";

import { useState } from "react";
import VoiceProfileSettings from "@/components/settings/VoiceProfileSettings";
import AvatarProfileSettings from "@/components/settings/AvatarProfileSettings";
import SystemSettings from "@/components/settings/SystemSettings";

type TabType = "voice" | "avatar" | "system";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>("voice");

    const tabs: { id: TabType; label: string; icon: string }[] = [
        { id: "voice", label: "Voice Profile", icon: "🎤" },
        { id: "avatar", label: "Avatar", icon: "🎭" },
        { id: "system", label: "System", icon: "⚙️" },
    ];

    return (
        <div className="min-h-full bg-gray-800 p-6">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-100">Settings</h1>
                    <p className="mt-2 text-gray-400">Configure your Personal AI Assistant</p>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-700">
                    <div className="flex gap-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${activeTab === tab.id
                                        ? "border-blue-500 text-blue-400"
                                        : "border-transparent text-gray-400 hover:text-gray-300"
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="rounded-lg border border-gray-700 bg-gray-750 p-6">
                    {activeTab === "voice" && <VoiceProfileSettings />}
                    {activeTab === "avatar" && <AvatarProfileSettings />}
                    {activeTab === "system" && <SystemSettings />}
                </div>
            </div>
        </div>
    );
}
