import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: {
    default: "Ilm Se Roshan Pakistan — AI Learning Companion",
    template: "%s | Ilm Se Roshan Pakistan",
  },
  description:
    "AI tutor for Pakistani students. Any topic explained in simple English and Roman Urdu, with practice MCQs and a suggested next lesson.",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tutor", label: "AI Tutor" },
  { href: "/quiz", label: "Quiz" },
  { href: "/assessment", label: "Report" },
] as const;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-pk-900 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-hairline bg-surface/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5 rounded-lg">
              <span
                aria-hidden="true"
                className="grid h-9 w-9 place-items-center rounded-xl bg-pk-900 font-mono text-xs font-bold tracking-tight text-white"
              >
                IRP
              </span>
              <span className="text-sm font-semibold leading-tight sm:text-base">
                Ilm Se Roshan Pakistan
              </span>
            </Link>

            <nav aria-label="Main">
              <ul className="flex items-center gap-1 text-sm font-medium">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-lg px-2.5 py-1.5 text-muted transition-colors hover:bg-pk-50 hover:text-pk-800 sm:px-3 dark:hover:bg-pk-950 dark:hover:text-pk-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        <div id="main" className="flex-1">
          {children}
        </div>

        <footer className="border-t border-hairline">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-muted sm:px-6">
            <p className="font-medium text-foreground">
              Ilm Se Roshan Pakistan
            </p>
            <p>Har bacha, har topic, har waqt — AI ke saath seekho.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
