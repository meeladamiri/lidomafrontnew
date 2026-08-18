import { useMutation, useQuery } from "@tanstack/react-query";
import ModalHeader from "components/General/core/ModalHeader";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import exception from "utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import { ResidenceTypes_enum } from "constants/enums/residence_types";
import { TextField } from "../General/core/TextField";
import Counter from "../General/Counter";
import Divider from "../General/Divider";
import { useFormik } from "formik";
import * as Yup from "yup";
import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { Button } from "../General/core/Button";
import { Select } from "../General/core/Select";
import {
  CoolingSystemValues,
  HeatingSystemValues,
  RefrigeratorValues,
  WC_Values,
} from "@/constants/Room-Amenities";
import { Switch } from "../General/core/Switch";
import { Textarea } from "../General/core/Textarea";
import Image from "next/image";
import { UploadBox } from "../General/UploadBox/UploadBox";
import BottomSheet, { THandleSmoothClose } from "../General/core/BottomSheet";
import UploadedImagePreviewBottomSheet from "./UploadedImagePreviewBottomSheet";
import {
  IServer_Observe_Room,
  getResidenceFulldataToEdit,
} from "@/api/Residences/getResidenceFulldataToEdit";
import { IUpdateRoomInfo, updateRoomInfo } from "@/api/Residences/updateRoomInfo";

const uploadedImagePreviewBottomSheet_InitV = {
  show: false,
  payload: {
    headerTitle: "",
    uploadBoxText: "",
    imageData: undefined,
    coresspondingImageSetStateAction: undefined,
  },
};

interface IUploadedImagePreviewBottomSheetData {
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

const yupSchema = {
  basePrice: Yup.number()
    .typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS)
    .required(VALIDATION_MESSAGES.REQUIRED),
  weekEndPrice: Yup.number()
    .typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS)
    .required(VALIDATION_MESSAGES.REQUIRED),
  peakDaysPrice: Yup.number()
    .typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS)
    .required(VALIDATION_MESSAGES.REQUIRED),
  extraGuestPrice: Yup.number().typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS).nullable(),
  extraGuestPriceInPeakdays: Yup.number()
    .typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS)
    .nullable(),
  weeklyReserveDiscount: Yup.number()
    .min(0, "میزان تخفیف حداقل باید 0 باشد.")
    .max(99, "میزان تخفیف را به درصد وارد کنید. ( حداکثر 99 درصد )")
    .typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS)
    .nullable(),
  monthlyReserveDiscount: Yup.number()
    .min(0, "میزان تخفیف حداقل باید 0 باشد.")
    .max(99, "میزان تخفیف را به درصد وارد کنید. ( حداکثر 99 درصد )")
    .typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS)
    .nullable(),
  roomName: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  "similar-rooms-number": Yup.number(),
  baseCapacityCounter: Yup.number(),
  maxCapacityCounter: Yup.number(),
  "single-beds-count": Yup.number(),
  "double-beds-count": Yup.number(),
  "traditional-beds-count": Yup.number(),
  //
  "cooling-sys": Yup.string(),
  "heating-sys": Yup.string(),
  "refrigerator-type": Yup.object().shape({ id: Yup.string(), name: Yup.string() }),
  "wc-type": Yup.object().shape({ id: Yup.string(), name: Yup.string() }),
  "seperated-wc-bath": Yup.boolean(),
  "free-breakfast": Yup.boolean(),
  "room-extra-desc": Yup.string(),
};

function BoomgardiRoomEdit() {
  const router = useRouter();
  const [uploadedImagePreviewBottomSheetData, setUploadedImagePreviewBottomSheetData] =
    useState<IUploadedImagePreviewBottomSheetData>(uploadedImagePreviewBottomSheet_InitV);
  const [roomImage, setRoomImage] = useState<File | string>();
  const roomImageRealFileBtn = useRef<any>();

  const [initialValues, setInitialValues] = useState({
    roomName: "",
    "similar-rooms-number": 0,
    baseCapacityCounter: 1,
    maxCapacityCounter: 1,
    "single-beds-count": 0,
    "double-beds-count": 0,
    "traditional-beds-count": 0,
    //
    basePrice: 0,
    weekEndPrice: 0,
    peakDaysPrice: 0,
    extraGuestPrice: 0,
    extraGuestPriceInPeakdays: 0,
    weeklyReserveDiscount: 0,
    monthlyReserveDiscount: 0,
    //
    "cooling-sys": "",
    "heating-sys": "",
    "refrigerator-type": { id: "0", name: "" },
    "wc-type": { id: "0", name: "" },
    "seperated-wc-bath": false,
    "free-breakfast": false,
    "room-extra-desc": "",
  });

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object(yupSchema),
    onSubmit: (values) => {
      if (!roomImage) {
        exception.message([
          { type: EXCEPTIONTYPES.ERROR, title: "لطفا تصویر اتاق را آپلود نمایید." },
        ]);
        return;
      }

      const data: IUpdateRoomInfo = {
        room_id: Number(router?.query?.id as string),
        name: values?.roomName,
        similar_res: values?.["similar-rooms-number"],
        capacity: values?.baseCapacityCounter,
        max_capacity: values?.maxCapacityCounter,
        week_price: values?.basePrice,
        weekend_price: values?.weekEndPrice,
        peak_price: values?.peakDaysPrice,
        extra_price: values?.extraGuestPrice,
        extra_peak_price: values?.extraGuestPriceInPeakdays,
        weekly_discount: values?.weeklyReserveDiscount,
        monthly_discount: values?.monthlyReserveDiscount,
        single_bed: values?.["single-beds-count"],
        double_bed: values?.["double-beds-count"],
        traditional_bed: values?.["traditional-beds-count"],
        cooling_system: values?.["cooling-sys"],
        heating_system: values?.["heating-sys"],
        refrigerator: values?.["refrigerator-type"].id as any,
        wc: values?.["wc-type"].id as any,
        separate_bathroom: values?.["seperated-wc-bath"],
        free_breakfast: values?.["free-breakfast"],
        description: values?.["room-extra-desc"],
        // image: roomImage,
      };

      if (typeof roomImage !== "string") {
        data["image"] = roomImage;
      }

      updateRoomInfoMutation.mutate(data);
    },
    enableReinitialize: true,
  });

  const { isLoading, refetch, data } = useQuery(
    [
      "getResidenceFulldataToEdit",
      router?.query?.id, // room id
      ResidenceTypes_enum.ROOM,
    ],
    () => {
      return getResidenceFulldataToEdit({
        product_id: parseInt(router?.query?.id as string),
        product_type: ResidenceTypes_enum.ROOM,
      });
    },
    {
      enabled: !!router?.query?.id,
    }
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        const room_data: IServer_Observe_Room = data?.params?.residence_info;

        setRoomImage(room_data?.image);

        setInitialValues({
          roomName: room_data?.name,
          "similar-rooms-number": 0,
          baseCapacityCounter: room_data?.capacity,
          maxCapacityCounter: room_data?.max_capacity,
          "single-beds-count": room_data?.single_bed,
          "double-beds-count": room_data?.double_bed,
          "traditional-beds-count": room_data?.traditional_bed,
          //
          basePrice: room_data?.week_price,
          weekEndPrice: room_data?.weekend_price,
          peakDaysPrice: room_data?.peak_price,
          extraGuestPrice: room_data?.extra_price,
          extraGuestPriceInPeakdays: room_data.extra_peak_price,
          weeklyReserveDiscount: room_data?.weekly_discount,
          monthlyReserveDiscount: room_data?.monthly_discount,
          //
          "cooling-sys": room_data?.amenities?.cooling_system || "",
          "heating-sys": room_data?.amenities?.heating_system || "",
          "refrigerator-type": !!room_data?.amenities?.refrigerator
            ? {
                id: room_data?.amenities?.refrigerator,
                name: WC_Values[room_data?.amenities?.refrigerator],
              }
            : { id: "0", name: "" },
          "wc-type": !!room_data?.amenities?.wc
            ? {
                id: room_data?.amenities?.wc,
                name: WC_Values[room_data?.amenities?.wc],
              }
            : { id: "0", name: "" },
          "seperated-wc-bath": !!room_data?.amenities?.separate_bathroom,
          "free-breakfast": !!room_data?.amenities?.free_breakfast,
          "room-extra-desc": room_data?.description || "",
        });
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data]);

  const updateRoomInfoMutation = useMutation(
    (data: IUpdateRoomInfo) => {
      return updateRoomInfo(data);
    },
    {
      onSuccess: (data) => {
        if (data?.data?.status === "success") {
          refetch();

          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "بروزرسانی اتاق با موفقیت انجام شد." },
          ]);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  return (
    <div className="relative pt-80 md:pt-0">
      <div className="fixed right-0 left-0 top-0 bg-white z-4 md:hidden">
        <ModalHeader headerTitle={"ویرایش اطلاعات اتاق"} onBackClick={() => router.back()} />
      </div>

      <div className="">
        {isLoading ? (
          <TinyLoader />
        ) : (
          <>
            <div className="pb-[88px] md:pb-0 grid grid-cols-12 gap-x-16 gap-y-16 md:gap-y-24">
              <div className="col-span-full md:col-span-full">
                <div className="w-full sm:max-w-[320px] md:max-w-[320px] sm:mx-auto md:mx-auto">
                  {!roomImage ? (
                    <UploadBox
                      text={"تصویر اتاق را بارگذاری کنید"}
                      uploadBtnText={"بارگذاری عکس"}
                      // setImage={setCartMelliTmpImage as any}
                      // setImagePreview={setCartMelliTmpImagePreview}
                      realFileBtn={roomImageRealFileBtn}
                      onImageLoadEnd_Cb={(imageData, imagePreviewData) => {
                        // Bring up the bottom sheet
                        setUploadedImagePreviewBottomSheetData({
                          show: true,
                          payload: {
                            headerTitle: "تصویر اتاق",
                            uploadBoxText: "تصویر اتاق را بارگذاری کنید",
                            imageData: imageData,
                            coresspondingImageSetStateAction: setRoomImage,
                          },
                        });
                      }}
                    />
                  ) : (
                    <div className="w-full h-[214px] relative">
                      <Image
                        src={
                          typeof roomImage === "string" ? roomImage : URL.createObjectURL(roomImage)
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
                              headerTitle: "تصویر اتاق",
                              uploadBoxText: "تصویر اتاق را بارگذاری کنید",
                              imageData: roomImage,
                              coresspondingImageSetStateAction: setRoomImage,
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

              <div className="col-span-full md:col-span-full">
                <TextField
                  name="roomName"
                  label="نام اتاق"
                  formik={formik}
                  placeholder="مانند : اتاق بنفشه"
                />
              </div>

              <div className="col-span-full grid grid-cols-12 gap-x-16 gap-y-16">
                <div className="col-span-full md:col-span-6">
                  <div className="flex items-center justify-between">
                    <p>تعداد اتاق های مجزا و مشابه</p>
                    <div className="w-[107px]">
                      <Counter
                        inputName={`similar-rooms-number`}
                        counterMinimum={0}
                        formik={formik}
                      />
                    </div>
                  </div>
                </div>

                <div className="hidden md:block md:col-span-6"></div>

                <p className="col-span-full md:col-span-full text-14 leading-24 text-black font-l">
                  چند مورد اتاق مجزا و مشابه این اتاق، در مجموعه شما وجود دارد که میتوان آن را رزرو
                  کرد ؟
                </p>
              </div>

              <Divider className="col-span-full md:hidden" />

              <div className="col-span-full md:col-span-6 flex items-center justify-between">
                <p className="text-16 leading-28 font-r text-black">ظرفیت پایه</p>

                <div className="w-[107px]">
                  <Counter inputName={`baseCapacityCounter`} counterMinimum={1} formik={formik} />
                </div>
              </div>

              <div className="col-span-full md:col-span-6 flex items-center justify-between pb-16 md:pb-0 border-b-1 border-solid border-b-gray-D2D2D7 md:border-b-none">
                <p className="text-16 leading-28 font-r text-black">حداکثر ظرفیت</p>

                <div className="w-[107px]">
                  <Counter inputName={`maxCapacityCounter`} counterMinimum={1} formik={formik} />
                </div>
              </div>

              <div className="col-span-full md:col-span-6 flex items-center justify-between">
                <p className="text-16 leading-28 font-r text-black">تعداد تخت یک نفره</p>

                <div className="w-[107px]">
                  <Counter inputName={`single-beds-count`} counterMinimum={0} formik={formik} />
                </div>
              </div>

              <div className="col-span-full md:col-span-6 flex items-center justify-between">
                <p className="text-16 leading-28 font-r text-black">تعداد تخت دو نفره</p>

                <div className="w-[107px]">
                  <Counter inputName={`double-beds-count`} counterMinimum={0} formik={formik} />
                </div>
              </div>

              <div className="col-span-full md:col-span-6 flex items-center justify-between">
                <p className="text-16 leading-28 font-r text-black">تعداد رخت خواب سنتی</p>

                <div className="w-[107px]">
                  <Counter
                    inputName={`traditional-beds-count`}
                    counterMinimum={0}
                    formik={formik}
                  />
                </div>
              </div>

              <div className="hidden md:block md:col-span-6"></div>

              <Divider className="col-span-full md:hidden" />

              <div className="col-span-full md:col-span-6">
                <TextField
                  name="basePrice"
                  inputmode="numeric"
                  formik={formik}
                  label="قیمت پایه"
                  label2="( شنبه ، یکشنبه، دوشنبه و سه شنبه )"
                  leftIcon={<span className="text-12 leading-21 text-black font-l">تومان</span>}
                  wordifyNumbers={true}
                />
              </div>

              <div className="col-span-full md:col-span-6">
                <TextField
                  name="weekEndPrice"
                  inputmode="numeric"
                  formik={formik}
                  label="قیمت آخر هفته"
                  label2="( چهارشنبه، پنجشنبه و جمعه )"
                  leftIcon={<span className="text-12 leading-21 text-black font-l">تومان</span>}
                  wordifyNumbers={true}
                />
              </div>

              <div className="col-span-full md:col-span-6">
                <TextField
                  name="peakDaysPrice"
                  inputmode="numeric"
                  formik={formik}
                  label="قیمت ایام پیک"
                  label2="( تعطیلات خاص )"
                  leftIcon={<span className="text-12 leading-21 text-black font-l">تومان</span>}
                  wordifyNumbers={true}
                />
              </div>

              <div className="col-span-full md:col-span-6">
                <TextField
                  name="extraGuestPrice"
                  inputmode="numeric"
                  formik={formik}
                  label="نرخ هر نفر اضافه"
                  leftIcon={<span className="text-12 leading-21 text-black font-l">تومان</span>}
                  wordifyNumbers={true}
                />
              </div>

              <div className="col-span-full md:col-span-6">
                <TextField
                  name="extraGuestPriceInPeakdays"
                  label2="(ایام پیک)"
                  label2ClassName="!text-error-light"
                  inputmode="numeric"
                  formik={formik}
                  label="نرخ هر نفر اضافه"
                  leftIcon={<span className="text-12 leading-21 text-black font-l">تومان</span>}
                  wordifyNumbers={true}
                />
              </div>

              <div className="col-span-full md:col-span-6">
                <TextField
                  name="weeklyReserveDiscount"
                  inputmode="numeric"
                  formik={formik}
                  label="تخفیف رزرو هفتگی"
                  leftIcon={<span className="text-12 leading-21 text-black font-l">درصد</span>}
                  wordifyNumbers={false}
                />
              </div>

              <div className="col-span-full md:col-span-6">
                <TextField
                  name="monthlyReserveDiscount"
                  inputmode="numeric"
                  formik={formik}
                  label="تخفیف رزرو ماهانه"
                  leftIcon={<span className="text-12 leading-21 text-black font-l">درصد</span>}
                  wordifyNumbers={false}
                />
              </div>

              <div className="hidden md:block md:col-span-6"></div>

              <Divider className="col-span-full md:hidden" />
              {/* <div className="grid grid-cols-12 md:gap-x-16 gap-y-16 mb-16"> */}
              <div className="col-span-full md:col-span-6">
                <Select
                  name={"cooling-sys"}
                  placeholder={"انتخاب کنید"}
                  labelText="سیستم سرمایشی"
                  data={CoolingSystemValues}
                  formik={formik}
                />
              </div>

              <div className="col-span-full md:col-span-6">
                <Select
                  name={"heating-sys"}
                  placeholder={"انتخاب کنید"}
                  labelText="سیستم گرمایشی"
                  data={HeatingSystemValues}
                  formik={formik}
                />
              </div>

              <div className="col-span-full md:col-span-6">
                <Select
                  name={"refrigerator-type"}
                  placeholder={"انتخاب کنید"}
                  labelText="یخچال"
                  keyValue="name"
                  data={Object.entries(RefrigeratorValues).map(([k, v], i) => ({
                    id: k,
                    name: v,
                  }))}
                  formik={formik}
                />
              </div>

              <div className="col-span-full md:col-span-6">
                <Select
                  name={"wc-type"}
                  placeholder={"انتخاب کنید"}
                  labelText="سرویس فرنگی"
                  keyValue="name"
                  data={Object.entries(WC_Values).map(([k, v], i) => ({
                    id: k,
                    name: v,
                  }))}
                  formik={formik}
                />
              </div>
              {/* </div> */}

              <div className="col-span-full md:col-span-6">
                <Switch
                  name={"seperated-wc-bath"}
                  label={"سرویس بهداشتی و حمام مجزا"}
                  formik={formik}
                  wrapperClassnames="justify-between"
                />
              </div>

              <div className="col-span-full md:col-span-6">
                <Switch
                  name={"free-breakfast"}
                  label={"صبحانه رایگان"}
                  formik={formik}
                  wrapperClassnames="justify-between"
                />
              </div>

              <Divider className="col-span-full md:hidden" />

              <div className="col-span-full md:col-span-full">
                <Textarea
                  name="room-extra-desc"
                  formik={formik}
                  rows={3}
                  placeholder="لطفاً توضیحات تکمیلی اتاق را بنویسید"
                  label="توضیحات تکمیلی اتاق"
                />
              </div>
            </div>

            <div className="bg-white py-16 md:py-0 px-20 md:px-0 fixed bottom-0 right-0 left-0 z-2 md:static md:mt-40 md:w-[320px] md:mx-auto">
              <div className="grid grid-cols-3 gap-x-12">
                <div className="col-span-1">
                  <Button isFullWidth color="grey" onClick={() => router.back()} type="button">
                    انصراف
                  </Button>
                </div>
                <div className="col-span-2">
                  <Button
                    isFullWidth
                    type="submit"
                    // disabled={!roomImage || initialValueRef.current === roomImage}
                    // onClick={() => handleUploadCartMelli()}
                    onClick={() => {
                      formik.handleSubmit();
                    }}
                  >
                    ذخیره
                  </Button>
                </div>
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
                        !!uploadedImagePreviewBottomSheetData?.payload
                          ?.coresspondingImageSetStateAction
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
          </>
        )}
      </div>
    </div>
  );
}
export default BoomgardiRoomEdit;
