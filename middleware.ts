import { NextResponse, type NextRequest } from "next/server";

/**
 * Who may open a panel page — decided before anything renders.
 *
 * Until now nothing decided it. Every `getServerSideProps` guard in the
 * project was commented out and there was no middleware, so opening
 * `/dashboard` while signed out rendered the whole shell, fired its requests,
 * collected 401s and left a logged-out person sitting in a broken panel. The
 * only thing that ever redirected anyone was a handful of duplicated
 * client-side branches that ran after the page had already painted.
 *
 * Doing it here instead means:
 *   - no flash of a panel the person cannot use;
 *   - the URL they wanted is preserved and returned to after login;
 *   - one rule, in one file, instead of a guard per page that can be
 *     forgotten (as all four of them were).
 *
 * Deliberately authentication only, not authorisation by role. The API scopes
 * every host query by the caller's own id, so a guest who reaches a host page
 * sees an empty list rather than someone else's data — a bad experience, not
 * a leak, and one better fixed by not offering the link than by a redirect
 * that would lock people out if this list were ever wrong. Role is handled in
 * the navigation instead.
 */

/** Panel routes: signed-in only. Prefix match, so `/chats/42` is covered by
 * `/chats`. Anything not listed stays public — the safe default, since a
 * missing entry only means the old behaviour, while a wrong one would block a
 * public page. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/my-trips",
  "/favourites",
  "/notifications",
  "/chats",
  "/comments",
  "/wallet",
  "/deposit",
  "/factor",
  "/submit-review",
  "/reservations",
  "/residences",
  "/general-pricing",
  "/statistics",
  "/change-residences-status",
  "/b-room",
];

/** Set by `utilities/cookies.ts` on login. */
const TOKEN_COOKIE = "session_id";
const REFRESH_COOKIE = "refresh_token";

/**
 * Whether the access token has already expired.
 *
 * The signature is not checked and does not need to be: this decides which
 * page to render, never what data to hand over — the API verifies every
 * request for itself. Reading `exp` is what makes «session expired» send
 * someone to login instead of into a panel that 401s on arrival.
 *
 * A token that cannot be parsed is treated as expired: something is wrong
 * with it either way, and login is the recoverable outcome.
 */
function isExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = JSON.parse(json)?.exp;
    if (typeof exp !== "number") return false;
    return exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  // An expired access token is not necessarily a dead session: the refresh
  // token outlives it by a fortnight and the client swaps it on the next 401.
  // Bouncing those people to login would sign them out every two weeks for no
  // reason, so they are let through and the client refreshes as it always has.
  const signedOut = !token || (isExpired(token) && !request.cookies.get(REFRESH_COOKIE));
  if (!signedOut) return NextResponse.next();

  const login = request.nextUrl.clone();
  login.pathname = "/auth/enter_phone";
  login.search = "";
  // Same shape the old (commented-out) SSR guard used, so the login screens
  // that already read `redirectTo` need no change.
  login.searchParams.set("redirectTo", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  /** Skip Next's own assets and any API route — matching them would put this
   * check in front of every image and chunk for no benefit. */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|assets/|images/).*)"],
};
