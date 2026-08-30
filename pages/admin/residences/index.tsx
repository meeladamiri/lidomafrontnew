import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch, apiFetchPaginated, getToken } from "@/api/Admin/adminApi";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  Modal,
  RowMenu,
  Select,
  SelectionBar,
  Skeleton,
  Stars,
  TabPills,
  Toolbar,
  ToolbarButton,
  ToolbarIconButton,
  ToolbarPager,
  ToolbarSearch,
  ViewSwitch,
  adminImageUrl,
  faDate,
  faMoney,
  faId,
  faNum,
  type ViewMode,
} from "@/components/Admin/ui";

interface ResidenceRow {
  id: number;
  publicId: number;
  reference: string | null;
  name: string;
  type: "SUIT" | "BOOMGARDI" | "HOTEL";
  state: string;
  published: boolean;
  address: string | null;
  weekPrice: number | null;
  averageRating: number;
  reviewsCount: number;
  maxCapacity: number | null;
  roomsCount: number;
  createdAt: string;
  updatedAt: string;
  host: { id: number; name: string | null; phone: string } | null;
  city: { name: string; province: { name: string } | null } | null;
  images: { url: string }[];
}

type Tab = "all" | "suit" | "boomgardi" | "hotel" | "pending";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "همه اقامتگاه‌ها" },
  { key: "suit", label: "ویلا و سوئیت" },
  { key: "boomgardi", label: "بوم‌گردی‌ها" },
  { key: "hotel", label: "هتل‌ها" },
  { key: "pending", label: "در انتظار تایید" },
];

// "نوع ملک" — the residence category (Odoo x_display_type)
const TYPE_LABEL: Record<string, string> = {
  SUIT: "ویلا و سوئیت",
  BOOMGARDI: "بوم‌گردی",
  HOTEL: "هتل",
};
const TYPE_ICON: Record<string, string> = {
  SUIT: "icon-Suite",
  BOOMGARDI: "icon-Boomgardi",
  HOTEL: "icon-Hotel",
};
const TYPE_TONE: Record<string, "blue" | "green" | "purple"> = {
  SUIT: "blue",
  BOOMGARDI: "green",
  HOTEL: "purple",
};

const STATE: Record<string, { label: string; tone: "green" | "yellow" | "red" | "gray" }> = {
  PUBLISHED: { label: "فعال", tone: "green" },
  PENDING: { label: "در انتظار", tone: "yellow" },
  DRAFT: { label: "پیش‌نویس", tone: "gray" },
  REJECTED: { label: "رد شده", tone: "red" },
  DEACTIVATED: { label: "غیرفعال", tone: "red" },
  DELETED: { label: "حذف شده", tone: "gray" },
};

export default function AdminResidencesPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState("newest");
  const [state, setState] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const query = new URLSearchParams({
    page: String(page),
    pageSize: "20",
    tab,
    sort,
    ...(q ? { q } : {}),
    ...(state ? { state } : {}),
  });

  const { data, isLoading, mutate } = useSWR(
    `/api/admin/residences?${query.toString()}`,
    (path: string) => apiFetchPaginated<ResidenceRow>(path)
  );
  const { data: counts, mutate: mutateCounts } = useSWR<Record<Tab, number>>(
    "/api/admin/residences/tab-counts",
    (path: string) => apiFetch<Record<Tab, number>>(path)
  );

  const rows = data?.items ?? [];
  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  function toggleRow(id: number, next: boolean) {
    setSelected((s) => (next ? [...s, id] : s.filter((x) => x !== id)));
  }

  function toggleAll(next: boolean) {
    setSelected(next ? rows.map((r) => r.id) : []);
  }

  function refreshAll() {
    mutate();
    mutateCounts();
    setSelected([]);
  }

  async function bulk(path: string, body: Record<string, unknown> = {}) {
    await apiFetch(`/api/admin/residences/bulk/${path}`, {
      method: "POST",
      body: JSON.stringify({ ids: selected, ...body }),
    });
    refreshAll();
  }

  // CSV comes back as a file body, so this bypasses apiFetch's JSON parsing.
  async function exportSelection() {
    const res = await fetch("/api/admin/residences/bulk/export", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ ids: selected }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "residences.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function setType(ids: number[], type: string) {
    await apiFetch("/api/admin/residences/bulk/type", {
      method: "POST",
      body: JSON.stringify({ ids, type }),
    });
    refreshAll();
  }

  function rowMenuItems(r: ResidenceRow) {
    // "نوع ملک" entries — only the types this residence is not already set to
    const typeItems = (["SUIT", "BOOMGARDI", "HOTEL"] as const)
      .filter((t) => t !== r.type)
      .map((t) => ({
        icon: TYPE_ICON[t],
        label: `تغییر به ${TYPE_LABEL[t]}`,
        onClick: () => setType([r.id], t),
      }));

    return [
      ...typeItems,
      {
        icon: "icon-Download",
        label: "خروجی فایل",
        onClick: async () => {
          setSelected([r.id]);
          await exportSelection();
        },
      },
      {
        icon: "icon-Copy",
        label: "کپی اقامتگاه",
        onClick: async () => {
          await apiFetch("/api/admin/residences/bulk/copy", {
            method: "POST",
            body: JSON.stringify({ ids: [r.id] }),
          });
          refreshAll();
        },
      },
      {
        icon: "icon-Power",
        label: r.state === "PUBLISHED" ? "غیرفعال‌سازی" : "فعال‌سازی",
        onClick: async () => {
          await apiFetch("/api/admin/residences/bulk/state", {
            method: "POST",
            body: JSON.stringify({
              ids: [r.id],
              state: r.state === "PUBLISHED" ? "DEACTIVATED" : "PUBLISHED",
            }),
          });
          refreshAll();
        },
      },
      {
        icon: "icon-Delete",
        label: "حذف",
        danger: true,
        onClick: () => {
          setSelected([r.id]);
          setConfirmDelete(true);
        },
      },
    ];
  }

  return (
    <AdminLayout
      title="مدیریت اقامتگاه‌ها"
      breadcrumb={<Link href="/admin">داشبورد</Link>}
      actions={
        <>
          <Link href="/admin/residences/new">
            <Button>
              <i className="icon-Plus text-16" /> ایجاد اقامتگاه جدید
            </Button>
          </Link>
          <TabPills
            tabs={TABS}
            value={tab}
            counts={counts}
            onChange={(t) => {
              setTab(t);
              setPage(1);
              setSelected([]);
            }}
          />
        </>
      }
      toolbar={
        <Toolbar>
          <div className="flex items-center gap-x-8 flex-1 min-w-[240px]">
            <ToolbarSearch
              value={q}
              onChange={(v) => {
                setQ(v);
                setPage(1);
              }}
              placeholder="نام اقامتگاه، کد، نام یا شماره میزبان..."
            />
            <ToolbarButton
              icon="icon-Filters"
              label="فیلترها"
              active={showFilters || !!state}
              onClick={() => setShowFilters((s) => !s)}
            />
            <ToolbarButton icon="icon-Rows-Sorting" label="گروه بندی" />
          </div>

          <div className="flex items-center gap-x-8">
            <ToolbarIconButton icon="icon-Refresh" label="بارگذاری مجدد" onClick={refreshAll} />
            {data && (
              <ToolbarPager
                page={page}
                pageSize={20}
                total={data.meta.total}
                pageCount={data.meta.pageCount}
                onPage={(p) => {
                  setPage(p);
                  setSelected([]);
                }}
              />
            )}
            <ViewSwitch value={view} onChange={setView} />
          </div>
        </Toolbar>
      }
    >
      <div className="flex flex-col gap-y-16">
        {showFilters && (
          <Card className="p-16 flex items-end gap-x-12 gap-y-12 flex-wrap">
            <Field label="وضعیت">
              <Select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">همه</option>
                {Object.entries(STATE).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="مرتب‌سازی">
              <Select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">جدیدترین</option>
                <option value="oldest">قدیمی‌ترین</option>
                <option value="importance">اهمیت اقامتگاه</option>
                <option value="rating">بیشترین امتیاز</option>
                <option value="price_asc">ارزان‌ترین</option>
                <option value="price_desc">گران‌ترین</option>
              </Select>
            </Field>
            {!!state && (
              <Button
                variant="ghost"
                onClick={() => {
                  setState("");
                  setPage(1);
                }}
              >
                حذف فیلترها
              </Button>
            )}
          </Card>
        )}

        {isLoading && (
          <div className="grid gap-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[64px]" />
            ))}
          </div>
        )}

        {data && rows.length === 0 && (
          <Card>
            <EmptyState text="اقامتگاهی با این فیلترها پیدا نشد" />
          </Card>
        )}

        {/* list view */}
        {rows.length > 0 && view === "list" && (
          <Card className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-263341 text-white text-12 leading-18">
                  <th className="px-16 py-12 w-40">
                    <Checkbox checked={allSelected} onChange={toggleAll} label="انتخاب همه" />
                  </th>
                  <th className="px-16 py-12 font-m">نام اقامتگاه</th>
                  <th className="px-16 py-12 font-m">کد</th>
                  <th className="px-16 py-12 font-m">نوع ملک</th>
                  <th className="px-16 py-12 font-m">تاریخ ایجاد</th>
                  <th className="px-16 py-12 font-m">قیمت</th>
                  <th className="px-16 py-12 font-m">میزبان</th>
                  <th className="px-16 py-12 font-m">شماره میزبان</th>
                  <th className="px-16 py-12 font-m">آخرین بروزرسانی</th>
                  <th className="px-16 py-12 font-m">آدرس</th>
                  <th className="px-16 py-12 font-m">وضعیت</th>
                  <th className="px-16 py-12 w-40" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-F0F0F0">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-F5F5F7 transition align-middle">
                    <td className="px-16 py-12">
                      <Checkbox
                        checked={selected.includes(r.id)}
                        onChange={(next) => toggleRow(r.id, next)}
                        label={`انتخاب ${r.name}`}
                      />
                    </td>
                    <td className="px-16 py-12 max-w-[220px]">
                      <Link
                        href={`/admin/residences/${r.id}`}
                        className="text-14 leading-20 text-black line-clamp-2 hover:text-primary-dark"
                      >
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-16 py-12 text-13 text-gray-6C6A7D whitespace-nowrap">
                      {faId(r.publicId)}
                    </td>
                    <td className="px-16 py-12">
                      <Badge tone={TYPE_TONE[r.type]}>{TYPE_LABEL[r.type]}</Badge>
                    </td>
                    <td className="px-16 py-12 text-13 text-gray-6C6A7D whitespace-nowrap">
                      {faDate(r.createdAt)}
                    </td>
                    <td className="px-16 py-12 text-13 whitespace-nowrap">{faMoney(r.weekPrice)}</td>
                    <td className="px-16 py-12 text-13 whitespace-nowrap">
                      {r.host ? (
                        <Link href={`/admin/users/${r.host.id}`} className="text-primary-dark">
                          {r.host.name ?? "بدون نام"}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-16 py-12 text-13 text-gray-6C6A7D whitespace-nowrap">
                      {r.host?.phone ?? "-"}
                    </td>
                    <td className="px-16 py-12 text-13 text-gray-6C6A7D whitespace-nowrap">
                      {faDate(r.updatedAt)}
                    </td>
                    <td className="px-16 py-12 text-13 text-gray-6C6A7D max-w-[220px]">
                      <span className="line-clamp-2">
                        {[r.city?.province?.name, r.city?.name, r.address]
                          .filter(Boolean)
                          .join("، ") || "-"}
                      </span>
                    </td>
                    <td className="px-16 py-12">
                      <Badge tone={STATE[r.state]?.tone ?? "gray"}>
                        {STATE[r.state]?.label ?? r.state}
                      </Badge>
                    </td>
                    <td className="px-16 py-12">
                      <RowMenu items={rowMenuItems(r)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* card view */}
        {rows.length > 0 && view === "cards" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16">
            {rows.map((r) => {
              const isSelected = selected.includes(r.id);
              return (
                <Card
                  key={r.id}
                  className={`overflow-hidden transition ${
                    isSelected ? "ring-2 ring-primary-main border-primary-main" : ""
                  }`}
                >
                  <div className="relative h-[150px] bg-gray-F0F0F0">
                    {!!r.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={adminImageUrl(r.images[0].url)}
                        alt={r.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <span className="absolute top-10 right-10 bg-white/90 rounded-6 p-4 leading-none">
                      <Checkbox
                        checked={isSelected}
                        onChange={(next) => toggleRow(r.id, next)}
                        label={`انتخاب ${r.name}`}
                      />
                    </span>
                    <span className="absolute top-10 left-10">
                      <RowMenu items={rowMenuItems(r)} />
                    </span>
                  </div>

                  <div className="p-14 flex flex-col gap-y-8">
                    <Link
                      href={`/admin/residences/${r.id}`}
                      className="text-14 leading-22 text-black line-clamp-2 hover:text-primary-dark"
                    >
                      {r.name}
                    </Link>

                    <div className="flex items-center justify-between">
                      <span className="text-12 text-gray-6C6A7D bg-gray-F5F5F7 rounded-6 px-8 py-4">
                        کد اقامتگاه: {faId(r.publicId)}
                      </span>
                      <Badge tone={STATE[r.state]?.tone ?? "gray"}>
                        {STATE[r.state]?.label ?? r.state}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <Stars value={r.averageRating} count={r.reviewsCount} />
                      {!!r.maxCapacity && (
                        <span className="text-12 text-gray-6C6A7D">
                          تا {faNum(r.maxCapacity)} نفر
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-12 text-gray-6C6A7D">
                      <span className="inline-flex items-center gap-x-4">
                        <i className="icon-Phone text-14" />
                        {r.host?.phone ?? "-"}
                      </span>
                      <span className="truncate">میزبان: {r.host?.name ?? "-"}</span>
                    </div>

                    <div className="inline-flex items-center gap-x-6 text-13 text-black">
                      <i className="icon-Information text-14 text-primary-dark" />
                      قیمت: {faMoney(r.weekPrice)}
                    </div>

                    <Link href={`/admin/residences/${r.id}`} className="mt-4">
                      <Button className="w-full">مشاهده جزئیات</Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <SelectionBar
        count={selected.length}
        onClear={() => setSelected([])}
        actions={[
          { icon: "icon-Download", label: "خروجی به فایل", onClick: exportSelection },
          { icon: "icon-Delete", label: "حذف", danger: true, onClick: () => setConfirmDelete(true) },
          { icon: "icon-Copy", label: "کپی", onClick: () => bulk("copy") },
          {
            icon: "icon-Block",
            label: "غیرفعال‌سازی",
            onClick: () => bulk("state", { state: "DEACTIVATED" }),
          },
          {
            icon: TYPE_ICON.SUIT,
            label: "تغییر نوع به ویلا و سوئیت",
            onClick: () => setType(selected, "SUIT"),
          },
          {
            icon: TYPE_ICON.BOOMGARDI,
            label: "تغییر نوع به بوم‌گردی",
            onClick: () => setType(selected, "BOOMGARDI"),
          },
          {
            icon: TYPE_ICON.HOTEL,
            label: "تغییر نوع به هتل",
            onClick: () => setType(selected, "HOTEL"),
          },
        ]}
      />

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="حذف اقامتگاه"
        width="max-w-[420px]"
      >
        <p className="text-14 leading-24 text-black mb-16">
          مطمئنی می‌خوای {faNum(selected.length)} اقامتگاه انتخاب‌شده رو حذف کنی؟ سابقه رزروها حفظ
          می‌شه.
        </p>
        <div className="flex items-center gap-x-10 justify-end">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            انصراف
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              await bulk("delete");
              setConfirmDelete(false);
            }}
          >
            آره، حذف کن
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
