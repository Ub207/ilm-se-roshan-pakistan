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
      <p className="mt-2 leading-relaxed text-muted">
        Link ghalat ho sakta hai. AI Tutor se koi topic poochein ya home par
        wapas jayein.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/tutor" className="btn btn-lg btn-primary">
          AI Tutor
          <ArrowRightIcon className="h-5 w-5" />
        </Link>
        <Link href="/" className="btn btn-lg btn-secondary">
          Home
        </Link>
      </div>
    </main>
  );
}
