import type { Metadata } from "next";

import { ChartIcon } from "@/components/icons";

import AssessmentClient from "./assessment-client";

export const metadata: Metadata = {
  title: "Progress Report",
  description:
    "Your quiz score, strong areas, weak areas, and the lesson to study next.",
};

export default function AssessmentPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <p className="eyebrow">
          <ChartIcon className="h-4 w-4" />
          Report
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Aap ki learning report
        </h1>
        <p className="mt-2.5 max-w-2xl leading-relaxed text-muted">
          Yeh report aap ke quiz attempts se banti hai — isi browser mein mehfooz
          rehti hai, kisi server par nahi jati.
        </p>
      </div>

      <AssessmentClient />
    </main>
  );
}
