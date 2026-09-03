import Link from "next/link";

import { GithubIcon } from "@/components/icons";
import {
  GITHUB_URL,
  NAV_LINKS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_TAGLINE_UR,
} from "@/lib/site";
import { SUBJECTS } from "@/lib/tutor";

/** Home is reachable from the logo, so the footer lists the feature routes only. */
const FEATURE_LINKS = NAV_LINKS.filter((link) => link.href !== "/");

const linkClass =
  "inline-flex min-h-9 items-center rounded-lg text-muted transition-colors duration-200 hover:text-pk-800 dark:hover:text-pk-200";

/** Site footer. Server Component — no state, no hooks. */
export default function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pk-900 font-mono text-xs font-bold tracking-tight text-white shadow-clay"
              >
                IRP
              </span>
              <span className="font-semibold">{SITE_NAME}</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              {SITE_TAGLINE}. {SITE_TAGLINE_UR} Grades 5–10 ke liye — koi login
              nahi, koi fees nahi.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Seekhein</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {FEATURE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Subjects</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {SUBJECTS.map((subject) => (
                <li key={subject}>
                  <Link
                    href={`/tutor?subject=${encodeURIComponent(subject)}`}
                    className={linkClass}
                  >
                    {subject}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-hairline pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Aap ka progress isi browser mein mehfooz rehta hai — kisi server par
            nahi jata.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg font-medium transition-colors duration-200 hover:text-pk-800 dark:hover:text-pk-200"
          >
            <GithubIcon className="h-5 w-5" />
            Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
