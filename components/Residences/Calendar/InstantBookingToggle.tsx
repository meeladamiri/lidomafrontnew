import { useEffect, useState } from "react";
import client from "@/api/index";

/**
 * «رزرو آنی» — one switch, on the listing.
 *
 * This replaces a four-screen flow: a preview sheet on the listing card, a
 * page with a residence picker, a date calendar, an all-or-selected choice and
 * a confirmation sheet — 744 lines to set one boolean. Worse, choosing a range
 * wrote a `calendar_days` row per night to store a flag identical to the one
 * the listing already carried: 671 such rows exist today.
 *
 * A listing either takes instant bookings or it does not. A single date can
 * still differ — that is set on the calendar below, and stored only when it
 * genuinely differs from this switch.
 */
export default function InstantBookingToggle({ residenceId }: { residenceId: number }) {
  const [isFast, setIsFast] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setIsFast(null);
    setError(null);
    client
      .get(`/api/host/residences/${residenceId}`)
      .then((res) => {
        if (alive) setIsFast(!!res.data?.data?.isFast);
      })
      .catch(() => {
        if (alive) setError("وضعیت رزرو آنی خوانده نشد");
      });
    return () => {
      alive = false;
    };
  }, [residenceId]);

  async function toggle() {
    if (isFast === null || saving) return;
    const next = !isFast;
    // Optimistic: the switch is the feedback, and a switch that waits for the
    // network before moving reads as broken.
    setIsFast(next);
    setSaving(true);
    setError(null);
    try {
      await client.patch(`/api/host/residences/${residenceId}`, { isFast: next });
    } catch {
      setIsFast(!next);
      setError("ذخیره نشد. دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  }

  if (isFast === null && !error) {
    return <div className="h-[72px] rounded-12 bg-gray-F3F5F7 animate-pulse mb-16" />;
  }

  return (
    <div
      className={`flex items-center gap-x-12 rounded-12 border p-14 mb-16 transition-colors ${
        isFast ? "border-primary-main bg-primary-light/30" : "border-gray-DBDFE5 bg-white"
      }`}
    >
      <i className={`icon-Flash text-24 ${isFast ? "text-primary-dark" : "text-gray-A9B1BC"}`} />

      <div className="grow">
        <p className="text-14 leading-24 font-m text-black">رزرو آنی</p>
        <p className="text-12 leading-20 font-l text-gray-77828F mt-2">
          {isFast
            ? "رزروها بدون تایید شما قطعی می‌شوند."
            : "هر رزرو منتظر تایید شما می‌ماند."}
        </p>
        {error && (
          <p role="alert" className="text-12 font-m text-error-light mt-4">
            {error}
          </p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={!!isFast}
        aria-label="رزرو آنی"
        onClick={toggle}
        disabled={saving}
        className={`relative w-[52px] h-[30px] shrink-0 rounded-full transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:ring-offset-2 ${
          isFast ? "bg-primary-main" : "bg-gray-DBDFE5"
        }`}
      >
        <span
          className={`absolute top-3 w-24 h-24 rounded-full bg-white shadow transition-all ${
            isFast ? "right-3" : "right-[25px]"
          }`}
        />
      </button>
    </div>
  );
}
