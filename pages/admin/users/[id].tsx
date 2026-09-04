import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import WalletCard from "@/components/Admin/WalletCard";
import { apiFetch } from "@/api/Admin/adminApi";
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
  StatTile,
  Toggle,
  faDate,
  faMoney,
  faNum,
} from "@/components/Admin/ui";

interface UserDetail {
  id: number;
  phone: string;
  name: string | null;
  email: string | null;
  nationalCode: string | null;
  address: string | null;
  contactPhone: string | null;
  emergencyPhone: string | null;
  job: string | null;
  education: string | null;
  description: string | null;
  birthDay: number | null;
  birthMonth: number | null;
  birthYear: number | null;
  avatarUrl: string | null;
  nationalCardUrl: string | null;
  verificationStatus: "NOT_CONFIRMED" | "CHECKING" | "CONFIRMED";
  isHost: boolean;
  isActive: boolean;
  isSpecialHost: boolean;
  commissionPercent: number | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  city: { name: string; province: { name: string } | null } | null;
  bankAccount: { cardNumber: string | null; shebaNumber: string | null; accountOwner: string | null } | null;
  residences: {
    id: number;
    /** کد اقامتگاه — what the panel URL uses. Not the same as `id`. */
    publicId: number;
    reference: string | null;
    name: string;
    state: string;
    averageRating: number;
    weekPrice: number | null;
    city: { name: string } | null;
    images: { url: string }[];
  }[];
  yellowCards: { id: number; reason: string; createdAt: string }[];
  stats: {
    reservationsAsGuest: number;
    reservationsAsHost: number;
    successfulAsGuest: number;
    successfulAsHost: number;
    totalSpent: number;
    totalIncome: number;
    lastActivityAt: string | null;
  };
}

const VERIFICATION: Record<string, { label: string; tone: "green" | "yellow" | "gray" }> = {
  CONFIRMED: { label: "تایید شده", tone: "green" },
  CHECKING: { label: "در حال بررسی", tone: "yellow" },
  NOT_CONFIRMED: { label: "تایید نشده", tone: "gray" },
};

const RESIDENCE_STATE_LABELS: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  PENDING: "در انتظار بررسی",
  PUBLISHED: "منتشر شده",
  REJECTED: "رد شده",
  DEACTIVATED: "غیرفعال",
  DELETED: "حذف شده",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-x-12 py-8 border-b border-gray-F0F0F0 last:border-0">
      <span className="text-12 leading-18 text-gray-6C6A7D shrink-0">{label}</span>
      <span className="text-14 leading-20 text-black text-left break-words">{value || "-"}</span>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [showEdit, setShowEdit] = useState(false);
  const [showYellow, setShowYellow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const { data, isLoading, mutate } = useSWR<UserDetail>(
    id ? `/api/admin/users/${id}` : null,
    (path: string) => apiFetch<UserDetail>(path)
  );

  async function patch(body: Record<string, unknown>) {
    await apiFetch(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    mutate();
  }

  const birth =
    data?.birthYear && data?.birthMonth && data?.birthDay
      ? `${data.birthYear}/${data.birthMonth}/${data.birthDay}`
      : null;

  return (
    <AdminLayout
      title={data?.name ?? "اطلاعات کاربری"}
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link> / <Link href="/admin/users">کاربران</Link>
        </>
      }
      actions={
        data && (
          <>
            <Button variant="secondary" onClick={() => setShowEdit(true)}>
              <i className="icon-Edit text-16" /> ویرایش اطلاعات
            </Button>
            <Button variant="secondary" onClick={() => setShowPassword(true)}>
              <i className="icon-Key text-16" /> تنظیم رمز عبور
            </Button>
            <Button variant="secondary" onClick={() => setShowYellow(true)}>
              <i className="icon-Warning text-16" /> ثبت کارت زرد
            </Button>
            <Button
              variant={data.isActive ? "danger" : "primary"}
              onClick={() => (data.isActive ? setConfirmDeactivate(true) : patch({ isActive: true }))}
            >
              {data.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
            </Button>
          </>
        )
      }
    >
      {isLoading && (
        <div className="flex flex-col gap-16">
          <Skeleton className="h-[140px]" />
          <Skeleton className="h-[104px]" />
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-y-16">
          {/* header */}
          <Card className="overflow-hidden">
            <div className="h-[96px] bg-gradient-to-l from-[#A855F7] to-[#7C3AED]" />
            <div className="px-20 pb-20 -mt-32 flex items-end gap-x-16 flex-wrap gap-y-12">
              <span className="w-72 h-72 rounded-16 bg-white border-4 border-white overflow-hidden flex items-center justify-center text-24 shrink-0">
                {data.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.avatarUrl} alt={data.name ?? ""} className="w-full h-full object-cover" />
                ) : (
                  (data.name?.[0] ?? "؟")
                )}
              </span>
              <div className="flex-1 min-w-[200px] pb-4">
                <div className="flex items-center gap-x-8 flex-wrap gap-y-6">
                  <h2 className="text-18 leading-26 font-m text-black">{data.name ?? "بدون نام"}</h2>
                  <Badge tone={data.isHost ? "green" : "gray"}>
                    {data.isHost ? "میزبان" : "مهمان"}
                  </Badge>
                  {data.role === "ADMIN" && <Badge tone="purple">ادمین</Badge>}
                  {data.isSpecialHost && <Badge tone="blue">میزبان ویژه</Badge>}
                  {!data.isActive && <Badge tone="red">غیرفعال</Badge>}
                  <Badge tone={VERIFICATION[data.verificationStatus].tone}>
                    {VERIFICATION[data.verificationStatus].label}
                  </Badge>
                </div>
                <p className="text-13 leading-20 text-gray-6C6A7D mt-4">
                  نام کاربری: {data.phone} · عضویت {faDate(data.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-x-16 pb-4">
                <label className="flex items-center gap-x-8 text-13 text-gray-6C6A7D">
                  <Toggle checked={data.isHost} onChange={(v) => patch({ isHost: v })} />
                  میزبان
                </label>
                <label className="flex items-center gap-x-8 text-13 text-gray-6C6A7D">
                  <Toggle
                    checked={data.isSpecialHost}
                    onChange={(v) => patch({ isSpecialHost: v })}
                  />
                  ویژه
                </label>
              </div>
            </div>
          </Card>

          <WalletCard userId={data.id} />

          {data.isHost && <HostCommissionCard user={data} onSaved={() => mutate()} />}

          {/* stats */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-16">
            <StatTile
              tone="blue"
              label="رزروهای موفق (مهمان)"
              value={faNum(data.stats.successfulAsGuest)}
              hint={`از ${faNum(data.stats.reservationsAsGuest)} درخواست`}
              icon={<i className="icon-Trips text-18" />}
            />
            <StatTile
              tone="orange"
              label="پرداختی به سایت"
              value={faMoney(data.stats.totalSpent)}
              icon={<i className="icon-CardBank text-18" />}
            />
            <StatTile
              tone="green"
              label="رزروهای موفق (میزبان)"
              value={faNum(data.stats.successfulAsHost)}
              hint={`از ${faNum(data.stats.reservationsAsHost)} درخواست`}
              icon={<i className="icon-Homes text-18" />}
            />
            <StatTile
              tone="purple"
              label="درآمد میزبانی"
              value={faMoney(data.stats.totalIncome)}
              hint={
                data.stats.lastActivityAt
                  ? `آخرین فعالیت ${faDate(data.stats.lastActivityAt)}`
                  : undefined
              }
              icon={<i className="icon-Amaar text-18" />}
            />
          </section>

          <section className="grid lg:grid-cols-3 gap-16">
            {/* profile info */}
            <Card className="p-20 lg:col-span-2">
              <h3 className="text-16 leading-24 font-m text-black mb-12">اطلاعات کاربر</h3>
              <div className="grid md:grid-cols-2 gap-x-24">
                <div>
                  <InfoRow label="نام و نام خانوادگی" value={data.name} />
                  <InfoRow label="شماره موبایل" value={data.phone} />
                  <InfoRow label="شماره تماس دیگر" value={data.contactPhone} />
                  <InfoRow label="تماس اضطراری" value={data.emergencyPhone} />
                  <InfoRow label="کد ملی" value={data.nationalCode} />
                  <InfoRow label="ایمیل" value={data.email} />
                </div>
                <div>
                  <InfoRow label="تاریخ تولد" value={birth} />
                  <InfoRow
                    label="شهر"
                    value={
                      data.city
                        ? `${data.city.province?.name ?? ""}${data.city.province ? "، " : ""}${data.city.name}`
                        : null
                    }
                  />
                  <InfoRow label="آدرس" value={data.address} />
                  <InfoRow label="شغل" value={data.job} />
                  <InfoRow label="تحصیلات" value={data.education} />
                  <InfoRow
                    label="تصویر کارت ملی"
                    value={
                      data.nationalCardUrl ? (
                        <a
                          href={data.nationalCardUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-dark font-m"
                        >
                          مشاهده فایل ↗
                        </a>
                      ) : null
                    }
                  />
                </div>
              </div>
              {!!data.description && (
                <div className="mt-12">
                  <p className="text-12 leading-18 text-gray-6C6A7D mb-4">درباره کاربر</p>
                  <p className="text-14 leading-24 text-black">{data.description}</p>
                </div>
              )}
            </Card>

            {/* verification + bank */}
            <div className="flex flex-col gap-y-16">
              <Card className="p-20">
                <h3 className="text-16 leading-24 font-m text-black mb-12">احراز هویت</h3>
                <Select
                  value={data.verificationStatus}
                  onChange={(e) => patch({ verificationStatus: e.target.value })}
                  className="w-full"
                >
                  <option value="NOT_CONFIRMED">تایید نشده</option>
                  <option value="CHECKING">در حال بررسی</option>
                  <option value="CONFIRMED">تایید شده</option>
                </Select>
                <h3 className="text-16 leading-24 font-m text-black mt-20 mb-8">نقش</h3>
                <Select
                  value={data.role}
                  onChange={(e) => patch({ role: e.target.value })}
                  className="w-full"
                >
                  <option value="USER">کاربر</option>
                  <option value="ADMIN">ادمین</option>
                </Select>
              </Card>

              <Card className="p-20">
                <h3 className="text-16 leading-24 font-m text-black mb-12">اطلاعات بانکی</h3>
                {data.bankAccount ? (
                  <>
                    <InfoRow label="صاحب حساب" value={data.bankAccount.accountOwner} />
                    <InfoRow label="شماره کارت" value={data.bankAccount.cardNumber} />
                    <InfoRow label="شبا" value={data.bankAccount.shebaNumber} />
                  </>
                ) : (
                  <EmptyState text="حساب بانکی ثبت نشده" />
                )}
              </Card>
            </div>
          </section>

          {/* yellow cards */}
          <Card className="p-20">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-16 leading-24 font-m text-black">کارت‌های زرد</h3>
              <Button variant="secondary" onClick={() => setShowYellow(true)}>
                + ثبت کارت زرد
              </Button>
            </div>
            {data.yellowCards.length === 0 ? (
              <EmptyState text="کارت زردی ثبت نشده" />
            ) : (
              <ul className="flex flex-col gap-y-8">
                {data.yellowCards.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start justify-between gap-x-12 bg-[#FFF9EC] rounded-10 p-12"
                  >
                    <div>
                      <p className="text-14 leading-22 text-black">{c.reason}</p>
                      <p className="text-12 leading-18 text-gray-6C6A7D mt-2">{faDate(c.createdAt)}</p>
                    </div>
                    <button
                      onClick={async () => {
                        await apiFetch(`/api/admin/yellow-cards/${c.id}`, { method: "DELETE" });
                        mutate();
                      }}
                      className="text-12 text-[#C62828] font-m shrink-0"
                    >
                      حذف
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* residences */}
          {data.residences.length > 0 && (
            <Card className="p-20">
              <h3 className="text-16 leading-24 font-m text-black mb-12">
                اقامتگاه‌ها ({faNum(data.residences.length)})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {data.residences.map((r) => (
                  <Link
                    key={r.id}
                    href={`/admin/residences/${r.publicId ?? r.id}`}
                    className="border border-gray-E5E5E6 rounded-12 overflow-hidden hover:border-primary-main transition"
                  >
                    <div className="h-[110px] bg-gray-F0F0F0">
                      {!!r.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/_next/image?url=${encodeURIComponent(r.images[0].url)}&w=640&q=70`}
                          alt={r.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="p-12">
                      <p className="text-13 leading-20 text-black line-clamp-1">{r.name}</p>
                      <div className="flex items-center justify-between mt-6">
                        <Badge tone={r.state === "PUBLISHED" ? "green" : "gray"}>
                          {RESIDENCE_STATE_LABELS[r.state] ?? r.state}
                        </Badge>
                        <span className="text-12 text-gray-6C6A7D">{r.city?.name}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* modals */}
      {data && (
        <>
          <EditUserModal
            open={showEdit}
            user={data}
            onClose={() => setShowEdit(false)}
            onSaved={() => {
              setShowEdit(false);
              mutate();
            }}
          />

          <Modal open={showYellow} onClose={() => setShowYellow(false)} title="دلیل ثبت کارت زرد">
            <YellowCardForm
              userId={data.id}
              onDone={() => {
                setShowYellow(false);
                mutate();
              }}
              onCancel={() => setShowYellow(false)}
            />
          </Modal>

          <Modal open={showPassword} onClose={() => setShowPassword(false)} title="تنظیم رمز عبور">
            <PasswordForm
              userId={data.id}
              onDone={() => setShowPassword(false)}
              onCancel={() => setShowPassword(false)}
            />
          </Modal>

          <Modal
            open={confirmDeactivate}
            onClose={() => setConfirmDeactivate(false)}
            title="غیرفعال‌سازی کاربر"
            width="max-w-[420px]"
          >
            <p className="text-14 leading-24 text-black mb-16">
              مطمئنی می‌خوای این {data.isHost ? "میزبان" : "کاربر"} رو غیرفعال کنی؟
            </p>
            <div className="flex items-center gap-x-10 justify-end">
              <Button variant="secondary" onClick={() => setConfirmDeactivate(false)}>
                انصراف
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  await patch({ isActive: false });
                  setConfirmDeactivate(false);
                }}
              >
                آره، غیرفعال کن
              </Button>
            </div>
          </Modal>
        </>
      )}
    </AdminLayout>
  );
}

function EditUserModal({
  open,
  user,
  onClose,
  onSaved,
}: {
  open: boolean;
  user: UserDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: user.name ?? "",
    email: user.email ?? "",
    nationalCode: user.nationalCode ?? "",
    contactPhone: user.contactPhone ?? "",
    emergencyPhone: user.emergencyPhone ?? "",
    address: user.address ?? "",
    job: user.job ?? "",
    education: user.education ?? "",
    description: user.description ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="ویرایش اطلاعات کاربر" width="max-w-[640px]">
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-12">
        <Field label="نام و نام خانوادگی">
          <Input value={form.name} onChange={set("name")} />
        </Field>
        <Field label="ایمیل">
          <Input value={form.email} onChange={set("email")} type="email" />
        </Field>
        <Field label="کد ملی">
          <Input value={form.nationalCode} onChange={set("nationalCode")} inputMode="numeric" />
        </Field>
        <Field label="شماره تماس دیگر">
          <Input value={form.contactPhone} onChange={set("contactPhone")} inputMode="numeric" />
        </Field>
        <Field label="تماس اضطراری">
          <Input value={form.emergencyPhone} onChange={set("emergencyPhone")} inputMode="numeric" />
        </Field>
        <Field label="شغل">
          <Input value={form.job} onChange={set("job")} />
        </Field>
        <Field label="تحصیلات">
          <Input value={form.education} onChange={set("education")} />
        </Field>
        <Field label="آدرس" className="md:col-span-2">
          <Input value={form.address} onChange={set("address")} />
        </Field>
        <Field label="درباره کاربر" className="md:col-span-2">
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={3}
            className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
          />
        </Field>

        {!!error && <p className="md:col-span-2 text-13 text-[#C62828]">{error}</p>}

        <div className="md:col-span-2 flex items-center gap-x-10 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function YellowCardForm({
  userId,
  onDone,
  onCancel,
}: {
  userId: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await apiFetch(`/api/admin/users/${userId}/yellow-cards`, {
            method: "POST",
            body: JSON.stringify({ reason }),
          });
          onDone();
        } finally {
          setSaving(false);
        }
      }}
    >
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
        rows={5}
        placeholder="دلیل ثبت کارت زرد را بنویسید..."
        className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition mb-16"
      />
      <div className="flex items-center gap-x-10 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          انصراف
        </Button>
        <Button type="submit" disabled={saving || !reason.trim()}>
          ثبت کارت زرد
        </Button>
      </div>
    </form>
  );
}

function PasswordForm({
  userId,
  onDone,
  onCancel,
}: {
  userId: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await apiFetch(`/api/admin/users/${userId}/password`, {
            method: "POST",
            body: JSON.stringify({ password }),
          });
          setDone(true);
          setTimeout(onDone, 900);
        } finally {
          setSaving(false);
        }
      }}
    >
      <Field label="رمز عبور جدید (حداقل ۶ کاراکتر)">
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="text"
          minLength={6}
          required
        />
      </Field>
      {done && <p className="text-13 text-[#015046] mt-8">رمز عبور با موفقیت تنظیم شد</p>}
      <div className="flex items-center gap-x-10 justify-end mt-16">
        <Button type="button" variant="secondary" onClick={onCancel}>
          انصراف
        </Button>
        <Button type="submit" disabled={saving || password.length < 6}>
          ذخیره رمز
        </Button>
      </div>
    </form>
  );
}

/**
 * کمیسیون میزبان — the site's cut of this host's bookings.
 *
 * Empty and "0" are deliberately different things, and the difference is
 * money: empty means "whatever the site charges", zero means "this host pays
 * nothing". A single input cannot say both, so clearing the field is its own
 * action with its own button.
 *
 * The rate applies to bookings made from now on. The ones already taken keep
 * the rate they were made under, which is why this says so out loud.
 */
function HostCommissionCard({ user, onSaved }: { user: UserDetail; onSaved: () => void }) {
  const [value, setValue] = useState(
    user.commissionPercent == null ? "" : String(user.commissionPercent)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: settings } = useSWR<{ commissionPercent: number }>(
    "/api/admin/settings/reservation",
    (p: string) => apiFetch<{ commissionPercent: number }>(p)
  );

  const custom = value.trim() !== "";
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  const invalid = custom && (!Number.isFinite(parsed) || parsed < 0 || parsed > 100);
  const effective = custom && !invalid ? parsed : settings?.commissionPercent;

  async function save(next: number | null) {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ commissionPercent: next }),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-20">
      <div className="flex items-start justify-between gap-x-12 flex-wrap gap-y-8 mb-14">
        <div>
          <h3 className="text-16 leading-24 font-m text-black">کمیسیون میزبان</h3>
          <p className="text-12 leading-20 text-gray-9B9BAA mt-2">
            درصدی از مبلغ اجاره که سهم سایت است و از سهم این میزبان کسر می‌شود.
          </p>
        </div>
        <Badge tone={user.commissionPercent == null ? "gray" : "blue"}>
          {user.commissionPercent == null
            ? `نرخ عمومی سایت${settings ? ` (${faNum(settings.commissionPercent)}٪)` : ""}`
            : `نرخ اختصاصی ${faNum(user.commissionPercent)}٪`}
        </Badge>
      </div>

      <div className="flex items-end gap-x-12 flex-wrap gap-y-12">
        <div className="w-[180px]">
          <Field label="درصد کمیسیون">
            <Input
              inputMode="decimal"
              value={value}
              placeholder={settings ? `${settings.commissionPercent}` : "نرخ عمومی"}
              onChange={(e) => setValue(e.target.value)}
            />
          </Field>
        </div>

        <Button disabled={saving || invalid} onClick={() => save(custom ? parsed : null)}>
          ذخیره
        </Button>

        {user.commissionPercent != null && (
          <Button
            variant="secondary"
            disabled={saving}
            onClick={() => {
              setValue("");
              save(null);
            }}
          >
            بازگشت به نرخ عمومی
          </Button>
        )}
      </div>

      {invalid && <p className="mt-10 text-13 text-[#C62828]">درصد باید بین ۰ تا ۱۰۰ باشد.</p>}
      {!!error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}

      {effective != null && !invalid && (
        <p className="mt-12 text-12 leading-20 text-gray-6C6A7D">
          با نرخ {faNum(effective)}٪، از یک رزرو {faNum(5_000_000)} تومانی سهم سایت{" "}
          <b>{faNum(Math.round((5_000_000 * effective) / 100))}</b> تومان می‌شود.
          <span className="text-gray-9B9BAA">
            {" "}
            این نرخ روی رزروهای جدید اعمال می‌شود؛ رزروهای ثبت‌شده نرخ خودشان را نگه می‌دارند.
          </span>
        </p>
      )}
    </Card>
  );
}
