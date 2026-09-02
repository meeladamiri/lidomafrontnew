import { THandleSmoothClose } from "components/General/core/BottomSheet";
import {
  confirmDeleteImageBottomSheet_InitV,
  uploadedImagePreviewBottomSheet_InitV,
} from "constants/Residences/Submit/Steps/Step_9";
import {
  IConfirmDeleteImageBottomSheet,
  IUploadedImagePreviewBottomSheet,
  IUploadedResidenceImage,
} from "interfaces/Residences/Submit/Steps/Step_9";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { monotonicFactory } from "ulid";
import UploadedResidenceImages from "../shared/UploadedResidenceImages";
import { useRouter } from "next/router";
import { editResidenceImage } from "@/api/EditResidenceImages";
import dynamic from "next/dynamic";

const BottomSheet = dynamic(() => import("components/General/core/BottomSheet"), {
  ssr: true,
});
const UploadedImagePreviewBottomSheet = dynamic(
  () => import("../shared/UploadedImagePreviewBottomSheet"),
  {
    ssr: true,
  }
);
const ConfirmDeleteImageBottomSheet = dynamic(
  () => import("../shared/ConfirmDeleteImageBottomSheet"),
  {
    ssr: true,
  }
);
const UploadBox = dynamic(
  () => import("@/components/General/UploadBox/UploadBox").then((module) => module.UploadBox),
  {
    ssr: true,
  }
);
const ResidenceMainImage = dynamic(() => import("../shared/ResidenceMainImage"), {
  ssr: true,
});
const EditMainImageBottomSheet = dynamic(
  () => import("../shared/EditMainImageBottomSheet"),
  {
    ssr: true,
  }
);

const ulid = monotonicFactory();

const EditResidenceImages = ({
  uploadedResidenceImages,
  setUploadedResidenceImages,
  imagesBeingUploaded,
  setImagesBeingUploaded,
  uploadedImagesToServer,
  setUploadedImagesToServer,
  mainImage,
  setMainImage,
  mainImageIsUploading,
  setMainImageIsUploading,
  mainImageUploadSuccess,
  setMainImageUploadSuccess,
}: {
  uploadedResidenceImages: IUploadedResidenceImage[];
  setUploadedResidenceImages: Dispatch<SetStateAction<IUploadedResidenceImage[]>>;
  imagesBeingUploaded: IUploadedResidenceImage[];
  setImagesBeingUploaded: Dispatch<SetStateAction<IUploadedResidenceImage[]>>;
  uploadedImagesToServer: {
    image_id: number;
    origin_id: string;
    product_id: number;
  }[];
  setUploadedImagesToServer: Dispatch<
    SetStateAction<
      {
        image_id: number;
        origin_id: string;
        product_id: number;
      }[]
    >
  >;
  mainImage: File | string | undefined;
  setMainImage: Dispatch<SetStateAction<File | string | undefined>>;
  mainImageIsUploading: boolean;
  setMainImageIsUploading: Dispatch<SetStateAction<boolean>>;
  mainImageUploadSuccess: boolean;
  setMainImageUploadSuccess: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const realFileBtn = useRef<any>();
  const mainImageRealFileBtn = useRef<any>();
  const [multipleImages, setMultipleImages] = useState<File[]>([]);
  const [multipleImagesPreview, setMultipleImagesPreview] = useState<FileReader["result"][]>([]);

  const [mainImageText, setMainImageText] = useState<string>("تصویر اصلی");
  const [showEditMainImageBottomSheet, setShowEditMainImageBottomSheet] = useState<boolean>(false);

  const [confirmDeleteImageBottomSheet, setConfirmDeleteImageBottomSheet] =
    useState<IConfirmDeleteImageBottomSheet>(confirmDeleteImageBottomSheet_InitV);
  const [uploadedImagePreviewBottomSheet, setUploadedImagePreviewBottomSheet] =
    useState<IUploadedImagePreviewBottomSheet>(uploadedImagePreviewBottomSheet_InitV);
  const [showUploadedImagePreviewBottomSheet, setShowUploadedImagePreviewBottomSheet] =
    useState<boolean>(false);

  async function uploadNewResidenceImageAPI_Call({
    resImage,
    imageLabel,
    imageObject,
  }: {
    resImage: any;
    imageLabel: string;
    imageObject: IUploadedResidenceImage;
  }) {
    setImagesBeingUploaded((prev) => [...prev, imageObject]);

    const response = await editResidenceImage({
      img: resImage,
      imgLabel: imageLabel,
      productId: Number(router?.query?.id as string),
      origin_id: imageObject.id,
    });

    if (response?.data?.status === "success") {
      const resp: {
        image_id: number;
        origin_id: string;
        product_id: number;
      } = response?.data?.params;

      setImagesBeingUploaded((prev) => [...prev.filter((el) => el.id !== resp.origin_id)]);

      setUploadedImagesToServer((prev) => [
        ...prev,
        {
          image_id: resp.image_id,
          origin_id: resp.origin_id,
          product_id: resp.product_id,
        },
      ]);
    } else {
      exception.message([
        { type: EXCEPTIONTYPES.ERROR, title: "مشکلی در آپلود یکی از تصاویر رخ داد." },
      ]);
    }
  }

  useEffect(() => {
    if (uploadedResidenceImages.length > 0) {
      uploadedResidenceImages.forEach((item, idx) => {
        if (typeof item?.data === "string") return;

        if (
          !!imagesBeingUploaded.find((el) => el.id === item.id) ||
          !!uploadedImagesToServer.find((el) => el.origin_id === item.id)
        ) {
          // This image is already being uploaded to server OR is uploaded to server.

          return;
        } else {
          uploadNewResidenceImageAPI_Call({
            imageLabel: item.title,
            resImage: item.data,
            imageObject: item,
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedResidenceImages]);

  async function uploadMainImage() {
    setMainImageIsUploading(true);
    setMainImageUploadSuccess(false);
    const response = await editResidenceImage({
      img: mainImage as File,
      imgLabel: "main",
      productId: Number(router?.query?.id as string),
      origin_id: "-1",
    });

    if (response?.data?.status === "success") {
      const resp: {
        image_id: number;
        origin_id: string;
        product_id: number;
      } = response?.data?.params;

      setMainImageIsUploading(false);
      setMainImageUploadSuccess(true);

      // setUploadedImagesToServer((prev) => [
      //   ...prev,
      //   {
      //     image_id: resp.image_id,
      //     origin_id: resp.origin_id,
      //     product_id: resp.product_id,
      //   },
      // ]);
    } else {
      setMainImageIsUploading(false);
      setMainImageUploadSuccess(false);
      exception.message([
        { type: EXCEPTIONTYPES.ERROR, title: "مشکلی در آپلود تصویر اصلی رخ داد." },
      ]);
    }
  }

  useEffect(() => {
    if (!!mainImage && typeof mainImage !== "string") {
      uploadMainImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainImage]);

  const onDragEnd = (result: any) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newArr = [...uploadedResidenceImages];
    const [removedEl] = newArr.splice(source.index, 1);
    newArr.splice(destination.index, 0, removedEl);

    setUploadedResidenceImages([...newArr]);
  };

  useEffect(() => {
    if (!!uploadedImagePreviewBottomSheet.imagesData.length) {
      setShowUploadedImagePreviewBottomSheet(true);
    }
  }, [uploadedImagePreviewBottomSheet.imagesData.length]);

  return (
    <>
      <div>
        <p className="text-16 leading-28 text-black font-m mb-16">
          تصاویر اقامتگاه خود را بارگذاری کنید
        </p>

        <p className="text-12 leading-30 text-black font-l mb-16">
          وارد کردن تصاویر زیر الزامی می باشد : <br />
          نمای پذیرایی، اتاق خواب، آشپزخانه، نمای بیرون و حیاط و سرویس بهداشتی <br />
          از تصاویر افقی استفاده کنید
        </p>

        <div>
          {/* main image */}
          <div className="mb-16 pb-16 border-b-1 border-solid border-b-gray-C4CAD3">
            {!mainImage ? (
              <UploadBox
                text={"تصویر اصلی اقامتگاه را بارگذاری کنید"}
                uploadBtnText={"بارگذاری عکس"}
                realFileBtn={mainImageRealFileBtn}
                onImageLoadEnd_Cb={(imageData, imagePreviewData) => {
                  // Bring up the bottom sheet
                  setUploadedImagePreviewBottomSheet({
                    imagesData: [
                      {
                        imageData: imageData,
                        title: mainImageText,
                        id: "-1",
                        isFirstTime: true,
                      },
                    ],
                  });
                }}
                multiple={false}
                // setMultipleImages={setMultipleImages}
                // setMultipleImagesPreview={setMultipleImagesPreview}
                // setImage={setMainImage}
                // setImagePreview={setMainImagePreview}
              />
            ) : (
              <ResidenceMainImage
                uploadedResidenceImage={{
                  title: mainImageText,
                  data: mainImage,
                  id: "-1",
                }}
                imageIndex={-1}
                canBeDeleted={false}
                onEditMainImageBtnClick={() => {
                  setShowEditMainImageBottomSheet(true);
                }}
                id={"-1"}
                setUploadedImagePreviewBottomSheet={setUploadedImagePreviewBottomSheet}
                isBeingUploaded={mainImageIsUploading}
                isUploadSuccess={mainImageUploadSuccess}
              />
            )}
          </div>

          <div className="mb-16">
            <UploadBox
              text={
                uploadedResidenceImages.length === 0 ? "تصاویر اقامتگاه خود را بارگذاری کنید" : ""
              }
              uploadBtnText={
                uploadedResidenceImages.length === 0 ? "بارگذاری عکس" : "انتخاب عکس جدید"
              }
              realFileBtn={realFileBtn}
              onEachImageLoadEnd_Cb={(imageData, imagePreviewData) => {
                // Bring up the bottom sheet
                setUploadedImagePreviewBottomSheet((prev) => {
                  const generatedId = ulid(150000);

                  return {
                    imagesData: [
                      ...prev.imagesData,
                      {
                        id: generatedId,
                        imageData: imageData,
                        isFirstTime: true,
                        title: "",
                      },
                    ],
                  };
                });
              }}
              multiple={true}
              setMultipleImages={setMultipleImages}
              setMultipleImagesPreview={setMultipleImagesPreview}
            />
          </div>

          <div>
            <DragDropContext onDragEnd={onDragEnd}>
              <div>
                <UploadedResidenceImages
                  uploadedResidenceImages={uploadedResidenceImages}
                  setUploadedResidenceImages={setUploadedResidenceImages}
                  setConfirmDeleteImageBottomSheet={setConfirmDeleteImageBottomSheet}
                  setUploadedImagePreviewBottomSheet={setUploadedImagePreviewBottomSheet}
                  imagesBeingUploaded={imagesBeingUploaded}
                  uploadedImagesToServer={uploadedImagesToServer}
                />
              </div>
            </DragDropContext>
          </div>
        </div>
      </div>

      {!!confirmDeleteImageBottomSheet.show && (
        <BottomSheet
          open={!!confirmDeleteImageBottomSheet.show}
          handleClose={() => setConfirmDeleteImageBottomSheet(confirmDeleteImageBottomSheet_InitV)}
          headerTitle="حذف تصویر"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <ConfirmDeleteImageBottomSheet
                uploadedImageData={confirmDeleteImageBottomSheet.payload.data as string | File}
                handleSmoothClose={handleSmoothClose}
                onDeleteConfirm={() => {
                  setUploadedResidenceImages((prev) => [
                    ...prev.filter((el) => el.id !== confirmDeleteImageBottomSheet.payload.id),
                  ]);
                }}
              />
            );
          }}
        />
      )}

      {!!showEditMainImageBottomSheet && (
        <BottomSheet
          open={!!showEditMainImageBottomSheet}
          handleClose={() => setShowEditMainImageBottomSheet(false)}
          headerTitle="تصویر اصلی"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <EditMainImageBottomSheet
                uploadedImageData={mainImage as string | File}
                handleSmoothClose={handleSmoothClose}
                onNewImageConfirm={(newMainImage: File) => {
                  setMainImage(newMainImage);
                }}
              />
            );
          }}
        />
      )}

      {!!showUploadedImagePreviewBottomSheet && (
        <BottomSheet
          open={showUploadedImagePreviewBottomSheet}
          handleClose={() => {
            setUploadedImagePreviewBottomSheet((prev) => ({
              imagesData: [...prev.imagesData.slice(1, undefined)],
            }));
            setMultipleImages((prev) => [...prev.slice(1, undefined)]);
            setMultipleImagesPreview((prev) => [...prev.slice(1, undefined)]);
            setShowUploadedImagePreviewBottomSheet(false);
          }}
          headerTitle="بارگذاری تصویر"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <UploadedImagePreviewBottomSheet
                handleSmoothClose={handleSmoothClose}
                uploadedImageData={
                  uploadedImagePreviewBottomSheet?.imagesData[0].imageData as File | string
                }
                uploadedImageTitle={uploadedImagePreviewBottomSheet.imagesData[0].title}
                uploadedImageId={uploadedImagePreviewBottomSheet.imagesData[0].id}
                isFirstTimeBeingEdited={uploadedImagePreviewBottomSheet.imagesData[0].isFirstTime}
                onSubmit={(imageTitle: string) => {
                  if (uploadedImagePreviewBottomSheet.imagesData[0].id === "-1") {
                    setMainImage(uploadedImagePreviewBottomSheet.imagesData[0].imageData);
                    setMainImageText(imageTitle);
                  } else {
                    setUploadedResidenceImages((prev) => {
                      const currentImageIdx = prev.findIndex(
                        (el) => el.id === uploadedImagePreviewBottomSheet.imagesData[0].id
                      );

                      if (currentImageIdx >= 0) {
                        // The image is uploaded before. user was editing it.

                        const newArray = [...prev];
                        newArray.splice(currentImageIdx, 1, {
                          ...prev[currentImageIdx],
                          title: imageTitle,
                        });

                        return newArray;
                      } else {
                        // It's a new image.

                        const newImageInfo = {
                          data: uploadedImagePreviewBottomSheet.imagesData[0].imageData as
                            | File
                            | string,
                          id: uploadedImagePreviewBottomSheet.imagesData[0].id,
                          title: imageTitle,
                        };

                        // setUploadedImagePreviewBottomSheet((prev) => {
                        //   return {
                        //     imagesData: prev.imagesData.slice(1, undefined),
                        //   };
                        // });
                        // setMultipleImages((prev) => [...prev.slice(1, undefined)]);
                        // setMultipleImagesPreview((prev) => [...prev.slice(1, undefined)]);

                        return [...prev, newImageInfo];
                      }
                    });
                  }
                }}
              />
            );
          }}
        />
      )}
    </>
  );
};

export default EditResidenceImages;
