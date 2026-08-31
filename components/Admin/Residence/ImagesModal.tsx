import { useEffect, useRef, useState } from "react";
import { apiFetch, getToken } from "@/api/Admin/adminApi";
import { Badge, Button, Modal, adminImageUrl, faNum } from "@/components/Admin/ui";

/**
 * مدیریت تصاویر اقامتگاه.
 *
 * Both buttons on the residence page used to link at
 * `/admin/residences/[id]/images`, a page that was never built — so the only
 * way to change a listing's photos was through the host's own account.
 *
 * Four things happen here, and they are the four an agent actually needs:
 * choose the cover, put the rest in order, describe them, and remove one.
 *
 * Order is saved explicitly rather than on every drop. The reorder endpoint
 * *deletes* any non-main image missing from the list it is given, so a request
 * fired mid-drag from a half-built array would destroy photos. The full list
 * is always sent, and only when «ذخیره ترتیب» is pressed.
 */

interface Image {
  id: number;
  url: string;
  title: string | null;
  alt: string | null;
  isMain: boolean;
  sortOrder: number;
}

export default function ResidenceImagesModal({
  open,
  onClose,
  residenceId,
  images,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  residenceId: number;
  images: Image[];
  onChanged: () => void;
}) {
  const [order, setOrder] = useState<Image[]>([]);
  const [editing, setEditing] = useState<Image | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setOrder([...images].sort((a, b) => a.sortOrder - b.sortOrder));
      setError(null);
      setEditing(null);
    }
  }, [open, images]);

  const dirty =
    order.length === images.length &&
    order.some((img, i) => img.id !== [...images].sort((a, b) => a.sortOrder - b.sortOrder)[i]?.id);

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length) return;
    setOrder((list) => {
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function run(key: string, fn: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    try {
      await fn();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "انجام نشد");
    } finally {
      setBusy(null);
    }
  }

  const setMain = (img: Image) =>
    run(`main-${img.id}`, () =>
      apiFetch(`/api/admin/residences/${residenceId}/images/${img.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isMain: true }),
      })
    );

  const remove = (img: Image) =>
    run(`del-${img.id}`, async () => {
      await apiFetch(`/api/admin/residences/${residenceId}/images/${img.id}`, { method: "DELETE" });
      setOrder((list) => list.filter((i) => i.id !== img.id));
    });

  const saveOrder = () =>
    run("order", () =>
      apiFetch(`/api/admin/residences/${residenceId}/images/order`, {
        method: "POST",
        // Every id, always. The endpoint deletes non-main images it does not
        // see, so a partial list is a partial listing.
        body: JSON.stringify({ imageIds: order.map((i) => i.id) }),
      })
    );

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy("upload");
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("image", file);
        // `apiFetch` sets JSON headers; multipart needs the browser to write
        // its own boundary, so this one call goes out raw.
        const res = await fetch(`/api/admin/residences/${residenceId}/images`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken() ?? ""}` },
          body,
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.message ?? "بارگذاری نشد");
        }
      }
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "بارگذاری نشد");
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="تصاویر اقامتگاه" width="max-w-[980px]">
      <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-10 mb-14">
        <p className="text-12 leading-20 text-gray-6C6A7D">
          {faNum(order.length)} تصویر · برای جابه‌جایی بکشید و رها کنید، یا از فلش‌ها استفاده کنید.
        </p>
        <div className="flex items-center gap-x-8">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />
          <Button
            variant="secondary"
            disabled={busy === "upload"}
            onClick={() => fileInput.current?.click()}
          >
            <i className="icon-Upload text-16" />
            {busy === "upload" ? "در حال بارگذاری..." : "بارگذاری تصویر"}
          </Button>
          <Button disabled={!dirty || busy === "order"} onClick={saveOrder}>
            {busy === "order" ? "در حال ذخیره..." : "ذخیره ترتیب"}
          </Button>
        </div>
      </div>

      {error && <p className="mb-12 text-13 text-[#C62828]">{error}</p>}

      {order.length === 0 ? (
        <p className="py-40 text-center text-14 text-gray-6C6A7D">
          هنوز تصویری بارگذاری نشده.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {order.map((img, i) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null) move(dragIndex.current, i);
                dragIndex.current = null;
              }}
              className={`rounded-12 border overflow-hidden bg-white cursor-move transition ${
                img.isMain ? "border-primary-main" : "border-gray-E5E5E6 hover:border-gray-C4CAD3"
              }`}
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={adminImageUrl(img.url, 384)}
                  alt={img.alt ?? ""}
                  className="w-full h-[120px] object-cover"
                />
                {img.isMain && (
                  <span className="absolute top-6 right-6">
                    <Badge tone="green">شاخص</Badge>
                  </span>
                )}
                <span className="absolute top-6 left-6 px-6 py-2 rounded-6 bg-black/50 text-white text-10 leading-16">
                  {faNum(i + 1)}
                </span>
              </div>

              <div className="p-8">
                <p className="text-11 leading-18 text-gray-6C6A7D truncate mb-2">
                  {img.title || <span className="text-gray-9B9BAA">بدون عنوان</span>}
                </p>
                <p className="text-10 leading-16 text-gray-9B9BAA truncate mb-8">
                  {img.alt ? `alt: ${img.alt}` : "بدون متن جایگزین"}
                </p>

                <div className="flex items-center gap-x-4">
                  <IconBtn title="جابه‌جایی به راست" onClick={() => move(i, i - 1)}>
                    ›
                  </IconBtn>
                  <IconBtn title="جابه‌جایی به چپ" onClick={() => move(i, i + 1)}>
                    ‹
                  </IconBtn>
                  <IconBtn title="ویرایش عنوان و متن جایگزین" onClick={() => setEditing(img)}>
                    <i className="icon-Edit text-13" />
                  </IconBtn>
                  {!img.isMain && (
                    <IconBtn
                      title="انتخاب به‌عنوان تصویر شاخص"
                      disabled={busy === `main-${img.id}`}
                      onClick={() => setMain(img)}
                    >
                      <i className="icon-Star text-13" />
                    </IconBtn>
                  )}
                  <IconBtn
                    title="حذف تصویر"
                    danger
                    disabled={busy === `del-${img.id}` || img.isMain}
                    onClick={() => remove(img)}
                  >
                    <i className="icon-Delete text-13" />
                  </IconBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* The main image cannot be deleted from here: a listing with no cover
          renders a grey box everywhere it appears. Promote another first. */}
      <p className="mt-12 text-11 leading-18 text-gray-9B9BAA">
        برای حذف تصویر شاخص، اول تصویر دیگری را شاخص کنید.
      </p>

      <div className="flex justify-end mt-16">
        <Button variant="secondary" onClick={onClose}>
          بستن
        </Button>
      </div>

      <EditImageModal
        image={editing}
        residenceId={residenceId}
        onClose={() => setEditing(null)}
        onSaved={onChanged}
      />
    </Modal>
  );
}

function IconBtn({
  children,
  title,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`w-26 h-26 rounded-8 border text-12 leading-none flex items-center justify-center transition disabled:opacity-35 ${
        danger
          ? "border-gray-E5E5E6 text-gray-9B9BAA hover:border-[#E53935] hover:text-[#E53935]"
          : "border-gray-E5E5E6 text-gray-6C6A7D hover:border-gray-C4CAD3 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * عنوان و متن جایگزین.
 *
 * Two fields rather than one because they are read by different people: the
 * title is the caption a visitor sees, the alt is what a screen reader says
 * and what Google indexes when the file will not load.
 */
function EditImageModal({
  image,
  residenceId,
  onClose,
  onSaved,
}: {
  image: Image | null;
  residenceId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (image) {
      setTitle(image.title ?? "");
      setAlt(image.alt ?? "");
      setError(null);
    }
  }, [image]);

  async function save() {
    if (!image) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/images/${image.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: title.trim() || null, alt: alt.trim() || null }),
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!image} onClose={onClose} title="عنوان و متن جایگزین" width="max-w-[460px]">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={adminImageUrl(image.url, 384)}
          alt=""
          className="w-full h-[160px] object-cover rounded-12 mb-14"
        />
      )}

      <label className="block mb-12">
        <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">عنوان تصویر</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثلاً: نمای حیاط"
          className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main"
        />
      </label>

      <label className="block">
        <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">
          متن جایگزین (alt)
        </span>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="توصیف تصویر برای موتور جستجو و صفحه‌خوان"
          className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main"
        />
        <span className="block mt-4 text-11 leading-18 text-gray-9B9BAA">
          چیزی که در تصویر دیده می‌شود را بنویسید، نه نام اقامتگاه.
        </span>
      </label>

      {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}

      <div className="flex justify-end gap-x-8 mt-16">
        <Button variant="secondary" onClick={onClose}>
          انصراف
        </Button>
        <Button disabled={busy} onClick={save}>
          {busy ? "در حال ذخیره..." : "ذخیره"}
        </Button>
      </div>
    </Modal>
  );
}
