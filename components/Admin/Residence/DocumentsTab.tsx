import { useRef, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import { getToken } from "@/api/Admin/adminApi";
import { Badge, Button, Card, EmptyState, Modal, Skeleton } from "@/components/Admin/ui";

/**
 * مدرک مالکیت — the identity and ownership files a listing carries.
 *
 * Three fixed documents answering three fixed questions: is this property what
 * the host says it is, is the host who they say they are, and — when the host
 * is not the owner — who is. They are columns on the residence, not a table,
 * because there is exactly one of each.
 *
 * **These are identity documents.** They are shown only inside the panel,
 * never linked from anywhere public, and the page says so: an admin who
 * assumes a file here is as harmless as a listing photo is an admin who
 * pastes a national ID card into a chat. The viewer opens in place rather
 * than a new tab for the same reason — a URL that ends up in someone's
 * history is a URL that ends up somewhere else.
 */

type Kind = "document" | "hostCard" | "ownerCard";

interface Payload {
  documentUrl: string | null;
  hostNationalCardUrl: string | null;
  ownerNationalCardUrl: string | null;
  host: {
    id: number;
    name: string | null;
    phone: string;
    verificationStatus: string | null;
  } | null;
}

const DOCS: { kind: Kind; field: keyof Payload; label: string; help: string }[] = [
  {
    kind: "document",
    field: "documentUrl",
    label: "سند / مدرک مالکیت",
    help: "سند تک‌برگ، قولنامه، یا اجاره‌نامه‌ای که نشان می‌دهد میزبان حق واگذاری این ملک را دارد.",
  },
  {
    kind: "hostCard",
    field: "hostNationalCardUrl",
    label: "کارت ملی میزبان",
    help: "کارت ملی همان شخصی که حساب میزبان به نامش است.",
  },
  {
    kind: "ownerCard",
    field: "ownerNationalCardUrl",
    label: "کارت ملی مالک",
    help: "فقط وقتی لازم است که میزبان خودش مالک نباشد.",
  },
];

/** The real VerificationStatus enum — three values, not the four I guessed. */
const VERIFICATION: Record<string, { label: string; tone: "green" | "yellow" | "gray" }> = {
  CONFIRMED: { label: "احراز شده", tone: "green" },
  CHECKING: { label: "در حال بررسی", tone: "yellow" },
  NOT_CONFIRMED: { label: "احراز نشده", tone: "gray" },
};

/**
 * Whether a browser will actually draw this in an <img>.
 *
 * HEIC is the reason this exists: 25 of the migrated documents are iPhone
 * photos, and Chrome renders none of them. A broken image icon would read as
 * "the file is missing" when the file is perfectly fine — so these are offered
 * as a download instead, which is honest and still gets the admin to the
 * document. PDFs are the same story for a different reason.
 */
function isPreviewable(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return !/.(heic|heif|pdf)$/.test(clean);
}

function fileLabel(url: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toUpperCase() ?? "فایل";
  return ext === "PDF" ? "فایل PDF" : `تصویر ${ext}`;
}

export default function DocumentsTab({ residenceId }: { residenceId: number }) {
  const { data, isLoading, mutate } = useSWR<Payload>(
    `/api/admin/residences/${residenceId}/documents`,
    (p: string) => apiFetch<Payload>(p)
  );

  const [viewing, setViewing] = useState<{ url: string; label: string } | null>(null);
  const [busy, setBusy] = useState<Kind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  async function upload(kind: Kind, file: File) {
    setBusy(kind);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      // Not apiFetch's JSON path: this is multipart, and the browser must set
      // its own boundary.
      const res = await fetch(`/api/admin/residences/${residenceId}/documents/${kind}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body,
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.message ?? "بارگذاری نشد");
      }
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "بارگذاری نشد");
    } finally {
      setBusy(null);
    }
  }

  async function remove(kind: Kind) {
    setBusy(kind);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/documents/${kind}`, {
        method: "DELETE",
      });
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "حذف نشد");
    } finally {
      setBusy(null);
    }
  }

  if (isLoading) return <Skeleton className="h-[300px]" />;
  if (!data)
    return (
      <Card>
        <EmptyState text="مدارک این اقامتگاه خوانده نشد" />
      </Card>
    );

  const verification =
    VERIFICATION[data.host?.verificationStatus ?? "NOT_CONFIRMED"] ?? VERIFICATION.NOT_CONFIRMED;

  return (
    <div className="flex flex-col gap-y-16">
      <Card className="p-16 flex items-center gap-x-14 flex-wrap gap-y-10">
        <Badge tone="purple">میزبان</Badge>
        {data.host ? (
          <Link
            href={`/admin/users/${data.host.id}`}
            className="text-14 leading-22 font-m text-primary-dark"
          >
            {data.host.name || data.host.phone}
          </Link>
        ) : (
          <span className="text-14 text-gray-9B9BAA">—</span>
        )}
        <span className="w-px h-16 bg-gray-E5E5E6" />
        <span className="text-13 leading-20 text-gray-6C6A7D">وضعیت احراز هویت :</span>
        <Badge tone={verification.tone}>{verification.label}</Badge>
      </Card>

      {/* Said once, at the top, where it cannot be missed. */}
      <Card className="p-14 bg-[#FFF8EC] border-r-4 border-r-[#B26A00]">
        <p className="text-13 leading-22 text-black">
          این مدارک <b>هویتی</b> هستند و فقط داخل پنل دیده می‌شوند — در هیچ صفحه‌ی عمومی نمایش
          داده نمی‌شوند. لطفاً از آن‌ها اسکرین‌شات نگیرید و لینکشان را جای دیگری نفرستید.
        </p>
      </Card>

      {!!error && (
        <Card className="p-14">
          <p className="text-13 leading-22 text-[#C62828]">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
        {DOCS.map((doc) => {
          const url = data[doc.field] as string | null;
          return (
            <Card key={doc.kind} className="p-16 flex flex-col">
              <div className="flex items-center justify-between gap-x-8 mb-2">
                <h3 className="text-14 leading-22 font-m text-black">{doc.label}</h3>
                {url ? <Badge tone="green">ثبت شده</Badge> : <Badge tone="gray">ندارد</Badge>}
              </div>
              <p className="text-11 leading-18 text-gray-9B9BAA mb-12">{doc.help}</p>

              <div className="rounded-10 border border-gray-E5E5E6 bg-gray-F7F7F7 h-[150px] flex items-center justify-center overflow-hidden mb-12">
                {url && isPreviewable(url) ? (
                  <button
                    type="button"
                    onClick={() => setViewing({ url, label: doc.label })}
                    className="w-full h-full"
                    title="بزرگ کردن"
                  >
                    {/* A plain <img>, not next/image: these are private files
                        behind the panel, and there is nothing to gain from
                        putting an identity document through a public image
                        optimiser and its cache. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={doc.label}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </button>
                ) : url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center gap-y-6 w-full h-full text-center px-10"
                  >
                    <i className="icon-Attach text-32 text-gray-9B9BAA" />
                    <span className="text-12 leading-20 text-primary-dark font-m">
                      {fileLabel(url)} — باز کردن
                    </span>
                    <span className="text-11 leading-16 text-gray-9B9BAA">
                      مرورگر این نوع فایل را پیش‌نمایش نمی‌دهد
                    </span>
                  </a>
                ) : (
                  <span className="text-12 leading-20 text-gray-9B9BAA">فایلی بارگذاری نشده</span>
                )}
              </div>

              <input
                ref={(el) => {
                  inputs.current[doc.kind] = el;
                }}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload(doc.kind, file);
                  e.target.value = "";
                }}
              />

              <div className="flex items-center gap-x-8 mt-auto">
                <Button
                  variant="secondary"
                  className="flex-1"
                  disabled={busy === doc.kind}
                  onClick={() => inputs.current[doc.kind]?.click()}
                >
                  {busy === doc.kind ? "…" : url ? "جایگزینی" : "بارگذاری"}
                </Button>
                {!!url && (
                  <Button
                    variant="danger"
                    disabled={busy === doc.kind}
                    onClick={() => remove(doc.kind)}
                  >
                    حذف
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.label ?? ""}
        width="max-w-[900px]"
      >
        {!!viewing && (
          <div className="max-h-[70vh] overflow-auto rounded-10 bg-gray-F7F7F7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewing.url} alt={viewing.label} className="w-full h-auto" />
          </div>
        )}
      </Modal>
    </div>
  );
}
