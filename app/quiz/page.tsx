import type { Metadata } from "next";

import { QuizIcon } from "@/components/icons";
import { QUESTIONS_PER_ROUND } from "@/lib/quiz";

import QuizClient from "./quiz-client";

export const metadata: Metadata = {
  title: "Quiz",
  description:
    "Subject-wise practice quiz with instant feedback, scoring, and a result screen that feeds your progress report.",
};

export default function QuizPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-pk-700 dark:text-pk-300">
          <QuizIcon className="h-4 w-4" />
          Quiz
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Apna imtihan lein
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Subject chunein aur {QUESTIONS_PER_ROUND} sawal hal karein. Har jawab par
          turant feedback milega, aur aakhir mein score aur report banegi.
        </p>
      </div>

      <QuizClient />
    </main>
  );
}
