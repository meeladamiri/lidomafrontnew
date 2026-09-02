import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteImage,
  reorderImages,
  setMainImage,
  uploadImage,
  type DraftImage,
} from "@/api/Residences/hostWizard";
import { StepLayout } from "../Shell";
import { MIN_IMAGES } from "../steps";
import { useWizard } from "../useWizard";
import { Callout, faDigits, Spinner, StepSkeleton } from "../ui";
import { humanSize, shrink, validate } from "../imageTools";

/**
 * Step seven: the photographs.
 *
 * The one screen where a host is most likely to give up, so it does the work
 * for them: files are checked and resized here, uploaded one at a time with
 * visible progress, and the gallery stays usable while they land.
 *
 * Order is committed on «ادامه» rather than after every drag — the reorder
 * endpoint also deletes anything missing from the list it is sent, so it is
 * not something to fire on every pointer move.
 */

interface Pending {
  key: string;
  name: string;
  size: number;
  previewUrl: string;
  percent: number;
  error?: string;
}

let pendingSeed = 0;

export default function ImagesStep() {
  const { draft, save, saveState, next, reload, progressMarker } = useWizard();
  const [images, setImages] = useState<DraftImage[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    if (seeded || !draft) return;
    setImages([...(draft.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder));
    setSeeded(true);
  }, [draft, seeded]);

  // Object URLs are a real allocation; a host who adds twenty photos and walks
  // away should not leave twenty of them behind.
  useEffect(
    () => () => {
      pending.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    },
    [pending]
  );

  const upload = useCallback(
    async (files: File[]) => {
      if (!draft) return;
      const rejections: string[] = [];
      const accepted: File[] = [];

      files.forEach((file) => {
        const problem = validate(file);
        if (problem) rejections.push(`${file.name} — ${problem}`);
        else accepted.push(file);
      });
      setRejected(rejections);

      for (const file of accepted) {
        const key = `pending-${++pendingSeed}`;
        const previewUrl = URL.createObjectURL(file);
        setPending((previous) => [
          ...previous,
          { key, name: file.name, size: file.size, previewUrl, percent: 0 },
        ]);

        const prepared = await shrink(file);
        const result = await uploadImage(draft.id, prepared, {
          onProgress: (percent) =>
            setPending((previous) =>
              previous.map((item) => (item.key === key ? { ...item, percent } : item))
            ),
        });

        if (result.ok) {
          setImages((previous) => [...previous, result.data]);
          setPending((previous) => {
            previous.filter((i) => i.key === key).forEach((i) => URL.revokeObjectURL(i.previewUrl));
            return previous.filter((item) => item.key !== key);
          });
        } else {
          // The failed tile stays, with its reason and a way to try again —
          // rather than vanishing and leaving the host to guess.
          setPending((previous) =>
            previous.map((item) =>
              item.key === key ? { ...item, error: result.message, percent: 0 } : item
            )
          );
        }
      }
    },
    [draft]
  );

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
    void upload([...event.dataTransfer.files]);
  }

  async function remove(image: DraftImage) {
    if (!draft) return;
    setBusyId(image.id);
    const result = await deleteImage(draft.id, image.id);
    setBusyId(null);
    if (result.ok) setImages((previous) => previous.filter((i) => i.id !== image.id));
  }

  async function promote(image: DraftImage) {
    if (!draft || image.isMain) return;
    setBusyId(image.id);
    const result = await setMainImage(draft.id, image.id);
    setBusyId(null);
    if (result.ok) {
      setImages((previous) =>
        previous.map((i) => ({ ...i, isMain: i.id === image.id }))
      );
    }
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((previous) => {
      const copy = [...previous];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  };

  async function onNext() {
    if (images.length < MIN_IMAGES) return;
    const ok = await save(
      async (id) => reorderImages(id, images.map((image) => image.id), progressMarker),
      { reload: true }
    );
    if (ok) next();
  }

  if (!seeded) return <StepSkeleton />;

  const uploading = pending.some((item) => !item.error);
  const short = MIN_IMAGES - images.length;

  return (
    <StepLayout
      onNext={onNext}
      busy={saveState === "saving"}
      nextDisabled={images.length < MIN_IMAGES || uploading}
      footerNote={
        short > 0 ? (
          <p className="text-12 font-l text-gray-77828F text-center">
            {faDigits(short)} تصویر دیگر لازم است.
          </p>
        ) : null
      }
    >
      {/* Drop zone. Also a real button, so it works without a pointer. */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-16 border-2 border-dashed transition-colors ${
          dragOver ? "border-primary-main bg-primary-light/30" : "border-gray-DBDFE5 bg-gray-F7F7F7"
        }`}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-32 px-16 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main rounded-16"
        >
          <i className="icon-Photo-Upload text-40 text-primary-dark" />
          <span className="block text-14 font-b text-black mt-12">
            تصاویر را اینجا رها کنید یا انتخاب کنید
          </span>
          <span className="block text-12 font-l text-gray-77828F mt-4">
            JPG یا PNG · حداکثر ۱۰ مگابایت · دست‌کم {faDigits(MIN_IMAGES)} تصویر
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void upload([...(e.target.files ?? [])]);
            // Same file twice in a row must still fire a change event.
            e.target.value = "";
          }}
        />
      </div>

      {rejected.length > 0 && (
        <div className="mt-16">
          <Callout tone="warning">
            <p className="font-m mb-4">این فایل‌ها اضافه نشدند:</p>
            <ul className="list-disc pr-16">
              {rejected.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Callout>
        </div>
      )}

      {(images.length > 0 || pending.length > 0) && (
        <div className="mt-20">
          <div className="flex items-baseline justify-between mb-10">
            <h3 className="text-15 font-b text-black">
              تصاویر ({faDigits(images.length)})
            </h3>
            <span className="text-12 font-l text-gray-77828F">
              اولین تصویر، کاور اقامتگاه است.
            </span>
          </div>

          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-12">
            {images.map((image, index) => (
              <li
                key={image.id}
                draggable
                onDragStart={() => (dragIndex.current = index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex.current !== null) move(dragIndex.current, index);
                  dragIndex.current = null;
                }}
                className="relative group rounded-12 overflow-hidden border border-gray-DBDFE5 bg-gray-F7F7F7"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.title || `تصویر ${faDigits(index + 1)} اقامتگاه`}
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                />

                {index === 0 && (
                  <span className="absolute top-8 right-8 px-8 py-2 rounded-full bg-black/70 text-10 font-m text-white">
                    کاور
                  </span>
                )}

                {busyId === image.id && (
                  <span className="absolute inset-0 bg-white/70 grid place-items-center">
                    <Spinner />
                  </span>
                )}

                <div className="flex items-center justify-between gap-x-4 p-6 bg-white">
                  <div className="flex items-center gap-x-2">
                    <button
                      type="button"
                      onClick={() => move(index, index - 1)}
                      disabled={index === 0}
                      aria-label={`انتقال تصویر ${faDigits(index + 1)} به عقب`}
                      className="w-28 h-28 rounded-8 grid place-items-center text-gray-77828F hover:text-black disabled:opacity-30"
                    >
                      <i className="icon-FlashRight text-14" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, index + 1)}
                      disabled={index === images.length - 1}
                      aria-label={`انتقال تصویر ${faDigits(index + 1)} به جلو`}
                      className="w-28 h-28 rounded-8 grid place-items-center text-gray-77828F hover:text-black disabled:opacity-30"
                    >
                      <i className="icon-FlashLeft text-14" />
                    </button>
                  </div>

                  <div className="flex items-center gap-x-2">
                    <button
                      type="button"
                      onClick={() => void promote(image)}
                      aria-label={`انتخاب تصویر ${faDigits(index + 1)} به‌عنوان تصویر اصلی`}
                      aria-pressed={image.isMain}
                      className={`w-28 h-28 rounded-8 grid place-items-center transition-colors ${
                        image.isMain ? "text-warning" : "text-gray-77828F hover:text-warning"
                      }`}
                    >
                      <i className={`${image.isMain ? "icon-StarFill" : "icon-Star"} text-14`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(image)}
                      aria-label={`حذف تصویر ${faDigits(index + 1)}`}
                      className="w-28 h-28 rounded-8 grid place-items-center text-gray-77828F hover:text-error-light transition-colors"
                    >
                      <i className="icon-Delete text-14" />
                    </button>
                  </div>
                </div>
              </li>
            ))}

            {pending.map((item) => (
              <li
                key={item.key}
                className="relative rounded-12 overflow-hidden border border-gray-DBDFE5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="w-full aspect-[4/3] object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-white/60 grid place-items-center px-10 text-center">
                  {item.error ? (
                    <div>
                      <i className="icon-ErrorFill text-20 text-error-light" />
                      <p className="text-10 font-m text-error-light mt-4">{item.error}</p>
                      <button
                        type="button"
                        onClick={() =>
                          setPending((previous) => previous.filter((p) => p.key !== item.key))
                        }
                        className="text-10 font-m text-gray-77828F underline mt-4"
                      >
                        حذف از فهرست
                      </button>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="h-4 rounded-full bg-gray-DBDFE5 overflow-hidden">
                        <div
                          className="h-full bg-primary-main transition-all"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <p className="text-10 font-l text-gray-77828F mt-6">
                        {faDigits(item.percent)}٪ · {humanSize(item.size)}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {images.length === 0 && pending.length === 0 && (
        <div className="mt-20">
          <Callout tone="info">
            اقامتگاه‌هایی که تصویر روشن و روزانه دارند، بیشتر از بقیه رزرو می‌شوند. نمای بیرونی،
            اتاق‌ها، آشپزخانه و سرویس را نشان دهید.
          </Callout>
        </div>
      )}
    </StepLayout>
  );
}
