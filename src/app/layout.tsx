import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-geist",
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-geist-mono",
});

export const metadata: Metadata = {
    title: "bTagScript — Playground",
    description: "A workspace for writing, testing, and exploring TagScript.",
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#eff1f5" },
        { media: "(prefers-color-scheme: dark)", color: "#181825" },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `try { document.documentElement.classList.toggle("dark", localStorage.getItem("btag-theme") === "dark"); } catch {}`,
                    }}
                />
            </head>
            <body className={`${geist.variable} ${geistMono.variable}`}>
                {children}
            </body>
        </html>
    );
}
