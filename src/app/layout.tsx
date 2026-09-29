import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
    title: "bTagScript — Playground",
    description: "A workspace for writing, testing, and exploring TagScript.",
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
            <body>{children}</body>
        </html>
    );
}
