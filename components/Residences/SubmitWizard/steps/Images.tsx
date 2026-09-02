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
const ResidenceMainImage = dynamic(
  () => import("@/components/Residences/Edit/shared/ResidenceMainImage"),
  { ssr: false }
);
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
const EditMainImageBottomSheet = dynamic(
  () => import("@/components/Residences/Edit/shared/EditMainImageBottomSheet"),
  { ssr: true }
);

/**
 * Step seven: the photographs.
 *
 * The cards, the drag handle, the caption sheet and the delete confirmation
 * are the previous wizard's own components. An earlier attempt at this screen
 * rebuilt them and lost two things in the process — the handle looked like a
 * drag handle but nothing was listening for a drag, and there was no way to
 * edit a caption at all. Reusing them is both closer to what hosts already
 * know and one implementation instead of two.
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

  /** Gallery order held locally so a drag is instant; the server follows. */
  const [gallery, setGallery] = useState<IUploadedResidenceImage[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [previewSheet, setPreviewSheet] =
    useState<IUploadedImagePreviewBottomSheet>(emptyPreviewSheet);
  const [deleteSheet, setDeleteSheet] = useState<IConfirmDeleteImageBottomSheet>(emptyDeleteSheet);
  const [coverSheet, setCoverSheet] = useState(false);

  const main = useMemo(() => draft?.images?.find((image) => image.isMain), [draft]);

  useEffect(() => {
    if (!draft) return;
    // Re-seeded whenever the server list changes length: an upload or a delete
    // has landed and the local order needs to include it.
    const server = (draft.images ?? [])
      .filter((image) => !image.isMain)
      .sort((a, b) => a.sortOrder - b.sortOrder);
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

  const addFiles = useCallback(
    async (files: FileList | null, asCover = false) => {
      if (!files?.length || !residenceId) return;
      setUploadError(undefined);

      for (const file of Array.from(files)) {
        const problem = validate(file);
        if (problem) {
          setUploadError(problem);
          continue;
        }
        const token = `${file.name}-${Date.now()}`;
        setUploading((previous) => [...previous, token]);
        // Shrunk in the browser: a phone photo is 4–8 MB and the site never
        // shows it above 1600px.
        const prepared = await shrink(file);
        const result = await uploadImage(residenceId, prepared, {
          isMain: asCover || undefined,
        });
        setUploading((previous) => previous.filter((t) => t !== token));
        if (!result.ok) {
          setUploadError(result.message);
          continue;
        }
      }
      await reload();
    },
    [residenceId, reload]
  );

  // ------------------------------------------------------------ reordering ---

  function onDragEnd(result: any) {
    if (!result.destination) return;
    const next = [...gallery];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setGallery(next);
  }

  /**
   * Sends the whole gallery, always.
   *
   * `POST /images/order` deletes any non-main image absent from the list, so a
   * partial list is a delete instruction. The main image is included too: it
   * is excluded from that deletion rule, and sending it keeps its sortOrder
   * consistent with everything else.
   */
  function commitOrder() {
    const ids = [...(main ? [main.id] : []), ...gallery.map((image) => Number(image.id))];
    commit(async (id) => reorderImages(id, ids, progressMarker));
  }

  // --------------------------------------------------------------- actions ---

  async function removeImage(imageId: string) {
    setDeleteSheet(emptyDeleteSheet);
    setGallery((previous) => previous.filter((image) => image.id !== imageId));
    if (!residenceId) return;
    await save(async (id) => deleteImage(id, Number(imageId)), { reload: true });
  }

  async function renameImage(imageId: string, title: string) {
    setGallery((previous) =>
      previous.map((image) => (image.id === imageId ? { ...image, title } : image))
    );
    if (!residenceId) return;
    commit(async (id) => updateImageTitle(id, Number(imageId), title));
  }

  async function promoteToCover(imageId: string) {
    if (!residenceId) return;
    await save(async (id) => setMainImage(id, Number(imageId)), { reload: true });
  }

  function onNext() {
    commitOrder();
    next();
  }

  if (!draft) return <StepSkeleton />;

  const total = (main ? 1 : 0) + gallery.length;
  const short = total < MIN_IMAGES;

  return (
    <StepLayout
      onNext={onNext}
      busy={saveState === "saving"}
      nextDisabled={!main}
      footerNote={
        !main ? (
          <p className="text-12 font-l text-gray-77828F text-center">
            برای ادامه حداقل یک تصویر لازم است.
          </p>
        ) : short ? (
          <p className="text-12 font-l text-gray-77828F text-center">
            {faDigits(total)} تصویر — پیشنهاد ما حداقل {faDigits(MIN_IMAGES)} تصویر است.
          </p>
        ) : null
      }
    >
      {uploadError && (
        <div className="mb-16">
          <Callout tone="error">{uploadError}</Callout>
        </div>
      )}

      {/* ---------------------------------------------------------- cover --- */}
      <Section title="تصویر اصلی" description="اولین چیزی که مهمان در نتایج جست‌وجو می‌بیند.">
        {main ? (
          <ResidenceMainImage
            uploadedResidenceImage={{
              id: String(main.id),
              title: main.title ?? "",
              data: main.url,
            }}
            imageIndex={0}
            canBeDeleted={false}
            onEditMainImageBtnClick={() => setCoverSheet(true)}
            id={main.id}
            setUploadedImagePreviewBottomSheet={setPreviewSheet}
            isBeingUploaded={false}
            isUploadSuccess={false}
          />
        ) : (
          <label className="block rounded-16 border-2 border-dashed border-gray-DBDFE5 py-32 text-center cursor-pointer transition-colors hover:border-primary-main">
            <i className="icon-Photo-Upload text-36 text-gray-A9B1BC" />
            <p className="text-14 font-m text-black mt-10">افزودن تصویر اصلی</p>
            <p className="text-12 font-l text-gray-77828F mt-4">JPG یا PNG، حداکثر ۱۰ مگابایت</p>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void addFiles(e.target.files, true)}
            />
          </label>
        )}
      </Section>

      {/* -------------------------------------------------------- gallery --- */}
      <Section
        title="تصاویر دیگر"
        description="با کشیدن دستگیره‌ی گوشه‌ی هر تصویر، ترتیب را عوض کنید."
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <UploadedResidenceImages
            uploadedResidenceImages={gallery}
            setUploadedResidenceImages={setGallery}
            setUploadedImagePreviewBottomSheet={setPreviewSheet}
            setConfirmDeleteImageBottomSheet={setDeleteSheet}
            imagesBeingUploaded={[]}
            uploadedImagesToServer={[]}
          />
        </DragDropContext>

        <label className="block rounded-16 border-2 border-dashed border-gray-DBDFE5 py-24 text-center cursor-pointer transition-colors hover:border-primary-main mt-12">
          {uploading.length > 0 ? (
            <>
              <i className="icon-Refresh text-28 text-primary-main animate-spin" />
              <p className="text-13 font-m text-black mt-8">
                در حال بارگذاری {faDigits(uploading.length)} تصویر…
              </p>
            </>
          ) : (
            <>
              <i className="icon-Plus text-28 text-gray-A9B1BC" />
              <p className="text-13 font-m text-black mt-8">افزودن تصویر</p>
              <p className="text-11 font-l text-gray-77828F mt-2">
                می‌توانید چند تصویر با هم انتخاب کنید
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
                    void renameImage(String(item.id), title);
                    setPreviewSheet(emptyPreviewSheet);
                  }}
                />
                {/* Promoting a gallery photo is only meaningful here. */}
                {String(item.id) !== String(main?.id) && (
                  <button
                    type="button"
                    onClick={() => {
                      void promoteToCover(String(item.id));
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

      {coverSheet && main && (
        <BottomSheet
          open
          handleClose={() => setCoverSheet(false)}
          headerTitle="تغییر تصویر اصلی"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => (
            <EditMainImageBottomSheet
              handleSmoothClose={handleSmoothClose}
              uploadedImageData={main.url}
              onNewImageConfirm={(file: File) => {
                const list = new DataTransfer();
                list.items.add(file);
                void addFiles(list.files, true);
                setCoverSheet(false);
              }}
            />
          )}
        />
      )}
    </StepLayout>
  );
}
