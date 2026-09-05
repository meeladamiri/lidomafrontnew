import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import MainLoader from "components/General/Loader/MainLoader";

/**
 * What the app shows while it is busy.
 *
 * It used to be a dimming overlay across the whole screen, raised by two
 * things:
 *
 *   - **every route change**, so tapping any link gave a blank dimmed screen
 *     and a spinner before the next page — the reason moving around the panel
 *     felt like a website reloading rather than an app responding; and
 *   - **every mutation anywhere** (`useIsMutating`), so saving a profile
 *     field, liking a listing or sending a chat message locked the entire
 *     interface until the request came back, however small it was.
 *
 * Neither needs the whole screen. Navigation now shows a thin progress bar at
 * the top — visible immediately, blocking nothing, and the page underneath
 * stays usable and stable. Mutations show their feedback where the action
 * was: the button that was pressed, the row that is saving, the toast that
 * follows. `isShowing` is still honoured for the few screens that deliberately
 * ask for a blocking loader.
 */

/** Below this, a flash of progress bar is more distracting than no bar. */
const SHOW_AFTER_MS = 120;

const Loader = ({ isShowing = false }: { isShowing?: boolean }) => {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const start = useCallback((_url: string, options?: { shallow?: boolean }) => {
    // A shallow change is the same page rewriting its own query string — a
    // wizard step, a selected chat, a tab. Announcing those as navigation is
    // what made in-page controls feel like page loads.
    if (options?.shallow) return;
    setNavigating(true);
  }, []);

  const end = useCallback((_url?: string, options?: { shallow?: boolean }) => {
    if (options?.shallow) return;
    setNavigating(false);
  }, []);

  useEffect(() => {
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", end);
    router.events.on("routeChangeError", end);

    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", end);
      // The old cleanup passed a fresh arrow function here, which matches
      // nothing, so this listener was never removed and stacked up one copy
      // per mount.
      router.events.off("routeChangeError", end);
    };
  }, [router, start, end]);

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!navigating) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [navigating]);

  return (
    <>
      <div
        aria-hidden={!visible}
        className={`fixed top-0 right-0 left-0 z-[1000] h-2 pointer-events-none transition-opacity duration-150 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="h-full w-full origin-right bg-primary-main animate-routeProgress" />
      </div>

      {/* Kept for the screens that ask for a blocking loader on purpose. */}
      <MainLoader isLoading={isShowing} />
    </>
  );
};

export default Loader;
