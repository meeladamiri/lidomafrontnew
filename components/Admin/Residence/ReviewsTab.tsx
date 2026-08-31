import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import moment from "moment-jalaali";
import { apiFetch } from "@/api/Admin/adminApi";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Modal,
  Skeleton,
  Stars,
  faNum,
} from "@/components/Admin/ui";
import { faDigits } from "@/components/Admin/JalaliDate";

/**
 * نظرات — moderation for one listing.
 *
 * The panel had no way to see a review, let alone act on one. Everything was
 * published the moment a guest wrote it, and the ops team's only recourse for
 * an abusive comment was to open the database.
 *
 * The one destructive-looking action is **hide**, and it is not destructive:
 * the row stays with a reason and an author. A review is a guest's statement,
 * and both sides of a dispute need it to still exist — the host who says it is
 * unfair, and the guest who says theirs disappeared. Hiding is also reversible
 * from right here, which is the point.
 *
 * Hidden reviews stay in this list, marked. This is the one place they must be
 * visible: it is where the decision gets re-examined.
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
  hiddenAt: string | null;
  hiddenReason: string | null;
  createdAt: string;
  guest: { id: number; name: string | null; phone: string; avatarUrl: string | null } | null;
  reservation: { id: number; reference: string; startDate: string; endDate: string } | null;
}

interface Payload {
  reviews: Review[];
  summary: {
    total: number;
    visible: number;
    hidden: number;
    unanswered: number;
    average: number;
    cleaning: number;
    location: number;
    quality: number;
    integrity: number;
    greeting: number;
    delivery: number;
  };
}

const jDate = (iso: string) => faDigits(moment(iso).format("jYYYY/jMM/jDD"));

type Filter = "all" | "visible" | "hidden" | "unanswered";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "visible", label: "نمایش داده می‌شود" },
  { key: "hidden", label: "پنهان" },
  { key: "unanswered", label: "بی‌پاسخ" },
];

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-x-4 rounded-6 bg-gray-F5F5F7 px-6 py-2 text-11 leading-16 text-gray-6C6A7D">
      {label}
      <b className="text-black">{faNum(value)}</b>
    </span>
  );
}

export default function ReviewsTab({ residenceId }: { residenceId: number }) {
  const { data, isLoading, mutate } = useSWR<Payload>(
    `/api/admin/residences/${residenceId}/reviews`,
    (p: string) => apiFetch<Payload>(p)
  );

  const [filter, setFilter] = useState<Filter>("all");
  const [hiding, setHiding] = useState<Review | null>(null);
  const [reason, setReason] = useState("");
  const [answering, setAnswering] = useState<Review | null>(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <Skeleton className="h-[360px]" />;
  if (!data)
    return (
      <Card>
        <EmptyState text="نظرات این اقامتگاه خوانده نشد" />
      </Card>
    );

  const rows = data.reviews.filter((r) => {
    if (filter === "visible") return !r.hiddenAt;
    if (filter === "hidden") return !!r.hiddenAt;
    if (filter === "unanswered") return !r.hiddenAt && !r.hostAnswer;
    return true;
  });

  async function hide() {
    if (!hiding || !reason.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/reviews/${hiding.id}/hide`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      setHiding(null);
      setReason("");
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  async function unhide(review: Review) {
    await apiFetch(`/api/admin/reviews/${review.id}/unhide`, { method: "POST" });
    mutate();
  }

  async function saveAnswer() {
    if (!answering || !answer.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/reviews/${answering.id}/answer`, {
        method: "PUT",
        body: JSON.stringify({ answer: answer.trim() }),
      });
      setAnswering(null);
      setAnswer("");
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-y-16">
      <Card className="p-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-14">
          <div className="rounded-12 border border-gray-E5E5E6 p-14 text-center">
            <p className="text-24 leading-34 font-b text-black">{faNum(data.summary.average)}</p>
            <div className="flex justify-center">
              <Stars value={data.summary.average} />
            </div>
            <p className="text-11 leading-18 text-gray-9B9BAA mt-2">میانگین</p>
          </div>
          <div className="rounded-12 border border-gray-E5E5E6 p-14">
            <p className="text-12 leading-20 text-gray-6C6A7D">نمایش داده می‌شود</p>
            <p className="text-20 leading-30 font-b text-black mt-2">
              {faNum(data.summary.visible)}
            </p>
          </div>
          <div className="rounded-12 border border-gray-E5E5E6 p-14">
            <p className="text-12 leading-20 text-gray-6C6A7D">پنهان</p>
            <p className="text-20 leading-30 font-b text-[#C62828] mt-2">
              {faNum(data.summary.hidden)}
            </p>
          </div>
          <div className="rounded-12 border border-gray-E5E5E6 p-14">
            <p className="text-12 leading-20 text-gray-6C6A7D">بی‌پاسخ</p>
            <p className="text-20 leading-30 font-b text-[#B26A00] mt-2">
              {faNum(data.summary.unanswered)}
            </p>
          </div>
          <div className="rounded-12 border border-gray-E5E5E6 p-14 col-span-2">
            <p className="text-12 leading-20 text-gray-6C6A7D mb-6">میانگین دسته‌ها</p>
            <div className="flex flex-wrap gap-4">
              <ScoreChip label="نظافت" value={data.summary.cleaning} />
              <ScoreChip label="موقعیت" value={data.summary.location} />
              <ScoreChip label="کیفیت" value={data.summary.quality} />
              <ScoreChip label="صحت" value={data.summary.integrity} />
              <ScoreChip label="برخورد" value={data.summary.greeting} />
              <ScoreChip label="تحویل" value={data.summary.delivery} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-x-6 flex-wrap gap-y-6">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-12 py-6 text-12 leading-20 border transition ${
                filter === f.key
                  ? "border-primary-main bg-primary-light text-primary-dark font-m"
                  : "border-gray-E5E5E6 text-gray-6C6A7D hover:border-gray-C4CAD3"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            text={
              data.summary.total === 0
                ? "هنوز نظری برای این اقامتگاه ثبت نشده"
                : "نظری با این فیلتر پیدا نشد"
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-y-12">
          {rows.map((r) => (
            <Card
              key={r.id}
              className={`p-16 ${r.hiddenAt ? "bg-[#FCF6F6] border-r-4 border-r-[#E11D48]" : ""}`}
            >
              <div className="flex items-start justify-between gap-x-12 flex-wrap gap-y-8 mb-10">
                <div className="min-w-0">
                  <div className="flex items-center gap-x-8 flex-wrap gap-y-4">
                    {r.guest ? (
                      <Link
                        href={`/admin/users/${r.guest.id}`}
                        className="text-14 leading-22 font-m text-primary-dark"
                      >
                        {r.guest.name || r.guest.phone}
                      </Link>
                    ) : (
                      <span className="text-14 leading-22 font-m text-black">مهمان</span>
                    )}
                    <Stars value={r.averageRating} />
                    <span className="text-12 leading-20 text-gray-9B9BAA">
                      {jDate(r.createdAt)}
                    </span>
                    {!!r.hiddenAt && <Badge tone="red">پنهان</Badge>}
                    {!r.hiddenAt && !r.hostAnswer && <Badge tone="yellow">بی‌پاسخ</Badge>}
                  </div>
                  {!!r.reservation && (
                    <Link
                      href={`/admin/reservations/${r.reservation.id}`}
                      className="text-12 leading-20 text-gray-6C6A7D hover:text-primary-dark"
                    >
                      {r.reservation.reference} · {jDate(r.reservation.startDate)} تا{" "}
                      {jDate(r.reservation.endDate)}
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-x-8">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setAnswering(r);
                      setAnswer(r.hostAnswer ?? "");
                    }}
                  >
                    {r.hostAnswer ? "ویرایش پاسخ" : "ثبت پاسخ میزبان"}
                  </Button>
                  {r.hiddenAt ? (
                    <Button variant="secondary" onClick={() => unhide(r)}>
                      نمایش دوباره
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      onClick={() => {
                        setHiding(r);
                        setReason("");
                      }}
                    >
                      پنهان کردن
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-13 leading-24 text-black whitespace-pre-line">{r.comment}</p>

              <div className="flex flex-wrap gap-4 mt-10">
                <ScoreChip label="نظافت" value={r.cleaning} />
                <ScoreChip label="موقعیت" value={r.location} />
                <ScoreChip label="کیفیت" value={r.quality} />
                <ScoreChip label="صحت" value={r.integrity} />
                <ScoreChip label="برخورد" value={r.greeting} />
                <ScoreChip label="تحویل" value={r.delivery} />
              </div>

              {!!r.hostAnswer && (
                <div className="mt-12 rounded-10 bg-gray-F5F5F7 px-12 py-10">
                  <p className="text-12 leading-20 text-gray-6C6A7D mb-2">پاسخ میزبان</p>
                  <p className="text-13 leading-22 text-black whitespace-pre-line">
                    {r.hostAnswer}
                  </p>
                </div>
              )}

              {!!r.hiddenAt && (
                <div className="mt-12 rounded-10 bg-[#FDECEC] px-12 py-10">
                  <p className="text-12 leading-20 text-[#C62828]">
                    پنهان شده در {jDate(r.hiddenAt)}
                    {r.hiddenReason ? ` — ${r.hiddenReason}` : ""}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ---- hide ---- */}
      <Modal
        open={!!hiding}
        onClose={() => setHiding(null)}
        title="پنهان کردن نظر"
        width="max-w-[480px]"
      >
        <div className="rounded-8 bg-[#F0F9FF] border border-[#BAE6FD] px-12 py-10 mb-14">
          <p className="text-12 leading-20 text-black">
            نظر <b>حذف نمی‌شود</b> — فقط از صفحه‌ی اقامتگاه برداشته می‌شود و از میانگین امتیاز
            کنار گذاشته می‌شود. هر وقت بخواهید از همین‌جا برمی‌گردد.
          </p>
        </div>
        <Field label="دلیل (الزامی)">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="چرا این نظر باید پنهان شود؟"
            className="w-full rounded-8 border border-gray-E3E3E8 px-12 py-10 text-14 leading-24 outline-none focus:border-primary resize-none"
          />
        </Field>
        {!!error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}
        <div className="mt-16 flex items-center justify-end gap-x-10">
          <Button variant="secondary" onClick={() => setHiding(null)} disabled={busy}>
            انصراف
          </Button>
          <Button variant="danger" onClick={hide} disabled={busy || !reason.trim()}>
            {busy ? "در حال ثبت…" : "پنهان کن"}
          </Button>
        </div>
      </Modal>

      {/* ---- host answer ---- */}
      <Modal
        open={!!answering}
        onClose={() => setAnswering(null)}
        title="پاسخ میزبان"
        width="max-w-[520px]"
      >
        <p className="text-12 leading-20 text-gray-9B9BAA mb-12">
          این متن در صفحه‌ی اقامتگاه به‌عنوان پاسخ میزبان دیده می‌شود. در تاریخچه ثبت می‌شود که
          شما آن را نوشته‌اید.
        </p>
        <Field label="متن پاسخ">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            className="w-full rounded-8 border border-gray-E3E3E8 px-12 py-10 text-14 leading-24 outline-none focus:border-primary resize-none"
          />
        </Field>
        {!!error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}
        <div className="mt-16 flex items-center justify-end gap-x-10">
          <Button variant="secondary" onClick={() => setAnswering(null)} disabled={busy}>
            انصراف
          </Button>
          <Button onClick={saveAnswer} disabled={busy || !answer.trim()}>
            {busy ? "در حال ثبت…" : "ثبت پاسخ"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
