import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getHostCalendar,
  patchCalendar,
  type CalendarPatch,
  type HostCalendar,
} from "@/api/Residences/hostCalendar";
import { getResidencesList } from "@/api/Residences/getResidencesList";
import { ResidenceStates_enum } from "@/constants/enums/residence_states";
import InstantBookingToggle from "./InstantBookingToggle";
import MonthGrid from "./MonthGrid";
import RateDialog from "./RateDialog";
import {
  addJalaliMonths,
  buildMonths,
  currentJalaliMonth,
  faDigits,
  rangeBetween,
  windowFor,
} from "./model";

/**
 * «تقویم اقامتگاه».
 *
 * The screen a host comes back to. Three things it does that the previous one
 * did not:
 *
 *  - **One request per window.** The listing's base rates, the day overrides
 *    and the booked nights arrive together, because a single cell cannot be
 *    drawn without all three. Moving a month re-uses the same cache entry when
 *    the window has already been fetched.
 *  - **Booked nights are locked.** A booking and a host's own block both write
 *    `isBlocked`, so the old screen could not tell them apart and would let a
 *    host reopen a sold night. The booked ranges come back separately now and
 *    those cells cannot be selected at all.
 *  - **Edits apply immediately.** The grid updates from the patch and the
 *    request follows; a failure puts it back and says so, rather than leaving
 *    the host watching a spinner after every tap.
 */

const MONTHS_ON_SCREEN_DESKTOP = 2;

type Action = "block" | "open" | "fast-on" | "fast-off" | "clear";

export default function ResidenceCalendar() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ------------------------------------------------------------- listing ---

  const { data: residences, isLoading: listLoading } = useQuery({
    queryKey: ["hostResidencesForCalendar"],
    queryFn: async () => {
      const res = await getResidencesList();
      return res?.status === "success" ? res.params.residences ?? [] : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  /** Only published listings have a calendar worth managing. */
  const active = useMemo(
    () => (residences ?? []).filter((r: any) => r.state === ResidenceStates_enum.ACTIVE),
    [residences]
  );

  const routeId = Number(router.query?.residenceId);
  const residenceId = Number.isFinite(routeId) && routeId > 0 ? routeId : active[0]?.id;

  // Put the chosen listing in the URL, so the page can be refreshed and shared.
  useEffect(() => {
    if (!residenceId || Number(router.query?.residenceId) === residenceId) return;
    router.replace(
      { pathname: router.pathname, query: { ...router.query, residenceId: String(residenceId) } },
      undefined,
      { shallow: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceId]);

  // -------------------------------------------------------------- window ---

  const [cursor, setCursor] = useState(currentJalaliMonth);
  const [monthsShown, setMonthsShown] = useState(1);

  useEffect(() => {
    const apply = () => setMonthsShown(window.innerWidth >= 1024 ? MONTHS_ON_SCREEN_DESKTOP : 1);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const range = useMemo(
    () => windowFor(cursor.year, cursor.month, monthsShown),
    [cursor, monthsShown]
  );

  const queryKey = ["hostCalendar", residenceId, range.from, range.to] as const;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: () => getHostCalendar(residenceId as number, range.from, range.to),
    enabled: !!residenceId,
    // The only writer is this screen, and it patches the cache itself.
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  const months = useMemo(
    () => buildMonths(data, cursor.year, cursor.month, monthsShown),
    [data, cursor, monthsShown]
  );

  // ----------------------------------------------------------- selection ---

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const dragging = useRef(false);
  const anchor = useRef<string | null>(null);
  const baseline = useRef<Set<string>>(new Set());

  useEffect(() => {
    const stop = () => {
      dragging.current = false;
      anchor.current = null;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  // A fresh listing or a fresh month is a fresh selection; keeping dates the
  // host can no longer see is how a bulk edit hits the wrong nights.
  useEffect(() => setSelected(new Set()), [residenceId]);

  const onPointerDown = useCallback((iso: string) => {
    dragging.current = true;
    anchor.current = iso;
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(iso)) next.delete(iso);
      else next.add(iso);
      baseline.current = new Set(next);
      return next;
    });
  }, []);

  const onPointerEnter = useCallback((iso: string) => {
    if (!dragging.current || !anchor.current) return;
    // Rebuilt from the baseline each time so dragging back shrinks the range
    // instead of leaving a trail behind the finger.
    setSelected(() => {
      const next = new Set(baseline.current);
      rangeBetween(anchor.current as string, iso).forEach((d) => next.add(d));
      return next;
    });
  }, []);

  const dates = useMemo(() => [...selected].sort(), [selected]);

  // -------------------------------------------------------------- writes ---

  const [failed, setFailed] = useState<string | null>(null);
  const [showRates, setShowRates] = useState(false);

  const mutation = useMutation({
    mutationFn: (patch: CalendarPatch) => patchCalendar(residenceId as number, patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<HostCalendar>(queryKey);
      // Paint the change now. The server is authoritative, but it agrees
      // almost always, and waiting for it on every tap is what made the old
      // screen feel heavy.
      queryClient.setQueryData<HostCalendar>(queryKey, (current) =>
        current ? applyLocally(current, patch) : current
      );
      return { previous };
    },
    onError: (_err, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      setFailed("تغییر ذخیره نشد. دوباره تلاش کنید.");
    },
    onSuccess: () => {
      setFailed(null);
      // Re-read once, quietly: the server normalises (an override equal to the
      // listing's own setting is dropped), so the truth can differ from the
      // optimistic paint in ways worth reflecting.
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  function run(patch: Omit<CalendarPatch, "dates">) {
    if (dates.length === 0) return;
    mutation.mutate({ dates, ...patch });
  }

  function act(action: Action) {
    if (action === "block") return run({ isBlocked: true });
    if (action === "open") return run({ isBlocked: false });
    if (action === "fast-on") return run({ isFast: true });
    if (action === "fast-off") return run({ isFast: false });
    if (action === "clear") return run({ reset: true } as Omit<CalendarPatch, "dates">);
  }

  // ---------------------------------------------------------------- view ---

  if (listLoading) {
    return <div className="h-[420px] rounded-16 bg-gray-F3F5F7 animate-pulse" />;
  }

  if (active.length === 0) {
    return (
      <div className="py-48 text-center">
        <i className="icon-Calendar text-40 text-gray-A9B1BC" />
        <p className="text-15 font-b text-black mt-16">هنوز اقامتگاه فعالی ندارید</p>
        <p className="text-13 leading-24 font-l text-gray-77828F mt-6 mb-20">
          تقویم پس از تایید اولین اقامتگاه شما در دسترس قرار می‌گیرد.
        </p>
        <Link
          href="/residences/list"
          className="inline-flex h-[44px] px-24 rounded-12 bg-primary-main text-14 font-b text-black items-center"
        >
          اقامتگاه‌های من
        </Link>
      </div>
    );
  }

  const basePrice = data?.residence?.weekPrice ?? null;

  return (
    <div className="pb-[120px] md:pb-24">
      <div className="flex items-center justify-between gap-x-12 mb-16">
        <h1 className="text-18 md:text-22 leading-32 font-b text-black">تقویم اقامتگاه</h1>
        {isFetching && !isLoading && (
          <span className="text-11 font-l text-gray-77828F">در حال به‌روزرسانی…</span>
        )}
      </div>

      {active.length > 1 && (
        <select
          value={String(residenceId ?? "")}
          onChange={(e) =>
            router.replace(
              { pathname: router.pathname, query: { residenceId: e.target.value } },
              undefined,
              { shallow: true }
            )
          }
          aria-label="انتخاب اقامتگاه"
          className="w-full h-[52px] px-16 mb-16 rounded-12 bg-white border border-gray-DBDFE5 text-14 font-m text-black outline-none appearance-none cursor-pointer focus:border-primary-main"
        >
          {active.map((r: any) => (
            <option key={r.id} value={String(r.id)}>
              {r.name}
            </option>
          ))}
        </select>
      )}

      {residenceId && <InstantBookingToggle residenceId={residenceId} />}

      {failed && (
        <div className="flex items-center justify-between gap-x-12 rounded-12 border border-error-light bg-red-light/50 p-12 mb-16">
          <span className="text-13 font-m text-black">{failed}</span>
          <button
            type="button"
            onClick={() => setFailed(null)}
            className="text-12 font-m text-gray-77828F underline shrink-0"
          >
            بستن
          </button>
        </div>
      )}

      {error ? (
        <div className="py-40 text-center">
          <p className="text-14 font-m text-black">تقویم بارگذاری نشد.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-12">
            <button
              type="button"
              onClick={() => setCursor((c) => addJalaliMonths(c.year, c.month, -1))}
              aria-label="ماه قبل"
              className="w-40 h-40 rounded-full border border-gray-DBDFE5 grid place-items-center text-black hover:border-primary-main transition-colors"
            >
              <i className="icon-FlashRight text-18" />
            </button>
            <button
              type="button"
              onClick={() => setCursor(currentJalaliMonth())}
              className="text-12 font-m text-gray-77828F underline"
            >
              ماه جاری
            </button>
            <button
              type="button"
              onClick={() => setCursor((c) => addJalaliMonths(c.year, c.month, 1))}
              aria-label="ماه بعد"
              className="w-40 h-40 rounded-full border border-gray-DBDFE5 grid place-items-center text-black hover:border-primary-main transition-colors"
            >
              <i className="icon-FlashLeft text-18" />
            </button>
          </div>

          {isLoading ? (
            <div className="h-[380px] rounded-16 bg-gray-F3F5F7 animate-pulse" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-24">
              {months.map((month) => (
                <MonthGrid
                  key={`${month.year}-${month.month}`}
                  month={month}
                  selected={selected}
                  onPointerDown={onPointerDown}
                  onPointerEnter={onPointerEnter}
                />
              ))}
            </div>
          )}

          <ul className="flex flex-wrap items-center gap-x-16 gap-y-6 mt-20 text-11 font-l text-gray-77828F">
            <li className="flex items-center gap-x-6">
              <span className="w-12 h-12 rounded-4 border border-gray-E9ECF0 bg-white" />
              باز
            </li>
            <li className="flex items-center gap-x-6">
              <span className="w-12 h-12 rounded-4 bg-gray-F3F5F7 border border-gray-E9ECF0" />
              بسته
            </li>
            <li className="flex items-center gap-x-6">
              <span className="w-12 h-12 rounded-4 bg-blue-light" />
              رزرو شده
            </li>
            <li className="flex items-center gap-x-6">
              <span className="w-8 h-8 rounded-full bg-error-light" />
              تخفیف
            </li>
            <li className="flex items-center gap-x-6">
              <span className="w-8 h-8 rounded-full bg-warning" />
              رزرو آنی متفاوت
            </li>
          </ul>
        </>
      )}

      {/* The action bar only exists when there is something to act on. */}
      {dates.length > 0 && (
        <div className="fixed md:sticky bottom-0 md:bottom-4 right-0 left-0 z-4 bg-white border-t md:border border-gray-E9ECF0 md:rounded-16 md:shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-16 md:px-16 py-12 pb-[max(12px,env(safe-area-inset-bottom))] md:pb-12 mt-16">
          <div className="flex items-center justify-between mb-10">
            <span className="text-13 font-b text-black">
              {faDigits(dates.length)} روز انتخاب شده
            </span>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-12 font-m text-gray-77828F underline"
            >
              لغو انتخاب
            </button>
          </div>

          <div className="flex flex-wrap gap-8">
            <Action label="بستن روزها" icon="icon-Block" onClick={() => act("block")} busy={mutation.isLoading} />
            <Action label="باز کردن" icon="icon-Tick" onClick={() => act("open")} busy={mutation.isLoading} />
            <Action label="تغییر نرخ" icon="icon-Pay" onClick={() => setShowRates(true)} busy={mutation.isLoading} primary />
            <Action label="رزرو آنی" icon="icon-Flash" onClick={() => act("fast-on")} busy={mutation.isLoading} />
            <Action label="بدون رزرو آنی" icon="icon-Timer" onClick={() => act("fast-off")} busy={mutation.isLoading} />
            <Action label="پاک کردن تنظیمات" icon="icon-Refresh" onClick={() => act("clear")} busy={mutation.isLoading} />
          </div>
        </div>
      )}

      {showRates && (
        <RateDialog
          count={dates.length}
          basePrice={basePrice}
          busy={mutation.isLoading}
          onClose={() => setShowRates(false)}
          onApply={(patch) => {
            run(patch);
            // Straight back to the calendar, selection intact.
            setShowRates(false);
          }}
        />
      )}
    </div>
  );
}

function Action({
  label,
  icon,
  onClick,
  busy,
  primary,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  busy: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`h-[38px] px-12 rounded-10 text-12 font-m flex items-center gap-x-6 transition-colors disabled:opacity-50 ${
        primary
          ? "bg-primary-main text-black"
          : "border border-gray-DBDFE5 text-black hover:border-primary-main"
      }`}
    >
      <i className={`${icon} text-14`} />
      {label}
    </button>
  );
}

/**
 * The optimistic paint.
 *
 * Mirrors what the server will do, including the part that matters most: an
 * override equal to the listing's own instant-book setting is not an override,
 * so it is removed rather than stored.
 */
function applyLocally(current: HostCalendar, patch: CalendarPatch): HostCalendar {
  const touched = new Set(patch.dates);
  const kept = current.days.filter((day) => !touched.has(String(day.date).slice(0, 10)));

  if (patch.reset) return { ...current, days: kept };

  const previousByDate = new Map(
    current.days.map((day) => [String(day.date).slice(0, 10), day])
  );

  const written = patch.dates.map((date) => {
    const before = previousByDate.get(date);
    const isFast =
      patch.isFast === undefined
        ? (before?.isFast ?? null)
        : patch.isFast === current.residence?.isFast
          ? null
          : patch.isFast;

    return {
      id: before?.id ?? -1,
      date,
      isBlocked: patch.isBlocked ?? before?.isBlocked ?? false,
      isFast,
      isPeak: before?.isPeak ?? false,
      specialPrice: patch.specialPrice ?? before?.specialPrice ?? null,
      discountAmount: patch.discountAmount ?? before?.discountAmount ?? null,
      discountType: patch.discountType ?? before?.discountType ?? null,
    };
  });

  // A day left saying nothing is not kept, exactly as the server does it.
  const meaningful = written.filter(
    (day) =>
      day.isBlocked ||
      day.isFast !== null ||
      day.isPeak ||
      day.specialPrice !== null ||
      day.discountAmount !== null
  );

  return { ...current, days: [...kept, ...meaningful] };
}
