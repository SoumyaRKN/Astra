"use client";

import Link from "next/link";
import { useUIStore } from "@/store/uiStore";
import { useState } from "react";

export default function Navbar() {
    const { toggleSidebar } = useUIStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <nav className="border-b border-gray-700 bg-gray-800 shadow-lg">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Left side - Logo and Title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="btn-icon rounded-lg text-xl"
                        title="Toggle Sidebar"
                    >
                        ☰
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        <span className="text-xl font-bold text-gray-100">Personal AI</span>
                    </Link>
                </div>

                {/* Center - Status */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-900 px-3 py-1 text-sm text-blue-100">
                        <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                        Backend Online
                    </span>
                </div>

                {/* Right side - User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="btn-icon flex items-center gap-2 rounded-lg px-3"
                    >
                        <span className="text-lg">👤</span>
                        <span className="hidden text-sm text-gray-300 sm:inline">User</span>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
                            <Link
                                href="/settings"
                                className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                            >
                                ⚙️ Settings
                            </Link>
                            <Link
                                href="/gallery"
                                className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                            >
                                🖼️ Gallery
                            </Link>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.href = "/";
                                }}
                                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                            >
                                🚪 Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
