import type { JSX, SVGProps } from "react";

import type { Subject } from "@/lib/tutor";

/**
 * Inline 24×24 outline icons, Heroicons-compatible paths.
 *
 * Kept local instead of pulling an icon package: the whole set is a few hundred
 * bytes and ships no runtime. Every icon is decorative by default (`aria-hidden`),
 * so pass `aria-hidden={false}` with an `aria-label` only when the icon is the
 * sole carrier of meaning.
 */
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
      {...props}
    >
      {children}
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 12.75l6 6 9-13.5" />
    </Icon>
  );
}

export function CrossIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 18L18 6M6 6l12 12" />
    </Icon>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </Icon>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
    </Icon>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </Icon>
  );
}

export function QuizIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </Icon>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </Icon>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
    </Icon>
  );
}

export function SignalIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
    </Icon>
  );
}

export function CapIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.26 10.147a60.44 60.44 0 00-.491 6.347A48.63 48.63 0 0112 20.904a48.63 48.63 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.9 59.9 0 0112 3.493a59.9 59.9 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.7 50.7 0 0112 13.489a50.7 50.7 0 017.74-3.342" />
    </Icon>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </Icon>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-4.5 0a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM12 12h.008v.008H12V12z" />
    </Icon>
  );
}

export function RetryIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Icon>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </Icon>
  );
}

export function CalculatorIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8.25 6h7.5v2.25h-7.5V6z" />
      <path d="M12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
      <path d="M8.25 11.5h.008M12 11.5h.008M15.75 11.5h.008M8.25 14.5h.008M12 14.5h.008M15.75 14.5h.008M8.25 17.5h.008M12 17.5h.008M15.75 17.5h.008" />
    </Icon>
  );
}

export function BeakerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396a24.3 24.3 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M5 14.5l.77-.193A9.065 9.065 0 0112 15c2.09 0 4.166-.24 6.23-.307L19.8 15.3m0 0 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.31 48.31 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5z" />
    </Icon>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8.625 9.75h6.75m-6.75 3h4.5m6.375-1.5c0 3.728-3.694 6.75-8.25 6.75a9.79 9.79 0 01-2.51-.322L4.5 20.25l.62-3.1A6.44 6.44 0 013 11.999c0-3.728 3.694-6.75 8.25-6.75s8.25 3.022 8.25 6.75z" />
    </Icon>
  );
}

export function PenIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </Icon>
  );
}

/** Crescent and star — the conventional, respectful mark for Islamiat. */
export function CrescentIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 15.25A8.25 8.25 0 019.5 4.06 8.75 8.75 0 1020 15.25z" />
      <path d="M18.5 4.5l.62 1.63L20.75 6.75l-1.63.62L18.5 9l-.62-1.63L16.25 6.75l1.63-.62L18.5 4.5z" />
    </Icon>
  );
}

/**
 * Loading indicator. The caller adds `animate-spin`; `prefers-reduced-motion`
 * stops it globally via the rule in globals.css, and the surrounding
 * `aria-busy` / `aria-live` region carries the state for screen readers.
 */
export function SpinnerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3a9 9 0 109 9" />
    </Icon>
  );
}

/** Brand mark — solid path, so fill and stroke are inverted from the outline set. */
export function GithubIcon(props: IconProps) {
  return (
    <Icon fill="currentColor" stroke="none" {...props}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </Icon>
  );
}

/**
 * One icon per subject, so a card is recognisable before its label is read.
 * Exported as a map rather than looked up at each call site: the home page, the
 * footer and the tutor all show subjects, and they must never disagree.
 */
export const SUBJECT_ICONS: Record<Subject, (props: IconProps) => JSX.Element> = {
  Mathematics: CalculatorIcon,
  Science: BeakerIcon,
  English: ChatIcon,
  Urdu: PenIcon,
  Islamiat: CrescentIcon,
};


