import type { Metadata } from "next";

import { CapIcon, SparkIcon } from "@/components/icons";
import { MAX_TOPIC_LENGTH, isSubject } from "@/lib/tutor";

import TutorClient from "./tutor-client";

export const metadata: Metadata = {
  title: "AI Tutor",
  description:
    "Type any topic and get a simple explanation, three practice MCQs, and a suggested next lesson.",
};

/** `searchParams` values are `string | string[]`; deep links only ever need the first. */
function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/**
 * Server Component so `?subject=` is read during render instead of via
 * `useSearchParams()`, which suspends and would cost a client-side round trip
 * before the form could be shown.
 */
export default async function TutorPage({ searchParams }: PageProps<"/tutor">) {
  const params = await searchParams;
  const subjectParam = firstValue(params.subject);
  const subject = isSubject(subjectParam) ? subjectParam : null;
  const topic = firstValue(params.topic).slice(0, MAX_TOPIC_LENGTH);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-pk-700 dark:text-pk-300">
          <SparkIcon className="h-4 w-4" />
          AI Tutor
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {subject ? `${subject} — koi bhi topic poochho` : "Koi bhi topic poochho"}
        </h1>
        <p className="mt-2.5 max-w-2xl leading-relaxed text-muted">
          Aap topic likhein, AI aap ko simple English aur Roman Urdu mein samjhayega —
          phir 3 practice questions aur agla lesson bhi dega.
        </p>
        {subject && (
          <p className="mt-3.5 inline-flex min-h-9 items-center gap-2 rounded-full border border-pk-200 bg-pk-50 px-3.5 py-1 text-sm font-medium text-pk-800 dark:border-pk-800 dark:bg-pk-950 dark:text-pk-200">
            <CapIcon className="h-4 w-4" />
            Subject: {subject}
          </p>
        )}
      </div>

      <TutorClient initialTopic={topic} initialSubject={subject} />
    </main>
  );
}
