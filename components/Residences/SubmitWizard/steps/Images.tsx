import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { DragDropContext } from "react-beautiful-dnd";
import {
  deleteImage,
  reorderImages,
  setMainImage,
  updateImageTitle,
  uploadImage,
} from "@/api/Residences/hostWizard";
import type { THandleSmoothClose } from "@/components/General/core/BottomSheet";
import type {
  IConfirmDeleteImageBottomSheet,
  IUploadedImagePreviewBottomSheet,
  IUploadedResidenceImage,
} from "@/interfaces/Residences/Submit/Steps/Step_9";
import { StepLayout } from "../Shell";
import { MIN_IMAGES } from "../steps";
import { useWizard } from "../useWizard";
import { Callout, Section, StepSkeleton, faDigits } from "../ui";
import { shrink, validate } from "../imageTools";

const BottomSheet = dynamic(() => import("@/components/General/core/BottomSheet"), { ssr: true });
const UploadedResidenceImages = dynamic(
  () => import("@/components/Residences/Edit/shared/UploadedResidenceImages"),
  { ssr: false }
);
const UploadedImagePreviewBottomSheet = dynamic(
  () => import("@/components/Residences/Edit/shared/UploadedImagePreviewBottomSheet"),
  { ssr: true }
);
const ConfirmDeleteImageBottomSheet = dynamic(
  () => import("@/components/Residences/Edit/shared/ConfirmDeleteImageBottomSheet"),
  { ssr: true }
);

/**
 * Step seven: the photographs.
 *
 * The cards, the drag handle, the caption sheet and the delete confirmation
 * are the previous wizard's own components. An earlier attempt at this screen
 * rebuilt them and lost two things — the handle looked like a drag handle but
 * nothing was listening for a drag, and there was no way to edit a caption at
 * all. Reusing them is both closer to what hosts already know and one
 * implementation instead of two.
 *
 * ONE LIST. The cover used to be a separate box above the gallery, which made
 * the host answer a question they never asked: two upload targets, two mental
 * slots, and a photo dropped in the wrong one could only be moved by deleting
 * it. Now position one is the cover, full stop — the first photo uploaded
 * becomes it on its own, dragging a photo to the top makes it the cover, and
 * every other card carries «تصویر اصلی شود» for hosts who would rather not
 * drag.
 *
 * The order is committed by `POST /images/order`, which also DELETES any
 * non-main image missing from the list it is given. So the list sent is always
 * every photo still on screen — see `commitOrder`.
 */

const emptyPreviewSheet: IUploadedImagePreviewBottomSheet = { imagesData: [] };
const emptyDeleteSheet: IConfirmDeleteImageBottomSheet = {
  show: false,
  payload: { id: "0", data: null },
};

export default function ImagesStep() {
  const { draft, residenceId, commit, save, saveState, next, reload, progressMarker } = useWizard();

  /** Every photo, cover first. Held locally so a drag is instant. */
  const [gallery, setGallery] = useState<IUploadedResidenceImage[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  /** Local previews of photos still on their way up, keyed by upload token. */
  const [pending, setPending] = useState<{ token: string; url: string }[]>([]);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [previewSheet, setPreviewSheet] =
    useState<IUploadedImagePreviewBottomSheet>(emptyPreviewSheet);
  const [deleteSheet, setDeleteSheet] = useState<IConfirmDeleteImageBottomSheet>(emptyDeleteSheet);

  /** What the server currently has flagged, which may lag a local promote. */
  const serverMainId = useMemo(
    () => draft?.images?.find((image) => image.isMain)?.id,
    [draft?.images]
  );

  useEffect(() => {
    if (!draft) return;
    /**
     * Re-seeded when the server list changes length — an upload or a delete
     * has landed. Promoting and reordering are applied locally first and both
     * leave the length alone, so this cannot stamp on them.
     *
     * `isMain` decides position one, `sortOrder` decides the rest. Sorting on
     * `sortOrder` alone would put the cover wherever it happened to sit.
     */
    const server = [...(draft.images ?? [])].sort(
      (a, b) => Number(b.isMain) - Number(a.isMain) || a.sortOrder - b.sortOrder
    );
    if (seeded && server.length === gallery.length) return;
    setGallery(
      server.map((image) => ({
        id: String(image.id),
        title: image.title ?? "",
        data: image.url,
      }))
    );
    setSeeded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.images]);

  // ------------------------------------------------------------ uploading ---

  /**
   * How many photos go up at once.
   *
   * They used to go strictly one at a time, so picking eight on a phone meant
   * eight round trips end to end — most of that spent waiting rather than
   * sending. A small pool overlaps them without opening enough sockets to
   * starve the connection the page itself is using.
   */
  const UPLOAD_CONCURRENCY = 3;

  const addFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length || !residenceId) return;
      setUploadError(undefined);

      const accepted: { token: string; file: File; url: string }[] = [];
      for (const file of Array.from(files)) {
        const problem = validate(file);
        if (problem) {
          setUploadError(problem);
          continue;
        }
        accepted.push({
          token: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          // Shown immediately, straight from the file the host just picked, so
          // the wait is spent looking at their own photos rather than at a
          // spinner that could mean anything.
          url: URL.createObjectURL(file),
        });
      }
      if (!accepted.length) return;

      setPending(accepted.map(({ token, url }) => ({ token, url })));
      setUploading(accepted.map((item) => item.token));

      const queue = [...accepted];
      const worker = async () => {
        for (;;) {
          const item = queue.shift();
          if (!item) return;
          // Shrunk in the browser: a phone photo is 4–8 MB and the site never
          // shows it above 1600px.
          const prepared = await shrink(item.file);
          // No `isMain`: the server flags the first photo a listing ever gets,
          // which is the same rule this screen states. Sending it from here as
          // well would be a second opinion about the same thing.
          const result = await uploadImage(residenceId, prepared);
          if (!result.ok) setUploadError(result.message);
          setUploading((previous) => previous.filter((t) => t !== item.token));
          setPending((previous) => {
            const done = previous.find((p) => p.token === item.token);
            if (done) URL.revokeObjectURL(done.url);
            return previous.filter((p) => p.token !== item.token);
          });
        }
      };

      await Promise.all(
        Array.from({ length: Math.min(UPLOAD_CONCURRENCY, accepted.length) }, worker)
      );
      await reload();
    },
    [residenceId, reload]
  );

  // Nothing should hold an object URL open after this screen goes away.
  useEffect(() => {
    return () => {
      setPending((previous) => {
        previous.forEach((p) => URL.revokeObjectURL(p.url));
        return [];
      });
    };
  }, []);

  // ------------------------------------------------------------- the cover ---

  /**
   * Position one is the cover.
   *
   * Called after anything that can change what sits there — a drag, a promote,
   * or deleting the photo that held it. The server keeps `isMain` on a row and
   * `sortOrder` separately, so letting them disagree means the listing card
   * shows one photo while this screen shows another.
   */
  const syncCover = useCallback(
    (list: IUploadedResidenceImage[]) => {
      const first = list[0];
      if (!first || !residenceId) return;
      if (serverMainId !== undefined && String(serverMainId) === first.id) return;
      commit(async (id) => setMainImage(id, Number(first.id)));
    },
    [commit, residenceId, serverMainId]
  );

  function onDragEnd(result: any) {
    if (!result.destination) return;
    const reordered = [...gallery];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setGallery(reordered);
    syncCover(reordered);
  }

  function promoteToCover(imageId: string) {
    const promoted = gallery.find((image) => image.id === imageId);
    if (!promoted) return;
    const reordered = [promoted, ...gallery.filter((image) => image.id !== imageId)];
    setGallery(reordered);
    syncCover(reordered);
  }

  /**
   * Sends the whole gallery, always.
   *
   * `POST /images/order` deletes any non-main image absent from the list, so a
   * partial list is a delete instruction.
   */
  function commitOrder() {
    const ids = gallery.map((image) => Number(image.id)).filter((id) => Number.isFinite(id));
    if (ids.length === 0) return;
    commit(async (id) => reorderImages(id, ids, progressMarker));
  }

  // --------------------------------------------------------------- actions ---

  async function removeImage(imageId: string) {
    setDeleteSheet(emptyDeleteSheet);
    const wasCover = gallery[0]?.id === imageId;
    const remaining = gallery.filter((image) => image.id !== imageId);
    setGallery(remaining);
    if (!residenceId) return;
    await save(async (id) => deleteImage(id, Number(imageId)), { reload: true });
    // Deleting the cover leaves the listing with no flagged photo at all, and
    // nothing on the server promotes a replacement.
    if (wasCover && remaining.length > 0) {
      commit(async (id) => setMainImage(id, Number(remaining[0].id)));
    }
  }

  function renameImage(imageId: string, title: string) {
    setGallery((previous) =>
      previous.map((image) => (image.id === imageId ? { ...image, title } : image))
    );
    if (!residenceId) return;
    commit(async (id) => updateImageTitle(id, Number(imageId), title));
  }

  function onNext() {
    if (uploading.length > 0) {
      return ["تا پایان بارگذاری تصاویر صبر کنید."];
    }
    if (gallery.length === 0) {
      return ["حداقل یک تصویر بارگذاری کنید. تصویر اول، تصویر اصلی اقامتگاه است."];
    }
    if (gallery.length < MIN_IMAGES) {
      return [
        `حداقل ${faDigits(MIN_IMAGES)} تصویر بارگذاری کنید — الان ${faDigits(
          gallery.length
        )} تصویر دارید.`,
      ];
    }
    commitOrder();
    next();
  }

  if (!draft) return <StepSkeleton />;

  const short = gallery.length > 0 && gallery.length < MIN_IMAGES;

  return (
    <StepLayout
      onNext={onNext}
      busy={saveState === "saving" || uploading.length > 0}
      footerNote={
        short ? (
          <p className="text-12 font-l text-gray-77828F text-center">
            {faDigits(gallery.length)} تصویر — برای ادامه حداقل {faDigits(MIN_IMAGES)} تصویر لازم
            است.
          </p>
        ) : null
      }
    >
      {uploadError && (
        <div className="mb-16">
          <Callout tone="error">{uploadError}</Callout>
        </div>
      )}

      <Section
        title="تصاویر اقامتگاه"
        description="تصویر اول، تصویر اصلی اقامتگاه است و در نتایج جست‌وجو دیده می‌شود. با کشیدن دستگیره‌ی گوشه‌ی هر تصویر، ترتیب را عوض کنید."
      >
        {gallery.length > 0 && (
          <DragDropContext onDragEnd={onDragEnd}>
            <UploadedResidenceImages
              uploadedResidenceImages={gallery}
              setUploadedResidenceImages={setGallery}
              setUploadedImagePreviewBottomSheet={setPreviewSheet}
              setConfirmDeleteImageBottomSheet={setDeleteSheet}
              imagesBeingUploaded={[]}
              uploadedImagesToServer={[]}
              coverInList
              onMakeMain={(image) => promoteToCover(image.id)}
            />
          </DragDropContext>
        )}

        {/* The photos the host just picked, from the files themselves — on
            screen before a byte has been sent, so the wait has something to
            look at and it is obvious which ones are still going up. */}
        {pending.length > 0 && (
          <ul className="mt-12 grid grid-cols-3 gap-8 md:grid-cols-4">
            {pending.map((item) => (
              <li
                key={item.token}
                className="relative aspect-square overflow-hidden rounded-12 bg-gray-F3F5F7"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="h-full w-full object-cover opacity-60" />
                <span className="absolute inset-0 grid place-items-center">
                  <i
                    aria-hidden="true"
                    className="icon-Refresh text-24 text-primary-dark animate-spin"
                  />
                </span>
              </li>
            ))}
          </ul>
        )}

        <label
          className={`block rounded-16 border-2 border-dashed border-gray-DBDFE5 text-center cursor-pointer transition-colors hover:border-primary-main ${
            gallery.length > 0 ? "py-24 mt-12" : "py-32"
          }`}
        >
          {uploading.length > 0 ? (
            <>
              <i className="icon-Refresh text-28 text-primary-main animate-spin" />
              <p className="text-13 font-m text-black mt-8">
                در حال بارگذاری {faDigits(uploading.length)} تصویر…
              </p>
            </>
          ) : (
            <>
              <i className="icon-Photo-Upload text-32 text-gray-A9B1BC" />
              <p className="text-14 font-m text-black mt-8">
                {gallery.length > 0 ? "افزودن تصویر" : "افزودن تصویر اقامتگاه"}
              </p>
              <p className="text-12 font-l text-gray-77828F mt-4">
                می‌توانید چند تصویر با هم انتخاب کنید · JPG یا PNG، حداکثر ۱۰ مگابایت
              </p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => void addFiles(e.target.files)}
          />
        </label>
      </Section>

      {/* ---------------------------------------------------------- sheets --- */}
      {previewSheet.imagesData.length > 0 && (
        <BottomSheet
          open
          handleClose={() => setPreviewSheet(emptyPreviewSheet)}
          headerTitle="ویرایش تصویر"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            const item = previewSheet.imagesData[previewSheet.imagesData.length - 1];
            return (
              <div>
                <UploadedImagePreviewBottomSheet
                  handleSmoothClose={handleSmoothClose}
                  uploadedImageId={item.id}
                  uploadedImageData={item.imageData as File | string}
                  uploadedImageTitle={item.title}
                  isFirstTimeBeingEdited={item.isFirstTime}
                  onSubmit={(title: string) => {
                    renameImage(String(item.id), title);
                    setPreviewSheet(emptyPreviewSheet);
                  }}
                />
                {gallery[0]?.id !== String(item.id) && (
                  <button
                    type="button"
                    onClick={() => {
                      promoteToCover(String(item.id));
                      handleSmoothClose();
                    }}
                    className="w-full h-[44px] mt-12 rounded-12 border border-primary-main text-13 font-m text-primary-dark"
                  >
                    این تصویر، تصویر اصلی شود
                  </button>
                )}
              </div>
            );
          }}
        />
      )}

      {deleteSheet.show && (
        <BottomSheet
          open
          handleClose={() => setDeleteSheet(emptyDeleteSheet)}
          headerTitle="حذف تصویر"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => (
            <ConfirmDeleteImageBottomSheet
              handleSmoothClose={handleSmoothClose}
              uploadedImageData={deleteSheet.payload.data as File | string}
              onDeleteConfirm={() => void removeImage(String(deleteSheet.payload.id))}
            />
          )}
        />
      )}
    </StepLayout>
  );
}
