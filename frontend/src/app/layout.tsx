import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
    title: "Astra",
    description: "Your local AI assistant",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <div className="flex h-screen">
                    <Sidebar />
                    <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
                </div>
            </body>
        </html>
    );
}
