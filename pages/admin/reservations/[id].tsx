import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";
import CancelReservationModal from "@/components/Admin/CancelReservationModal";
import ReservationStatusBar from "@/components/Admin/ReservationStatusBar";
import ReservationActions from "@/components/Admin/ReservationActions";
import CallAndNotePanel from "@/components/Admin/CallAndNotePanel";
import PricingWorkspace from "@/components/Admin/PricingWorkspace";
import PaymentsPanel from "@/components/Admin/PaymentsPanel";
import EditTermsModal from "@/components/Admin/EditTermsModal";
import EditStayModal from "@/components/Admin/EditStayModal";
import { jalaliLong } from "@/components/Admin/JalaliDate";
import {
  Badge,
  Button,
  Card,
  Modal,
  Skeleton,
  Stars,
  type Tone,
  adminImageUrl,
  faDateTime,
  faMoney,
  faNum,
} from "@/components/Admin/ui";

/**
 * صفحه‌ی جزئیات رزرو.
 *
 * Three columns across the top, in the order a booking gets talked about:
 * who and where (right), how much (middle), and the decision that is waiting
 * (left). Underneath, the one box an agent actually types into all day —
 * calls and notes — and then the panels that are opened occasionally.
 *
 * The decision column is narrow on purpose. It holds two buttons and a clock,
 * and it is the only part of the page that changes what happens next, so it
 * is the only part that never shares space with something else.
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

interface PartyProfile {
  id: number;
  nationalCode: string | null;
  nationalCardUrl: string | null;
  verificationStatus: "NOT_CONFIRMED" | "CHECKING" | "CONFIRMED";
  isSpecialHost: boolean;
  isHost: boolean;
  createdAt: string;
  location: { name: string } | null;
  walletBalance: number;
  walletBlocked: number;
  hostRating?: number;
  hostReviewsCount?: number;
  residencesCount?: number;
}

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
  guestProfile: PartyProfile | null;
  hostProfile: PartyProfile | null;
  residence: {
    id: number;
    /** کد اقامتگاه — what the panel URL uses. Not the same as `id`. */
    publicId: number;
    name: string;
    reference: string;
    type: "BOOMGARDI" | "SUIT";
    address: string | null;
    neighborhood: string | null;
    capacity: number | null;
    maxCapacity: number | null;
    averageRating: number;
    reviewsCount: number;
    minReservableDays: number | null;
    checkinFrom: string | null;
    checkinTo: string | null;
    checkout: string | null;
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

const CANCELLED_BY_LABELS: Record<string, string> = {
  HOST_CANCELLED: "میزبان",
  LIDOMA_CANCELLED: "پشتیبانی لیدوما",
  GUEST_CANCELLED: "مهمان",
};

const TYPE_LABELS: Record<string, string> = { BOOMGARDI: "بوم‌گردی", SUIT: "سوئیت" };

const VERIFICATION_LABELS: Record<string, string> = {
  CONFIRMED: "کارت ملی — تایید شده",
  CHECKING: "کارت ملی — در حال بررسی",
  NOT_CONFIRMED: "ثبت نشده",
};

/**
 * The forward step each state offers, and what to call it on a green button.
 * `null` means there is no decision waiting and the column shows the state
 * instead of pretending there is something to press.
 */
const DECISION: Partial<Record<State, { to: State; approve: string; reject: string; deadline: string }>> = {
  DRAFT: { to: "HOST_APPROVAL", approve: "ارسال به میزبان", reject: "رد درخواست", deadline: "مهلت ثبت درخواست" },
  HOST_APPROVAL: { to: "SECOND_PAYMENT", approve: "تایید درخواست", reject: "رد درخواست", deadline: "مهلت تایید یا رد" },
  SECOND_PAYMENT: { to: "DONE", approve: "ثبت پرداخت مهمان", reject: "لغو رزرو", deadline: "مهلت پرداخت مهمان" },
};

export default function AdminReservationDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const [showCancel, setShowCancel] = useState(false);
  const [showReprice, setShowReprice] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showStay, setShowStay] = useState(false);
  /** Bumped whenever something writes to the log, so the list refetches. */
  const [logVersion, setLogVersion] = useState(0);

  const { data, mutate, isLoading } = useSWR(
    id ? `/api/admin/reservations/${id}` : null,
    (path: string) => apiFetch<ReservationDetail>(path)
  );

  const canCancel = !!data && data.state !== "CANCEL" && data.state !== "EXPIRED";

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
            <Button
              className="bg-[#2E7D32] text-white hover:opacity-90"
              onClick={() => reveal("payments")}
            >
              <i className="icon-Cash text-16" /> ثبت پرداخت
            </Button>
            <Button
              className="bg-[#1B4F9C] text-white hover:opacity-90"
              onClick={() => reveal("activity")}
            >
              <i className="icon-PhoneFill text-16" /> تماس و یادداشت
            </Button>
            <Button variant="secondary" onClick={() => setShowReprice(true)}>
              <i className="icon-CalendarFlash text-16" /> تقویم و نرخ
            </Button>
            <a href={`/admin/reservations/${data.id}/invoice`} target="_blank" rel="noreferrer">
              <Button variant="secondary">
                <i className="icon-Details text-16" /> چاپ فاکتور
              </Button>
            </a>
            <ReservationActions
              reservationId={data.id}
              onActed={() => setLogVersion((v) => v + 1)}
            />
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
          <Skeleton className="h-[64px]" />
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
          <PricingWorkspace
            open={showReprice}
            onClose={() => setShowReprice(false)}
            reservationId={data.id}
            reference={data.reference}
            residenceId={data.residence.id}
            startDate={data.startDate}
            endDate={data.endDate}
            onSaved={() => {
              mutate();
              setLogVersion((v) => v + 1);
            }}
          />

          <EditTermsModal
            open={showTerms}
            onClose={() => setShowTerms(false)}
            reservationId={data.id}
            terms={{
              totalAmount: data.totalAmount,
              websiteShare: data.websiteShare,
              vatAmount: data.vatAmount,
              guestCommission: data.guestCommission,
              hostShare: data.hostShare,
            }}
            onSaved={() => {
              mutate();
              setLogVersion((v) => v + 1);
            }}
          />

          <EditStayModal
            open={showStay}
            onClose={() => setShowStay(false)}
            reservationId={data.id}
            stay={{
              startDate: data.startDate,
              endDate: data.endDate,
              daysCount: data.daysCount,
              guestsCount: data.guestsCount,
              extraGuestsCount: data.extraGuestsCount,
              capacity: data.residence.capacity,
              maxCapacity: data.residence.maxCapacity,
            }}
            onSaved={() => {
              mutate();
              setLogVersion((v) => v + 1);
            }}
          />

          <div className="flex flex-col gap-y-16">
            {/* وضعیت — read and changed in the same place, because they are
                the same thought two seconds apart. */}
            <ReservationStatusBar
              reservationId={data.id}
              createdAt={data.createdAt}
              updatedAt={data.updatedAt}
              onCancel={() => setShowCancel(true)}
              onChanged={() => {
                mutate();
                setLogVersion((v) => v + 1);
              }}
            />

            {/* ── سه ستون بالای صفحه ──────────────────────────────── */}
            <div className="grid lg:grid-cols-12 gap-16 items-start">
              {/* راست: مهمان، اقامتگاه، میزبان */}
              <div className="lg:col-span-5 flex flex-col gap-y-16 min-w-0">
                <GuestCard data={data} onEditStay={() => setShowStay(true)} />
                <ResidenceCard data={data} />
                <HostCard data={data} />
              </div>

              {/* وسط: پول */}
              <div className="lg:col-span-4 min-w-0">
                <PriceCard
                  data={data}
                  onEditRates={() => setShowReprice(true)}
                  onEditTerms={() => setShowTerms(true)}
                />
              </div>

              {/* چپ: تصمیمی که منتظر است */}
              <div className="lg:col-span-3 min-w-0">
                <DecisionPanel
                  data={data}
                  onChanged={() => mutate()}
                  onReject={() => setShowCancel(true)}
                />
              </div>
            </div>

            {/* ── تماس و یادداشت ─────────────────────────────────── */}
            <div id="payments">
            <PaymentsPanel
              reservationId={data.id}
              canRecord={data.state !== "CANCEL"}
              guestWalletBalance={data.guestProfile?.walletBalance}
              onChanged={() => {
                mutate();
                setLogVersion((v) => v + 1);
              }}
            />
            </div>

            <div id="activity">
              <CallAndNotePanel reservationId={data.id} refreshKey={logVersion} />
            </div>

            {data.state === "CANCEL" && (
              <Card className="p-20 border-r-4 border-r-[#E53935]">
                <h3 className="text-16 leading-24 font-m text-black mb-10">اطلاعات لغو</h3>
                <div className="grid md:grid-cols-2 gap-x-24">
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

          </div>
        </>
      )}
    </AdminLayout>
  );
}

/* ────────────────────────── کمکی‌ها ────────────────────────── */

/** Clears the sticky top bar, so the panel's heading is not hidden under it. */
const HEADER_OFFSET = 76;

/**
 * Take the page to a panel.
 *
 * Not `scrollIntoView({ behavior: "smooth" })`: that is ignored outright in
 * some browsers and by anyone with reduced motion on, and a button that
 * sometimes fails to move the page is worse than one that always jumps.
 */
function reveal(elementId: string) {
  requestAnimationFrame(() => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: Math.max(top, 0) });
  });
}


/**
 * «برچسب : مقدار» — the shape every one of these cards is made of.
 *
 * `nowrap` for values that are meaningless once broken: a date range split
 * across two lines, or a price with «تومان» orphaned under it, both cost the
 * reader a second look. Free text keeps wrapping.
 */
function Fact({
  label,
  value,
  nowrap,
}: {
  label: string;
  value: React.ReactNode;
  nowrap?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-x-8 py-4 text-13 leading-22">
      <span className="text-gray-9B9BAA shrink-0">{label} :</span>
      <span className={`text-black min-w-0 ${nowrap ? "whitespace-nowrap" : "break-words"}`}>
        {value}
      </span>
    </div>
  );
}

function CardTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-x-8 mb-12">
      <i className={`${icon} text-16 text-gray-9B9BAA`} />
      <h3 className="text-15 leading-24 font-m text-black">{children}</h3>
    </div>
  );
}

/**
 * A phone number, dialable and copyable.
 *
 * Both, because the two things done with it are calling it and pasting it
 * somewhere else, and neither should mean selecting the digits by hand.
 */
function Phone({ value }: { value: string }) {
  const [done, setDone] = useState(false);

  return (
    <span className="inline-flex items-center gap-x-6">
      <a
        href={`tel:${value}`}
        dir="ltr"
        className="text-13 leading-22 text-black hover:text-primary-main"
      >
        {value}
      </a>
      <button
        type="button"
        title="کپی شماره"
        onClick={() => {
          navigator.clipboard?.writeText(value).then(
            () => {
              setDone(true);
              setTimeout(() => setDone(false), 1400);
            },
            () => undefined
          );
        }}
        className={`px-6 py-2 rounded-6 text-10 leading-16 border transition ${
          done
            ? "border-[#03D6BB] text-[#015046] bg-[#03D6BB14]"
            : "border-gray-E5E5E6 text-gray-9B9BAA hover:border-gray-C4CAD3"
        }`}
      >
        {done ? "کپی شد" : "کپی"}
      </button>
    </span>
  );
}

function Avatar({ url, name, size = 44 }: { url: string | null; name: string | null; size?: number }) {
  return (
    <span
      className="rounded-full bg-gray-F0F0F0 overflow-hidden shrink-0 flex items-center justify-center text-14 text-gray-6C6A7D"
      style={{ width: size, height: size }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={adminImageUrl(url, 96)} alt="" className="w-full h-full object-cover" />
      ) : (
        (name?.[0] ?? "؟")
      )}
    </span>
  );
}

/* ────────────────────────── ستون راست ────────────────────────── */

function GuestCard({ data, onEditStay }: { data: ReservationDetail; onEditStay: () => void }) {
  const p = data.guestProfile;

  return (
    <Card className="p-20">
      <CardTitle icon="icon-Profile">مشخصات مهمان</CardTitle>

      <div className="flex items-center gap-x-12 mb-12">
        <Avatar url={data.guest.avatarUrl} name={data.guest.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-x-8 flex-wrap gap-y-6">
            <Link
              href={`/admin/users/${data.guest.id}`}
              className="text-14 leading-22 font-m text-primary-dark hover:text-primary-main truncate"
            >
              {data.guest.name || "بدون نام"}
            </Link>
            {p?.isSpecialHost && <Badge tone="yellow">مهمان ویژه</Badge>}
          </div>
          <div className="mt-2">
            <span className="text-12 text-gray-9B9BAA">شماره تماس </span>
            <Phone value={data.guestPhoneOverride || data.guest.phone} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-x-20">
        <Fact
          nowrap
          label="تاریخ سفر"
          value={`${jalaliLong(data.startDate)} ← ${jalaliLong(data.endDate)}`}
        />
        <Fact nowrap label="مدت اقامت" value={`${faNum(data.daysCount)} شب`} />
        <Fact
          nowrap
          label="تعداد مهمانان"
          value={`${faNum(data.guestsCount)} نفر${
            data.extraGuestsCount > 0 ? ` + ${faNum(data.extraGuestsCount)} نفر اضافه` : ""
          }`}
        />
        <Fact nowrap label="شهر مقصد" value={data.residence.city?.name ?? "—"} />
        <Fact
          nowrap
          label="مدارک"
          value={p ? (VERIFICATION_LABELS[p.verificationStatus] ?? "—") : "—"}
        />
        <Fact nowrap label="موجودی کیف پول" value={p ? faMoney(p.walletBalance) : "—"} />
      </div>

      {data.guestNameOverride && (
        <p className="mt-8 text-11 leading-18 text-gray-9B9BAA">
          رزرو برای شخص دیگر: {data.guestNameOverride}
        </p>
      )}

      <div className="mt-12 flex flex-wrap gap-8">
        <Button variant="secondary" onClick={onEditStay}>
          <i className="icon-Calendar text-16" /> ویرایش اقامت
        </Button>
        <Link href={`/admin/users/${data.guest.id}`}>
          <Button variant="secondary">
            <i className="icon-Edit text-16" /> پروفایل مهمان
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function ResidenceCard({ data }: { data: ReservationDetail }) {
  const r = data.residence;
  const place = [r.city?.name, r.city?.province?.name, r.neighborhood].filter(Boolean).join("، ");

  return (
    <Card className="p-20">
      <CardTitle icon="icon-Homes">مشخصات اقامتگاه</CardTitle>

      <div className="flex gap-x-14">
        {r.images[0]?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={adminImageUrl(r.images[0].url, 384)}
            alt=""
            className="w-[104px] h-[78px] rounded-12 object-cover shrink-0"
          />
        ) : (
          <span className="w-[104px] h-[78px] rounded-12 bg-gray-F0F0F0 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-x-8 flex-wrap gap-y-4">
            <Link
              href={`/admin/residences/${r.publicId ?? r.id}`}
              className="text-14 leading-22 font-m text-primary-dark hover:text-primary-main"
            >
              {r.name}
            </Link>
            <span className="text-12 text-gray-9B9BAA">( کد : {r.reference} )</span>
            <Badge tone="gray">{TYPE_LABELS[r.type] ?? r.type}</Badge>
          </div>

          <p className="flex items-start gap-x-6 text-12 leading-20 text-gray-6C6A7D mt-4">
            <i className="icon-Home text-14 text-gray-9B9BAA shrink-0 mt-2" />
            <span>{[place, r.address].filter(Boolean).join("، ") || "—"}</span>
          </p>

          <div className="mt-6">
            <Stars value={r.averageRating} count={r.reviewsCount} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-x-20 mt-12">
        <Fact nowrap label="ورود" value={`${r.checkinFrom ?? "—"} تا ${r.checkinTo ?? "—"}`} />
        <Fact nowrap label="خروج" value={r.checkout ?? "—"} />
        <Fact
          nowrap
          label="ظرفیت"
          value={`${faNum(r.capacity)} نفر${r.maxCapacity ? ` (حداکثر ${faNum(r.maxCapacity)})` : ""}`}
        />
        <Fact
          nowrap
          label="حداقل اقامت"
          value={r.minReservableDays ? `${faNum(r.minReservableDays)} شب` : "—"}
        />
      </div>

      {data.rooms.length > 0 && (
        <p className="mt-8 text-12 leading-20 text-gray-6C6A7D">
          اتاق‌های رزروشده: {data.rooms.map((x) => x.room.name).join("، ")}
        </p>
      )}

      {r.rules.length > 0 && (
        <p className="mt-4 text-11 leading-18 text-gray-9B9BAA">
          قوانین: {r.rules.map((x) => x.rule.name).join("، ")}
        </p>
      )}

      <div className="mt-12">
        <Link href={`/admin/residences/${r.publicId ?? r.id}/calendar`}>
          <Button variant="secondary">
            <i className="icon-CalendarFlash text-16" /> تقویم اقامتگاه
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function HostCard({ data }: { data: ReservationDetail }) {
  const p = data.hostProfile;

  return (
    <Card className="p-20">
      <CardTitle icon="icon-Profile">مشخصات میزبان</CardTitle>

      <div className="flex items-center gap-x-12">
        <Avatar url={data.host.avatarUrl} name={data.host.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-x-8 flex-wrap gap-y-6">
            <Link
              href={`/admin/users/${data.host.id}`}
              className="text-14 leading-22 font-m text-primary-dark hover:text-primary-main truncate"
            >
              {data.host.name || "بدون نام"}
            </Link>
            {p?.isSpecialHost && <Badge tone="blue">میزبان ویژه</Badge>}
          </div>
          <div className="mt-2">
            <span className="text-12 text-gray-9B9BAA">شماره تماس </span>
            <Phone value={data.host.phone} />
          </div>
          {p?.hostRating !== undefined && (
            <div className="mt-4">
              <Stars value={p.hostRating} count={p.hostReviewsCount} />
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-x-20 mt-10">
        <Fact
          nowrap
          label="کارمزد سایت"
          value={
            data.commissionPercent != null ? `${faNum(data.commissionPercent)}٪ از این رزرو` : "—"
          }
        />
        <Fact nowrap label="موجودی کیف پول" value={p ? faMoney(p.walletBalance) : "—"} />
        <Fact
          label="مدارک"
          value={p ? (VERIFICATION_LABELS[p.verificationStatus] ?? "—") : "—"}
        />
        <Fact
          nowrap
          label="تعداد اقامتگاه"
          value={p?.residencesCount !== undefined ? `${faNum(p.residencesCount)} اقامتگاه` : "—"}
        />
      </div>
    </Card>
  );
}

/* ────────────────────────── ستون وسط ────────────────────────── */

/**
 * The money, in the order it is read out over the phone: the code first, then
 * the one number the guest cares about, then the split.
 *
 * Every row here is a column we actually store. Odoo's screen carried «تخفیف
 * سایت» and «پرداختی از کیف پول» as separate lines; we have no such columns,
 * and printing them as zero would state something we do not know.
 */
function PriceCard({
  data,
  onEditRates,
  onEditTerms,
}: {
  data: ReservationDetail;
  onEditRates: () => void;
  onEditTerms: () => void;
}) {
  const due = data.totalAmount + (data.guestCommission ?? 0);
  const remainder = (data.hostShare ?? 0) - data.settledAmount;

  return (
    <Card className="p-20">
      <div className="rounded-12 border border-gray-E5E5E6 py-12 text-center mb-14">
        <span className="text-13 leading-22 text-gray-6C6A7D">کد رزرو </span>
        <b className="text-15 leading-24 font-m text-black tracking-wide">{data.reference}</b>
      </div>

      <div className="rounded-12 bg-gray-F7F7F7 p-14 mb-14 text-center">
        <p className="text-12 leading-20 text-gray-6C6A7D mb-2">مبلغ کل جهت پرداختی</p>
        <strong className="text-18 leading-28 font-m text-black">{faMoney(due)}</strong>
      </div>

      <MoneyRow label="مبلغ رزرو" value={data.totalAmount} />
      <MoneyRow
        label="کارمزد مهمان"
        hint={
          data.guestCommissionPercent != null ? `${faNum(data.guestCommissionPercent)}٪` : undefined
        }
        value={data.guestCommission}
      />
      <MoneyRow label="پرداختی مسافر" value={data.paidAmount} />
      {data.remainingAmount > 0 && (
        <MoneyRow label="باقی‌مانده پرداخت" value={data.remainingAmount} tone="red" strong />
      )}

      <Divider />

      <MoneyRow
        label="سهم میزبان"
        value={data.hostShare}
        strong
      />
      <MoneyRow
        label="سود سایت"
        hint={data.commissionPercent != null ? `${faNum(data.commissionPercent)}٪` : undefined}
        value={data.websiteShare}
      />
      <MoneyRow
        label="مالیات"
        hint={data.vatPercent != null ? `${faNum(data.vatPercent)}٪ از کارمزد` : undefined}
        value={data.vatAmount}
      />
      <MoneyRow label="کد تخفیف" value={null} text={data.voucherCode ?? "—"} />

      <Divider />

      <MoneyRow label="واریز شده به میزبان" value={data.settledAmount} />
      <MoneyRow
        label="مانده سهم میزبان"
        value={data.hostShare == null ? null : remainder}
        strong
        tone={remainder > 0 ? "red" : "green"}
      />

      {(data.residence.hostShareTotalAmount != null ||
        data.residence.hostSharePastNights != null ||
        data.residence.hostShareFutureNights != null) && (
        <p className="mt-10 text-11 leading-18 text-gray-9B9BAA">
          سیاست تسویه: کل {data.residence.hostShareTotalAmount ?? "—"}٪ · شب‌های گذشته{" "}
          {data.residence.hostSharePastNights ?? "—"}٪ · شب‌های آینده{" "}
          {data.residence.hostShareFutureNights ?? "—"}٪
        </p>
      )}

      <div className="mt-14 flex flex-col gap-y-8">
        {/* Two different edits, named for what they change: the nightly rates
            that make up the rent, and the cut taken out of it. */}
        <Button variant="secondary" className="w-full" onClick={onEditRates}>
          <i className="icon-Edit text-16" /> ویرایش قیمت رزرو
        </Button>
        <Button variant="secondary" className="w-full" onClick={onEditTerms}>
          <i className="icon-Cash text-16" /> ویرایش کارمزد و مالیات
        </Button>
      </div>
    </Card>
  );
}

function Divider() {
  return <div className="h-1 bg-gray-F0F0F0 my-10" />;
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
  tone,
  text,
}: {
  label: string;
  value: number | null;
  hint?: string;
  strong?: boolean;
  tone?: "red" | "green";
  /** Overrides the amount — used for the voucher code, which is not a number. */
  text?: string;
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
      <span className="text-12 leading-20 text-gray-9B9BAA min-w-0">
        {label}
        {hint && <span className="text-11"> · {hint}</span>}
      </span>
      <span className={`text-13 leading-20 whitespace-nowrap ${color} ${strong ? "font-m" : ""}`}>
        {text ?? (value == null ? <span className="text-gray-9B9BAA">ثبت نشده</span> : faMoney(value))}
      </span>
    </div>
  );
}

/* ────────────────────────── ستون چپ ────────────────────────── */

/**
 * The decision that is waiting, and the clock it is waiting against.
 *
 * «رد درخواست» opens the cancellation dialog rather than moving the state
 * directly: rejecting a booking refunds the guest and releases the calendar,
 * and those need a canceller and a justification that a one-line note cannot
 * carry.
 */
function DecisionPanel({
  data,
  onChanged,
  onReject,
}: {
  data: ReservationDetail;
  onChanged: () => void;
  onReject: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extending, setExtending] = useState(false);
  /** Set once a DONE transition lands and the ledger still shows a balance. */
  const [unpaidRemaining, setUnpaidRemaining] = useState<number | null>(null);

  const decision = DECISION[data.state];
  const left = data.expiryDate
    ? Math.round((new Date(data.expiryDate).getTime() - Date.now()) / 60000)
    : null;
  const overdue = left != null && left <= 0;

  async function approve() {
    if (!decision) return;
    const goingToDone = decision.to === "DONE";
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/reservations/${data.id}/state`, {
        method: "POST",
        body: JSON.stringify({ toState: decision.to, note: note.trim() }),
      });
      setConfirming(false);
      setNote("");
      onChanged();

      /**
       * «ثبت پرداخت مهمان» confirms the booking — it does not mean the guest
       * has paid. The state change above no longer stamps `remainingAmount`
       * as settled (see stateChange.service.ts), so what the ledger says right
       * after landing on «قطعی» is whatever it actually said before: a real
       * balance if one was there. The ledger endpoint, not `data.remainingAmount`
       * from the page's own (not-yet-refetched) SWR cache, because this needs
       * the number the transition just produced, not the one from before it.
       */
      if (goingToDone) {
        try {
          const ledger = await apiFetch<{ summary: { remaining: number } }>(
            `/api/admin/reservations/${data.id}/payments`
          );
          if (ledger.summary.remaining > 0) setUnpaidRemaining(ledger.summary.remaining);
        } catch {
          // The confirmation already succeeded; a failed follow-up check is
          // not worth blocking on or surfacing as an error of its own.
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت نشد");
    } finally {
      setBusy(false);
    }
  }

  async function extend(minutes: number) {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/reservations/${data.id}/expiry`, {
        method: "PATCH",
        body: JSON.stringify({ minutesFromNow: minutes }),
      });
      setExtending(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تمدید نشد");
    } finally {
      setBusy(false);
    }
  }

  /*
   * The unpaid-balance reminder is deliberately rendered outside the
   * `!decision` branch below, not inside the card that branch replaces.
   * Confirming a booking to «قطعی» is exactly the transition that makes
   * `decision` fall out of `DECISION` (DONE has no entry — there is nothing
   * further to decide), so the moment the reminder needs to appear is the
   * same moment the card that used to hold it stops rendering at all. It
   * showed the ledger's real remaining balance and then discarded the JSX
   * meant to say so before that render ever reached the screen.
   */
  const reminderModal = (
    <Modal
      open={unpaidRemaining != null}
      onClose={() => setUnpaidRemaining(null)}
      title="مهمان هنوز پرداخت را کامل نکرده"
      width="max-w-[460px]"
    >
      <p className="text-13 leading-22 text-gray-6C6A7D mb-4">
        رزرو <b className="text-black">{data.reference}</b> قطعی شد، اما طبق دفتر پرداخت‌ها هنوز{" "}
        <b className="text-[#C62828]">{unpaidRemaining != null && faMoney(unpaidRemaining)}</b> از
        مهمان دریافت نشده است.
      </p>
      <p className="text-12 leading-20 text-gray-9B9BAA mb-16">
        می‌توانید همین حالا پرداخت را ثبت کنید، یا بدون آن ادامه دهید و بعداً از همین صفحه ثبتش کنید.
      </p>
      <div className="flex flex-col gap-y-8">
        <Button
          className="w-full"
          onClick={() => {
            setUnpaidRemaining(null);
            document.getElementById("payments")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
        >
          ثبت پرداخت مهمان
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => setUnpaidRemaining(null)}>
          ادامه بدون نیاز به پرداخت مهمان
        </Button>
      </div>
    </Modal>
  );

  if (!decision) {
    return (
      <>
        <Card className="p-20">
          <h3 className="text-15 leading-24 font-m text-black mb-8">وضعیت رزرو</h3>
          <Badge tone={STATE_TONE[data.state] ?? "gray"}>
            {STATE_LABELS[data.state] ?? data.state}
          </Badge>
          <p className="mt-10 text-12 leading-20 text-gray-6C6A7D">
            تصمیمی برای این رزرو در انتظار نیست. برای جابه‌جایی دستی از پنل «وضعیت رزرو» پایین صفحه
            استفاده کنید.
          </p>
        </Card>
        {reminderModal}
      </>
    );
  }

  return (
    <>
    <Card className="p-20">
      <div className="flex flex-col gap-y-10">
        <Button
          className="w-full bg-[#2E7D32] text-white hover:opacity-90"
          onClick={() => setConfirming(true)}
        >
          {decision.approve}
        </Button>
        <Button variant="danger" className="w-full" onClick={onReject}>
          {decision.reject}
        </Button>
      </div>

      <div className="mt-16 pt-14 border-t border-gray-F0F0F0">
        <p className="text-12 leading-20 text-gray-6C6A7D mb-6">{decision.deadline}</p>

        {data.expiryDate ? (
          <>
            <div
              className={`text-24 leading-32 font-m tracking-wide ${
                overdue ? "text-[#C62828]" : "text-black"
              }`}
              dir="ltr"
            >
              {overdue ? "۰۰ : ۰۰" : countdown(left!)}
            </div>
            <p className="text-11 leading-18 text-gray-9B9BAA mt-2">
              {jalaliLong(data.expiryDate)} ساعت {faDateTime(data.expiryDate)[1]}
              {overdue && " — گذشته؛ در اجرای بعدی زمان‌بند منقضی می‌شود"}
            </p>
          </>
        ) : (
          /* Every booking made before deadlines existed has none, and without
             one the sweep leaves it alone — so it waits forever rather than
             expiring silently. */
          <p className="text-12 leading-20 text-gray-9B9BAA">
            مهلتی ثبت نشده — این رزرو خودبه‌خود منقضی نمی‌شود.
          </p>
        )}

        {extending ? (
          <div className="mt-10 flex flex-wrap gap-8">
            {[30, 60, 120, 720].map((m) => (
              <button
                key={m}
                type="button"
                disabled={busy}
                onClick={() => extend(m)}
                className="px-10 py-6 rounded-10 text-12 leading-20 border border-gray-E5E5E6 text-gray-6C6A7D hover:border-gray-C4CAD3 transition disabled:opacity-50"
              >
                {m < 60 ? `${faNum(m)} دقیقه` : `${faNum(m / 60)} ساعت`}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setExtending(false)}
              className="px-10 py-6 rounded-10 text-12 leading-20 text-gray-9B9BAA"
            >
              انصراف
            </button>
          </div>
        ) : (
          <Button variant="secondary" className="w-full mt-10" onClick={() => setExtending(true)}>
            تمدید {decision.deadline}
          </Button>
        )}
      </div>

      {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={decision.approve}
        width="max-w-[460px]"
      >
        <p className="text-13 leading-22 text-gray-6C6A7D mb-10">
          رزرو <b className="text-black">{data.reference}</b> به وضعیت «
          {STATE_LABELS[decision.to]}» منتقل می‌شود.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="توضیح — چرا این رزرو جابه‌جا می‌شود؟"
          className="w-full rounded-8 border border-gray-E5E5E6 p-10 text-13 leading-22 outline-none focus:border-primary-main"
        />
        <p className="mt-6 text-11 leading-18 text-gray-9B9BAA">
          این توضیح در تاریخچه‌ی رزرو با نام شما ثبت می‌شود و پاک نمی‌شود.
        </p>
        {error && <p className="mt-8 text-13 text-[#C62828]">{error}</p>}
        <div className="flex justify-end gap-x-8 mt-14">
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            انصراف
          </Button>
          <Button disabled={busy || note.trim().length < 3} onClick={approve}>
            {busy ? "در حال ثبت..." : "ثبت"}
          </Button>
        </div>
      </Modal>
    </Card>
    {reminderModal}
    </>
  );
}

/** «۲۵ : ۱۵» — hours and minutes left, in Persian digits. */
function countdown(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const pad = (n: number) => faNum(n).padStart(2, "۰");
  return `${pad(h)} : ${pad(m)}`;
}

/* ────────────────────────── پایین صفحه ────────────────────────── */

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

      <div className="grid md:grid-cols-3 gap-x-24 mt-12">
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
