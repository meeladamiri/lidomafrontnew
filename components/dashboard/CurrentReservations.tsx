import Link from "next/link";
import Image from "next/image";
import PageTitle from "components/General/PageTitle";
import Divider from "components/General/Divider";
import { miladiToJalali } from "utilities/dateTools";

/**
 * رزروهای جاری — on the dashboard, where they were missing entirely.
 *
 * "Current" is decided by the server (see dashboard.service): anything still
 * waiting on somebody, plus confirmed stays that have not finished. A trip
 * from two years ago is history and belongs on the trips page.
 *
 * One component for both sides. A host's own trips and their listings'
 * bookings are the same object shown to different people, and the only real
 * difference is where a row links — so that is the only thing passed in.
 */

interface Row {
  id: number;
  reference: string;
  state: string;
  start_date: string;
  end_date: string;
  days_count: number;
  guests_count: number;
  total_amount: number;
  expiry_date: string | null;
  product: { id: number; name: string; address: string; image_url: string } | null;
}

/**
 * The five states a booking can be in here, in the words the rest of the site
 * uses. Colour carries the same meaning as the text so a row can be read at a
 * glance without being read at all.
 */
const STATE: Record<string, { label: string; className: string }> = {
  HOST_APPROVAL: { label: "در انتظار تایید میزبان", className: "bg-warning/15 text-[#B26A00]" },
  SECOND_PAYMENT: { label: "در انتظار پرداخت", className: "bg-error-light/15 text-error-light" },
  DONE: { label: "قطعی", className: "bg-success/15 text-[#1B8A1B]" },
  CANCEL: { label: "لغو شده", className: "bg-gray-F4F5F6 text-gray-959FA7" },
  EXPIRED: { label: "منقضی شده", className: "bg-gray-F4F5F6 text-gray-959FA7" },
};

const fa = (n: number) => (n ?? 0).toLocaleString("fa-IR");

/**
 * miladiToJalali returns Latin digits. Every other number in this card is
 * Persian, and one Latin date among them reads as a rendering fault rather
 * than a style choice.
 */
const faDate = (iso: string) =>
  miladiToJalali(iso).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export default function CurrentReservations({
  title,
  icon,
  rows,
  hrefFor,
  emptyHref,
}: {
  title: string;
  icon: string;
  rows: Row[];
  hrefFor: (row: Row) => string;
  /** "همه" link in the header. */
  emptyHref: string;
}) {
  if (!rows?.length) return null;

  return (
    <>
      <div className="py-16">
        <PageTitle
          title={title}
          icon={<i className={`${icon} text-24`} />}
          containerClassname="mb-16"
          element={
            <Link href={emptyHref} className="text-14 leading-24 text-primary-main font-m">
              همه
            </Link>
          }
        />

        <div className="flex flex-col gap-y-10">
          {rows.slice(0, 4).map((r) => {
            const state = STATE[r.state] ?? {
              label: r.state,
              className: "bg-gray-F4F5F6 text-gray-959FA7",
            };

            return (
              <Link
                key={r.id}
                href={hrefFor(r)}
                className="flex items-center gap-x-12 rounded-12 border-1 border-solid border-gray-CACFD3 p-10 hover:border-primary-main transition"
              >
                <div className="relative w-64 h-64 rounded-8 overflow-hidden bg-gray-F4F5F6 shrink-0">
                  {!!r.product?.image_url && (
                    <Image
                      src={r.product.image_url}
                      alt=""
                      fill
                      sizes="64px"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-14 leading-22 text-black font-m OnlyOneLineAndEndWithElipsis">
                    {r.product?.name ?? "اقامتگاه"}
                  </p>
                  <p className="text-12 leading-20 text-gray-959FA7 mt-2">
                    {faDate(r.start_date)} تا {faDate(r.end_date)} ·{" "}
                    {fa(r.days_count)} شب · {fa(r.guests_count)} نفر
                  </p>
                  <p className="text-12 leading-20 text-gray-959FA7">کد {r.reference}</p>
                </div>

                <div className="shrink-0 text-left">
                  <span
                    className={`inline-block rounded-full px-10 py-2 text-11 leading-18 font-m ${state.className}`}
                  >
                    {state.label}
                  </span>
                  <p className="text-13 leading-22 text-black font-m mt-6">
                    {fa(r.total_amount)}{" "}
                    <span className="text-11 text-gray-959FA7 font-r">تومان</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <Divider />
    </>
  );
}
