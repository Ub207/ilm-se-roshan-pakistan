import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 text-center sm:px-6">
      <p className="font-mono text-sm font-semibold text-pk-700 dark:text-pk-300">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        Yeh page nahi mila
      </h1>
      <p className="mt-2 text-muted">
        Link ghalat ho sakta hai. AI Tutor se koi topic poochhein ya home par
        wapas jayein.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/tutor"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-pk-900 px-5 py-2.5 font-semibold text-white shadow-clay transition-all duration-200 hover:bg-pk-800 hover:shadow-clay-lg active:translate-y-px"
        >
          AI Tutor
          <ArrowRightIcon className="h-5 w-5" />
        </Link>
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
