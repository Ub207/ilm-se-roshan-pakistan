"use client";

import { CheckIcon, CrossIcon } from "@/components/icons";

export const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

type McqOptionProps = {
  /** Radio group name — unique per question on the page. */
  name: string;
  optionIndex: number;
  option: string;
  /** Index the student picked, or `undefined` while unanswered. */
  chosen: number | undefined;
  correctIndex: number;
  onSelect: () => void;
};

/**
 * One answer choice, shared by the AI tutor and the quiz so both read the same.
 *
 * Answering locks the question and reveals the correct row. Colour is never the
 * only signal: a check/cross icon and a text label carry it too, per WCAG 1.4.1.
 */
export function McqOption({
  name,
  optionIndex,
  option,
  chosen,
  correctIndex,
  onSelect,
}: McqOptionProps) {
  const answered = chosen !== undefined;
  const isChosen = chosen === optionIndex;
  const isCorrect = optionIndex === correctIndex;

  const tone = !answered
    ? "border-hairline hover:border-pk-400 hover:bg-pk-50 dark:hover:bg-pk-950"
    : isCorrect
      ? "border-pk-500 bg-pk-50 dark:bg-pk-950"
      : isChosen
        ? "border-red-400 bg-red-50 dark:border-red-800 dark:bg-red-950/60"
        : "border-hairline opacity-70";

  return (
    <label
      className={`flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors duration-200 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pk-600 ${answered ? "cursor-default" : "cursor-pointer"} ${tone}`}
    >
      <input
        type="radio"
        name={name}
        value={optionIndex}
        checked={isChosen}
        disabled={answered}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-current text-xs font-semibold"
      >
        {OPTION_LETTERS[optionIndex] ?? optionIndex + 1}
      </span>
      <span className="flex-1">{option}</span>
      {answered && isCorrect && (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wide text-pk-700 dark:text-pk-300">
          <CheckIcon className="h-4 w-4" />
          Correct
        </span>
      )}
      {answered && isChosen && !isCorrect && (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
          <CrossIcon className="h-4 w-4" />
          Your pick
        </span>
      )}
    </label>
  );
}
