/**
 * Where a person goes after authenticating — decided in one place.
 *
 * This used to live inline in four components (OTP, EnterPassword,
 * SignupForm, ForgetPassword) and the four had drifted: two sent hosts to
 * «/dashboard» and guests to the public homepage, one sent everyone to the
 * homepage, and one did something else again. So where you landed depended on
 * which door you came through, which is not a thing a person can learn.
 *
 * Two rules now:
 *
 *   1. If they were going somewhere, take them there. Anything else throws
 *      away the reason they logged in.
 *   2. Otherwise the panel — for everyone. «/dashboard» serves guests as well
 *      as hosts (it says so in its own page title comment), and the panel
 *      already adapts to the role, so there is nothing for a role branch to
 *      decide here.
 *
 * Logging in from a modal is deliberately not a navigation at all: someone
 * picking dates on a listing who signs in mid-booking must stay on that
 * listing. The old code moved hosts away and left guests in place.
 */

/** The panel's front door, for both hosts and guests. */
export const PANEL_HOME = "/dashboard";

/**
 * A `redirectTo` is a URL taken straight from the query string, so it is
 * attacker-supplied: `?redirectTo=https://evil.example` would have been handed
 * to `router.push` as-is, which navigates off-site — a textbook open redirect,
 * and a convincing one because it happens right after a real login.
 *
 * Only a path on this site is allowed through. `//evil.example` is rejected
 * too: browsers read a protocol-relative URL as another origin.
 */
export function safeInternalPath(value: unknown): string | null {
  if (typeof value !== "string" || value === "") return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  // A backslash is treated as a slash by some browsers when resolving a URL,
  // so `/\evil.example` can escape the origin the same way `//` does.
  if (value.startsWith("/\\")) return null;
  return value;
}

/** Where to send someone once they are authenticated. */
export function postLoginDestination(redirectTo: unknown): string {
  return safeInternalPath(redirectTo) ?? PANEL_HOME;
}

/** The login URL for someone who tried to reach `intendedPath` first. */
export function loginUrlFor(intendedPath: string): string {
  const safe = safeInternalPath(intendedPath);
  return safe ? `/auth/enter_phone?redirectTo=${encodeURIComponent(safe)}` : "/auth/enter_phone";
}
