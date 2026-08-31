import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";
import CancelReservationModal from "@/components/Admin/CancelReservationModal";
import ReservationStatePanel, { StateFlow } from "@/components/Admin/ReservationStatePanel";
import ActivityTimeline from "@/components/Admin/ActivityTimeline";
import ReservationActions from "@/components/Admin/ReservationActions";
import ReservationCalendarPanel from "@/components/Admin/ReservationCalendarPanel";
import {
  Badge,
  Button,
  Card,
  Input,
  Skeleton,
  StatTile,
  Stars,
  type Tone,
  adminImageUrl,
  faDate,
  faDateTime,
  faMoney,
  faNum,
} from "@/components/Admin/ui";

/**
 * صفحه‌ی جزئیات رزرو.
 *
 * The layout follows the order the questions are actually asked. An agent
 * opens this page with a phone already ringing, and in that order needs: which
 * booking is this and where has it got to; who do I talk to; what does the
 * money look like; then, only sometimes, everything else.
 *
 * So the page is three bands rather than two columns of cards:
 *
 *   1. Identity — code, state, and the path drawn once at the top.
 *   2. Four figures, because "how much" is asked on nearly every call and
 *      reading it out of a twelve-row table takes too long.
 *   3. A wide main column for what is read (parties, listing, calendar,
 *      history) and a narrow rail for what is *done* (the full breakdown,
 *      the deadline, the state, the send buttons).
 *
 * The previous version put the breakdown, the state panel, the calendar, the
 * timeline and every action into the narrow column and left the wide one to
 * static text. The timeline — the longest content on the page — had about a
 * third of the width available to it.
 */

interface Review {
  id: number;
  cleaning: number;
  location: number;
  quality: number;
  integrity: number;
  greeting: number;
  delivery: number;
  averageRating: number;
  comment: string;
  hostAnswer: string | null;
  createdAt: string;
}

type State = "DRAFT" | "HOST_APPROVAL" | "SECOND_PAYMENT" | "DONE" | "CANCEL" | "EXPIRED";

interface ReservationDetail {
  id: number;
  reference: string;
  state: State;
  startDate: string;
  endDate: string;
  expiryDate: string | null;
  daysCount: number;
  guestsCount: number;
  extraGuestsCount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  hostShare: number | null;
  websiteShare: number | null;
  vatAmount: number | null;
  guestCommission: number | null;
  settledAmount: number;
  commissionPercent: number | null;
  vatPercent: number | null;
  guestCommissionPercent: number | null;
  voucherCode: string | null;
  cancelledBy: "HOST_CANCELLED" | "LIDOMA_CANCELLED" | "GUEST_CANCELLED" | null;
  cancelReason: string | null;
  cancelDesc: string | null;
  guestNameOverride: string | null;
  guestPhoneOverride: string | null;
  createdAt: string;
  updatedAt: string;
  guest: { id: number; name: string | null; phone: string; avatarUrl: string | null };
  host: { id: number; name: string | null; phone: string; avatarUrl: string | null };
  residence: {
    id: number;
    name: string;
    reference: string;
    type: "BOOMGARDI" | "SUIT";
    address: string | null;
    neighborhood: string | null;
    latitude: number | null;
    longitude: number | null;
    capacity: number | null;
    maxCapacity: number | null;
    averageRating: number;
    reviewsCount: number;
    minReservableDays: number | null;
    checkinFrom: string | null;
    checkinTo: string | null;
    checkout: string | null;
    beforeStartTime: number | null;
    fullReturnTime: number | null;
    hostShareTotalAmount: number | null;
    hostSharePastNights: number | null;
    hostShareFutureNights: number | null;
    city: { name: string; province: { name: string } | null } | null;
    images: { url: string }[];
    rules: { rule: { name: string } }[];
  };
  rooms: { room: { id: number; name: string; image: string | null } }[];
  review: Review | null;
}

const STATE_LABELS: Record<string, string> = {
  DRAFT: "در انتظار ثبت درخواست",
  HOST_APPROVAL: "در انتظار تایید میزبان",
  SECOND_PAYMENT: "در انتظار پرداخت نهایی",
  DONE: "تکمیل شده",
  CANCEL: "لغو شده",
  EXPIRED: "منقضی شده",
};

const STATE_TONE: Record<string, Tone> = {
  DRAFT: "gray",
  HOST_APPROVAL: "yellow",
  SECOND_PAYMENT: "yellow",
  DONE: "green",
  CANCEL: "red",
  EXPIRED: "gray",
};

/** A 4px band across the card top — the state, readable before any text is. */
const STATE_ACCENT: Record<string, string> = {
  DRAFT: "bg-gray-C4CAD3",
  HOST_APPROVAL: "bg-[#FFB74D]",
  SECOND_PAYMENT: "bg-[#FFB74D]",
  DONE: "bg-[#03D6BB]",
  CANCEL: "bg-[#E53935]",
  EXPIRED: "bg-gray-C4CAD3",
};

const CANCELLED_BY_LABELS: Record<string, string> = {
  HOST_CANCELLED: "میزبان",
  LIDOMA_CANCELLED: "پشتیبانی لیدوما",
  GUEST_CANCELLED: "مهمان",
};

const TYPE_LABELS: Record<string, string> = { BOOMGARDI: "بوم‌گردی", SUIT: "سوئیت" };

/** Clears the sticky top bar, so the panel's heading is not hidden under it. */
const HEADER_OFFSET = 72;

/**
 * Bring a panel into view after opening it from the header.
 *
 * Not `scrollIntoView({ behavior: "smooth" })`: that is ignored outright in
 * some browsers and by anyone with reduced motion on, and a button that
 * sometimes fails to move the page is worse than one that always jumps. The
 * scroll waits a frame because opening a panel changes its height first.
 */
function reveal(elementId: string) {
  requestAnimationFrame(() => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: Math.max(top, 0) });
  });
}

export default function AdminReservationDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const [showCancel, setShowCancel] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data, mutate, isLoading } = useSWR(
    id ? `/api/admin/reservations/${id}` : null,
    (path: string) => apiFetch<ReservationDetail>(path)
  );

  const canCancel = !!data && data.state !== "CANCEL" && data.state !== "EXPIRED";
  const hostRemainder = data ? (data.hostShare ?? 0) - data.settledAmount : 0;

  return (
    <AdminLayout
      title={data?.reference ?? "جزئیات رزرو"}
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link> / <Link href="/admin/reservations">رزروها</Link>
        </>
      }
      actions={
        data && (
          <>
            {/* The three things done most often, in front of the reader
                instead of three cards down the narrow column. */}
            <Button
              onClick={() => {
                setCallOpen(true);
                reveal("activity");
              }}
            >
              <i className="icon-Call text-16" /> ثبت تماس
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setCalendarOpen(true);
                reveal("calendar");
              }}
            >
              <i className="icon-CalendarFlash text-16" /> تقویم و نرخ
            </Button>
            <a href={`/admin/reservations/${data.id}/invoice`} target="_blank" rel="noreferrer">
              <Button variant="secondary">
                <i className="icon-Printer text-16" /> چاپ فاکتور
              </Button>
            </a>
            {canCancel && (
              <Button variant="danger" onClick={() => setShowCancel(true)}>
                لغو رزرو
              </Button>
            )}
          </>
        )
      }
    >
      {isLoading && (
        <div className="flex flex-col gap-16">
          <Skeleton className="h-[132px]" />
          <Skeleton className="h-[104px]" />
          <Skeleton className="h-[420px]" />
        </div>
      )}

      {data && (
        <>
          <CancelReservationModal
            reservationId={data.id}
            reference={data.reference}
            open={showCancel}
            onClose={() => setShowCancel(false)}
            onCancelled={() => mutate()}
          />

          <div className="flex flex-col gap-y-16">
            {/* ── ۱. هویت رزرو ─────────────────────────────────────── */}
            <Card className="overflow-hidden">
              <div className={`h-4 ${STATE_ACCENT[data.state] ?? "bg-gray-C4CAD3"}`} />
              <div className="p-20">
                <div className="flex items-start justify-between gap-x-24 flex-wrap gap-y-12 mb-16">
                  <div className="flex items-center gap-x-10 flex-wrap gap-y-8 min-w-0">
                    <h2 className="text-20 leading-28 font-m text-black tracking-wide">
                      {data.reference}
                    </h2>
                    <CopyButton text={data.reference} />
                    <Badge tone={STATE_TONE[data.state] ?? "gray"}>
                      {STATE_LABELS[data.state] ?? data.state}
                    </Badge>
                    {data.state === "CANCEL" && data.cancelledBy && (
                      <Badge tone="red">لغو توسط {CANCELLED_BY_LABELS[data.cancelledBy]}</Badge>
                    )}
                    {data.voucherCode && <Badge tone="purple">کد تخفیف {data.voucherCode}</Badge>}
                  </div>

                  {/* Pushed to the far end rather than tucked under the code:
                      it is metadata, and on a wide card the alternative is a
                      third of the header sitting empty. */}
                  <div className="text-left shrink-0">
                    <Stamp label="ثبت" value={data.createdAt} />
                    <Stamp label="آخرین تغییر" value={data.updatedAt} />
                  </div>
                </div>

                <StateFlow current={data.state} />
              </div>
            </Card>

            {/* ── ۲. چهار عددی که در تماس پرسیده می‌شود ──────────────── */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-16">
              <StatTile
                tone="blue"
                label="مبلغ کل اجاره"
                value={faMoney(data.totalAmount)}
                hint={`${faNum(data.daysCount)} شب`}
                icon={<i className="icon-Cash text-18" />}
              />
              <StatTile
                tone={data.remainingAmount > 0 ? "orange" : "green"}
                label="پرداختی مهمان"
                value={faMoney(data.paidAmount)}
                hint={
                  data.remainingAmount > 0
                    ? `${faMoney(data.remainingAmount)} باقی‌مانده`
                    : "تسویه‌ی کامل"
                }
                icon={<i className="icon-CardMenu text-18" />}
              />
              {/* A figure that was never recorded says so. Bookings migrated
                  from Odoo have no site share at all, and "۰ تومان" there
                  reads as "we took nothing" instead of "nobody wrote it
                  down" — the difference between a fee waiver and a gap. */}
              <StatTile
                tone="purple"
                label="سهم سایت"
                value={data.websiteShare == null ? "ثبت نشده" : faMoney(data.websiteShare)}
                hint={
                  data.commissionPercent != null
                    ? `${faNum(data.commissionPercent)}٪ کارمزد میزبان`
                    : undefined
                }
                icon={<i className="icon-Amaar text-18" />}
              />
              <StatTile
                tone={hostRemainder > 0 ? "red" : "teal"}
                label="مانده سهم میزبان"
                value={data.hostShare == null ? "ثبت نشده" : faMoney(hostRemainder)}
                hint={
                  data.hostShare == null
                    ? `واریزشده ${faMoney(data.settledAmount)}`
                    : `از ${faMoney(data.hostShare)} · واریزشده ${faMoney(data.settledAmount)}`
                }
                icon={<i className="icon-Homes text-18" />}
              />
            </section>

            {/* ── ۳. ستون خواندن و ستون انجام‌دادن ────────────────────── */}
            <div className="grid lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-8 flex flex-col gap-y-16 min-w-0">
                <StayCard data={data} />
                <PartiesCard data={data} />
                <ResidenceCard data={data} />

                {data.state === "CANCEL" && (
                  <Card className="p-20 border-r-4 border-r-[#E53935]">
                    <h3 className="text-16 leading-24 font-m text-black mb-10">اطلاعات لغو</h3>
                    <div className="grid md:grid-cols-2 gap-x-24 gap-y-8">
                      <Fact
                        label="لغوکننده"
                        value={(data.cancelledBy && CANCELLED_BY_LABELS[data.cancelledBy]) ?? "—"}
                      />
                      <Fact label="دلیل" value={data.cancelReason || "—"} />
                    </div>
                    {data.cancelDesc && (
                      <p className="mt-12 rounded-10 bg-gray-F7F7F7 p-12 text-13 leading-22 text-gray-6C6A7D whitespace-pre-wrap">
                        {data.cancelDesc}
                      </p>
                    )}
                  </Card>
                )}

                {data.review && <ReviewCard review={data.review} />}

                <div id="calendar">
                  <ReservationCalendarPanel
                    reservationId={data.id}
                    reference={data.reference}
                    residenceId={data.residence.id}
                    startDate={data.startDate}
                    endDate={data.endDate}
                    open={calendarOpen}
                    onOpenChange={setCalendarOpen}
                    onRepriced={() => mutate()}
                  />
                </div>

                {/* The timeline is the longest thing on the page and now has
                    the width to be read without every entry wrapping. */}
                <div id="activity">
                  <ActivityTimeline
                    reservationId={data.id}
                    callOpen={callOpen}
                    onCallOpenChange={setCallOpen}
                  />
                </div>
              </div>

              <aside className="lg:col-span-4 flex flex-col gap-y-16 min-w-0">
                <MoneyCard data={data} />

                {(data.state === "HOST_APPROVAL" || data.state === "SECOND_PAYMENT") && (
                  <ExpiryCard
                    id={data.id}
                    state={data.state}
                    expiryDate={data.expiryDate}
                    onChanged={() => mutate()}
                  />
                )}

                <ReservationStatePanel
                  reservationId={data.id}
                  showFlow={false}
                  onChanged={() => mutate()}
                />

                <ReservationActions
                  reservationId={data.id}
                  residenceId={data.residence.id}
                  showViewActions={false}
                  canCancel={false}
                  onCancel={() => setShowCancel(true)}
                  onActed={() => mutate()}
                />
              </aside>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

/* ────────────────────────── اجزای صفحه ────────────────────────── */

/** A timestamp in the hero: label, date, clock — one line, aligned to the end. */
function Stamp({ label, value }: { label: string; value: string }) {
  const [d, t] = faDateTime(value);
  return (
    <p className="text-12 leading-20 text-gray-9B9BAA whitespace-nowrap">
      {label} <span className="text-gray-6C6A7D">{d}</span> ساعت{" "}
      <span className="text-gray-6C6A7D">{t}</span>
    </p>
  );
}

/** One labelled value. Used wherever a card is a list of facts, not a form. */
function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-x-12 py-4 border-b border-gray-F0F0F0 last:border-0">
      <span className="text-12 leading-20 text-gray-9B9BAA shrink-0">{label}</span>
      <span className="text-13 leading-20 text-black text-left min-w-0 break-words">{value}</span>
    </div>
  );
}

/**
 * Copying the code is the single most repeated action on this page — it gets
 * read into a phone, pasted into the gateway, searched in the old panel.
 */
function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(
          () => {
            setDone(true);
            setTimeout(() => setDone(false), 1400);
          },
          () => undefined
        );
      }}
      className={`px-8 py-4 rounded-8 text-11 leading-18 border transition ${
        done
          ? "border-[#03D6BB] text-[#015046] bg-[#03D6BB14]"
          : "border-gray-E5E5E6 text-gray-9B9BAA hover:border-gray-C4CAD3"
      }`}
    >
      {done ? "کپی شد" : "کپی"}
    </button>
  );
}

/**
 * ورود، خروج، شب، مهمان — four boxes rather than two sentences.
 *
 * These are compared against something the caller is holding (a message, a
 * voucher), and a sentence has to be read to be compared while a box does not.
 */
function StayCard({ data }: { data: ReservationDetail }) {
  const r = data.residence;

  const cells = [
    {
      label: "تاریخ ورود",
      value: faDate(data.startDate),
      hint: r.checkinFrom ? `از ساعت ${r.checkinFrom}` : null,
    },
    {
      label: "تاریخ خروج",
      value: faDate(data.endDate),
      hint: r.checkout ? `تا ساعت ${r.checkout}` : null,
    },
    {
      label: "مدت اقامت",
      value: `${faNum(data.daysCount)} شب`,
      hint: r.minReservableDays ? `حداقل ${faNum(r.minReservableDays)} شب` : null,
    },
    {
      label: "مهمانان",
      value: `${faNum(data.guestsCount)} نفر`,
      hint:
        data.extraGuestsCount > 0
          ? `${faNum(data.extraGuestsCount)} نفر اضافه`
          : r.capacity
            ? `ظرفیت ${faNum(r.capacity)}`
            : null,
    },
  ];

  return (
    <Card className="p-20">
      <h3 className="text-16 leading-24 font-m text-black mb-12">اقامت</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
        {cells.map((c) => (
          <div key={c.label} className="rounded-12 border border-gray-E5E5E6 p-12">
            <span className="block text-11 leading-18 text-gray-9B9BAA mb-4">{c.label}</span>
            <strong className="block text-15 leading-24 font-m text-black">{c.value}</strong>
            {c.hint && (
              <span className="block text-11 leading-18 text-gray-9B9BAA mt-2">{c.hint}</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/** مهمان و میزبان side by side — the two people this call is about. */
function PartiesCard({ data }: { data: ReservationDetail }) {
  return (
    <Card className="p-20">
      <h3 className="text-16 leading-24 font-m text-black mb-12">طرفین رزرو</h3>
      <div className="grid md:grid-cols-2 gap-12">
        <Party
          role="مهمان"
          tone="blue"
          userId={data.guest.id}
          name={data.guest.name}
          avatarUrl={data.guest.avatarUrl}
          phone={data.guestPhoneOverride || data.guest.phone}
          note={data.guestNameOverride ? `رزرو برای شخص دیگر: ${data.guestNameOverride}` : null}
        />
        <Party
          role="میزبان"
          tone="green"
          userId={data.host.id}
          name={data.host.name}
          avatarUrl={data.host.avatarUrl}
          phone={data.host.phone}
          note={
            data.commissionPercent != null
              ? `کارمزد این رزرو ${faNum(data.commissionPercent)}٪`
              : null
          }
        />
      </div>
    </Card>
  );
}

function Party({
  role,
  tone,
  userId,
  name,
  avatarUrl,
  phone,
  note,
}: {
  role: string;
  tone: Tone;
  userId: number;
  name: string | null;
  avatarUrl: string | null;
  phone: string;
  note: string | null;
}) {
  return (
    <div className="rounded-12 border border-gray-E5E5E6 p-14">
      <Badge tone={tone} className="mb-10">
        {role}
      </Badge>
      <div className="flex items-center gap-x-12">
        <span className="w-44 h-44 rounded-12 bg-gray-F0F0F0 overflow-hidden shrink-0 flex items-center justify-center text-16 text-gray-6C6A7D">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={adminImageUrl(avatarUrl, 96)} alt="" className="w-full h-full object-cover" />
          ) : (
            (name?.[0] ?? "؟")
          )}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={`/admin/users/${userId}`}
            className="block text-14 leading-22 font-m text-black hover:text-primary-main truncate"
          >
            {name || "بدون نام"}
          </Link>
          {/* A phone number that is a link is a phone number that gets dialled
              instead of copied by hand and mistyped. */}
          <a
            href={`tel:${phone}`}
            dir="ltr"
            className="block text-13 leading-20 text-gray-6C6A7D hover:text-primary-main text-right"
          >
            {phone}
          </a>
        </div>
        <CopyButton text={phone} />
      </div>
      {note && <p className="mt-10 text-11 leading-18 text-gray-9B9BAA">{note}</p>}
    </div>
  );
}

function ResidenceCard({ data }: { data: ReservationDetail }) {
  const r = data.residence;
  const place = [r.city?.name, r.city?.province?.name, r.neighborhood].filter(Boolean).join(" · ");

  return (
    <Card className="p-20">
      <h3 className="text-16 leading-24 font-m text-black mb-12">اقامتگاه</h3>
      <div className="flex gap-x-14 flex-wrap gap-y-12">
        {r.images[0]?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={adminImageUrl(r.images[0].url, 320)}
            alt=""
            className="w-[132px] h-[99px] rounded-12 object-cover shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-x-8 flex-wrap gap-y-6">
            <Link
              href={`/admin/residences/${r.id}`}
              className="text-15 leading-24 font-m text-black hover:text-primary-main"
            >
              {r.name}
            </Link>
            <Badge tone="gray">{TYPE_LABELS[r.type] ?? r.type}</Badge>
            <span className="text-12 text-gray-9B9BAA">کد {r.reference}</span>
          </div>
          <p className="text-12 leading-20 text-gray-6C6A7D mt-4">{place || "—"}</p>
          {r.address && <p className="text-12 leading-20 text-gray-9B9BAA mt-2">{r.address}</p>}
          <div className="mt-8">
            <Stars value={r.averageRating} count={r.reviewsCount} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-x-24 mt-14">
        <Fact
          label="ظرفیت"
          value={`${faNum(r.capacity)} نفر${r.maxCapacity ? ` (حداکثر ${faNum(r.maxCapacity)})` : ""}`}
        />
        <Fact label="ورود" value={`${r.checkinFrom ?? "—"} تا ${r.checkinTo ?? "—"}`} />
        <Fact label="خروج" value={r.checkout ?? "—"} />
        <Fact
          label="حداقل اقامت"
          value={r.minReservableDays ? `${faNum(r.minReservableDays)} شب` : "—"}
        />
      </div>

      {r.rules.length > 0 && (
        <p className="mt-12 text-12 leading-20 text-gray-9B9BAA">
          قوانین: {r.rules.map((x) => x.rule.name).join("، ")}
        </p>
      )}

      {data.rooms.length > 0 && (
        <div className="mt-12">
          <p className="text-12 leading-20 text-gray-6C6A7D mb-8">اتاق‌های رزروشده</p>
          <div className="flex flex-wrap gap-8">
            {data.rooms.map((x) => (
              <span
                key={x.room.id}
                className="inline-flex items-center gap-x-8 rounded-10 border border-gray-E5E5E6 py-4 pr-4 pl-10"
              >
                {x.room.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={adminImageUrl(x.room.image, 96)}
                    alt=""
                    className="w-28 h-28 rounded-8 object-cover"
                  />
                )}
                <span className="text-12 leading-20 text-black">{x.room.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * صورتحساب.
 *
 * Grouped by whose money it is — what the guest pays, what the site keeps,
 * what the host is owed — because that is the question being answered, and a
 * flat list of eight rows makes the reader group them mentally every time.
 *
 * Percentages are the ones this booking was made under, not today's; they are
 * stored on the reservation for exactly that reason.
 */
function MoneyCard({ data }: { data: ReservationDetail }) {
  const remainder = (data.hostShare ?? 0) - data.settledAmount;

  return (
    <Card className="p-20">
      <h3 className="text-16 leading-24 font-m text-black mb-12">صورتحساب</h3>

      <MoneyGroup title="مهمان">
        <MoneyRow label="مبلغ کل اجاره" value={data.totalAmount} strong />
        <MoneyRow
          label="کارمزد مهمان وبسایت"
          hint={
            data.guestCommissionPercent != null
              ? `${faNum(data.guestCommissionPercent)}٪، افزوده به پرداختی`
              : undefined
          }
          value={data.guestCommission}
        />
        <MoneyRow label="جمع پرداختی مهمان" value={data.paidAmount} />
        {data.remainingAmount > 0 && (
          <MoneyRow label="باقی‌مانده پرداخت" value={data.remainingAmount} tone="red" strong />
        )}
      </MoneyGroup>

      <MoneyGroup title="سایت">
        <MoneyRow
          label="کارمزد میزبان وبسایت"
          hint={
            data.commissionPercent != null ? `${faNum(data.commissionPercent)}٪ از اجاره` : undefined
          }
          value={data.websiteShare}
          negative
        />
        <MoneyRow
          label="ارزش افزوده"
          hint={data.vatPercent != null ? `${faNum(data.vatPercent)}٪ از کارمزد` : undefined}
          value={data.vatAmount}
          negative
        />
      </MoneyGroup>

      <MoneyGroup title="میزبان" last>
        <MoneyRow label="سهم میزبان بابت کل رزرو" value={data.hostShare} strong />
        <MoneyRow label="واریز شده" value={data.settledAmount} />
        <MoneyRow
          label="مانده سهم میزبان"
          value={remainder}
          strong
          tone={remainder > 0 ? "red" : "green"}
        />
      </MoneyGroup>

      {(data.residence.hostShareTotalAmount != null ||
        data.residence.hostSharePastNights != null ||
        data.residence.hostShareFutureNights != null) && (
        <p className="mt-12 text-11 leading-18 text-gray-9B9BAA">
          سیاست تسویه‌ی اقامتگاه: کل {data.residence.hostShareTotalAmount ?? "—"}٪ · شب‌های گذشته{" "}
          {data.residence.hostSharePastNights ?? "—"}٪ · شب‌های آینده{" "}
          {data.residence.hostShareFutureNights ?? "—"}٪
        </p>
      )}
    </Card>
  );
}

function MoneyGroup({
  title,
  last,
  children,
}: {
  title: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={last ? "" : "mb-12 pb-12 border-b border-gray-F0F0F0"}>
      <p className="text-11 leading-18 text-gray-9B9BAA mb-6">{title}</p>
      {children}
    </div>
  );
}

/**
 * One line of the breakdown.
 *
 * A missing figure prints "ثبت نشده" rather than zero. Bookings migrated from
 * Odoo have no guest fee at all, and a zero there would read as "we charged
 * nothing" instead of "nobody recorded it".
 */
function MoneyRow({
  label,
  value,
  hint,
  strong,
  negative,
  tone,
}: {
  label: string;
  value: number | null;
  hint?: string;
  strong?: boolean;
  negative?: boolean;
  tone?: "red" | "green";
}) {
  const color =
    tone === "red"
      ? "text-[#C62828]"
      : tone === "green"
        ? "text-[#2E7D32]"
        : strong
          ? "text-black"
          : "text-gray-6C6A7D";

  return (
    <div className="flex items-baseline justify-between gap-x-12 py-3">
      <span className="text-12 leading-20 text-gray-6C6A7D min-w-0">
        {label}
        {hint && <span className="text-11 text-gray-9B9BAA"> · {hint}</span>}
      </span>
      <span className={`text-13 leading-20 whitespace-nowrap ${color} ${strong ? "font-m" : ""}`}>
        {value == null ? (
          <span className="text-gray-9B9BAA">ثبت نشده</span>
        ) : (
          <>
            {/* Written-out sign: on an RTL line a leading "−" lands where
                nobody is looking for it. */}
            {negative && value > 0 ? "− " : ""}
            {faMoney(Math.abs(value))}
          </>
        )}
      </span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const scores = [
    { label: "نظافت", score: review.cleaning },
    { label: "موقعیت مکانی", score: review.location },
    { label: "کیفیت نسبت به نرخ", score: review.quality },
    { label: "صحت مطالب", score: review.integrity },
    { label: "برخورد میزبان", score: review.greeting },
    { label: "نحوه تحویل", score: review.delivery },
  ];

  return (
    <Card className="p-20">
      <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 mb-10">
        <h3 className="text-16 leading-24 font-m text-black">نظر مهمان</h3>
        <Stars value={review.averageRating} />
      </div>
      <p className="text-13 leading-22 text-black whitespace-pre-wrap">{review.comment}</p>

      <div className="grid md:grid-cols-2 gap-x-24 mt-12">
        {scores.map((s) => (
          <Fact key={s.label} label={s.label} value={`${faNum(s.score)} از ۵`} />
        ))}
      </div>

      {review.hostAnswer && (
        <div className="mt-12 rounded-10 bg-gray-F7F7F7 p-12">
          <p className="text-11 leading-18 text-gray-9B9BAA mb-4">پاسخ میزبان</p>
          <p className="text-13 leading-22 text-black whitespace-pre-wrap">{review.hostAnswer}</p>
        </div>
      )}
    </Card>
  );
}

/**
 * مهلت این رزرو.
 *
 * The site-wide window sets the deadline when a booking is made; this moves it
 * for one booking. Support needs it for the case the whole feature exists
 * for — a host who has just called to say they are on their way, or a guest
 * whose bank transfer is stuck — and the alternative today is watching the
 * booking expire and taking a new one.
 *
 * Two ways to say the same thing, because those are the two ways people ask:
 * a quick "another hour", or an exact time.
 */
function ExpiryCard({
  id,
  state,
  expiryDate,
  onChanged,
}: {
  id: number;
  state: "HOST_APPROVAL" | "SECOND_PAYMENT";
  expiryDate: string | null;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exact, setExact] = useState("");

  const left = expiryDate ? Math.round((new Date(expiryDate).getTime() - Date.now()) / 60000) : null;
  const overdue = left != null && left <= 0;

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/reservations/${id}/expiry`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setExact("");
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تغییر مهلت انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-20">
      <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 mb-10">
        <h3 className="text-16 leading-24 font-m text-black">
          مهلت {state === "HOST_APPROVAL" ? "تایید میزبان" : "پرداخت مهمان"}
        </h3>
        {expiryDate && (
          <Badge tone={overdue ? "red" : "yellow"}>
            {overdue ? "گذشته" : `${faNum(left!)} دقیقه`}
          </Badge>
        )}
      </div>

      {expiryDate ? (
        <p className="text-13 leading-22 text-black mb-12">
          {faDate(expiryDate)} ساعت {faDateTime(expiryDate)[1]}
          {overdue && (
            <span className="block text-11 leading-18 text-[#C62828] mt-2">
              در اجرای بعدی زمان‌بند منقضی می‌شود.
            </span>
          )}
        </p>
      ) : (
        <p className="text-12 leading-20 text-gray-9B9BAA mb-12">
          {/* Every booking made before deadlines existed has none, and without
              one the sweep leaves it alone — so it waits forever rather than
              expiring silently. */}
          مهلتی ثبت نشده — این رزرو خودبه‌خود منقضی نمی‌شود.
        </p>
      )}

      <div className="flex flex-wrap gap-8 mb-10">
        {[30, 60, 120, 720].map((m) => (
          <button
            key={m}
            type="button"
            disabled={busy}
            onClick={() => send({ minutesFromNow: m })}
            className="px-12 py-8 rounded-10 text-13 leading-20 border border-gray-E5E5E6 text-gray-6C6A7D hover:border-gray-C4CAD3 transition disabled:opacity-50"
          >
            {m < 60 ? `${faNum(m)} دقیقه` : `${faNum(m / 60)} ساعت`}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-x-8">
        <Input
          type="datetime-local"
          value={exact}
          onChange={(e) => setExact(e.target.value)}
          className="flex-1 min-w-0"
        />
        <Button
          variant="secondary"
          disabled={busy || !exact}
          onClick={() => send({ expiryDate: new Date(exact).toISOString() })}
        >
          ثبت
        </Button>
      </div>

      {!!error && <p className="mt-8 text-13 text-[#C62828]">{error}</p>}
    </Card>
  );
}
