import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import Image from "next/image";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetchPaginated, apiFetch } from "@/api/Admin/adminApi";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Skeleton,
  TabPills,
  Toolbar,
  ToolbarPager,
  ToolbarSearch,
  ViewSwitch,
  adminImageUrl,
  faNum,
  type Tone,
} from "@/components/Admin/ui";
import { jalaliShort } from "@/components/Admin/JalaliDate";

/**
 * نظرات — the moderation queue.
 *
 * The sidebar has linked here since the panel was built; the page never
 * existed, so the link 404'd.
 *
 * ## Why the default order is not "newest"
 *
 * A review carries two things that get approved separately — what the guest
 * wrote and what the host wrote back — and the state worth acting on first is
 * neither of their timestamps. It is «نظر مهمان منتشر شده و میزبان تازه جواب
 * داده»: the review is live on the listing, the reply is not, so right now the
 * page shows a complaint with nothing under it. Those sort to the top.
 *
 * ## The «پاسخ میزبان» column
 *
 * It sits where the listing name used to. The name is one tap away on every
 * row and rarely what the reader is deciding on; whether the host has replied
 * — and what they said — is the entire question this page exists to answer.
 * The listing is still on the row, as its tooltip and its link.
 */

const PAGE_SIZE = 20;

type Tab = "all" | "pending" | "published" | "rejected" | "low";
type ViewMode = "list" | "cards";

const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "در انتظار بررسی" },
  { key: "all", label: "همه" },
  { key: "published", label: "منتشر شده" },
  { key: "low", label: "کم‌امتیاز" },
  { key: "rejected", label: "رد شده" },
];

const STATUS: Record<string, { label: string; tone: Tone }> = {
  AWAITING_HOST_ANSWER_APPROVAL: { label: "در انتظار تایید نظر میزبان", tone: "yellow" },
  AWAITING_GUEST_COMMENT_APPROVAL: { label: "در انتظار تایید نظر مهمان", tone: "yellow" },
  AWAITING_BOTH: { label: "در انتظار تایید", tone: "yellow" },
  PUBLISHED: { label: "منتشر شده", tone: "green" },
  REJECTED: { label: "رد شده", tone: "red" },
};

interface ReviewRow {
  id: number;
  averageRating: number;
  comment: string;
  hostAnswer: string | null;
  status: keyof typeof STATUS;
  createdAt: string;
  guest: { id: number; name: string | null; phone: string; avatarUrl: string | null };
  reservation: { id: number; reference: string; startDate: string; endDate: string } | null;
  residence: {
    id: number;
    name: string;
    reference: string | null;
    host: { id: number; name: string | null; phone: string; avatarUrl: string | null } | null;
  };
}

/** One star and a number — the table has no room for five glyphs per row. */
function RatingCell({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-x-4">
      <i className="icon-Star text-14 text-[#FFC120]" />
      <span className="text-13 text-black">{faNum(Math.round(value * 10) / 10)}</span>
    </span>
  );
}

function Avatar({ url, name, size = 32 }: { url: string | null; name: string | null; size?: number }) {
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
      className="rounded-full bg-gray-F0F0F0 text-gray-6C6A7D flex items-center justify-center shrink-0 text-12"
      style={{ width: size, height: size }}
    >
      {(name ?? "؟").trim().charAt(0)}
    </span>
  );
}

export default function AdminCommentsPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [selected, setSelected] = useState<number[]>([]);

  const key = `/api/admin/reviews?tab=${tab}&page=${page}&pageSize=${PAGE_SIZE}${
    q ? `&q=${encodeURIComponent(q)}` : ""
  }`;

  const { data, isLoading, mutate } = useSWR(key, (p: string) =>
    apiFetchPaginated<ReviewRow>(p)
  );
  const { data: counts } = useSWR("/api/admin/reviews/tab-counts", (p: string) =>
    apiFetch<Record<Tab, number>>(p)
  );

  const rows = data?.items ?? [];
  const meta = data?.meta;

  function toggle(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  /** Approve every selected comment at once — the common case on this page. */
  async function bulkPublish() {
    for (const id of selected) {
      await apiFetch(`/api/admin/reviews/${id}/comment-status`, {
        method: "POST",
        body: JSON.stringify({ status: "PUBLISHED" }),
      }).catch(() => undefined);
    }
    setSelected([]);
    mutate();
  }

  return (
    <AdminLayout
      title="نظرات"
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link> / نظرات
        </>
      }
      toolbar={
        <Toolbar>
          <ToolbarSearch
            value={q}
            onChange={(v) => {
              setQ(v);
              setPage(1);
            }}
            placeholder="متن نظر، مهمان، اقامتگاه…"
          />
          <ViewSwitch value={view} onChange={(v) => setView(v as ViewMode)} />
          {!!meta && (
            <ToolbarPager
              page={meta.page}
              pageSize={meta.pageSize}
              pageCount={meta.pageCount}
              total={meta.total}
              onPage={setPage}
            />
          )}
        </Toolbar>
      }
    >
      {/* The server declines "action" order above its cap and says so. A page
          that quietly shows a different order than the one it offers is worse
          than one that admits it. */}
      {(meta as { sortedBy?: string } | undefined)?.sortedBy === "newest" && (
        <p className="mb-10 text-12 leading-20 text-gray-9B9BAA">
          تعداد نتایج زیاد است، پس به‌جای «اول آنچه نیاز به بررسی دارد» بر اساس جدیدترین مرتب شده.
          برای دیدن صف بررسی، تب «در انتظار بررسی» را باز کنید.
        </p>
      )}

      <TabPills
        tabs={TABS}
        value={tab}
        counts={counts as Record<string, number> | undefined}
        onChange={(t) => {
          setTab(t);
          setPage(1);
          setSelected([]);
        }}
      />

      {selected.length > 0 && (
        <Card className="px-16 py-12 mb-12 flex items-center justify-between gap-x-12 flex-wrap gap-y-8">
          <span className="text-13 text-black">
            <b>{faNum(selected.length)}</b> نظر انتخاب شده
          </span>
          <div className="flex items-center gap-x-8">
            <Button onClick={bulkPublish}>تایید و انتشار</Button>
            <Button variant="secondary" onClick={() => setSelected([])}>
              پاک کردن انتخاب
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-[420px]" />
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState text="نظری با این فیلتر پیدا نشد" />
        </Card>
      ) : view === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {rows.map((r) => (
            <Card key={r.id} className="p-16 flex flex-col">
              <div className="flex items-start justify-between mb-8">
                <Checkbox checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />
                <Badge tone={STATUS[r.status]?.tone ?? "gray"}>
                  {STATUS[r.status]?.label ?? r.status}
                </Badge>
              </div>

              <div className="flex flex-col items-center text-center mb-10">
                <Avatar url={r.guest.avatarUrl} name={r.guest.name} size={72} />
                <p className="mt-8 text-15 leading-24 font-m text-black">
                  {r.guest.name ?? r.guest.phone}
                </p>
                <div className="mt-2">
                  <RatingCell value={r.averageRating} />
                </div>
                {!!r.reservation && (
                  <p className="mt-4 text-12 leading-20 text-gray-9B9BAA">
                    تاریخ سفر : {jalaliShort(r.reservation.startDate)}
                  </p>
                )}
              </div>

              <p className="text-13 leading-24 text-black line-clamp-4 grow">{r.comment}</p>

              <Link href={`/admin/comments/${r.id}`} className="mt-14">
                <Button className="w-full">مشاهده جزئیات</Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-13 min-w-[900px]">
            <thead>
              <tr className="bg-[#2C3654] text-white text-right">
                <th className="px-12 py-12 w-40">
                  <Checkbox
                    checked={selected.length === rows.length && rows.length > 0}
                    indeterminate={selected.length > 0}
                    onChange={(next) => setSelected(next ? rows.map((r) => r.id) : [])}
                  />
                </th>
                <th className="px-12 py-12 font-m">مهمان</th>
                <th className="px-12 py-12 font-m">متن نظر</th>
                <th className="px-12 py-12 font-m">امتیاز</th>
                <th className="px-12 py-12 font-m">میزبان</th>
                <th className="px-12 py-12 font-m">تاریخ سفر</th>
                <th className="px-12 py-12 font-m">پاسخ میزبان</th>
                <th className="px-12 py-12 font-m">وضعیت</th>
                <th className="px-12 py-12 w-80" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  title={r.residence.name}
                  className="border-b border-gray-F0F0F0 last:border-0 hover:bg-gray-F9F9FB"
                >
                  <td className="px-12 py-12">
                    <Checkbox checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />
                  </td>
                  <td className="px-12 py-12">
                    <Link
                      href={`/admin/users/${r.guest.id}`}
                      className="text-primary-dark font-m whitespace-nowrap"
                    >
                      {r.guest.name ?? r.guest.phone}
                    </Link>
                  </td>
                  <td className="px-12 py-12 max-w-[260px]">
                    <p className="line-clamp-2 text-black leading-22">{r.comment}</p>
                  </td>
                  <td className="px-12 py-12">
                    <RatingCell value={r.averageRating} />
                  </td>
                  <td className="px-12 py-12">
                    {r.residence.host ? (
                      <Link
                        href={`/admin/users/${r.residence.host.id}`}
                        className="text-primary-dark whitespace-nowrap"
                      >
                        {r.residence.host.name ?? r.residence.host.phone}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-12 py-12 whitespace-nowrap text-gray-6C6A7D">
                    {r.reservation ? jalaliShort(r.reservation.startDate) : "—"}
                  </td>
                  {/* Replaces the listing-name column: whether the host has
                      replied is the decision this page is for. */}
                  <td className="px-12 py-12 max-w-[240px]">
                    {r.hostAnswer ? (
                      <p className="line-clamp-2 text-gray-6C6A7D leading-22">{r.hostAnswer}</p>
                    ) : (
                      <span className="text-gray-9B9BAA">بدون پاسخ</span>
                    )}
                  </td>
                  <td className="px-12 py-12">
                    <Badge tone={STATUS[r.status]?.tone ?? "gray"}>
                      {STATUS[r.status]?.label ?? r.status}
                    </Badge>
                  </td>
                  <td className="px-12 py-12">
                    <Link
                      href={`/admin/comments/${r.id}`}
                      title="مشاهده و ویرایش"
                      className="text-primary-dark"
                    >
                      <i className="icon-Edit text-18" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </AdminLayout>
  );
}
