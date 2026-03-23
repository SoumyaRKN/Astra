"use client";

import Link from "next/link";
import { useUIStore } from "@/store/uiStore";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const { sidebarOpen } = useUIStore();
    const pathname = usePathname();

    const menuItems = [
        { href: "/", label: "💬 Chat", icon: "💬" },
        { href: "/gallery", label: "🖼️ Gallery", icon: "🖼️" },
        { href: "/settings", label: "⚙️ Settings", icon: "⚙️" },
    ];

    return (
        <aside
            className={`border-r border-gray-700 bg-gray-800 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"
                } overflow-hidden`}
        >
            <div className="flex flex-col gap-1 p-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                                }`}
                            title={sidebarOpen ? undefined : item.label}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </div>

            {sidebarOpen && (
                <div className="border-t border-gray-700 p-4 text-center">
                    <div className="text-xs text-gray-500">
                        <p>🚀 Phase 6</p>
                        <p>UI Dashboard</p>
                    </div>
                </div>
            )}
        </aside>
    );
}
