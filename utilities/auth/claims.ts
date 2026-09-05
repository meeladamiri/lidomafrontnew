import { getUserToken } from "utilities/cookies";

/**
 * Who the visitor is, known on the first render.
 *
 * The panel used to learn this over two round-trips: `checkUserStatus` had to
 * answer before `getAccountInfo` was even allowed to start, and until the
 * first of them landed `is_host` was `false`. So a host opening the site was
 * shown the guest version of the header, the side panel and the bottom bar,
 * which then rearranged themselves under their hands a moment later — the
 * «why did the page change after I logged in?» feeling, and the reason the
 * panel looked like it was redirecting when it was only re-rendering.
 *
 * The token already carries the answer. Reading it costs nothing, needs no
 * request, and is available synchronously — so the first paint is already the
 * right one. The requests still run and still win: if the account has since
 * become a host, `checkUserStatus` corrects this a moment later. This is a
 * starting value, not a source of truth, and it is never used to decide what
 * data anyone may see — the API settles that on every call.
 */
export interface TokenClaims {
  id: number | null;
  isHost: boolean;
}

function decodeSegment(segment: string): unknown {
  // Base64url → base64, then a UTF-8-safe decode: `atob` alone mangles any
  // non-ASCII byte, and these payloads can carry a Persian name.
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** Claims from the session cookie, or null when there is no usable token. */
export function readTokenClaims(): TokenClaims | null {
  if (typeof window === "undefined") return null;

  const token = getUserToken();
  if (!token) return null;

  try {
    const payload = decodeSegment(token.split(".")[1] ?? "") as {
      sub?: number;
      isHost?: boolean;
      exp?: number;
    };

    // An expired token still means "was signed in", and the client refreshes
    // on the next 401 — but claiming to know the role from it would be a
    // guess about a session that may already be gone.
    if (typeof payload?.exp === "number" && payload.exp * 1000 <= Date.now()) return null;

    return { id: payload?.sub ?? null, isHost: !!payload?.isHost };
  } catch {
    return null;
  }
}
