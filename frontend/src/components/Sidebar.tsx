"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    MessageSquare,
    Mic,
    Image,
    Video,
    Music,
    User,
    GraduationCap,
    Images,
    Settings,
    Sparkles,
} from "lucide-react";
import clsx from "clsx";

const nav = [
    { href: "/", icon: MessageSquare, label: "Chat" },
    { href: "/voice", icon: Mic, label: "Voice" },
    { href: "/image", icon: Image, label: "Image" },
    { href: "/video", icon: Video, label: "Video" },
    { href: "/audio", icon: Music, label: "Audio" },
    { href: "/avatar", icon: User, label: "Avatar" },
    { href: "/train", icon: GraduationCap, label: "Train" },
    { href: "/gallery", icon: Images, label: "Gallery" },
    { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex w-16 flex-col items-center border-r border-border bg-surface py-4 gap-1">
            {/* Logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 mb-4">
                <Sparkles className="h-5 w-5 text-accent" />
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col items-center gap-1">
                {nav.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            title={label}
                            className={clsx(
                                "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                                active
                                    ? "bg-accent/15 text-accent"
                                    : "text-muted hover:bg-surface-2 hover:text-text"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                        </Link>
                    );
                })}
            </nav>

            {/* Version */}
            <p className="text-[10px] text-muted/50">v2.0</p>
        </aside>
    );
}
