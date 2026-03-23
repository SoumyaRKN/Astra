import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
    title: "Personal AI Assistant",
    description: "Your self-hosted AI companion with voice, avatar, and more",
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-gray-900 text-gray-100">
                <div className="flex h-screen flex-col">
                    {/* Header/Navigation */}
                    <Navbar />

                    {/* Main Content Area */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar */}
                        <Sidebar />

                        {/* Main Content */}
                        <main className="flex-1 overflow-auto bg-gray-800">
                            <div className="h-full">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
}
