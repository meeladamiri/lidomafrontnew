import { useMutation } from "@tanstack/react-query";
import BottomSheet, { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Switch } from "components/General/core/Switch";
import Divider from "components/General/Divider";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { IDocs } from "interfaces/Residences/Submit";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { UploadBox } from "../../../../General/UploadBox/UploadBox";
import UploadedImagePreviewBottomSheet from "./UploadedImagePreviewBottomSheet";
import { useRouter } from "next/router";
import StepTitle from "../../StepTitle";
import { submitNewResidenceDocs } from "@/api/NewResidenceImages";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { Button } from "@/components/General/core/Button";
import BottomActionsWrapper from "../../BottomActions/BottomActionsWrapper";
import { useResidenceDraft } from "../../useWizard";

export interface IUploadedImagePreviewBottomSheetData {
  show: boolean;
  payload: {
    headerTitle: string;
    uploadBoxText: string;
    imageData: File | string | undefined;
    coresspondingImageSetStateAction:
      | Dispatch<SetStateAction<string | File | undefined>> // Note: the string type is not gonna be used here actually
      | undefined;
  };
}

const uploadedImagePreviewBottomSheet_InitV = {
  show: false,
  payload: {
    headerTitle: "",
    uploadBoxText: "",
    imageData: undefined,
    coresspondingImageSetStateAction: undefined,
  },
};

function Step10() {
  const router = useRouter();
  const cartMelliRealFileBtn = useRef<any>();
  const resDocumentRealFileBtn = useRef<any>();
  const ownerCartMelliRealFileBtn = useRef<any>();

  const [cartMelliImage, setCartMelliImage] = useState<File | string>();
  const [resDocumentImage, setResDocumentImage] = useState<File | string>();
  const [ownerCartMelliImage, setOwnerCartMelliImage] = useState<File | string>();
  const [isOwnerOfResidenceSomeoneElse, setIsOwnerOfResidenceSomeoneElse] =
    useState<boolean>(false);

  const [uploadedImagePreviewBottomSheetData, setUploadedImagePreviewBottomSheetData] =
    useState<IUploadedImagePreviewBottomSheetData>(uploadedImagePreviewBottomSheet_InitV);

  const {
    isLoading: getResidenceSubmittedDataIsLaoding,
    data: residenceSubmittedData,
    refetch,
  } = useResidenceDraft();

  useEffect(() => {
    if (!!residenceSubmittedData) {
      if (residenceSubmittedData?.status === "success") {
        const docsData: IDocs = residenceSubmittedData?.params?.residence_info;

        setCartMelliImage(docsData.host_national_card);
        setResDocumentImage(docsData.document);
        setOwnerCartMelliImage(docsData.owner_national_card);
        if (!!docsData.owner_national_card) {
          setIsOwnerOfResidenceSomeoneElse(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceSubmittedData]);

  const submitStep10Mutation = useMutation(
    ({
      host_national_card,
      document,
      owner_national_card,
      product_id,
    }: {
      host_national_card: any;
      document: any;
      owner_national_card: any;
      product_id: number;
    }) => {
      return submitNewResidenceDocs({
        host_national_card,
        document,
        owner_national_card,
        product_id,
      });
    },
    {
      onSuccess: (data) => {
        if (data?.data?.status === "success") {
          refetch();
          router.push(`?step=${11}&productId=${data?.data?.params?.product_id}`);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  function onSubmitClick() {
    submitStep10Mutation.mutate({
      host_national_card: cartMelliImage || null,
      document: resDocumentImage || null,
      owner_national_card: !!isOwnerOfResidenceSomeoneElse ? ownerCartMelliImage || null : null,
      product_id: Number(router?.query?.productId as string),
    });
  }

  return getResidenceSubmittedDataIsLaoding ? (
    <TinyLoader />
  ) : (
    <>
      <div className="pb-120 md:pb-80">
        <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0" />

        {/* <p className="text-12 leading-30 text-black font-l mb-24 ">
            وارد کردن تصویر مارت ملی الزامیست
          </p> */}

        <div>
          <div>
            <div className="mb-12">
              {!cartMelliImage ? (
                <UploadBox
                  text={"بارگذاری تصویر کارت ملی"}
                  uploadBtnText={"بارگذاری عکس"}
                  realFileBtn={cartMelliRealFileBtn}
                  onImageLoadEnd_Cb={(imageData, imagePreviewData) => {
                    // Bring up the bottom sheet
                    setUploadedImagePreviewBottomSheetData({
                      show: true,
                      payload: {
                        headerTitle: "تصویر کارت ملی",
                        uploadBoxText: "بارگذاری تصویر کارت ملی",
                        imageData: imageData,
                        coresspondingImageSetStateAction: setCartMelliImage,
                      },
                    });
                  }}
                />
              ) : (
                <div className="w-full h-[214px] relative">
                  <Image
                    src={
                      typeof cartMelliImage === "string"
                        ? cartMelliImage
                        : URL.createObjectURL(cartMelliImage)
                    }
                    alt=""
                    className="rounded-12"
                    fill
                    style={{
                      objectFit: "cover",
                    }}
                  />

                  <div
                    onClick={() => {
                      setUploadedImagePreviewBottomSheetData({
                        show: true,
                        payload: {
                          headerTitle: "تصویر کارت ملی",
                          uploadBoxText: "بارگذاری تصویر کارت ملی",
                          imageData: cartMelliImage,
                          coresspondingImageSetStateAction: setCartMelliImage,
                        },
                      });
                    }}
                    className="absolute top-12 left-12 w-40 h-40 flex items-center justify-center rounded-full bg-white cursor-pointer"
                  >
                    <i className="icon-Edit text-24 text-black" />
                  </div>
                </div>
              )}
            </div>

            <div className="">
              {!resDocumentImage ? (
                <UploadBox
                  text={"بارگذاری تصویر سند ملک، قبض برق یا مجوز گردشگری"}
                  isImageOptional={true}
                  uploadBtnText={"بارگذاری عکس"}
                  realFileBtn={resDocumentRealFileBtn}
                  onImageLoadEnd_Cb={(imageData, imagePreviewData) => {
                    // Bring up the bottom sheet
                    setUploadedImagePreviewBottomSheetData({
                      show: true,
                      payload: {
                        headerTitle: "بارگذاری تصویر سند ملک، قبض برق یا مجوز گردشگری",
                        uploadBoxText: "بارگذاری تصویر سند ملک، قبض برق یا مجوز گردشگری",
                        imageData: imageData,
                        coresspondingImageSetStateAction: setResDocumentImage,
                      },
                    });
                  }}
                />
              ) : (
                <div className="w-full h-[214px] relative">
                  <Image
                    src={
                      typeof resDocumentImage === "string"
                        ? resDocumentImage
                        : URL.createObjectURL(resDocumentImage)
                    }
                    fill
                    style={{ objectFit: "cover" }}
                    alt=""
                    className="rounded-12"
                  />

                  <div
                    onClick={() => {
                      setUploadedImagePreviewBottomSheetData({
                        show: true,
                        payload: {
                          headerTitle: "بارگذاری تصویر سند ملک، قبض برق یا مجوز گردشگری",
                          uploadBoxText: "بارگذاری تصویر سند ملک، قبض برق یا مجوز گردشگری",
                          imageData: resDocumentImage,
                          coresspondingImageSetStateAction: setResDocumentImage,
                        },
                      });
                    }}
                    className="absolute top-12 left-12 w-40 h-40 flex items-center justify-center rounded-full bg-white cursor-pointer"
                  >
                    <i className="icon-Edit text-24 text-black" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="my-24">
            <Divider />
          </div>

          <div className="">
            <div className="mb-16">
              <Switch
                wrapperClassnames="!justify-between"
                labelClassnames="!text-16 !leading-28 !font-m"
                name={"res-owner-switch"}
                label={"آیا مالک اقامتگاه شخص دیگری است ؟"}
                checked={isOwnerOfResidenceSomeoneElse}
                onChange={(e) => {
                  setIsOwnerOfResidenceSomeoneElse(e.target.checked);
                }}
              />
            </div>

            <p className="text-12 leading-20 text-black font-l">
              در صورتی که مالک این اقامتگاه شخص دیگری است باید علاوه بر مدارک خود مدارک مالک را نیز
              بارگذاری کنید
            </p>

            {!!isOwnerOfResidenceSomeoneElse && (
              <div className="mt-16">
                {!ownerCartMelliImage ? (
                  <UploadBox
                    text={"بارگذاری تصویر کارت ملی مالک"}
                    isImageOptional={true}
                    uploadBtnText={"بارگذاری عکس"}
                    realFileBtn={ownerCartMelliRealFileBtn}
                    onImageLoadEnd_Cb={(imageData, imagePreviewData) => {
                      // Bring up the bottom sheet
                      setUploadedImagePreviewBottomSheetData({
                        show: true,
                        payload: {
                          headerTitle: "بارگذاری تصویر کارت ملی مالک",
                          uploadBoxText: "بارگذاری تصویر کارت ملی مالک",
                          imageData: imageData,
                          coresspondingImageSetStateAction: setOwnerCartMelliImage,
                        },
                      });
                    }}
                  />
                ) : (
                  <div className="w-full h-[214px] relative">
                    <Image
                      src={
                        typeof ownerCartMelliImage === "string"
                          ? ownerCartMelliImage
                          : URL.createObjectURL(ownerCartMelliImage)
                      }
                      alt=""
                      className="rounded-12"
                      fill
                      sizes="100vw"
                      style={{
                        objectFit: "cover",
                      }}
                    />

                    <div
                      onClick={() => {
                        setUploadedImagePreviewBottomSheetData({
                          show: true,
                          payload: {
                            headerTitle: "بارگذاری تصویر کارت ملی مالک",
                            uploadBoxText: "بارگذاری تصویر کارت ملی مالک",
                            imageData: ownerCartMelliImage,
                            coresspondingImageSetStateAction: setOwnerCartMelliImage,
                          },
                        });
                      }}
                      className="absolute top-12 left-12 w-40 h-40 flex items-center justify-center rounded-full bg-white cursor-pointer"
                    >
                      <i className="icon-Edit text-24 text-black" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <BottomSheet
          open={!!uploadedImagePreviewBottomSheetData.show}
          handleClose={() => {
            setUploadedImagePreviewBottomSheetData(uploadedImagePreviewBottomSheet_InitV);
          }}
          headerTitle={uploadedImagePreviewBottomSheetData.payload.headerTitle}
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <UploadedImagePreviewBottomSheet
                handleSmoothClose={handleSmoothClose}
                uploadedImageData={
                  uploadedImagePreviewBottomSheetData.payload.imageData as string | File
                }
                uploadBoxText={uploadedImagePreviewBottomSheetData.payload.uploadBoxText}
                onSubmit={(imageData) => {
                  if (
                    !!uploadedImagePreviewBottomSheetData?.payload?.coresspondingImageSetStateAction
                  ) {
                    uploadedImagePreviewBottomSheetData.payload.coresspondingImageSetStateAction(
                      imageData
                    );
                  }
                  handleSmoothClose();
                }}
              />
            );
          }}
        />
      </div>

      <BottomActionsWrapper
        isSaving={submitStep10Mutation.isLoading}
        onClickOfSubmitStep={() => onSubmitClick()}
        // isSubmitBtnDisabled={!cartMelliImage}
      >
        <Button
          isLoading={submitStep10Mutation.isLoading}
          loadingText="در حال ذخیره…"
          leftIcon={<i className="icon-FlashLeft text-24 text-white hidden md:block" />}
          isFullWidth
          onClick={onSubmitClick}
          // Is Disabled when there is no carte melli
          // disabled={!cartMelliImage}
        >
          ذخیره و ادامه
        </Button>
      </BottomActionsWrapper>
    </>
  );
}

export default Step10;
