import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * اطلاعیه‌ها on the dashboard — banners inline, popups over the page.
 *
 * ## How often somebody sees one
 *
 * `maxViews` is the whole model: null shows it every time, 1 shows it once,
 * n shows it n times. The count is kept per browser in localStorage, which is
 * the honest limit — there is no per-account read state on the server, so
 * somebody who sees it on their phone will see it again on their laptop.
 * Claiming otherwise would be a promise the data cannot keep.
 *
 * A view is counted once per mount, not once per render, or a page that
 * re-renders three times burns a three-view budget in one visit.
 *
 * ## Why the popup is a different component and not a styled banner
 *
 * It takes the screen. That means it also has to give it back: Escape closes
 * it, the backdrop closes it, and it counts as seen the moment it opens — so
 * a "once" popup that somebody closes without reading does not come back to
 * ambush them on the next page load.
 *
 * Every localStorage access is wrapped. A browser with site data blocked
 * throws on access, and a notice bar must never be the thing that breaks the
 * dashboard.
 */

export interface Announcement {
  id: number;
  title: string;
  body: string | null;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  style: "BANNER" | "MODAL";
  maxViews: number | null;
  backgroundColor: string | null;
  textColor: string | null;
  titleBold: boolean;
  dashedBorder: boolean;
}

const SEEN_KEY = "lidoma_announcement_views";
const DISMISSED_KEY = "lidoma_dismissed_announcements";

function readMap(key: string): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function bump(key: string, id: number, by = 1) {
  try {
    const map = readMap(key);
    map[id] = (map[id] ?? 0) + by;
    window.localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // Not persisting is a worse experience, not a broken one.
  }
}

function readDismissed(): number[] {
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function remember(id: number) {
  try {
    const next = [...new Set([...readDismissed(), id])].slice(-50);
    window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  } catch {
    /* see above */
  }
}

/** Has this browser already used up this notice's view budget? */
function exhausted(a: Announcement, views: Record<string, number>) {
  if (a.maxViews == null) return false;
  return (views[a.id] ?? 0) >= a.maxViews;
}

export default function Announcements({ items }: { items?: Announcement[] }) {
  // Read once on mount. Reading during render would make the list change
  // under React as the counters are written.
  const [ready, setReady] = useState(false);
  const [views, setViews] = useState<Record<string, number>>({});
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [popupClosed, setPopupClosed] = useState<number[]>([]);

  useEffect(() => {
    setViews(readMap(SEEN_KEY));
    setDismissed(readDismissed());
    setReady(true);
  }, []);

  const eligible = (items ?? []).filter(
    (a) => !dismissed.includes(a.id) && !exhausted(a, views)
  );
  const banners = eligible.filter((a) => a.style === "BANNER");
  const popup = eligible.find((a) => a.style === "MODAL" && !popupClosed.includes(a.id));

  // One view per notice per mount — not per render, or a page that re-renders
  // three times would spend a three-view budget on a single visit.
  useEffect(() => {
    if (!ready) return;
    for (const a of eligible) {
      if (a.maxViews != null) bump(SEEN_KEY, a.id);
    }
    // Deliberately keyed on the ids, so navigating back later counts again but
    // a re-render does not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, eligible.map((a) => a.id).join(",")]);

  // Escape closes the popup, like every other dialog on the site.
  useEffect(() => {
    if (!popup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopupClosed((c) => [...c, popup.id]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popup]);

  if (!ready) return null;

  function dismiss(id: number) {
    remember(id);
    setDismissed((d) => [...d, id]);
  }

  return (
    <>
      {banners.length > 0 && (
        <div className="flex flex-col gap-y-10 mb-16">
          {banners.map((a) => (
            <Card key={a.id} a={a} onDismiss={() => dismiss(a.id)} />
          ))}
        </div>
      )}

      {!!popup && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-16"
          onClick={() => setPopupClosed((c) => [...c, popup.id])}
        >
          <div
            className="w-full max-w-[440px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card a={popup} onDismiss={() => setPopupClosed((c) => [...c, popup.id])} />
          </div>
        </div>
      )}
    </>
  );
}

function Card({ a, onDismiss }: { a: Announcement; onDismiss: () => void }) {
  const bg = a.backgroundColor || undefined;
  const fg = a.textColor || undefined;

  return (
    <div
      className={`relative rounded-12 overflow-hidden border-1 border-solid ${
        a.dashedBorder ? "!border-dashed" : ""
      } ${bg ? "" : "bg-primary-light"} border-gray-CACFD3`}
      style={{ backgroundColor: bg, borderStyle: a.dashedBorder ? "dashed" : undefined }}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="بستن اطلاعیه"
        className="absolute top-8 left-8 z-1 w-28 h-28 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"
      >
        <i className="icon-Plus text-16 text-black rotate-45" />
      </button>

      {/* Two images, one per shape of screen. A wide banner is unreadable on a
          phone; whichever is missing falls back to the other. */}
      {!!(a.imageUrl || a.imageUrlMobile) && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.imageUrlMobile || a.imageUrl || ""}
            alt=""
            className="w-full max-h-[180px] object-cover md:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.imageUrl || a.imageUrlMobile || ""}
            alt=""
            className="w-full max-h-[200px] object-cover hidden md:block"
          />
        </>
      )}

      <div className="p-14 pl-40">
        <p
          className={`text-16 leading-26 ${a.titleBold ? "font-b" : "font-r"} text-black`}
          style={{ color: fg }}
        >
          {a.title}
        </p>
        {!!a.body && (
          <p
            className="text-13 leading-22 text-gray-6C6A7D mt-4 whitespace-pre-line"
            style={{ color: fg }}
          >
            {a.body}
          </p>
        )}
        {!!a.linkUrl && (
          <Link
            href={a.linkUrl}
            className="inline-block mt-12 rounded-8 bg-primary-main text-white text-13 leading-22 px-16 py-8"
          >
            {a.linkLabel || "مشاهده"}
          </Link>
        )}
      </div>
    </div>
  );
}
