"use client";

import Link from "next/link";
import { useEffect } from "react";

import { RetryIcon, WarningIcon } from "@/components/icons";

/**
 * Route-level error boundary. Catches render/data errors in any page so a single
 * bad response shows a recoverable screen instead of a blank document.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] route error", error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 text-center sm:px-6">
      <span className="medallion mx-auto h-12 w-12 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
        <WarningIcon className="h-6 w-6" />
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        Kuch gadbad ho gayi
      </h1>
      <p className="mt-2 leading-relaxed text-muted">
        Page load nahi ho saka. Dobara koshish karein — masla rahe to home se
        shuru karein.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs text-muted">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-lg btn-primary">
          <RetryIcon className="h-5 w-5" />
          Dobara koshish karein
        </button>
        <Link href="/" className="btn btn-lg btn-secondary">
          Home
        </Link>
      </div>
    </main>
  );
}
