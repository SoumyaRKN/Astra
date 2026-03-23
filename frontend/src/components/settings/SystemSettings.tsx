"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useUIStore } from "@/store/uiStore";

export default function SystemSettings() {
    const { settings, updateSettings, saveSettings } = useSettingsStore();
    const { addToast } = useUIStore();

    const handleChange = (key: string, value: any) => {
        updateSettings({ [key]: value } as any);
    };

    const handleSave = () => {
        saveSettings();
        addToast("success", "Settings saved successfully");
    };

    if (!settings) {
        return <div className="text-center text-gray-400">Loading settings...</div>;
    }

    return (
        <div className="space-y-6">
            {/* API Configuration */}
            <div>
                <h4 className="mb-3 font-semibold text-gray-100">API Configuration</h4>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            API Base URL
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}
                            className="input-field"
                        />
                    </div>
                </div>
            </div>

            {/* Display Settings */}
            <div>
                <h4 className="mb-3 font-semibold text-gray-100">Display</h4>
                <div className="space-y-3">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={settings.theme === "dark"}
                            onChange={(e) =>
                                handleChange("theme", e.target.checked ? "dark" : "light")
                            }
                            className="h-4 w-4 rounded"
                        />
                        <span className="text-gray-300">Dark Mode</span>
                    </label>
                </div>
            </div>

            {/* Behavior Settings */}
            <div>
                <h4 className="mb-3 font-semibold text-gray-100">Behavior</h4>
                <div className="space-y-3">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={settings.autoPlayResponses}
                            onChange={(e) =>
                                handleChange("autoPlayResponses", e.target.checked)
                            }
                            className="h-4 w-4 rounded"
                        />
                        <span className="text-gray-300">Auto-play Responses</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={settings.enableNotifications}
                            onChange={(e) =>
                                handleChange("enableNotifications", e.target.checked)
                            }
                            className="h-4 w-4 rounded"
                        />
                        <span className="text-gray-300">Enable Notifications</span>
                    </label>
                </div>
            </div>

            {/* Language */}
            <div>
                <h4 className="mb-3 font-semibold text-gray-100">Language</h4>
                <select
                    value={settings.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    className="input-field"
                >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                </select>
            </div>

            {/* Save Button */}
            <div className="border-t border-gray-700 pt-4">
                <button onClick={handleSave} className="btn-primary w-full">
                    💾 Save Settings
                </button>
            </div>
        </div>
    );
}
