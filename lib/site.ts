/**
 * Site-wide chrome constants, shared by the header, the footer, and metadata.
 *
 * Safe to import from Server or Client Components: values only, no secrets.
 */

export const SITE_NAME = "Ilm Se Roshan Pakistan";

/** One-line positioning statement. Also the hero headline on the home page. */
export const SITE_TAGLINE =
  "AI-Powered Learning for Every Student in Pakistan";

export const SITE_TAGLINE_UR = "Har bacha, har topic, har waqt.";

export const GITHUB_URL = "https://github.com/Ub207/ilm-se-roshan-pakistan";

/** Primary navigation, in the order a new student should meet the app. */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tutor", label: "AI Tutor" },
  { href: "/quiz", label: "Quiz" },
  { href: "/assessment", label: "Report" },
] as const;
