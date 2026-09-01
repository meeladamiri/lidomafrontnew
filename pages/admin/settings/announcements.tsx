import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
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
  Toggle,
  faDate,
} from "@/components/Admin/ui";

/**
 * اطلاعیه‌ها — notices shown on people's dashboards.
 *
 * The dashboard has rendered an `announcement` since the migration and nothing
 * could write one, so it was dead code on the page.
 *
 * ## The editor is a preview
 *
 * A notice is a handful of fields and one decision that matters — banner or
 * dialog — and it is very easy to write one that reads fine in a form and
 * badly on the page it lands on. So the form shows the actual card as it will
 * appear, next to the fields, and it updates as you type. Nobody should have
 * to publish something to find out what it looks like.
 *
 * ## Live is not the same as active
 *
 * A switched-on notice whose date window has passed is showing nobody
 * anything. The list says «در حال نمایش» only for the ones actually on screen
 * right now, so a notice that has quietly expired does not look enabled.
 */

interface Announcement {
  id: number;
  title: string;
  body: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  audience: "ALL" | "HOSTS" | "GUESTS";
  style: "BANNER" | "MODAL";
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  isLive: boolean;
  createdBy: { id: number; name: string | null } | null;
}

const AUDIENCE: Record<Announcement["audience"], string> = {
  ALL: "همه کاربران",
  HOSTS: "فقط میزبان‌ها",
  GUESTS: "فقط مهمان‌ها",
};

const STYLE: Record<Announcement["style"], string> = {
  BANNER: "نوار در پیشخوان",
  MODAL: "پنجره‌ی بازشو",
};

const EMPTY = {
  title: "",
  body: "",
  imageUrl: "",
  linkUrl: "",
  linkLabel: "",
  audience: "ALL" as Announcement["audience"],
  style: "BANNER" as Announcement["style"],
  isActive: true,
  startsAt: "",
  endsAt: "",
  sortOrder: 0,
};

type Draft = typeof EMPTY;

export default function AnnouncementsSettingsPage() {
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, mutate } = useSWR<Announcement[]>(
    "/api/admin/announcements",
    (p: string) => apiFetch<Announcement[]>(p)
  );

  async function toggleActive(a: Announcement) {
    await apiFetch(`/api/admin/announcements/${a.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !a.isActive }),
    });
    mutate();
  }

  return (
    <AdminLayout
      title="اطلاعیه‌ها"
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link> / <Link href="/admin/settings">تنظیمات</Link>
        </>
      }
      actions={<Button onClick={() => setCreating(true)}>اطلاعیه جدید</Button>}
    >
      {isLoading ? (
        <Skeleton className="h-[300px]" />
      ) : !data?.length ? (
        <Card className="p-20">
          <EmptyState text="اطلاعیه‌ای ساخته نشده" />
          <p className="text-12 leading-20 text-gray-9B9BAA text-center mt-8">
            اطلاعیه‌ها در پیشخوان مهمان‌ها و میزبان‌ها نمایش داده می‌شوند.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-y-12">
          {data.map((a) => (
            <Card key={a.id} className="p-16">
              <div className="flex items-start justify-between gap-x-12 flex-wrap gap-y-10">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-x-8 flex-wrap gap-y-6 mb-6">
                    <span className="text-15 leading-24 font-m text-black">{a.title}</span>
                    {a.isLive ? (
                      <Badge tone="green">در حال نمایش</Badge>
                    ) : a.isActive ? (
                      <Badge tone="yellow">خارج از بازه‌ی زمانی</Badge>
                    ) : (
                      <Badge tone="gray">خاموش</Badge>
                    )}
                    <Badge tone="purple">{AUDIENCE[a.audience]}</Badge>
                    <Badge tone="gray">{STYLE[a.style]}</Badge>
                  </div>

                  {!!a.body && (
                    <p className="text-13 leading-22 text-gray-6C6A7D whitespace-pre-line">
                      {a.body}
                    </p>
                  )}

                  <p className="text-11 leading-18 text-gray-9B9BAA mt-6">
                    {a.startsAt || a.endsAt
                      ? `از ${a.startsAt ? faDate(a.startsAt) : "همیشه"} تا ${
                          a.endsAt ? faDate(a.endsAt) : "همیشه"
                        }`
                      : "بدون محدودیت زمانی"}
                    {a.createdBy?.name ? ` · ${a.createdBy.name}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-x-8 shrink-0">
                  <Toggle checked={a.isActive} onChange={() => toggleActive(a)} />
                  <Button variant="secondary" onClick={() => setEditing(a)}>
                    ویرایش
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Editor
        open={creating || !!editing}
        announcement={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={mutate}
      />
    </AdminLayout>
  );
}

function Editor({
  open,
  announcement,
  onClose,
  onSaved,
}: {
  open: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<number | "new" | null>(null);

  const key = announcement?.id ?? "new";
  if (open && ready !== key) {
    setDraft(
      announcement
        ? {
            title: announcement.title,
            body: announcement.body ?? "",
            imageUrl: announcement.imageUrl ?? "",
            linkUrl: announcement.linkUrl ?? "",
            linkLabel: announcement.linkLabel ?? "",
            audience: announcement.audience,
            style: announcement.style,
            isActive: announcement.isActive,
            startsAt: announcement.startsAt?.slice(0, 10) ?? "",
            endsAt: announcement.endsAt?.slice(0, 10) ?? "",
            sortOrder: announcement.sortOrder,
          }
        : EMPTY
    );
    setError(null);
    setReady(key);
  }
  if (!open && ready !== null) setReady(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  async function save() {
    if (!draft.title.trim()) {
      setError("عنوان اطلاعیه الزامی است");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const body = JSON.stringify({
        title: draft.title.trim(),
        body: draft.body.trim() || null,
        imageUrl: draft.imageUrl.trim() || null,
        linkUrl: draft.linkUrl.trim() || null,
        linkLabel: draft.linkLabel.trim() || null,
        audience: draft.audience,
        style: draft.style,
        isActive: draft.isActive,
        startsAt: draft.startsAt || null,
        endsAt: draft.endsAt || null,
        sortOrder: Number(draft.sortOrder) || 0,
      });

      if (announcement) {
        await apiFetch(`/api/admin/announcements/${announcement.id}`, { method: "PATCH", body });
      } else {
        await apiFetch("/api/admin/announcements", { method: "POST", body });
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!announcement) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/announcements/${announcement.id}`, { method: "DELETE" });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "حذف نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={announcement ? "ویرایش اطلاعیه" : "اطلاعیه جدید"}
      width="max-w-[880px]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* ---- fields ---- */}
        <div className="flex flex-col gap-y-12">
          <Field label="عنوان">
            <Input
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="مثلاً تغییر روش پرداخت"
            />
          </Field>

          <Field label="متن (اختیاری)">
            <textarea
              value={draft.body}
              onChange={(e) => set("body", e.target.value)}
              rows={3}
              className="w-full rounded-8 border border-gray-E3E3E8 px-12 py-10 text-14 leading-24 outline-none focus:border-primary resize-none"
            />
          </Field>

          <Field label="آدرس تصویر (اختیاری)" hint="اگر خالی باشد فقط متن نمایش داده می‌شود">
            <Input
              value={draft.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://…"
              dir="ltr"
            />
          </Field>

          <div className="grid grid-cols-2 gap-10">
            <Field label="لینک (اختیاری)">
              <Input
                value={draft.linkUrl}
                onChange={(e) => set("linkUrl", e.target.value)}
                placeholder="/residences/list"
                dir="ltr"
              />
            </Field>
            <Field label="متن دکمه">
              <Input
                value={draft.linkLabel}
                onChange={(e) => set("linkLabel", e.target.value)}
                placeholder="مشاهده"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-10">
            <Field label="مخاطب">
              <Select
                value={draft.audience}
                onChange={(e) => set("audience", e.target.value as Announcement["audience"])}
                className="w-full"
              >
                <option value="ALL">همه کاربران</option>
                <option value="HOSTS">فقط میزبان‌ها</option>
                <option value="GUESTS">فقط مهمان‌ها</option>
              </Select>
            </Field>
            <Field label="نحوه نمایش">
              <Select
                value={draft.style}
                onChange={(e) => set("style", e.target.value as Announcement["style"])}
                className="w-full"
              >
                <option value="BANNER">نوار در پیشخوان</option>
                <option value="MODAL">پنجره‌ی بازشو</option>
              </Select>
            </Field>
          </div>

          {draft.style === "MODAL" && (
            <p className="text-11 leading-18 text-[#B26A00] -mt-6">
              پنجره‌ی بازشو جلوی کار کاربر را می‌گیرد. اگر زیاد استفاده شود، کاربر یاد می‌گیرد
              بدون خواندن ببندد — برای موارد واقعاً مهم نگهش دارید.
            </p>
          )}

          <div className="grid grid-cols-2 gap-10">
            <Field label="شروع نمایش (اختیاری)">
              <Input
                type="date"
                value={draft.startsAt}
                onChange={(e) => set("startsAt", e.target.value)}
                dir="ltr"
              />
            </Field>
            <Field label="پایان نمایش (اختیاری)">
              <Input
                type="date"
                value={draft.endsAt}
                onChange={(e) => set("endsAt", e.target.value)}
                dir="ltr"
              />
            </Field>
          </div>

          <label className="flex items-center gap-x-8 text-13 text-gray-6C6A7D">
            <Toggle checked={draft.isActive} onChange={(v) => set("isActive", v)} />
            فعال
          </label>
        </div>

        {/* ---- live preview ---- */}
        <div>
          <p className="text-12 leading-20 text-gray-6C6A7D mb-8">
            پیش‌نمایش — دقیقاً همان چیزی که کاربر می‌بیند
          </p>
          <div className="rounded-12 bg-gray-F7F7F7 p-16">
            <AnnouncementPreview draft={draft} />
          </div>
          <p className="text-11 leading-18 text-gray-9B9BAA mt-8">
            {draft.audience === "ALL"
              ? "برای همه‌ی کاربران واردشده نمایش داده می‌شود."
              : draft.audience === "HOSTS"
                ? "فقط در پیشخوان میزبان‌ها."
                : "فقط در پیشخوان مهمان‌ها."}
          </p>
        </div>
      </div>

      {!!error && <p className="mt-14 text-13 text-[#C62828]">{error}</p>}

      <div className="mt-20 flex items-center justify-between gap-x-10">
        <div>
          {!!announcement && (
            <Button variant="danger" onClick={remove} disabled={busy}>
              حذف
            </Button>
          )}
        </div>
        <div className="flex items-center gap-x-10">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            انصراف
          </Button>
          <Button onClick={save} disabled={busy || !draft.title.trim()}>
            {busy ? "در حال ذخیره…" : "ذخیره"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * The same markup the dashboard renders, so the preview is not a drawing of
 * the result — it is the result.
 */
function AnnouncementPreview({ draft }: { draft: Draft }) {
  if (!draft.title.trim() && !draft.body.trim()) {
    return <p className="text-12 text-gray-9B9BAA text-center py-20">عنوان را بنویسید…</p>;
  }

  return (
    <div className="rounded-12 bg-white border-1 border-solid border-gray-E5E5E6 overflow-hidden">
      {!!draft.imageUrl.trim() && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={draft.imageUrl} alt="" className="w-full h-[120px] object-cover" />
      )}
      <div className="p-14">
        <p className="text-15 leading-24 font-m text-black">{draft.title || "عنوان اطلاعیه"}</p>
        {!!draft.body.trim() && (
          <p className="text-13 leading-22 text-gray-6C6A7D mt-4 whitespace-pre-line">
            {draft.body}
          </p>
        )}
        {!!draft.linkUrl.trim() && (
          <span className="inline-block mt-10 rounded-8 bg-primary-main text-white text-13 leading-22 px-14 py-6">
            {draft.linkLabel.trim() || "مشاهده"}
          </span>
        )}
      </div>
    </div>
  );
}
