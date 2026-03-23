"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
    Sun,
    Moon,
    Monitor,
    MoreHorizontal,
    X,
} from "lucide-react";
import clsx from "clsx";
import { useTheme, ThemeMode } from "@/store/theme";

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

const mobileNav = nav.slice(0, 4);
const moreNav = nav.slice(4);

const themeOptions: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
    { mode: "light", icon: Sun, label: "Light" },
    { mode: "dark", icon: Moon, label: "Dark" },
    { mode: "system", icon: Monitor, label: "System" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { mode, setMode } = useTheme();
    const [showTheme, setShowTheme] = useState(false);
    const [showMore, setShowMore] = useState(false);

    const ThemeModeIcon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-[72px] flex-col items-center border-r border-[var(--color-border)] bg-[var(--color-surface)] py-5 gap-1 transition-colors duration-300">
                {/* Logo */}
                <Link href="/" className="group relative mb-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-accent transition-transform group-hover:scale-105 glow-accent">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                </Link>

                {/* Nav items */}
                <nav className="flex flex-1 flex-col items-center gap-0.5">
                    {nav.map(({ href, icon: Icon, label }) => {
                        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={clsx(
                                    "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                                    active
                                        ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                                        : "text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                                )}
                            >
                                <Icon className={clsx("h-[18px] w-[18px] transition-transform", active && "scale-110")} />
                                <span className="pointer-events-none absolute left-full ml-3 rounded-lg bg-[var(--color-surface-3)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 whitespace-nowrap z-50 border border-[var(--color-border)]">
                                    {label}
                                </span>
                                {active && (
                                    <span className="absolute -left-[1px] top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[var(--color-accent)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Theme toggle */}
                <div className="relative mb-2">
                    <button
                        onClick={() => setShowTheme(!showTheme)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all"
                        title="Theme"
                    >
                        <ThemeModeIcon className="h-[18px] w-[18px]" />
                    </button>
                    {showTheme && (
                        <div className="absolute left-full ml-3 bottom-0 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl p-1.5 z-50 animate-in-scale">
                            {themeOptions.map(({ mode: m, icon: Icon, label }) => (
                                <button
                                    key={m}
                                    onClick={() => { setMode(m); setShowTheme(false); }}
                                    className={clsx(
                                        "flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all whitespace-nowrap",
                                        mode === m
                                            ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-medium"
                                            : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Version pill */}
                <div className="rounded-full bg-[var(--color-surface-2)] px-2.5 py-1">
                    <p className="text-[10px] font-medium text-[var(--color-muted)]">v2.0</p>
                </div>
            </aside>

            {/* Mobile bottom navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-xl transition-colors duration-300">
                <div className="flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)] pt-1">
                    {mobileNav.map(({ href, icon: Icon, label }) => {
                        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={clsx(
                                    "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all min-w-[56px]",
                                    active ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"
                                )}
                            >
                                <Icon className={clsx("h-5 w-5 transition-transform", active && "scale-110")} />
                                <span className="text-[10px] font-medium">{label}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className={clsx(
                            "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all min-w-[56px]",
                            moreNav.some(n => pathname === n.href || pathname.startsWith(n.href)) ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"
                        )}
                    >
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="text-[10px] font-medium">More</span>
                    </button>
                </div>
            </nav>

            {/* Mobile "More" sheet */}
            {showMore && (
                <>
                    <div className="md:hidden fixed inset-0 bg-black/40 z-[60] animate-in" onClick={() => setShowMore(false)} />
                    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[61] bg-[var(--color-surface)] border-t border-[var(--color-border)] rounded-t-2xl pb-[env(safe-area-inset-bottom)] animate-slide-up">
                        <div className="flex items-center justify-between px-5 pt-4 pb-2">
                            <h3 className="text-sm font-semibold text-[var(--color-text)]">More</h3>
                            <button onClick={() => setShowMore(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="px-3 pb-3 space-y-0.5">
                            {moreNav.map(({ href, icon: Icon, label }) => {
                                const active = pathname === href || pathname.startsWith(href);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setShowMore(false)}
                                        className={clsx(
                                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                                            active
                                                ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                                                : "text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="text-sm font-medium">{label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                        {/* Mobile theme picker */}
                        <div className="border-t border-[var(--color-border)] px-3 pt-3 pb-3">
                            <p className="px-3 pb-2 text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wider">Theme</p>
                            <div className="flex gap-1.5">
                                {themeOptions.map(({ mode: m, icon: Icon, label }) => (
                                    <button
                                        key={m}
                                        onClick={() => setMode(m)}
                                        className={clsx(
                                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                                            mode === m
                                                ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                                                : "text-[var(--color-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)]"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
