import type { Metadata } from "next";
import { Geist, Geist_Mono, Lexend } from "next/font/google";
import "./globals.css";

import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Display face for headings. Lexend was designed to raise reading proficiency,
 * which suits an audience of grade 5-10 students reading English as a second
 * language. Applied to h1-h4 in globals.css, not per-component.
 */
const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — AI Learning Companion`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "AI tutor for Pakistani students. Any topic explained in simple English and Roman Urdu, with practice MCQs and a suggested next lesson.",
  applicationName: SITE_NAME,
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Any topic explained in simple English and Roman Urdu, with practice MCQs, quizzes, and a progress report. Free, no login.",
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-pk-900 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <SiteHeader />

        <div id="main" className="flex-1">
          {children}
        </div>

        <SiteFooter />
      </body>
    </html>
  );
}

