"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BookIcon } from "@/components/icons";
import { NAV_LINKS, SITE_NAME } from "@/lib/site";

/** `/tutor` should stay lit on `/tutor?subject=…`; `/` must not match everything. */
function isActive(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Sticky site header.
 *
 * A Client Component only because the active nav item needs `usePathname` — the
 * current page has to be visually indicated, otherwise every link looks the same
 * and the student loses their place. Layout is one flex row that wraps: below
 * `md` the nav drops to its own full-width row of equal, 44px-tall targets.
 */
export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-2.5 sm:px-6 sm:py-3">
        <Link
          href="/"
          className="order-1 flex items-center gap-2.5 rounded-control py-1"
        >
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-pk-900 font-mono text-xs font-bold tracking-tight text-white shadow-clay"
          >
            IRP
          </span>
          <span className="text-sm font-semibold leading-tight sm:text-base">
            {SITE_NAME}
          </span>
        </Link>

        <Link
          href="/tutor"
          className="btn btn-primary order-2 hidden md:order-3 sm:inline-flex"
        >
          <BookIcon className="h-5 w-5" />
          Start Learning
        </Link>

        <nav
          aria-label="Main"
          className="order-3 -mx-1 w-full md:order-2 md:mx-0 md:w-auto"
        >
          {/*
            8px is the minimum gap between adjacent touch targets (WCAG 2.5.8 /
            platform guidance) — at gap-1 a thumb aiming for Quiz lands on Tutor.
          */}
          <ul className="grid grid-cols-4 gap-2 text-sm font-medium md:flex md:items-center">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center justify-center rounded-control px-2 text-center transition-colors duration-150 ease-clay md:px-3 ${
                      active
                        ? "bg-pk-50 font-semibold text-pk-900 dark:bg-pk-950 dark:text-pk-100"
                        : "text-muted hover:bg-pk-50 hover:text-pk-800 dark:hover:bg-pk-950 dark:hover:text-pk-200"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
