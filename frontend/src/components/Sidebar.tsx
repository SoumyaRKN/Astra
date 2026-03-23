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

// Mobile bottom nav shows only these
const mobileNav = nav.slice(0, 5);

export function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-[72px] flex-col items-center border-r border-border bg-surface/80 backdrop-blur-xl py-5 gap-1.5">
                {/* Logo */}
                <Link href="/" className="group relative mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-accent transition-transform group-hover:scale-105 glow-accent">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                </Link>

                {/* Nav items */}
                <nav className="flex flex-1 flex-col items-center gap-1">
                    {nav.map(({ href, icon: Icon, label }) => {
                        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={clsx(
                                    "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                                    active
                                        ? "bg-accent-subtle text-accent glow-accent"
                                        : "text-muted hover:bg-surface-2 hover:text-text"
                                )}
                            >
                                <Icon className={clsx("h-[18px] w-[18px] transition-transform", active && "scale-110")} />
                                {/* Tooltip */}
                                <span className="pointer-events-none absolute left-full ml-3 rounded-lg bg-surface-3 px-3 py-1.5 text-xs font-medium text-text opacity-0 shadow-xl transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 whitespace-nowrap z-50 border border-border">
                                    {label}
                                </span>
                                {/* Active indicator */}
                                {active && (
                                    <span className="absolute -left-[1px] top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-accent" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Version pill */}
                <div className="rounded-full bg-surface-2 px-2.5 py-1">
                    <p className="text-[10px] font-medium text-muted">v2.0</p>
                </div>
            </aside>

            {/* Mobile bottom navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-surface/90 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
                {mobileNav.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={clsx(
                                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all",
                                active ? "text-accent" : "text-muted"
                            )}
                        >
                            <Icon className={clsx("h-5 w-5", active && "scale-110")} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    );
                })}
                {/* More menu — shows remaining on mobile */}
                <Link
                    href="/settings"
                    className={clsx(
                        "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all",
                        ["/avatar", "/train", "/gallery", "/settings"].some(p => pathname.startsWith(p)) ? "text-accent" : "text-muted"
                    )}
                >
                    <Settings className="h-5 w-5" />
                    <span className="text-[10px] font-medium">More</span>
                </Link>
            </nav>
        </>
    );
}
