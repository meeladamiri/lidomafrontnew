import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * اطلاعیه‌ها on the dashboard.
 *
 * Banners only — the modal-style ones are handled by the dialog the page
 * already had. They sit at the top, above the tiles, because a notice below
 * the fold is a notice nobody reads.
 *
 * ## Dismissal is per browser, and that is the honest limit
 *
 * Closing one hides it in this browser (localStorage), not for the account.
 * There is no "read" flag on the server, so a person who dismisses on their
 * phone will see it again on their laptop. That is a smaller wrong than the
 * alternatives: never letting it be dismissed, or claiming a per-account
 * state that does not exist.
 *
 * Every read and write is wrapped — a browser with site data blocked throws on
 * access, and an announcement bar must not be the thing that breaks a page.
 */

interface Announcement {
  id: number;
  title: string;
  body: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  style: "BANNER" | "MODAL";
}

const KEY = "lidoma_dismissed_announcements";

function readDismissed(): number[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function remember(id: number) {
  try {
    const next = [...new Set([...readDismissed(), id])].slice(-50);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Dismissal not persisting is a worse experience, not a broken one.
  }
}

export default function Announcements({ items }: { items?: Announcement[] }) {
  const [dismissed, setDismissed] = useState<number[]>(() =>
    typeof window === "undefined" ? [] : readDismissed()
  );

  const banners = (items ?? []).filter(
    (a) => a.style === "BANNER" && !dismissed.includes(a.id)
  );

  if (!banners.length) return null;

  function dismiss(id: number) {
    remember(id);
    setDismissed((d) => [...d, id]);
  }

  return (
    <div className="flex flex-col gap-y-10 mb-16">
      {banners.map((a) => (
        <div
          key={a.id}
          className="relative rounded-12 bg-primary-light border-1 border-solid border-primary-main/20 overflow-hidden"
        >
          <button
            type="button"
            onClick={() => dismiss(a.id)}
            aria-label="بستن اطلاعیه"
            className="absolute top-8 left-8 z-1 w-28 h-28 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"
          >
            <i className="icon-Plus text-16 text-black rotate-45" />
          </button>

          <div className="flex items-stretch gap-x-12">
            {!!a.imageUrl && (
              <div className="relative w-96 shrink-0 hidden sm:block md:block">
                <Image src={a.imageUrl} alt="" fill sizes="96px" style={{ objectFit: "cover" }} />
              </div>
            )}

            <div className="p-14 pl-40 min-w-0 flex-1">
              <p className="text-15 leading-24 font-m text-black">{a.title}</p>
              {!!a.body && (
                <p className="text-13 leading-22 text-gray-6C6A7D mt-4 whitespace-pre-line">
                  {a.body}
                </p>
              )}
              {!!a.linkUrl && (
                <Link
                  href={a.linkUrl}
                  className="inline-block mt-10 rounded-8 bg-primary-main text-white text-13 leading-22 px-14 py-6"
                >
                  {a.linkLabel || "مشاهده"}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
