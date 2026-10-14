import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pre-Legal · Plantillas legales",
  description:
    "Catálogo de plantillas de documentos legales de Common Paper que Pre-Legal podrá adaptar para cada usuario.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <header className="border-b border-black/10 dark:border-white/15">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Pre-Legal
            </Link>
            <span className="text-sm text-foreground/60">
              Plantillas de documentos legales
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
          {children}
        </main>
        <footer className="border-t border-black/10 text-sm text-foreground/60 dark:border-white/15">
          <div className="mx-auto max-w-5xl px-4 py-6">
            Plantillas de{" "}
            <a
              href="https://github.com/CommonPaper"
              className="underline hover:text-foreground"
            >
              Common Paper
            </a>
            , publicadas bajo{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              className="underline hover:text-foreground"
            >
              CC BY 4.0
            </a>
            .
          </div>
        </footer>
      </body>
    </html>
  );
}
