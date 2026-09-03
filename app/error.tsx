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
      <WarningIcon className="mx-auto h-10 w-10 text-amber-600 dark:text-amber-400" />
      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        Kuch gadbad ho gayi
      </h1>
      <p className="mt-2 text-muted">
        Page load nahi ho saka. Dobara koshish karein — masla rahe to home se
        shuru karein.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs text-muted">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-pk-900 px-5 py-2.5 font-semibold text-white shadow-clay transition-all duration-200 hover:bg-pk-800 hover:shadow-clay-lg active:translate-y-px"
        >
          <RetryIcon className="h-5 w-5" />
          Dobara koshish karein
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl border border-hairline bg-surface px-5 py-2.5 font-semibold transition-colors duration-200 hover:border-pk-400"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
