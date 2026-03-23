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
    X,
    ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { useTheme, ThemeMode } from "@/store/theme";

// Navigation structure — grouped for visual hierarchy
const navMain = [
    { href: "/", icon: MessageSquare, label: "Chat" },
    { href: "/voice", icon: Mic, label: "Voice" },
];

const navCreate = [
    { href: "/image", icon: Image, label: "Image" },
    { href: "/video", icon: Video, label: "Video" },
    { href: "/audio", icon: Music, label: "Audio" },
    { href: "/avatar", icon: User, label: "Avatar" },
];

const navLearn = [
    { href: "/train", icon: GraduationCap, label: "Train" },
    { href: "/gallery", icon: Images, label: "Gallery" },
];

const allNav = [...navMain, ...navCreate, ...navLearn, { href: "/settings", icon: Settings, label: "Settings" }];
const mobileNav = allNav.slice(0, 4);
const moreNav = allNav.slice(4);

const themeOptions: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
    { mode: "light", icon: Sun, label: "Light" },
    { mode: "dark", icon: Moon, label: "Dark" },
    { mode: "system", icon: Monitor, label: "System" },
];

function NavSection({ label, items, pathname }: {
    label: string;
    items: typeof navMain;
    pathname: string;
}) {
    return (
        <div className="px-3">
            <p className="mb-1 px-2 text-[10px] font-700 uppercase tracking-widest text-[var(--color-muted)] opacity-60">
                {label}
            </p>
            <div className="flex flex-col gap-0.5">
                {items.map(({ href, icon: Icon, label: itemLabel }) => {
                    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={clsx(
                                "group flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium transition-all duration-200",
                                active
                                    ? "bg-[var(--color-surface-3)] text-[var(--color-text)]"
                                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
                            )}
                        >
                            <Icon className={clsx(
                                "h-[15px] w-[15px] shrink-0 transition-colors duration-200",
                                active ? "text-[var(--color-accent)]" : "text-current"
                            )} />
                            <span className="truncate">{itemLabel}</span>
                            {active && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)] shrink-0" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const { mode, setMode } = useTheme();
    const [showTheme, setShowTheme] = useState(false);
    const [showMore, setShowMore] = useState(false);

    const ThemeModeIcon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;

    return (
        <>
            {/* Desktop sidebar — always-visible labels */}
            <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-colors duration-500 overflow-hidden">

                {/* Logo mark */}
                <div className="flex h-14 items-center gap-2.5 border-b border-[var(--color-border)] px-5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[8px] logo-gradient shrink-0">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[14px] font-700 tracking-tight text-[var(--color-text)]" style={{ fontWeight: 700 }}>Astra</span>
                        <span className="text-[10px] tracking-widest uppercase text-[var(--color-muted)] font-500 mt-0.5" style={{ fontWeight: 500, letterSpacing: '0.08em' }}>Local AI</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col gap-5 py-5 overflow-y-auto">
                    <NavSection label="Workspace" items={navMain} pathname={pathname} />
                    <NavSection label="Create" items={navCreate} pathname={pathname} />
                    <NavSection label="Learn" items={navLearn} pathname={pathname} />
                </nav>

                {/* Bottom: Settings + Theme */}
                <div className="border-t border-[var(--color-border)] px-3 py-3 space-y-0.5">
                    {/* Settings */}
                    {(() => {
                        const active = pathname === "/settings";
                        return (
                            <Link
                                href="/settings"
                                className={clsx(
                                    "flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium transition-all duration-200",
                                    active
                                        ? "bg-[var(--color-surface-3)] text-[var(--color-text)]"
                                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
                                )}
                            >
                                <Settings className={clsx("h-[15px] w-[15px] shrink-0", active ? "text-[var(--color-accent)]" : "")} />
                                <span>Settings</span>
                                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />}
                            </Link>
                        );
                    })()}

                    {/* Theme pill */}
                    <div className="relative">
                        <button
                            onClick={() => setShowTheme(!showTheme)}
                            className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)] transition-all duration-200"
                        >
                            <ThemeModeIcon className="h-[15px] w-[15px] shrink-0" />
                            <span>Theme</span>
                            <ChevronRight className={clsx("ml-auto h-3 w-3 shrink-0 transition-transform duration-200", showTheme && "rotate-90")} />
                        </button>

                        {showTheme && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowTheme(false)} />
                                <div className="absolute bottom-full left-0 right-0 mb-1 rounded-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-xl p-1 z-50 animate-in-scale">
                                    {themeOptions.map(({ mode: m, icon: Icon, label }) => (
                                        <button
                                            key={m}
                                            onClick={() => { setMode(m); setShowTheme(false); }}
                                            className={clsx(
                                                "flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-[12px] font-medium transition-all duration-150",
                                                mode === m
                                                    ? "bg-[var(--color-surface-3)] text-[var(--color-text)]"
                                                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
                                            )}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {label}
                                            {mode === m && <span className="ml-auto text-[var(--color-accent)]">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile bottom navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-glass)] backdrop-blur-xl transition-colors duration-300"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
                <div className="flex items-center justify-around px-2 pt-1 pb-1">
                    {mobileNav.map(({ href, icon: Icon, label }) => {
                        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={clsx(
                                    "flex flex-col items-center gap-1 px-3 py-2 rounded-[10px] transition-all duration-200 min-w-[56px]",
                                    active ? "text-[var(--color-accent)]" : "text-[var(--color-muted)] hover:text-[var(--color-text-secondary)]"
                                )}
                            >
                                <Icon className={clsx("h-[18px] w-[18px] transition-transform duration-200", active && "scale-110")} />
                                <span className={clsx("text-[10px] font-600", active && "font-700")} style={{ fontWeight: active ? 700 : 600 }}>{label}</span>
                            </Link>
                        );
                    })}

                    {/* More button */}
                    <button
                        onClick={() => setShowMore(true)}
                        className={clsx(
                            "flex flex-col items-center gap-1 px-3 py-2 rounded-[10px] transition-all duration-200 min-w-[56px]",
                            moreNav.some(n => pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href)))
                                ? "text-[var(--color-accent)]"
                                : "text-[var(--color-muted)] hover:text-[var(--color-text-secondary)]"
                        )}
                    >
                        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
                            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
                            <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
                        </svg>
                        <span className="text-[10px] font-600" style={{ fontWeight: 600 }}>More</span>
                    </button>
                </div>
            </nav>

            {/* Mobile "More" sheet */}
            {showMore && (
                <>
                    <div className="md:hidden fixed inset-0 bg-black/50 z-[60] animate-in" onClick={() => setShowMore(false)} />
                    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[61] bg-[var(--color-surface)] border-t border-[var(--color-border)] rounded-t-[20px] animate-slide-up"
                        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}>

                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="h-1 w-10 rounded-full bg-[var(--color-border-strong)]" />
                        </div>

                        <div className="flex items-center justify-between px-5 pt-2 pb-3">
                            <h3 className="text-[15px] font-700 text-[var(--color-text)]" style={{ fontWeight: 700 }}>More</h3>
                            <button onClick={() => setShowMore(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="px-4 pb-2 grid grid-cols-2 gap-2">
                            {moreNav.map(({ href, icon: Icon, label }) => {
                                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setShowMore(false)}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-3 rounded-[12px] border transition-all duration-200",
                                            active
                                                ? "bg-[var(--color-surface-2)] border-[var(--color-border-hover)] text-[var(--color-text)]"
                                                : "bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
                                        )}
                                    >
                                        <Icon className={clsx("h-4 w-4 shrink-0", active && "text-[var(--color-accent)]")} />
                                        <span className="text-[14px] font-600" style={{ fontWeight: 600 }}>{label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Theme row */}
                        <div className="border-t border-[var(--color-border)] mx-4 pt-3 pb-1">
                            <p className="px-1 pb-2 text-[10px] font-700 uppercase tracking-wider text-[var(--color-muted)]" style={{ fontWeight: 700 }}>Theme</p>
                            <div className="flex gap-2">
                                {themeOptions.map(({ mode: m, icon: Icon, label }) => (
                                    <button
                                        key={m}
                                        onClick={() => setMode(m)}
                                        className={clsx(
                                            "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[10px] text-[12px] font-600 transition-all duration-200 border",
                                            mode === m
                                                ? "bg-[var(--color-surface-2)] border-[var(--color-border-hover)] text-[var(--color-text)]"
                                                : "bg-transparent border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-hover)]"
                                        )}
                                        style={{ fontWeight: 600 }}
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
