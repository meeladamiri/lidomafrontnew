import { Button } from "components/General/core/Button";
import Tabs from "components/General/core/Tabs";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IEditResidence_Fulldata } from "interfaces/Residences/Edit/Residence";
import { IEditResidence_SpecsInitV } from "interfaces/Residences/Edit/Residence/Specs";
import { VALIDATION_MESSAGES } from "constants/enums/validation_messages";
import { ResidenceAmenity } from "interfaces/Residences/Submit";
import { ISelectedExtraFeatures } from "interfaces/Residences/Submit/Steps/Step_6";
import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import exception from "utilities/exception";
import { IOtherRoomData, ISharedSpaceData } from "interfaces/Residences/Submit/Steps/Step_5";
import { numericToStringicMap } from "utilities/Number_tools";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { IExtraRule, ISelectedRulesData } from "@/interfaces/Residences/Submit/Steps/Step_12";
import { ICustomPolicyInitialValues } from "@/interfaces/Residences/Submit/Steps/Step_13";
import {
  customPolicyFormikInitialValues,
  customPolicyYupSchema,
} from "@/constants/Residences/Submit/Steps/Step_13";
import { CancellationPolicy_enum } from "@/constants/enums/cancellation_policy";
import { IUploadedResidenceImage } from "@/interfaces/Residences/Submit/Steps/Step_9";
import { submitStepOfEditResImages } from "@/api/EditResidenceImages";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import dynamic from "next/dynamic";
import { IEditResidenceRules, editResidenceRules } from "@/api/Residences/editResidenceRules";
import { getResidenceFulldataToEdit } from "@/api/Residences/getResidenceFulldataToEdit";
import { editResidenceAmenities } from "@/api/Residences/editResidenceAmenities";
import { editResidenceCapacities } from "@/api/Residences/editResidenceCapacities";
import { IEditResidenceSpecs, editResidenceSpecs } from "@/api/Residences/editResidenceSpecs";
import BottomSheet from "@/components/General/core/BottomSheet";
import ChangeAlertBottomSheet from "./BottomSheets/ChangeAlertBottomSheet";

const EditResidenceCapacities = dynamic(() => import("./Capacities"), {
  ssr: true,
});
const EditResidenceSpecs = dynamic(() => import("components/Residences/Edit/Residence/Specs"), {
  ssr: true,
});
const EditResidenceFacilities = dynamic(() => import("./Facilities"), {
  ssr: true,
});
const EditResidenceRules = dynamic(() => import("./Rules"), {
  ssr: true,
});
const EditResidenceImages = dynamic(() => import("./Images"), {
  ssr: true,
});
const ModalHeader = dynamic(() => import("components/General/core/ModalHeader"), {
  ssr: true,
});

// Specs
const residenceSpecsInitV: IEditResidence_SpecsInitV = {
  resName: "",
  aboutResidence: "",
  "select-province": undefined,
  "select-city": undefined,
  neighborhood: "",
  exactAddress: "",
  totalArea: null,
  infraArea: null,
  floor: "",
  reslatlng: [],
};
const residenceSpecsYupSchema = {
  resName: Yup.string().required("نام اقامتگاه نمیتواند خالی باشد."),
  aboutResidence: Yup.string(),
  "select-province": Yup.object().shape({
    id: Yup.number().required(VALIDATION_MESSAGES.REQUIRED),
    name: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  }),
  "select-city": Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  neighborhood: Yup.string(),
  exactAddress: Yup.string(),
  totalArea: Yup.number().typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS).nullable(),
  infraArea: Yup.number().typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS).nullable(),
  floor: Yup.string(),
  reslatlng: Yup.array().of(Yup.number()),
};
const unsubmittedChangeAlertInitV = {
  show: false,
  targetTabIdx: 0,
};

function EditResidence() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<number>(0);
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const [oneTabIsChanged, setOneTabIsChanged] = useState<boolean>(false);
  const [showChangeAlert, setShowChangeAlert] = useState<{ show: boolean; targetTabIdx: number }>(
    unsubmittedChangeAlertInitV
  );
  const [manuallyTriggerToRunDataEffect, setManuallyTriggerToRunDataEffect] = useState<Date>(
    new Date()
  );

  // Specs
  const [residenceSpecsV, setResidenceSpecsV] =
    useState<IEditResidence_SpecsInitV>(residenceSpecsInitV);
  const [showProvincesListModal, setShowProvincesListModal] = useState<boolean>(false);
  const [showCitiesListModal, setShowCitiesListModal] = useState<boolean>(false);

  const residenceSpecsFormik = useFormik({
    initialValues: residenceSpecsV,
    validationSchema: Yup.object(residenceSpecsYupSchema),
    onSubmit: (values) => {
      editResidenceSpecsMutation.mutate({
        address: values.exactAddress,
        description: values.aboutResidence,
        floor: values.floor,
        foundation_area: values.infraArea || null,
        latitude: values.reslatlng[0] || null,
        longitude: values.reslatlng[1] || null,
        name: values.resName,
        neighborhood: values.neighborhood,
        product_id: Number(router?.query?.id as string),
        total_area: values.totalArea,
        city: values["select-city"] as string,
        province: values["select-province"]?.name as string,
      });
    },
    enableReinitialize: true,
  });

  // Images
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
  // // Inits
  const [uploadedResidenceImagesInit, setUploadedResidenceImagesInit] = useState<
    IUploadedResidenceImage[]
  >([]);
  const [mainImageInit, setMainImageInit] = useState<File | string>();

  // Capacities
  const [baseCapacityCount, setBaseCapacityCount] = useState<number>(1);
  const [maxCapacityCount, setMaxCapacityCount] = useState<number>(1);
  const [sharedSpaceData, setSharedSpaceData] = useState<ISharedSpaceData>({
    collapse: false,
    payload: {
      singleBedsCount: 0,
      doubleBedsCount: 0,
      traditionalBedsCount: 0,
      extra: "",
    },
  });
  const [additionalRoomsData, setAdditionalRoomsData] = useState<IOtherRoomData[]>([]);
  // // Inits
  const [baseCapacityCountInit, setBaseCapacityCountInit] = useState<number>(1);
  const [maxCapacityCountInit, setMaxCapacityCountInit] = useState<number>(1);
  const [sharedSpaceDataInit, setSharedSpaceDataInit] = useState<ISharedSpaceData>({
    collapse: false,
    payload: {
      singleBedsCount: 0,
      doubleBedsCount: 0,
      traditionalBedsCount: 0,
      extra: "",
    },
  });
  const [additionalRoomsDataInit, setAdditionalRoomsDataInit] = useState<IOtherRoomData[]>([]);

  // Facilities
  const [selectedFacilities, setSelectedFacilities] = useState<ResidenceAmenity[]>([]);
  const [selectedExtraFeatures, setSelectedExtraFeatures] = useState<ISelectedExtraFeatures>({});
  const [resSpecialFacilities, setResSpecialFacilities] = useState<string>("");
  // // Inits
  const [selectedFacilitiesInit, setSelectedFacilitiesInit] = useState<ResidenceAmenity[]>([]);
  const [selectedExtraFeaturesInit, setSelectedExtraFeaturesInit] =
    useState<ISelectedExtraFeatures>({});
  const [resSpecialFacilitiesInit, setResSpecialFacilitiesInit] = useState<string>("");

  // Rules
  const [selectedRulesData, setSelectedRulesData] = useState<ISelectedRulesData[]>([]);
  const [additionalRules, setAdditionalRules] = useState<string>("");
  const [minReservableDays, setMinReservableDays] = useState<number>(1);
  const [selectedCheckinFrom, setSelectedCheckinFrom] = useState<string>("");
  const [selectedCheckinTo, setSelectedCheckinTo] = useState<string>("");
  const [selectedCheckoutTime, setSelectedCheckoutTime] = useState<string>("12:00");
  const [selectedCancelPolicy, setSelectedCancelPolicy] = useState<CancellationPolicy_enum>();
  // // Inits
  const [selectedRulesDataInit, setSelectedRulesDataInit] = useState<ISelectedRulesData[]>([]);
  const [additionalRulesInit, setAdditionalRulesInit] = useState<string>("");
  const [minReservableDaysInit, setMinReservableDaysInit] = useState<number>(1);
  const [selectedCheckinFromInit, setSelectedCheckinFromInit] = useState<string>("");
  const [selectedCheckinToInit, setSelectedCheckinToInit] = useState<string>("");
  const [selectedCheckoutTimeInit, setSelectedCheckoutTimeInit] = useState<string>("12:00");
  const [selectedCancelPolicyInit, setSelectedCancelPolicyInit] =
    useState<CancellationPolicy_enum>();

  const [customPolicyInitialValues, setCustomPolicyInitialValues] =
    useState<ICustomPolicyInitialValues>(customPolicyFormikInitialValues);
  const customPolicyFormik = useFormik({
    initialValues: customPolicyInitialValues,
    onSubmit: (values) => {
      if ((values["before-start-time"] as number) >= (values["full-return-time"] as number)) {
        const errMsg = "مقدار فیلد دوم، حتما باید کمتر از فیلد اول باشد.";

        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: errMsg }]);

        customPolicyFormik.setFieldError("before-start-time", errMsg);
        customPolicyFormik.setFieldError("full-return-time", errMsg);
        return;
      }

      editResidenceRulesMutation.mutate({
        product_id: Number(router?.query?.id as string),
        rules: selectedRulesData
          .filter((el) => !!el.checked)
          .map((el) => ({
            id: el.id,
            extra_rules: !!el.userDesc ? { desc: el.userDesc } : "",
          })),
        checkin_from: selectedCheckinFrom || "",
        checkin_to: selectedCheckinTo || "",
        checkout: selectedCheckoutTime,
        min_reservable_days: minReservableDays || 1,
        desc: additionalRules,
        cancellation_policy: "custom",
        full_return_time: values["full-return-time"] as number,
        before_start_time: values["before-start-time"] as number,
        host_share_total_amount: values["host-share-total-amount"] as number,
        host_share_past_nights: values["host-share-past-nights"] as number,
        host_share_future_nights: values["host-share-future-nights"] as number,
      });
    },
    validationSchema: Yup.object(customPolicyYupSchema),
    enableReinitialize: true,
  });

  // Un-Submitted change Alert check
  useEffect(() => {
    if (
      JSON.stringify(residenceSpecsFormik.values) !==
      JSON.stringify(residenceSpecsFormik.initialValues)
    ) {
      setOneTabIsChanged(true);
    } else {
      setOneTabIsChanged(false);
    }
  }, [residenceSpecsFormik?.values, residenceSpecsFormik.initialValues]);

  useEffect(() => {
    if (
      JSON.stringify(uploadedResidenceImagesInit) !== JSON.stringify(uploadedResidenceImages) ||
      JSON.stringify(mainImageInit) !== JSON.stringify(mainImage)
    ) {
      setOneTabIsChanged(true);
    } else {
      setOneTabIsChanged(false);
    }
  }, [uploadedResidenceImagesInit, mainImageInit, mainImage, uploadedResidenceImages]);

  useEffect(() => {
    if (
      JSON.stringify(baseCapacityCountInit) !== JSON.stringify(baseCapacityCount) ||
      JSON.stringify(maxCapacityCountInit) !== JSON.stringify(maxCapacityCount) ||
      JSON.stringify(sharedSpaceDataInit) !== JSON.stringify(sharedSpaceData) ||
      JSON.stringify(additionalRoomsDataInit) !== JSON.stringify(additionalRoomsData)
    ) {
      setOneTabIsChanged(true);
    } else {
      setOneTabIsChanged(false);
    }
  }, [
    baseCapacityCountInit,
    maxCapacityCountInit,
    sharedSpaceDataInit,
    baseCapacityCount,
    maxCapacityCount,
    sharedSpaceData,
    additionalRoomsDataInit,
    additionalRoomsData,
  ]);

  useEffect(() => {
    if (
      JSON.stringify(selectedFacilitiesInit) !== JSON.stringify(selectedFacilities) ||
      JSON.stringify(selectedExtraFeaturesInit) !== JSON.stringify(selectedExtraFeatures) ||
      JSON.stringify(resSpecialFacilitiesInit) !== JSON.stringify(resSpecialFacilities)
    ) {
      setOneTabIsChanged(true);
    } else {
      setOneTabIsChanged(false);
    }
  }, [
    selectedFacilitiesInit,
    selectedFacilities,
    selectedExtraFeaturesInit,
    selectedExtraFeatures,
    resSpecialFacilitiesInit,
    resSpecialFacilities,
  ]);

  useEffect(() => {
    if (
      JSON.stringify(selectedRulesDataInit) !== JSON.stringify(selectedRulesData) ||
      JSON.stringify(additionalRulesInit) !== JSON.stringify(additionalRules) ||
      JSON.stringify(minReservableDaysInit) !== JSON.stringify(minReservableDays) ||
      JSON.stringify(selectedCheckinFromInit) !== JSON.stringify(selectedCheckinFrom) ||
      JSON.stringify(selectedCheckinToInit) !== JSON.stringify(selectedCheckinTo) ||
      JSON.stringify(selectedCheckoutTimeInit) !== JSON.stringify(selectedCheckoutTime) ||
      JSON.stringify(selectedCancelPolicyInit) !== JSON.stringify(selectedCancelPolicy) ||
      JSON.stringify(customPolicyFormik.initialValues) !== JSON.stringify(customPolicyFormik.values)
    ) {
      setOneTabIsChanged(true);
    } else {
      setOneTabIsChanged(false);
    }
  }, [
    selectedRulesDataInit,
    selectedRulesData,
    additionalRulesInit,
    additionalRules,
    minReservableDaysInit,
    minReservableDays,
    selectedCheckinFrom,
    selectedCheckinFromInit,
    selectedCheckinToInit,
    selectedCheckinTo,
    selectedCheckoutTimeInit,
    selectedCheckoutTime,
    customPolicyFormik.initialValues,
    customPolicyFormik.values,
    selectedCancelPolicy,
    selectedCancelPolicyInit,
  ]);
  // end of Un-Submitted change Alert check

  // Queries
  const { isLoading, refetch, data } = useQuery(
    [
      "getResidenceFulldataToEdit",
      router?.query?.id, // product_id
      router.query.residenceType,
    ],
    () => {
      return getResidenceFulldataToEdit({
        product_id: parseInt(router?.query?.id as string),
        product_type: router.query.residenceType as ResidenceTypes_enum,
      });
    },
    {
      enabled: !!router?.query?.id,
    }
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        if (!!data?.params?.residence_info) {
          const residenceFulldata: IEditResidence_Fulldata = data?.params?.residence_info;

          // For Specs Tab
          setResidenceSpecsV({
            "select-city": residenceFulldata.city,
            "select-province": !!residenceFulldata?.parent_city
              ? {
                  name: residenceFulldata?.parent_city?.name,
                  id: residenceFulldata?.parent_city?.id,
                }
              : undefined,
            exactAddress: residenceFulldata.address || "",
            aboutResidence: residenceFulldata.description || "",
            floor: residenceFulldata.floor || "",
            infraArea: residenceFulldata.foundation_area || null,
            totalArea: residenceFulldata.total_area || null,
            neighborhood: residenceFulldata.neigborhood || "",
            resName: residenceFulldata.name || "",
            reslatlng:
              !!residenceFulldata.latitude && !!residenceFulldata.longitude
                ? [Number(residenceFulldata.latitude), Number(residenceFulldata.longitude)]
                : [],
          });

          // For Images Tab
          setMainImage(residenceFulldata?.main_image || "");
          setUploadedResidenceImages(
            residenceFulldata?.images.map((item, i) => {
              return {
                id: item?.id?.toString(),
                title: item.name,
                data: item.url,
              };
            })
          );
          // // Inits
          setMainImageInit(residenceFulldata?.main_image || "");
          setUploadedResidenceImagesInit(
            residenceFulldata?.images.map((item, i) => {
              return {
                id: item?.id?.toString(),
                title: item.name,
                data: item.url,
              };
            })
          );

          // For Capacities Tab
          setBaseCapacityCount(residenceFulldata.capacity);
          setMaxCapacityCount(residenceFulldata.max_capacity);
          const sharedSpaceRoomDataComingFromApi = residenceFulldata.rooms.find(
            (el) => el.name === "فضای مشترک"
          );
          if (!!sharedSpaceRoomDataComingFromApi) {
            setSharedSpaceData((prev) => ({
              ...prev,
              payload: {
                singleBedsCount: sharedSpaceRoomDataComingFromApi.single_bed,
                doubleBedsCount: sharedSpaceRoomDataComingFromApi.double_bed,
                traditionalBedsCount: sharedSpaceRoomDataComingFromApi.traditional_bed,
                extra: sharedSpaceRoomDataComingFromApi.extras,
                // id: sharedSpaceRoomDataComingFromApi.id,
              },
            }));
          }
          const otherRooms = residenceFulldata.rooms.filter((el) => el.name !== "فضای مشترک");
          setAdditionalRoomsData(
            otherRooms.map((otherRoom, index) => ({
              collapse: true,
              payload: {
                doubleBedsCount: otherRoom.double_bed,
                extra: otherRoom.extras,
                singleBedsCount: otherRoom.single_bed,
                traditionalBedsCount: otherRoom.traditional_bed,
                // id: otherRoom.id,
              },
            }))
          );
          // // Inits
          setBaseCapacityCountInit(residenceFulldata.capacity);
          setMaxCapacityCountInit(residenceFulldata.max_capacity);
          if (!!sharedSpaceRoomDataComingFromApi) {
            setSharedSpaceDataInit((prev) => ({
              ...prev,
              payload: {
                singleBedsCount: sharedSpaceRoomDataComingFromApi.single_bed,
                doubleBedsCount: sharedSpaceRoomDataComingFromApi.double_bed,
                traditionalBedsCount: sharedSpaceRoomDataComingFromApi.traditional_bed,
                extra: sharedSpaceRoomDataComingFromApi.extras,
                // id: sharedSpaceRoomDataComingFromApi.id,
              },
            }));
          }
          setAdditionalRoomsDataInit(
            otherRooms.map((otherRoom, index) => ({
              collapse: true,
              payload: {
                doubleBedsCount: otherRoom.double_bed,
                extra: otherRoom.extras,
                singleBedsCount: otherRoom.single_bed,
                traditionalBedsCount: otherRoom.traditional_bed,
                // id: otherRoom.id,
              },
            }))
          );

          // For Facilities Tab
          // For Facilities Tab -- amenities
          if (!!residenceFulldata?.amenities && residenceFulldata?.amenities.length !== 0) {
            const alreadySubmittedAmenities: {
              category: string; // surely it is "امکانات"
              id: number;
              name: string;
              value: string;
            }[] = residenceFulldata?.amenities;
            const data = alreadySubmittedAmenities.map((item) => ({
              category: item.category,
              icon_url: "", // we don't actually use this; for 'icon_url', we use 'icon_url' of "getAmenities" API;
              id: item.id,
              name: item.name,
              values: item.value,
              extra_features: [], // we don't actually use this; for listing extra_features, we use "getAmenities" API;
            }));
            setSelectedFacilities(data);
            setSelectedFacilitiesInit(data);
          }
          // For Facilities Tab -- extra_features
          if (!!residenceFulldata?.extra_features) {
            const alreadySubmittedExtraFeatures: {
              [
                key: number // facilityId
              ]: {
                [key: string | number]: string | number;
              };
            } & { others?: string } = data?.params?.residence_info?.extra_features;
            const alreadySubmittedExtraFeaturesWithoutOthersField = {
              ...alreadySubmittedExtraFeatures,
            };
            delete alreadySubmittedExtraFeaturesWithoutOthersField.others;
            setSelectedExtraFeatures(alreadySubmittedExtraFeaturesWithoutOthersField);
            setSelectedExtraFeaturesInit(alreadySubmittedExtraFeaturesWithoutOthersField);
            setResSpecialFacilities(alreadySubmittedExtraFeatures?.others || "");
            setResSpecialFacilitiesInit(alreadySubmittedExtraFeatures?.others || "");
          }

          // For Rules Tab
          setMinReservableDays(residenceFulldata?.min_reservable_days || 1);
          setMinReservableDaysInit(residenceFulldata?.min_reservable_days || 1);
          setSelectedCheckinFrom(residenceFulldata?.checkin_from || "");
          setSelectedCheckinFromInit(residenceFulldata?.checkin_from || "");
          setSelectedCheckinTo(residenceFulldata?.checkin_to || "");
          setSelectedCheckinToInit(residenceFulldata?.checkin_to || "");
          setSelectedCheckoutTime(residenceFulldata?.checkout || "12:00");
          setSelectedCheckoutTimeInit(residenceFulldata?.checkout || "12:00");
          let extra_rules_data: IExtraRule | null = null;
          if (!!residenceFulldata?.rules_desc) {
            const extraRules: IExtraRule = JSON.parse(residenceFulldata.rules_desc);

            extra_rules_data = extraRules;
          }
          const selected_rules_data = residenceFulldata.rules.map((rule) => ({
            id: rule.id,
            name: rule.name,
            category: rule.category as "مقررات اقامتگاه",
            userDesc: !!extra_rules_data ? (extra_rules_data?.[rule?.id] as any)?.desc || "" : "",
            checked: true,
          }));
          setSelectedRulesData(selected_rules_data);
          setSelectedRulesDataInit(selected_rules_data);
          if (!!extra_rules_data?.desc) {
            setAdditionalRules((extra_rules_data?.desc as string) || "");
            setAdditionalRulesInit((extra_rules_data?.desc as string) || "");
          }
          const cancelPolicy = residenceFulldata.rules.find(
            (el) => el.category === "مقررات لغو رزرو" && el.name === "مقررات لغو رزرو"
          );
          if (!!cancelPolicy) {
            setSelectedCancelPolicy(cancelPolicy.value as CancellationPolicy_enum);
            setSelectedCancelPolicyInit(cancelPolicy.value as CancellationPolicy_enum);

            if (cancelPolicy.value === CancellationPolicy_enum.CUSTOM) {
              setCustomPolicyInitialValues({
                "before-start-time": residenceFulldata?.before_start_time || null,
                "full-return-time": residenceFulldata?.full_return_time || null,
                "host-share-future-nights": residenceFulldata?.host_share_future_nights || null,
                "host-share-past-nights": residenceFulldata?.host_share_past_nights || null,
                "host-share-total-amount": residenceFulldata?.host_share_total_amount || null,
              });
            }
          }
          //
        }
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data, manuallyTriggerToRunDataEffect]);

  function handleCurrentTabSubmit() {
    if (activeTab === 0) {
      residenceSpecsFormik.handleSubmit();
    } else if (activeTab === 1) {
      submitEditImagesOrderMutation.mutate();
    } else if (activeTab === 2) {
      editResidenceCapacitiesMutation.mutate();
    } else if (activeTab === 3) {
      editResidenceAmenitiesMutation.mutate();
    } else if (activeTab === 4) {
      handleTab4Submit();
    }
  }

  function resetCurrentTab() {
    residenceSpecsFormik.resetForm();
    setManuallyTriggerToRunDataEffect(new Date());
    // refetch();
  }

  // Mutations
  const editResidenceAmenitiesMutation = useMutation(
    () => {
      return editResidenceAmenities({
        productId: Number(router?.query?.id as string),
        others: resSpecialFacilities,
        amenities: selectedFacilities.map((facility) => {
          return {
            id: facility.id,
            extra_features: selectedExtraFeatures[facility.id] || {},
          };
        }),
      });
    },
    {
      onSuccess: (resp) => {
        // console.log("At onSuccess editResidenceAmenitiesMutation", resp);

        if (resp?.status === "success") {
          refetch();
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "تغییرات با موفقیت اعمال شد" },
          ]);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: resp?.err_msg || defaultError }]);
        }
      },
    }
  );

  const editResidenceCapacitiesMutation = useMutation(
    () => {
      return editResidenceCapacities({
        productId: Number(router?.query?.id as string),
        capacity: baseCapacityCount,
        max_capacity: maxCapacityCount,
        rooms: [
          {
            double_bed: sharedSpaceData.payload.doubleBedsCount,
            extra: sharedSpaceData.payload.extra || "",
            name: "فضای مشترک",
            single_bed: sharedSpaceData.payload.singleBedsCount,
            traditional_bed: sharedSpaceData.payload.traditionalBedsCount,
            // id: sharedSpaceData?.payload?.id || undefined,
          },
          ...additionalRoomsData.map((additionalRoom, index) => ({
            double_bed: additionalRoom.payload.doubleBedsCount,
            extra: additionalRoom.payload.extra || "",
            name: `اتاق ${numericToStringicMap[index + 1]}`,
            single_bed: additionalRoom.payload.singleBedsCount,
            traditional_bed: additionalRoom.payload.traditionalBedsCount,
            // id: additionalRoom?.payload?.id || undefined,
          })),
        ],
      });
    },
    {
      onSuccess: (resp) => {
        // console.log("At onSuccess editResidenceAmenitiesMutation", resp);

        if (resp?.status === "success") {
          refetch();
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "تغییرات با موفقیت اعمال شد" },
          ]);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: resp?.err_msg || defaultError }]);
        }
      },
    }
  );

  const editResidenceRulesMutation = useMutation(
    (data: IEditResidenceRules) => {
      return editResidenceRules(data);
    },
    {
      onSuccess: (resp) => {
        if (resp?.status === "success") {
          refetch();
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "تغییرات با موفقیت اعمال شد" },
          ]);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: resp?.err_msg || defaultError }]);
        }
      },
    }
  );

  const editResidenceSpecsMutation = useMutation(
    (data: IEditResidenceSpecs) => {
      return editResidenceSpecs(data);
    },
    {
      onSuccess: (resp) => {
        if (resp?.status === "success") {
          refetch();
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "تغییرات با موفقیت اعمال شد" },
          ]);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: resp?.err_msg || defaultError }]);
        }
      },
    }
  );

  function handleTab4Submit() {
    if (!selectedCancelPolicy) {
      exception.message([
        { type: EXCEPTIONTYPES.ERROR, title: "یکی از قوانین را برای لغو رزرو انتخاب کنید." },
      ]);
    } else {
      if (selectedCancelPolicy === CancellationPolicy_enum.CUSTOM) {
        customPolicyFormik.handleSubmit();
      } else {
        editResidenceRulesMutation.mutate({
          product_id: Number(router?.query?.id as string),
          rules: selectedRulesData
            .filter((el) => !!el.checked)
            .map((el) => ({
              id: el.id,
              extra_rules: !!el.userDesc ? { desc: el.userDesc } : "",
            })),
          checkin_from: selectedCheckinFrom || "",
          checkin_to: selectedCheckinTo || "",
          checkout: selectedCheckoutTime,
          min_reservable_days: minReservableDays || 1,
          desc: additionalRules,
          cancellation_policy: selectedCancelPolicy,
        });
      }
    }
  }

  const submitEditImagesOrderMutation = useMutation(
    () => {
      return submitStepOfEditResImages({
        productId: Number(router?.query?.id as string),
        imageIds: uploadedResidenceImages.map((el) => {
          if (typeof el.data === "string") {
            return Number(el.id);
          } else {
            return uploadedImagesToServer.find((item) => item.origin_id === el.id)
              ?.image_id as number;
          }
        }),
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          refetch();

          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "تصاویر اقامتگاه باموفقیت ویرایش شدند." },
          ]);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  return (
    <>
      <div className="relative pt-[146px] md:pt-0 md:pb-[80px]">
        <div className="fixed right-0 left-0 top-0 bg-white pb-16 z-4 md:static">
          {!isDesktop && (
            <ModalHeader
              headerTitle={"ویرایش اقامتگاه"}
              onBackClick={() => router.back()}
              containerClassname="md:hidden"
            />
          )}

          <div className="w-full mt-16 md:mt-0 px-20 md:px-0">
            <Tabs
              activeIndex={activeTab}
              onChange={(idx: number) => {
                if (idx === activeTab) return;

                if (!!oneTabIsChanged) {
                  setShowChangeAlert({ show: true, targetTabIdx: idx });
                } else {
                  setActiveTab(idx);
                }
              }}
              data={[
                {
                  tabLabel: `مشخصات`,
                  tabIndex: 0,
                },
                {
                  tabLabel: `تصاویر`,
                  tabIndex: 1,
                },
                {
                  tabLabel: `ظرفیت`,
                  tabIndex: 2,
                },
                {
                  tabLabel: `امکانات`,
                  tabIndex: 3,
                },
                {
                  tabLabel: `قوانین`,
                  tabIndex: 4,
                },
              ]}
            />
          </div>
        </div>

        <div className="">
          {isLoading ? (
            <TinyLoader />
          ) : (
            <>
              <div className="pb-[88px] md:pb-0">
                {activeTab === 0 ? (
                  <EditResidenceSpecs
                    residenceSpecsV={residenceSpecsV}
                    setResidenceSpecsV={setResidenceSpecsV}
                    showProvincesListModal={showProvincesListModal}
                    setShowProvincesListModal={setShowProvincesListModal}
                    showCitiesListModal={showCitiesListModal}
                    setShowCitiesListModal={setShowCitiesListModal}
                    residenceSpecsFormik={residenceSpecsFormik}
                  />
                ) : activeTab === 1 ? (
                  <EditResidenceImages
                    uploadedResidenceImages={uploadedResidenceImages}
                    setUploadedResidenceImages={setUploadedResidenceImages}
                    imagesBeingUploaded={imagesBeingUploaded}
                    setImagesBeingUploaded={setImagesBeingUploaded}
                    uploadedImagesToServer={uploadedImagesToServer}
                    setUploadedImagesToServer={setUploadedImagesToServer}
                    mainImage={mainImage}
                    setMainImage={setMainImage}
                    mainImageIsUploading={mainImageIsUploading}
                    setMainImageIsUploading={setMainImageIsUploading}
                    mainImageUploadSuccess={mainImageUploadSuccess}
                    setMainImageUploadSuccess={setMainImageUploadSuccess}
                  />
                ) : activeTab === 2 ? (
                  <EditResidenceCapacities
                    baseCapacityCount={baseCapacityCount}
                    setBaseCapacityCount={setBaseCapacityCount}
                    maxCapacityCount={maxCapacityCount}
                    setMaxCapacityCount={setMaxCapacityCount}
                    sharedSpaceData={sharedSpaceData}
                    setSharedSpaceData={setSharedSpaceData}
                    additionalRoomsData={additionalRoomsData}
                    setAdditionalRoomsData={setAdditionalRoomsData}
                  />
                ) : activeTab === 3 ? (
                  <EditResidenceFacilities
                    selectedFacilities={selectedFacilities}
                    setSelectedFacilities={setSelectedFacilities}
                    selectedExtraFeatures={selectedExtraFeatures}
                    setSelectedExtraFeatures={setSelectedExtraFeatures}
                    resSpecialFacilities={resSpecialFacilities}
                    setResSpecialFacilities={setResSpecialFacilities}
                  />
                ) : activeTab === 4 ? (
                  <EditResidenceRules
                    selectedRulesData={selectedRulesData}
                    setSelectedRulesData={setSelectedRulesData}
                    additionalRules={additionalRules}
                    setAdditionalRules={setAdditionalRules}
                    minReservableDays={minReservableDays}
                    setMinReservableDays={setMinReservableDays}
                    selectedCheckinFrom={selectedCheckinFrom}
                    setSelectedCheckinFrom={setSelectedCheckinFrom}
                    selectedCheckinTo={selectedCheckinTo}
                    setSelectedCheckinTo={setSelectedCheckinTo}
                    selectedCheckoutTime={selectedCheckoutTime}
                    setSelectedCheckoutTime={setSelectedCheckoutTime}
                    customPolicyFormik={customPolicyFormik}
                    selectedCancelPolicy={selectedCancelPolicy}
                    setSelectedCancelPolicy={setSelectedCancelPolicy}
                    setCustomPolicyInitialValues={setCustomPolicyInitialValues}
                  />
                ) : null}
              </div>

              <div className="bg-white py-16 md:py-0 px-20 md:px-0 fixed bottom-0 right-0 left-0 z-2 md:static md:mt-40 md:w-[320px] md:mx-auto">
                <Button
                  isFullWidth
                  // disabled={!selectedResidences.length}
                  onClick={() => handleCurrentTabSubmit()}
                  disabled={
                    activeTab === 1
                      ? !mainImage || !!mainImageIsUploading || imagesBeingUploaded.length > 0
                      : false
                  }
                >
                  ذخیره
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {!!showChangeAlert.show && (
        <BottomSheet
          open={!!showChangeAlert.show}
          handleClose={() => setShowChangeAlert(unsubmittedChangeAlertInitV)}
          headerTitle="ذخیره کردن تغییرات"
          body={({ handleSmoothClose }) => {
            return (
              <ChangeAlertBottomSheet
                handleSmoothClose={handleSmoothClose}
                onYes={() => {
                  handleCurrentTabSubmit();
                  setActiveTab(showChangeAlert.targetTabIdx);
                  handleSmoothClose();
                }}
                onNo={() => {
                  setActiveTab(showChangeAlert.targetTabIdx);
                  resetCurrentTab();
                  handleSmoothClose();
                }}
              />
            );
          }}
        />
      )}
    </>
  );
}

export default EditResidence;
