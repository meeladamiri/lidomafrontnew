import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch, apiFetchPaginated } from "@/api/Admin/adminApi";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  Select,
  Skeleton,
  Toggle,
  faDate,
  faNum,
} from "@/components/Admin/ui";

interface UserRow {
  id: number;
  phone: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  isHost: boolean;
  isActive: boolean;
  isSpecialHost: boolean;
  role: "USER" | "ADMIN";
  verificationStatus: "NOT_CONFIRMED" | "CHECKING" | "CONFIRMED";
  createdAt: string;
  reservationsCount: number;
  residencesCount: number;
  yellowCardsCount: number;
  lastReservationAt: string | null;
}

type Tab = "all" | "hosts" | "guests" | "admins";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "همه کاربران" },
  { key: "hosts", label: "میزبان‌ها" },
  { key: "guests", label: "مهمان‌ها" },
  { key: "admins", label: "ادمین‌ها" },
];

const VERIFICATION: Record<UserRow["verificationStatus"], { label: string; tone: "green" | "yellow" | "gray" }> = {
  CONFIRMED: { label: "تایید شده", tone: "green" },
  CHECKING: { label: "در حال بررسی", tone: "yellow" },
  NOT_CONFIRMED: { label: "تایید نشده", tone: "gray" },
};

function UserBadges({ u }: { u: UserRow }) {
  return (
    <div className="flex items-center gap-x-6 flex-wrap gap-y-4">
      <Badge tone={u.isHost ? "green" : "gray"}>{u.isHost ? "میزبان" : "مهمان"}</Badge>
      {u.role === "ADMIN" && <Badge tone="purple">ادمین</Badge>}
      {u.isSpecialHost && <Badge tone="blue">میزبان ویژه</Badge>}
      {!u.isActive && <Badge tone="red">غیرفعال</Badge>}
      {u.yellowCardsCount > 0 && <Badge tone="yellow">{faNum(u.yellowCardsCount)} کارت زرد</Badge>}
    </div>
  );
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState("newest");
  const [verification, setVerification] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [view, setView] = useState<"list" | "cards">("list");
  const [showCreate, setShowCreate] = useState(false);

  const query = new URLSearchParams({
    page: String(page),
    pageSize: "20",
    tab,
    sort,
    ...(q ? { q } : {}),
    ...(verification ? { verificationStatus: verification } : {}),
    ...(activeFilter ? { isActive: activeFilter } : {}),
  });

  const { data, isLoading, mutate } = useSWR(`/api/admin/users?${query.toString()}`, (path: string) =>
    apiFetchPaginated<UserRow>(path)
  );
  const { data: counts, mutate: mutateCounts } = useSWR<Record<Tab, number>>(
    "/api/admin/users/tab-counts",
    (path: string) => apiFetch<Record<Tab, number>>(path)
  );

  async function patchUser(id: number, body: Record<string, unknown>) {
    await apiFetch(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    mutate();
    mutateCounts();
  }

  function switchTab(next: Tab) {
    setTab(next);
    setPage(1);
  }

  return (
    <AdminLayout
      title="مدیریت کاربران"
      breadcrumb={<Link href="/admin">داشبورد</Link>}
      actions={<Button onClick={() => setShowCreate(true)}>+ ایجاد کاربر جدید</Button>}
    >
      <div className="flex flex-col gap-y-16">
        {/* tabs */}
        <div className="flex items-center gap-x-8 flex-wrap gap-y-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              aria-pressed={tab === t.key}
              className={`px-14 py-8 rounded-10 text-14 leading-20 font-m transition ${
                tab === t.key
                  ? "bg-primary-main text-white"
                  : "bg-white text-gray-6C6A7D border border-gray-E5E5E6 hover:bg-gray-F0F0F0"
              }`}
            >
              {t.label}
              {counts && (
                <span className="mr-6 opacity-80">({faNum(counts[t.key] ?? 0)})</span>
              )}
            </button>
          ))}
        </div>

        {/* toolbar */}
        <Card className="p-16 flex items-end gap-x-12 gap-y-12 flex-wrap">
          <Field label="جستجو" className="flex-1 min-w-[220px]">
            <Input
              placeholder="نام، موبایل، ایمیل یا کد ملی..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </Field>
          <Field label="احراز هویت">
            <Select
              value={verification}
              onChange={(e) => {
                setVerification(e.target.value);
                setPage(1);
              }}
            >
              <option value="">همه</option>
              <option value="CONFIRMED">تایید شده</option>
              <option value="CHECKING">در حال بررسی</option>
              <option value="NOT_CONFIRMED">تایید نشده</option>
            </Select>
          </Field>
          <Field label="وضعیت">
            <Select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">همه</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </Select>
          </Field>
          <Field label="مرتب‌سازی">
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">جدیدترین</option>
              <option value="oldest">قدیمی‌ترین</option>
              <option value="reservations">بیشترین رزرو</option>
              <option value="name">نام</option>
            </Select>
          </Field>
          <div className="flex items-center gap-x-4 bg-gray-F0F0F0 rounded-10 p-4">
            <button
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              title="نمایش لیست"
              className={`px-12 py-6 rounded-8 text-14 ${view === "list" ? "bg-white" : ""}`}
            >
              ☰
            </button>
            <button
              onClick={() => setView("cards")}
              aria-pressed={view === "cards"}
              title="نمایش کارتی"
              className={`px-12 py-6 rounded-8 text-14 ${view === "cards" ? "bg-white" : ""}`}
            >
              ▦
            </button>
          </div>
        </Card>

        {isLoading && (
          <div className="grid gap-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[64px]" />
            ))}
          </div>
        )}

        {data && data.items.length === 0 && (
          <Card>
            <EmptyState text="کاربری با این فیلترها پیدا نشد" />
          </Card>
        )}

        {data && data.items.length > 0 && view === "list" && (
          <Card className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-F5F5F7 text-12 leading-18 text-gray-6C6A7D">
                  <th className="px-16 py-12 font-m">کاربر</th>
                  <th className="px-16 py-12 font-m">شماره تماس</th>
                  <th className="px-16 py-12 font-m">رزروها</th>
                  <th className="px-16 py-12 font-m">آخرین رزرو</th>
                  <th className="px-16 py-12 font-m">عضویت</th>
                  <th className="px-16 py-12 font-m">احراز هویت</th>
                  <th className="px-16 py-12 font-m">ماهیت</th>
                  <th className="px-16 py-12 font-m">فعال</th>
                  <th className="px-16 py-12 font-m"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-F0F0F0">
                {data.items.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-F5F5F7 transition">
                    <td className="px-16 py-12">
                      <Link href={`/admin/users/${u.id}`} className="flex items-center gap-x-10">
                        <span className="w-32 h-32 rounded-full bg-gray-F0F0F0 flex items-center justify-center text-12 shrink-0">
                          {u.name?.[0] ?? "؟"}
                        </span>
                        <span className="text-14 leading-20 text-black">{u.name ?? "بدون نام"}</span>
                      </Link>
                    </td>
                    <td className="px-16 py-12 text-14 text-gray-6C6A7D">{u.phone}</td>
                    <td className="px-16 py-12 text-14">{faNum(u.reservationsCount)}</td>
                    <td className="px-16 py-12 text-14 text-gray-6C6A7D">
                      {faDate(u.lastReservationAt)}
                    </td>
                    <td className="px-16 py-12 text-14 text-gray-6C6A7D">{faDate(u.createdAt)}</td>
                    <td className="px-16 py-12">
                      <Badge tone={VERIFICATION[u.verificationStatus].tone}>
                        {VERIFICATION[u.verificationStatus].label}
                      </Badge>
                    </td>
                    <td className="px-16 py-12">
                      <UserBadges u={u} />
                    </td>
                    <td className="px-16 py-12">
                      <Toggle
                        checked={u.isActive}
                        onChange={(next) => patchUser(u.id, { isActive: next })}
                      />
                    </td>
                    <td className="px-16 py-12">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-14 font-m text-primary-dark whitespace-nowrap"
                      >
                        مشاهده جزئیات ←
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {data && data.items.length > 0 && view === "cards" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16">
            {data.items.map((u) => (
              <Card key={u.id} className="p-16 flex flex-col items-center text-center gap-y-10">
                <span className="w-64 h-64 rounded-full bg-gray-F0F0F0 flex items-center justify-center text-20">
                  {u.name?.[0] ?? "؟"}
                </span>
                <div>
                  <p className="text-14 leading-20 font-m text-black">{u.name ?? "بدون نام"}</p>
                  <p className="text-12 leading-18 text-gray-6C6A7D">{u.phone}</p>
                </div>
                <UserBadges u={u} />
                <p className="text-12 leading-18 text-gray-6C6A7D">
                  {faNum(u.reservationsCount)} رزرو · عضویت {faDate(u.createdAt)}
                </p>
                <Link href={`/admin/users/${u.id}`} className="w-full mt-auto">
                  <Button variant="secondary" className="w-full">
                    مشاهده جزئیات
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {data && data.meta.pageCount > 1 && (
          <div className="flex items-center justify-center gap-x-12">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              قبلی
            </Button>
            <span className="text-14 text-gray-6C6A7D">
              صفحه {faNum(page)} از {faNum(data.meta.pageCount)} ({faNum(data.meta.total)} کاربر)
            </span>
            <Button
              variant="secondary"
              disabled={page >= data.meta.pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              بعدی
            </Button>
          </div>
        )}
      </div>

      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);
          mutate();
          mutateCounts();
        }}
      />
    </AdminLayout>
  );
}

function CreateUserModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    contactPhone: "",
    nationalCode: "",
    email: "",
    address: "",
    password: "",
    isHost: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await apiFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(
          Object.fromEntries(Object.entries(form).filter(([, v]) => v !== "" && v !== false))
        ),
      });
      onCreated();
      setForm({
        name: "",
        phone: "",
        contactPhone: "",
        nationalCode: "",
        email: "",
        address: "",
        password: "",
        isHost: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ایجاد کاربر");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="ایجاد کاربر جدید">
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-12">
        <Field label="نام و نام خانوادگی">
          <Input value={form.name} onChange={set("name")} />
        </Field>
        <Field label="شماره موبایل *">
          <Input
            value={form.phone}
            onChange={set("phone")}
            required
            placeholder="09xxxxxxxxx"
            inputMode="numeric"
          />
        </Field>
        <Field label="شماره تماس دیگر">
          <Input value={form.contactPhone} onChange={set("contactPhone")} inputMode="numeric" />
        </Field>
        <Field label="کد ملی">
          <Input value={form.nationalCode} onChange={set("nationalCode")} inputMode="numeric" />
        </Field>
        <Field label="ایمیل">
          <Input value={form.email} onChange={set("email")} type="email" />
        </Field>
        <Field label="رمز عبور (اختیاری)">
          <Input
            value={form.password}
            onChange={set("password")}
            type="password"
            placeholder="در صورت خالی بودن، ورود با کد یکبارمصرف"
          />
        </Field>
        <Field label="آدرس محل" className="sm:col-span-2">
          <Input value={form.address} onChange={set("address")} />
        </Field>

        <label className="sm:col-span-2 flex items-center gap-x-10 text-14 text-black">
          <Toggle
            checked={form.isHost}
            onChange={(next) => setForm((f) => ({ ...f, isHost: next }))}
          />
          کاربر میزبان باشد
        </label>

        {!!error && <p className="sm:col-span-2 text-13 text-[#C62828]">{error}</p>}

        <div className="sm:col-span-2 flex items-center gap-x-10 justify-end mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "در حال ثبت..." : "ثبت"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
