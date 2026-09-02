import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
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
 * The card shape is the previous wizard's: a full-width cover picture with the
 * position badge and the delete button over it, a drag handle in the corner,
 * and a caption row underneath. Reordering uses react-beautiful-dnd, which the
 * old step used and the edit flow still does — the HTML5 drag events this step
 * shipped with dropped items when the pointer left the tile, which on a phone
 * is most of the time.
 *
 * Order is committed on «ادامه» rather than after every drag: the reorder
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

/** Next refuses hosts it was not told about; a plain img is the honest fallback. */
function Photo({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 480px, 100vw"
      style={{ objectFit: "cover" }}
      onError={() => setFailed(true)}
      unoptimized={src.startsWith("blob:") || src.startsWith("data:")}
    />
  );
}

export default function ImagesStep() {
  const { draft, save, saveState, next, progressMarker } = useWizard();
  const [images, setImages] = useState<DraftImage[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (seeded || !draft) return;
    setImages([...(draft.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder));
    setSeeded(true);
  }, [draft, seeded]);

  // Object URLs are a real allocation; twenty of them should not outlive the step.
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
          // The failed tile stays, with its reason and a way to retry —
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
    if (result.ok) setImages((previous) => previous.map((i) => ({ ...i, isMain: i.id === image.id })));
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
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
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void upload([...e.dataTransfer.files]);
        }}
        className={`rounded-16 border-2 border-dashed transition-colors ${
          dragOver ? "border-primary-main bg-primary-light/30" : "border-gray-DBDFE5 bg-gray-F7F7F7"
        }`}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-32 px-16 text-center rounded-16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main"
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
            e.target.value = ""; // same file twice in a row must still fire
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
            <h3 className="text-15 font-b text-black">تصاویر ({faDigits(images.length)})</h3>
            <span className="text-12 font-l text-gray-77828F">
              با دسته‌ی گوشه‌ی تصویر جابه‌جا کنید.
            </span>
          </div>

          <DragDropContext
            onDragEnd={(result: any) => {
              if (!result.destination) return;
              move(result.source.index, result.destination.index);
            }}
          >
            <Droppable droppableId="residence-images">
              {(dropProvided: any) => (
                <div ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
                  {images.map((image, index) => (
                    <Draggable key={image.id} draggableId={String(image.id)} index={index}>
                      {(provided: any, snapshot: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`mb-16 last:mb-0 rounded-12 ${
                            snapshot.isDragging ? "shadow-[0_8px_24px_rgba(0,0,0,0.18)]" : ""
                          }`}
                        >
                          <div className="w-full h-[214px] relative rounded-tr-12 rounded-tl-12 overflow-hidden bg-gray-F3F5F7">
                            <Photo
                              src={image.url}
                              alt={image.title || `تصویر ${faDigits(index + 1)} اقامتگاه`}
                            />

                            <div className="flex items-start justify-between absolute top-12 right-12 left-12">
                              <div className="flex items-center gap-x-6">
                                <span className="w-24 h-24 flex items-center justify-center rounded-full bg-white text-12 font-m text-black">
                                  {faDigits(index + 1)}
                                </span>
                                {image.isMain && (
                                  <span className="h-24 px-10 flex items-center rounded-full bg-white text-11 font-m text-black">
                                    تصویر اصلی
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => void remove(image)}
                                aria-label={`حذف تصویر ${faDigits(index + 1)}`}
                                className="w-40 h-40 flex items-center justify-center rounded-full bg-error-light"
                              >
                                <i className="icon-Delete text-20 text-white" />
                              </button>
                            </div>

                            {busyId === image.id && (
                              <span className="absolute inset-0 bg-white/70 grid place-items-center">
                                <Spinner />
                              </span>
                            )}

                            <div
                              {...provided.dragHandleProps}
                              aria-label={`جابه‌جایی تصویر ${faDigits(index + 1)}`}
                              className="w-40 h-40 rounded-full bg-white flex items-center justify-center absolute bottom-12 left-12 cursor-grab active:cursor-grabbing"
                            >
                              <i className="icon-Move text-20 text-black" />
                            </div>

                            <button
                              type="button"
                              onClick={() => setLightbox(image.url)}
                              aria-label={`مشاهده تصویر ${faDigits(index + 1)}`}
                              className="w-40 h-40 rounded-full bg-white flex items-center justify-center absolute bottom-12 right-12"
                            >
                              <i className="icon-See text-20 text-black" />
                            </button>
                          </div>

                          <div className="py-10 px-16 flex items-center justify-between bg-gray-F7F7F7 rounded-br-12 rounded-bl-12">
                            <p className="text-13 font-m text-black truncate">
                              {image.title || `تصویر ${faDigits(index + 1)}`}
                            </p>

                            <div className="flex items-center gap-x-4 shrink-0">
                              <button
                                type="button"
                                onClick={() => void promote(image)}
                                aria-pressed={image.isMain}
                                aria-label={`انتخاب تصویر ${faDigits(index + 1)} به‌عنوان تصویر اصلی`}
                                className={`w-32 h-32 rounded-8 grid place-items-center transition-colors ${
                                  image.isMain
                                    ? "text-warning"
                                    : "text-gray-77828F hover:text-warning"
                                }`}
                              >
                                <i className={`${image.isMain ? "icon-StarFill" : "icon-Star"} text-18`} />
                              </button>
                              <button
                                type="button"
                                onClick={() => move(index, index - 1)}
                                disabled={index === 0}
                                aria-label={`انتقال تصویر ${faDigits(index + 1)} به عقب`}
                                className="w-32 h-32 rounded-8 grid place-items-center text-gray-77828F hover:text-black disabled:opacity-30"
                              >
                                <i className="icon-FlashRight text-16" />
                              </button>
                              <button
                                type="button"
                                onClick={() => move(index, index + 1)}
                                disabled={index === images.length - 1}
                                aria-label={`انتقال تصویر ${faDigits(index + 1)} به جلو`}
                                className="w-32 h-32 rounded-8 grid place-items-center text-gray-77828F hover:text-black disabled:opacity-30"
                              >
                                <i className="icon-FlashLeft text-16" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {dropProvided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {pending.map((item) => (
            <div
              key={item.key}
              className="mt-16 rounded-12 overflow-hidden border border-gray-DBDFE5"
            >
              <div className="w-full h-[140px] relative bg-gray-F3F5F7">
                <Photo src={item.previewUrl} alt="" />
                <div className="absolute inset-0 bg-white/70 grid place-items-center px-24 text-center">
                  {item.error ? (
                    <div>
                      <i className="icon-ErrorFill text-24 text-error-light" />
                      <p className="text-12 font-m text-error-light mt-4">{item.error}</p>
                      <button
                        type="button"
                        onClick={() =>
                          setPending((previous) => previous.filter((p) => p.key !== item.key))
                        }
                        className="text-11 font-m text-gray-77828F underline mt-4"
                      >
                        حذف از فهرست
                      </button>
                    </div>
                  ) : (
                    <div className="w-full max-w-[260px]">
                      <div className="h-4 rounded-full bg-gray-DBDFE5 overflow-hidden">
                        <div
                          className="h-full bg-primary-main transition-all"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <p className="text-11 font-l text-gray-77828F mt-6">
                        {faDigits(item.percent)}٪ · {humanSize(item.size)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="نمایش تصویر"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightbox(null)}
          className="fixed inset-0 z-5 bg-black/80 grid place-items-center p-16"
        >
          <div className="relative w-full max-w-[900px] h-[70vh]">
            <Photo src={lightbox} alt="تصویر اقامتگاه" />
          </div>
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="بستن"
            className="absolute top-16 left-16 w-44 h-44 rounded-full bg-white grid place-items-center"
          >
            <i className="icon-Close text-20 text-black" />
          </button>
        </div>
      )}
    </StepLayout>
  );
}
