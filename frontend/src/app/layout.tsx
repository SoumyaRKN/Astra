import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
    title: "Astra",
    description: "Your local AI assistant — 100% private, runs entirely on your machine",
    icons: {
        icon: "/favicon.svg",
        apple: "/apple-touch-icon.svg",
    },
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem("astra-theme")||"system";var r=t;if(t==="system"){r=window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",r);document.documentElement.style.colorScheme=r}catch(e){}})()`,
                    }}
                />
            </head>
            <body>
                <ThemeProvider>
                    <div className="ambient-bg" aria-hidden="true" />
                    <div className="relative z-10 flex h-dvh">
                        <Sidebar />
                        <main className="flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">{children}</main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
