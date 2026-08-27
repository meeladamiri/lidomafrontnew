import { useMutation } from "@tanstack/react-query";
import BottomSheet, { THandleSmoothClose } from "components/General/core/BottomSheet";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import {
  confirmDeleteImageBottomSheet_InitV,
  uploadedImagePreviewBottomSheet_InitV,
} from "constants/Residences/Submit/Steps/Step_9";
import {
  IConfirmDeleteImageBottomSheet,
  IUploadedImagePreviewBottomSheet,
  IUploadedResidenceImage,
} from "interfaces/Residences/Submit/Steps/Step_9";
import { useEffect, useRef, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import ConfirmDeleteImageBottomSheet from "./ConfirmDeleteImageBottomSheet";
import { UploadBox } from "../../../../General/UploadBox/UploadBox";
import UploadedImagePreviewBottomSheet from "./UploadedImagePreviewBottomSheet";
import UploadedResidenceImages from "./UploadedResidenceImages";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { monotonicFactory } from "ulid";
import ResidenceMainImage from "./ResidenceMainImage";
import EditMainImageBottomSheet from "./EditMainImageBottomSheet";
import { uploadNewResidenceImage } from "@/api/NewResidenceImages";
import StepTitle from "../../StepTitle";
import { useRouter } from "next/router";
import BottomActionsWrapper from "../../BottomActions/BottomActionsWrapper";
import { Button } from "@/components/General/core/Button";
import { submitStep } from "@/api/SubmitResidence";
import { useResidenceDraft } from "../../useWizard";

const ulid = monotonicFactory();

function Step9() {
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

  //
  const [uploadedResidenceImages, setUploadedResidenceImages] = useState<IUploadedResidenceImage[]>(
    []
  );
  const [imagesBeingUploaded, setImagesBeingUploaded] = useState<IUploadedResidenceImage[]>([]);
  const [uploadedImagesToServer, setUploadedImagesToServer] = useState<
    { image_id: number; origin_id: string; product_id: number }[]
  >([]);
  const [mainImage, setMainImage] = useState<File | string>();
  const [mainImageIsUploading, setMainImageIsUploading] = useState<boolean>(false);
  const [mainImageUploadSuccess, setMainImageUploadSuccess] = useState<boolean>(false);

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

    const response = await uploadNewResidenceImage({
      img: resImage,
      imgLabel: imageLabel,
      productId: Number(router?.query?.productId as string),
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

  const {
    isLoading: getResidenceSubmittedDataIsLaoding,
    data: residenceSubmittedData,
    refetch,
  } = useResidenceDraft();

  useEffect(() => {
    if (!!residenceSubmittedData) {
      if (residenceSubmittedData?.status === "success") {
        const submittedData: {
          id: number; // product_id
          images: { id: number; name: string; url: string }[];
          main_image: string; // "https://cdn.lidomatrip.com/web/image/product.template/22938/image/یاغلی-کوکه.jpg";
          step: number;
        } = residenceSubmittedData?.params?.residence_info;

        setMainImage(submittedData?.main_image);

        setUploadedResidenceImages(
          submittedData.images.map((item, i) => {
            return {
              id: item?.id?.toString(),
              title: item.name,
              data: item.url,
            };
          })
        );
        // setUploadedResidenceImages([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceSubmittedData]);

  async function uploadMainImage() {
    setMainImageIsUploading(true);
    setMainImageUploadSuccess(false);
    const response = await uploadNewResidenceImage({
      img: mainImage as File,
      imgLabel: "main",
      productId: Number(router?.query?.productId as string),
      origin_id: "-1",
    });

    if (response?.data?.status === "success") {
      setMainImageIsUploading(false);
      setMainImageUploadSuccess(true);
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

  const submitStep9Mutation = useMutation(
    ({ imageIds, product_id }: { imageIds: number[]; product_id: number }) => {
      return submitStep({
        step: 9,
        productId: product_id,
        data: {
          image_ids: imageIds,
        },
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          refetch();

          router.push(`?step=${10}&productId=${data?.params?.product_id}`);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  function onSubmitClick() {
    submitStep9Mutation.mutate({
      product_id: Number(router?.query?.productId as string),
      imageIds: uploadedResidenceImages.map((el) => {
        if (typeof el.data === "string") {
          return Number(el.id);
        } else {
          return uploadedImagesToServer.find((item) => item.origin_id === el.id)
            ?.image_id as number;
        }
      }),
    });
    setMainImage(undefined);
  }

  return (
    <>
      {getResidenceSubmittedDataIsLaoding ? (
        <TinyLoader />
      ) : (
        <>
          <div className="pb-120 md:pb-[130px]">
            <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0" />

            <p className="text-12 leading-30 text-black font-l mb-16">
              {/* وارد کردن تصاویر زیر الزامی می باشد : <br />
              نمای پذیرایی، اتاق خواب، آشپزخانه، نمای بیرون و حیاط و سرویس بهداشتی <br /> */}
              از تصاویر افقی استفاده کنید
            </p>

            <div>
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
                    uploadedResidenceImages.length === 0
                      ? "تصاویر اقامتگاه خود را بارگذاری کنید"
                      : ""
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

          <BottomActionsWrapper
        isSaving={submitStep9Mutation.isLoading}
            onClickOfSubmitStep={() => onSubmitClick()}
            isSubmitBtnDisabled={
              // !mainImage ||
              !!mainImageIsUploading || imagesBeingUploaded.length > 0
            }
          >
            <Button
              isLoading={submitStep9Mutation.isLoading}
              loadingText="در حال ذخیره…"
              leftIcon={<i className="icon-FlashLeft text-24 text-white hidden md:block" />}
              isFullWidth
              onClick={onSubmitClick}
              // Is Disabled when there is no MainImage.
              disabled={
                // !mainImage ||
                !!mainImageIsUploading || imagesBeingUploaded.length > 0
              }
            >
              ذخیره و ادامه
            </Button>
          </BottomActionsWrapper>
        </>
      )}

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

                // Maybe the image is still being uploaded. so lets remove it form 'imagesBeingUploaded' state, too.
                setImagesBeingUploaded((prev) => {
                  return prev.filter((el) => el.id !== confirmDeleteImageBottomSheet.payload.id);
                });
              }}
            />
          );
        }}
      />

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

                      return [...prev, newImageInfo];
                    }
                  });
                }
              }}
            />
          );
        }}
      />
    </>
  );
}

export default Step9;
