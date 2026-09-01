import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Skeleton,
  Toggle,
  adminImageUrl,
  faNum,
  type Tone,
} from "@/components/Admin/ui";
import { jalaliShort } from "@/components/Admin/JalaliDate";
import CallAndNotePanel from "@/components/Admin/CallAndNotePanel";

/**
 * جزئیات نظر.
 *
 * Two blocks, because a review is two pieces of writing by two people, each
 * approved on its own: the guest's comment on top, the host's reply beneath.
 * Each has its own status badge and its own «نمایش نظر» switch, and the switch
 * is the moderation decision — not a preview toggle.
 *
 * Both texts are editable. In practice support has to be able to: a phone
 * number left in a review, a name, an insult inside an otherwise fair
 * complaint. The alternative was rejecting the whole review, which throws away
 * a real opinion to fix one line. Every edit puts the original in the activity
 * log — editing what someone said without recording what they actually said is
 * the thing that would make this dangerous.
 *
 * The two buttons in the rail tell the guest or the host their text is live.
 * They refuse when it is not: telling someone their review is published when
 * the site does not show it is worse than saying nothing.
 */

const STATUS: Record<string, { label: string; tone: Tone }> = {
  AWAITING_HOST_ANSWER_APPROVAL: { label: "در انتظار تایید نظر میزبان", tone: "yellow" },
  AWAITING_GUEST_COMMENT_APPROVAL: { label: "در انتظار تایید نظر مهمان", tone: "yellow" },
  AWAITING_BOTH: { label: "در انتظار تایید", tone: "yellow" },
  PUBLISHED: { label: "منتشر شده", tone: "green" },
  REJECTED: { label: "رد شده", tone: "red" },
};

const PART_STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "در انتظار تایید", tone: "yellow" },
  PUBLISHED: { label: "منتشر شده", tone: "green" },
  REJECTED: { label: "رد شده", tone: "red" },
};

const SCORES: { key: keyof Review; label: string }[] = [
  { key: "cleaning", label: "نظافت اقامتگاه" },
  { key: "location", label: "موقعیت مکانی" },
  { key: "greeting", label: "برخورد میزبان" },
  { key: "delivery", label: "نحوه تحویل" },
  { key: "quality", label: "کیفیت نسبت به نرخ" },
  { key: "integrity", label: "صحت اطلاعات" },
];

interface Review {
  id: number;
  residenceId: number;
  cleaning: number;
  location: number;
  quality: number;
  integrity: number;
  greeting: number;
  delivery: number;
  averageRating: number;
  comment: string;
  hostAnswer: string | null;
  commentStatus: "PENDING" | "PUBLISHED" | "REJECTED";
  hostAnswerStatus: "PENDING" | "PUBLISHED" | "REJECTED" | null;
  status: keyof typeof STATUS;
  createdAt: string;
  moderationNote: string | null;
  guest: { id: number; name: string | null; phone: string; avatarUrl: string | null };
  reservation: { id: number; reference: string; startDate: string; endDate: string } | null;
  residence: {
    id: number;
    /** کد اقامتگاه — what the panel URL uses. Not the same as `id`. */
    publicId: number;
    name: string;
    reference: string | null;
    host: { id: number; name: string | null; phone: string; avatarUrl: string | null } | null;
  };
}

/**
 * Five stars, clickable.
 *
 * Buttons rather than a range input: a score is one of five named things, and
 * the thing being clicked should be the thing being chosen. Each carries its
 * own label so the row is usable without seeing the colour.
 */
function Stars5({
  value,
  onPick,
}: {
  value: number;
  onPick?: (n: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-x-2" dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => {
        const lit = n <= Math.round(value);
        if (!onPick) {
          return (
            <i
              key={n}
              className={`icon-Star text-14 ${lit ? "text-[#FFC120]" : "text-gray-E5E5E6"}`}
            />
          );
        }
        return (
          <button
            key={n}
            type="button"
            title={`${n} از ۵`}
            aria-label={`${n} از ۵`}
            onClick={() => onPick(n)}
            className="leading-none"
          >
            <i
              className={`icon-Star text-16 transition ${
                lit ? "text-[#FFC120]" : "text-gray-E5E5E6 hover:text-[#FFE2A0]"
              }`}
            />
          </button>
        );
      })}
    </span>
  );
}

function Avatar({ url, name, size = 40 }: { url: string | null; name: string | null; size?: number }) {
  if (url) {
    return (
      <Image
        src={adminImageUrl(url, 96)}
        alt={name ?? ""}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="rounded-full bg-gray-F0F0F0 text-gray-6C6A7D flex items-center justify-center shrink-0 text-13"
      style={{ width: size, height: size }}
    >
      {(name ?? "؟").trim().charAt(0)}
    </span>
  );
}

export default function ReviewDetailPage() {
  const router = useRouter();
  const id = Number(router.query.id);

  const { data, isLoading, mutate } = useSWR<Review>(
    Number.isFinite(id) ? `/api/admin/reviews/${id}` : null,
    (p: string) => apiFetch<Review>(p)
  );

  const [comment, setComment] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  // Only the scores that were touched. Sent as-is, so an untouched field is
  // never written back — the server keeps its current value.
  const [scoreDraft, setScoreDraft] = useState<Record<string, number>>({});
  const [rejecting, setRejecting] = useState<"comment" | "answer" | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  // Reset the drafts whenever the server's copy changes, so an edit saved
  // elsewhere does not sit invisibly behind a stale textarea.
  useEffect(() => {
    if (!data) return;
    setComment(data.comment ?? "");
    setAnswer(data.hostAnswer ?? "");
    setScoreDraft({});
  }, [data?.id, data?.comment, data?.hostAnswer]);

  async function run(label: string, fn: () => Promise<unknown>, okText: string) {
    setBusy(label);
    setMessage(null);
    try {
      await fn();
      await mutate();
      setMessage({ tone: "ok", text: okText });
    } catch (e) {
      setMessage({ tone: "err", text: e instanceof Error ? e.message : "انجام نشد" });
    } finally {
      setBusy(null);
    }
  }

  const setCommentStatus = (status: string, note?: string) =>
    run(
      "comment-status",
      () =>
        apiFetch(`/api/admin/reviews/${id}/comment-status`, {
          method: "POST",
          body: JSON.stringify({ status, note }),
        }),
      status === "PUBLISHED" ? "نظر مهمان منتشر شد" : "نظر مهمان رد شد"
    );

  const setAnswerStatus = (status: string, note?: string) =>
    run(
      "answer-status",
      () =>
        apiFetch(`/api/admin/reviews/${id}/answer-status`, {
          method: "POST",
          body: JSON.stringify({ status, note }),
        }),
      status === "PUBLISHED" ? "پاسخ میزبان منتشر شد" : "پاسخ میزبان رد شد"
    );

  const notify = (audience: "guest" | "host") =>
    run(
      `notify-${audience}`,
      async () => {
        const res = await apiFetch<{ smsSent: boolean }>(`/api/admin/reviews/${id}/notify`, {
          method: "POST",
          body: JSON.stringify({ audience }),
        });
        // The provider is a stub until it is configured. Saying "پیامک ارسال
        // شد" when nothing left the building is the one thing this must not do.
        setMessage({
          tone: "ok",
          text: res.smsSent
            ? "پیامک ارسال شد"
            : "اعلان داخل سایت ثبت شد — سرویس پیامک هنوز وصل نیست",
        });
      },
      ""
    );

  if (isLoading) return <AdminLayout title="جزئیات نظر"><Skeleton className="h-[520px]" /></AdminLayout>;
  if (!data)
    return (
      <AdminLayout title="جزئیات نظر">
        <Card>
          <EmptyState text="نظر پیدا نشد" />
        </Card>
      </AdminLayout>
    );

  const scoresDirty = SCORES.some(
    (sc) => scoreDraft[sc.key] !== undefined && scoreDraft[sc.key] !== data[sc.key]
  );
  const commentDirty = comment.trim() !== (data.comment ?? "").trim();
  const answerDirty = answer.trim() !== (data.hostAnswer ?? "").trim();

  return (
    <AdminLayout
      title="جزئیات نظر"
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link> / <Link href="/admin/comments">نظرات</Link> /{" "}
          <Link href={`/admin/residences/${data.residence.publicId ?? data.residence.id}`}>{data.residence.name}</Link>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-16 items-start">
        <div className="flex flex-col gap-y-16">
          {/* ---------- the guest's review ---------- */}
          <Card className="p-20">
            <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-10 mb-16">
              <div className="flex items-center gap-x-10">
                <Badge tone="purple">مهمان</Badge>
                <Avatar url={data.guest.avatarUrl} name={data.guest.name} />
                <Link
                  href={`/admin/users/${data.guest.id}`}
                  className="text-14 font-m text-primary-dark"
                >
                  {data.guest.name ?? data.guest.phone}
                </Link>
              </div>
              <div className="flex items-center gap-x-12 text-12 text-gray-6C6A7D">
                {!!data.reservation && (
                  <>
                    <Link
                      href={`/admin/reservations/${data.reservation.id}`}
                      className="text-primary-dark"
                    >
                      کد رزرو : {data.reservation.reference}
                    </Link>
                    <span>تاریخ سفر : {jalaliShort(data.reservation.startDate)}</span>
                  </>
                )}
                <Badge tone={PART_STATUS[data.commentStatus]?.tone ?? "gray"}>
                  {PART_STATUS[data.commentStatus]?.label ?? data.commentStatus}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-x-8 mb-14">
              <span className="text-14 font-m text-black">میانگین امتیاز</span>
              <i className="icon-Star text-16 text-[#FFC120]" />
              <span className="text-14 font-b text-black">
                ({faNum(Math.round(data.averageRating * 10) / 10)})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-8 mb-10">
              {SCORES.map((sc) => {
                const current = scoreDraft[sc.key] ?? (data[sc.key] as number);
                const moved = scoreDraft[sc.key] !== undefined && scoreDraft[sc.key] !== data[sc.key];
                return (
                  <div key={sc.key} className="flex items-center justify-between gap-x-8">
                    <span className={`text-12 ${moved ? "text-[#B26A00] font-m" : "text-gray-6C6A7D"}`}>
                      {sc.label}
                    </span>
                    <span className="flex items-center gap-x-6">
                      <Stars5
                        value={current}
                        onPick={(n) => setScoreDraft((prev) => ({ ...prev, [sc.key]: n }))}
                      />
                      <span className={`text-12 ${moved ? "text-[#B26A00] font-m" : "text-black"}`}>
                        ({faNum(current)})
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>

            {scoresDirty && (
              <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 rounded-10 bg-[#FFF8EC] border border-[#F5D9A8] px-12 py-10 mb-14">
                <p className="text-12 leading-20 text-black">
                  با ذخیره‌ی امتیازها، میانگین این نظر و امتیاز کل اقامتگاه دوباره حساب می‌شود.
                </p>
                <div className="flex items-center gap-x-8">
                  <Button variant="secondary" onClick={() => setScoreDraft({})}>
                    بازگردانی
                  </Button>
                  <Button
                    disabled={busy === "edit-scores"}
                    onClick={() =>
                      run(
                        "edit-scores",
                        () =>
                          apiFetch(`/api/admin/reviews/${id}/scores`, {
                            method: "PUT",
                            body: JSON.stringify(scoreDraft),
                          }),
                        "امتیازها ذخیره شد"
                      ).then(() => setScoreDraft({}))
                    }
                  >
                    ذخیره امتیازها
                  </Button>
                </div>
              </div>
            )}

            <label className="block text-11 text-gray-9B9BAA mb-4">متن نظر مهمان</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-10 border border-gray-E5E5E6 px-14 py-12 text-13 leading-24 outline-none focus:border-primary-main resize-y"
            />

            <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-10 mt-12">
              <label className="flex items-center gap-x-8 text-13 text-gray-6C6A7D">
                <Toggle
                  checked={data.commentStatus === "PUBLISHED"}
                  onChange={(v) =>
                    v ? setCommentStatus("PUBLISHED") : setRejecting("comment")
                  }
                />
                نمایش نظر
              </label>

              {commentDirty && (
                <div className="flex items-center gap-x-8">
                  <Button variant="secondary" onClick={() => setComment(data.comment ?? "")}>
                    بازگردانی
                  </Button>
                  <Button
                    disabled={busy === "edit-comment" || !comment.trim()}
                    onClick={() =>
                      run(
                        "edit-comment",
                        () =>
                          apiFetch(`/api/admin/reviews/${id}/comment`, {
                            method: "PUT",
                            body: JSON.stringify({ comment: comment.trim() }),
                          }),
                        "متن نظر ذخیره شد"
                      )
                    }
                  >
                    ذخیره متن نظر
                  </Button>
                </div>
              )}
            </div>

            {!!data.moderationNote && (
              <p className="mt-10 text-12 leading-20 text-[#C62828]">
                دلیل رد شدن : {data.moderationNote}
              </p>
            )}
          </Card>

          {/* ---------- the host's reply ---------- */}
          <Card className="p-20">
            <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-10 mb-14">
              <div className="flex items-center gap-x-10">
                <Badge tone="blue">میزبان</Badge>
                <Avatar url={data.residence.host?.avatarUrl ?? null} name={data.residence.host?.name ?? null} />
                {data.residence.host ? (
                  <Link
                    href={`/admin/users/${data.residence.host.id}`}
                    className="text-14 font-m text-primary-dark"
                  >
                    {data.residence.host.name ?? data.residence.host.phone}
                  </Link>
                ) : (
                  <span className="text-14 text-gray-9B9BAA">—</span>
                )}
              </div>
              {data.hostAnswerStatus ? (
                <Badge tone={PART_STATUS[data.hostAnswerStatus]?.tone ?? "gray"}>
                  {PART_STATUS[data.hostAnswerStatus]?.label ?? data.hostAnswerStatus}
                </Badge>
              ) : (
                <Badge tone="gray">بدون پاسخ</Badge>
              )}
            </div>

            <label className="block text-11 text-gray-9B9BAA mb-4">متن پاسخ میزبان</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              placeholder="میزبان هنوز پاسخی ننوشته — می‌توانید از اینجا برایش ثبت کنید."
              className="w-full rounded-10 border border-gray-E5E5E6 px-14 py-12 text-13 leading-24 outline-none focus:border-primary-main resize-y"
            />

            <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-10 mt-12">
              <label className="flex items-center gap-x-8 text-13 text-gray-6C6A7D">
                <Toggle
                  checked={data.hostAnswerStatus === "PUBLISHED"}
                  onChange={(v) => (v ? setAnswerStatus("PUBLISHED") : setRejecting("answer"))}
                />
                نمایش پاسخ
              </label>

              {answerDirty && (
                <div className="flex items-center gap-x-8">
                  <Button variant="secondary" onClick={() => setAnswer(data.hostAnswer ?? "")}>
                    بازگردانی
                  </Button>
                  <Button
                    disabled={busy === "edit-answer" || !answer.trim()}
                    onClick={() =>
                      run(
                        "edit-answer",
                        () =>
                          apiFetch(`/api/admin/reviews/${id}/answer`, {
                            method: "PUT",
                            body: JSON.stringify({ answer: answer.trim() }),
                          }),
                        "پاسخ میزبان ذخیره شد"
                      )
                    }
                  >
                    ذخیره پاسخ
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* The same panel as the reservation page, keyed by the same booking.
              A review is about one stay, and a call made about the review is a
              call about that stay — putting it on a second timeline would mean
              support has two places to look for the same conversation. */}
          {!!data.reservation && <CallAndNotePanel reservationId={data.reservation.id} />}
        </div>

        {/* ---------- the rail ---------- */}
        <div className="flex flex-col gap-y-10 lg:sticky lg:top-[76px]">
          <Card className="p-14">
            <Badge tone={STATUS[data.status]?.tone ?? "gray"}>
              {STATUS[data.status]?.label ?? data.status}
            </Badge>

            <div className="flex flex-col gap-y-8 mt-12">
              <Button
                variant="secondary"
                disabled={busy === "notify-guest" || data.commentStatus !== "PUBLISHED"}
                title={
                  data.commentStatus !== "PUBLISHED"
                    ? "تا وقتی نظر منتشر نشده نمی‌شود به مهمان خبر داد"
                    : undefined
                }
                onClick={() => notify("guest")}
              >
                به مهمان بگو نظرت تأییده
              </Button>
              <Button
                disabled={busy === "notify-host" || data.hostAnswerStatus !== "PUBLISHED"}
                title={
                  data.hostAnswerStatus !== "PUBLISHED"
                    ? "تا وقتی پاسخ منتشر نشده نمی‌شود به میزبان خبر داد"
                    : undefined
                }
                onClick={() => notify("host")}
              >
                به میزبان بگو نظرت تأییده
              </Button>
            </div>

            {!!message && (
              <p
                className={`mt-12 text-12 leading-20 ${
                  message.tone === "ok" ? "text-[#2E7D32]" : "text-[#C62828]"
                }`}
              >
                {message.text}
              </p>
            )}
          </Card>

          <Card className="p-14">
            <p className="text-12 leading-20 text-gray-6C6A7D mb-2">اقامتگاه</p>
            <Link
              href={`/admin/residences/${data.residence.publicId ?? data.residence.id}`}
              className="text-13 leading-22 font-m text-primary-dark"
            >
              {data.residence.name}
            </Link>
            <p className="text-11 leading-18 text-gray-9B9BAA mt-6">
              ثبت نظر : {jalaliShort(data.createdAt)}
            </p>
          </Card>
        </div>
      </div>

      {/* Rejecting needs a reason; approving does not. Months later "why is
          this review not on the site" is the only question anyone asks. */}
      {rejecting && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-16">
          <Card className="p-20 w-full max-w-[420px]">
            <h3 className="text-15 leading-24 font-m text-black mb-8">
              {rejecting === "comment" ? "رد کردن نظر مهمان" : "رد کردن پاسخ میزبان"}
            </h3>
            <p className="text-12 leading-20 text-gray-6C6A7D mb-12">
              متن حذف نمی‌شود — فقط از سایت برداشته می‌شود و دلیلش ثبت می‌ماند.
            </p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="دلیل"
              className="w-full rounded-10 border border-gray-E5E5E6 px-12 py-10 text-13 leading-22 outline-none focus:border-primary-main resize-none"
            />
            <div className="flex items-center justify-end gap-x-10 mt-14">
              <Button
                variant="secondary"
                onClick={() => {
                  setRejecting(null);
                  setRejectNote("");
                }}
              >
                انصراف
              </Button>
              <Button
                variant="danger"
                disabled={!rejectNote.trim()}
                onClick={async () => {
                  const part = rejecting;
                  const note = rejectNote.trim();
                  setRejecting(null);
                  setRejectNote("");
                  if (part === "comment") await setCommentStatus("REJECTED", note);
                  else await setAnswerStatus("REJECTED", note);
                }}
              >
                رد کن
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
