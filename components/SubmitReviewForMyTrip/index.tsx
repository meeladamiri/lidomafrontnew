import ModalHeader from "components/General/core/ModalHeader";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Divider from "../General/Divider";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Textarea } from "../General/core/Textarea";
import Image from "next/image";
import CustomRating from "../General/Rating/CustomRating";
import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { Button } from "../General/core/Button";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  IServer_SubmittedReview,
  ISubmitMyTripReviewDetails,
  getMyTripSubmittedReviewDetails,
  submitMyTripReviewDetails,
} from "@/api/Review";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import moment from "moment-jalaali";

const yupSchema = {
  "user-review": Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  "location-rating": Yup.number(),
  "clean-rating": Yup.number(),
  "quality-rating": Yup.number(),
  "integrity-rating": Yup.number(),
  "greeting-rating": Yup.number(),
  "delivery-rating": Yup.number(),
};

interface IRatingItem {
  icon: JSX.Element;
  title: string;
  subTitle: string;
  name: string;
}

interface IForm {
  "user-review": string;
  "location-rating": number;
  "clean-rating": number;
  "quality-rating": number;
  "integrity-rating": number;
  "greeting-rating": number;
  "delivery-rating": number;
}

const Rating_Items: IRatingItem[] = [
  {
    icon: <Image src={"/assets/non-icomoon-icons/location3.svg"} width={24} height={24} alt="" />,
    title: "موقعیت مکانی",
    subTitle: "موقعیت مکانی اقامتگاه چقدر مورد رضایت شما بود ؟ ",
    name: "location-rating",
  },
  {
    icon: <Image src={"/assets/non-icomoon-icons/sanitizer.svg"} width={24} height={24} alt="" />,
    title: "نظافت اقامتگاه",
    subTitle: "چقدر از نظافت اقامتگاه رضایت داشتید ؟ ",
    name: "clean-rating",
  },
  {
    icon: <Image src={"/assets/non-icomoon-icons/payments.svg"} width={24} height={24} alt="" />,
    title: "کیفیت نسبت به نرخ",
    subTitle: "نسبت به نرخ اقامتگاه، چقدر از کیفیت آن راضی بودید ؟",
    name: "quality-rating",
  },
  {
    icon: (
      <Image
        src={"/assets/non-icomoon-icons/assignment_turned_in.svg"}
        width={24}
        height={24}
        alt=""
      />
    ),
    title: "صحت مطالب",
    subTitle: "مطالب سایت، چقدر با واقعیت مطابقت داشت ؟",
    name: "integrity-rating",
  },
  {
    icon: <Image src={"/assets/non-icomoon-icons/person.svg"} width={24} height={24} alt="" />,
    title: "برخورد میزبان",
    subTitle: "تا چه حد از برخورد میزبان رضایت داشتید ؟",
    name: "greeting-rating",
  },
  {
    icon: <Image src={"/assets/non-icomoon-icons/key.svg"} width={24} height={24} alt="" />,
    title: "نحوه تحویل",
    subTitle: "تا چه حد از نحوه تحویل اقامتگاه رضایت داشتید ؟",
    name: "delivery-rating",
  },
];

function SubmitReviewForMyTrip() {
  const router = useRouter();
  const [orderInfo, setOrderInfo] = useState<IServer_SubmittedReview["order_details"]>();

  const [initialValues, setInitialValues] = useState<IForm>({
    "user-review": "",
    "location-rating": 5,
    "clean-rating": 5,
    "quality-rating": 5,
    "integrity-rating": 5,
    "greeting-rating": 5,
    "delivery-rating": 5,
  });

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object(yupSchema),
    onSubmit: (values) => {
      submitReviewMutation.mutate({
        cleaning: values["clean-rating"],
        comment: values["user-review"],
        delivery: values["delivery-rating"],
        greeting: values["greeting-rating"],
        integrity: values["integrity-rating"],
        location: values["location-rating"],
        order_id: Number(router?.query?.id as string),
        quality: values["quality-rating"],
      });
    },
    enableReinitialize: true,
  });

  const { isLoading, refetch, data } = useQuery(
    [
      "getMyTripSubmittedReviewDetails",
      router?.query?.id, // TODO: Think about hash of backend
    ],
    () => {
      return getMyTripSubmittedReviewDetails({
        order_id: router?.query?.id as string, // TODO: Think about hash of backend
      });
    },
    {
      enabled: !!router?.query?.id,
    }
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        const review_data = data?.params as IServer_SubmittedReview;

        setOrderInfo(review_data?.order_details);

        if (!!review_data?.review_details && Object.keys(review_data?.review_details).length > 0) {
          setInitialValues({
            "clean-rating": review_data.review_details.cleaning,
            "delivery-rating": review_data.review_details.delivery,
            "greeting-rating": review_data.review_details.greeting,
            "integrity-rating": review_data.review_details.integrity,
            "location-rating": review_data.review_details.location,
            "quality-rating": review_data.review_details.quality,
            "user-review": review_data.review_details.comment,
          });
        }
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data]);

  const submitReviewMutation = useMutation(
    (data: ISubmitMyTripReviewDetails) => {
      return submitMyTripReviewDetails(data);
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          refetch();

          exception.message([{ type: EXCEPTIONTYPES.SUCCESS, title: "نظر شما با موفقیت ثبت شد." }]);
          router.push("/");
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  return (
    <div className="md:w-screen md:h-screen md:flex md:items-center md:justify-center">
      <div className="relative pt-80 md:w-[calc(688px)] md:max-h-[calc(70vh)] md:h-[calc(70vh)] md:py-24 md:mx-auto md:border-1 md:border-solid md:rounded-12 md:border-gray-C4CAD3 md:overflow-y-auto">
        <div className="fixed right-0 left-0 top-0 bg-white z-4 md:hidden">
          <ModalHeader headerTitle={"ثبت نظر"} onBackClick={() => router.back()} />
        </div>

        <div className="">
          {isLoading || !orderInfo ? (
            <TinyLoader />
          ) : (
            <>
              <div className="pb-[104px] md:pb-0">
                {/* wrapper */}
                <div>
                  {/* top */}
                  <div className="flex items-start gap-x-12 px-20 pb-16">
                    <div className="w-120 h-120 relative">
                      {!!orderInfo?.product.image_url && (
                        <Image
                          src={orderInfo?.product.image_url}
                          fill
                          style={{ objectFit: "cover" }}
                          alt=""
                          className="rounded-12"
                        />
                      )}
                    </div>

                    <div>
                      <p className="text-14 leading-20 font-r text-black mb-8">
                        {orderInfo.product.name}
                      </p>

                      <div className="flex items-center gap-x-8 mb-12">
                        <p className="text-14 leading-20 font-r text-black">
                          {moment(orderInfo.start_date, "YYYY-MM-DD").format("jYYYY/jMM/jDD")}
                        </p>
                        <i className="icon-CalendarFlash text-24 text-black" />
                        <p className="text-14 leading-20 font-r text-black">
                          {moment(orderInfo.end_date, "YYYY-MM-DD").format("jYYYY/jMM/jDD")}
                        </p>
                      </div>

                      <div className="flex items-center gap-x-4 mb-8">
                        <p className="text-12 leading-21 font-l text-black">مهمان :</p>
                        <p className="text-14 leading-24 font-r text-black">{orderInfo.guest}</p>
                      </div>

                      <div className="flex items-center gap-x-4">
                        <p className="text-12 leading-21 font-l text-black">میزبان :</p>
                        <p className="text-14 leading-24 font-r text-black">{orderInfo.host}</p>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  <div className="pt-16 px-20 pb-16">
                    <Textarea
                      name={"user-review"}
                      label="نظر خود را درباره اقامتتان ثبت کنید"
                      formik={formik}
                      placeholder="نظر خود را بنویسید"
                      labelClassname="!mb-8"
                      rows={5}
                    />
                  </div>

                  <Divider />

                  <div className="pt-16 px-20">
                    <p className="text-16 leading-24 font-m text-black mb-32">
                      به اقامت خود امتیاز دهید
                    </p>

                    <div>
                      {Rating_Items.map((Rating_Item: IRatingItem, idx: number) => {
                        return (
                          <div
                            key={idx}
                            className="pb-16 last:pb-0 border-b-1 border-dashed border-b-gray-CACFD3 last:border-b-none mb-16 last:mb-0"
                          >
                            <div className="flex items-center gap-x-8 mb-16">
                              <div className="flex items-center">{Rating_Item.icon}</div>

                              <div>
                                <p className="text-14 leading-20 font-m text-black mb-8">
                                  {Rating_Item.title}
                                </p>
                                <p className="text-12 leading-16 font-l text-gray-616E7C">
                                  {Rating_Item.subTitle}
                                </p>
                              </div>
                            </div>

                            <div>
                              <CustomRating
                                percentage={
                                  formik?.values?.[Rating_Item?.name as keyof IForm] as number
                                }
                                width={40}
                                height={40}
                                onChange={(newValue) => {
                                  formik.setFieldValue(Rating_Item.name, newValue);
                                }}
                                readOnly={false}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-24 border-t-1 border-solid border-t-gray-CACFD3 pt-16 flex items-center justify-between">
                      <p className="text-16 leading-24 font-r text-black">
                        میانگین امتیاز (
                        {(
                          (formik.values["clean-rating"] +
                            formik.values["delivery-rating"] +
                            formik.values["greeting-rating"] +
                            formik.values["integrity-rating"] +
                            formik.values["location-rating"] +
                            formik.values["quality-rating"]) /
                          6
                        ).toFixed(1)}
                        )
                      </p>

                      <CustomRating
                        percentage={
                          (formik.values["clean-rating"] +
                            formik.values["delivery-rating"] +
                            formik.values["greeting-rating"] +
                            formik.values["integrity-rating"] +
                            formik.values["location-rating"] +
                            formik.values["quality-rating"]) /
                          6
                        }
                        width={24}
                        height={23}
                        readOnly={true}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white py-16 md:py-0 px-20 md:px-0 border-t-1 border-solid border-t-gray-CACFD3 md:border-t-none fixed bottom-0 right-0 left-0 z-2 md:static md:mt-40 md:w-[320px] md:mx-auto md:sticky">
                <Button
                  isFullWidth
                  onClick={() => formik.handleSubmit()}
                  disabled={
                    !!data?.params?.review_details &&
                    Object.keys(data?.params?.review_details)?.length > 0
                  }
                >
                  ثبت نظر و امتیاز
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default SubmitReviewForMyTrip;
