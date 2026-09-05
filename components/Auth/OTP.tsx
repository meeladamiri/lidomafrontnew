import { postLoginDestination } from "@/utilities/auth/redirect";
import classes from "styles/otp-code-input.module.css";
import { submitNewReserve } from "@/api/Reserves";
import { useUserProfile } from "@/providers/Profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import AuthTimer from "components/General/Authtimer";
import { Button } from "components/General/core/Button";
const FieldError = dynamic(() => import("components/General/core/FieldError"), {
  ssr: true,
});
import { Auth } from "constants/enums/auth";
import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import { VALIDATION_MESSAGES } from "constants/enums/validation_messages";
import { useFormik } from "formik";
import AuthLayout from "layouts/Auth";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { setAxiosToken } from "api";
import { setUserToken } from "utilities/cookies";
import exception from "utilities/exception";
const ReactCodeInput = dynamic(() => import("react-code-input"), { ssr: false });
import * as Yup from "yup";

const yupSchema = {
  code: Yup.string().length(5, "کد باید 5 رقم باشد").required(VALIDATION_MESSAGES.REQUIRED),
};

function OTP({ showAsModal = false }: { showAsModal?: boolean }) {
  const router = useRouter();
  const profileData = useUserProfile();
  const redirectToParam = router.query.redirectTo;
  const queryClient = useQueryClient();
  const product_page_url_ref = useRef<string>();

  const [finished, setFinished] = useState(false);
  const [hasSentCode, setHasSentCode] = useState(true); // code is sent in the prevoius step.
  const [initialValues, setInitialValues] = useState<{
    code: string;
  }>({
    code: "",
  });

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      //   sendSms.mutate({ phone: values.code });
    },
    validationSchema: Yup.object(yupSchema),
    enableReinitialize: true,
  });

  const sendAgainMutation = useMutation(async ({ phone }: { phone: string }) => {
    const res = await axios.post("/api/auth/otp/request", { phone });

    if (res?.data?.status === "success") {
      exception.message([{ type: EXCEPTIONTYPES.SUCCESS, title: "کد یکبار مصرف مجددا ارسال شد." }]);
      setHasSentCode(true);
      setFinished(false);
    } else {
      exception.message([
        {
          type: EXCEPTIONTYPES.ERROR,
          title: "مشکلی در ارسال کد یکبار مصرف پیش آمد. لطفا دوباره امتحان کنید.",
        },
      ]);
    }
  });

  const submitReserveMutation = useMutation(
    ({ product_id, product_type, start_date, end_date, guests_count, guest }: any) => {
      return submitNewReserve({
        product_id,
        product_type,
        start_date,
        end_date,
        guests_count,
        guest,
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "error") {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.message || defaultError }]);

          // lets delete Pending_request info from localStorage
          localStorage.removeItem("Pending_Reserve_Details");

          // close the open modal
          profileData.authModalsUtils.setShowOTPModal(false);

          // take user back to the product page he was visiting
          router.push(product_page_url_ref.current as string);
        } else {
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "رزرو شما با موفقیت ثبت شد." },
          ]);

          // lets delete Pending_request info from localStorage
          localStorage.removeItem("Pending_Reserve_Details");

          // close the open modal
          profileData.authModalsUtils.setShowOTPModal(false);

          queryClient.invalidateQueries(["getCalendarData"]);

          router.push(`/my-trips/${data?.data?.id}`);
        }
      },
    }
  );

  const sendAgain = () => {
    sendAgainMutation.mutate({
      phone: localStorage.getItem(Auth.MIZBAN_PHONE_NUMBER) || "",
    });
  };

  const verifyCodeMutation = useMutation(async ({ otpCode }: { otpCode: string }) => {
    // console.log("at otp submit, phone local is: ", localStorage.getItem(Auth.MIZBAN_PHONE_NUMBER));
    const res = await axios.post("/api/auth/otp/verify", {
      code: otpCode,
      phone: localStorage.getItem(Auth.MIZBAN_PHONE_NUMBER),
    });

    const parsedResp = res?.data;

    if (parsedResp?.status === "error") {
      exception.message([
        { type: EXCEPTIONTYPES.ERROR, title: parsedResp?.message || defaultError },
      ]);
    } else {
      // parsedResp?.status == "success"
      setUserToken({
        accessToken: parsedResp?.data?.accessToken,
        refreshToken: parsedResp?.data?.refreshToken,
      });
      setAxiosToken(parsedResp?.data?.accessToken);

      profileData?.profileQueryUtils?.refetchCheckUserStatus?.();

      const is_from_forget_password = localStorage.getItem(Auth.IS_FROM_FORGET_PASSWORD);

      if (!!is_from_forget_password && is_from_forget_password === "true") {
        // user clicked on "forget-password" link. They're logged in now (OTP verify
        // doubles as login), so the next page just sets a new password directly.
        const url = !!redirectToParam
          ? `/auth/forget-password?redirectTo=${redirectToParam}`
          : "/auth/forget-password";

        if (showAsModal) {
          profileData.authModalsUtils.setShowOTPModal(false);
          profileData.authModalsUtils.setShowForgetPasswordModal(true);
        } else {
          router.push(url);
        }
      } else {
        const is_sign_up = localStorage.getItem(Auth.IS_SIGN_UP);

        if (is_sign_up === "true") {
          const url = !!redirectToParam
            ? `/auth/signup?redirectTo=${redirectToParam}`
            : "/auth/signup";

          if (showAsModal) {
            profileData.authModalsUtils.setShowOTPModal(false);
            profileData.authModalsUtils.setShowSignUpModal(true);
          } else {
            router.push(url);
          }
        } else {
          // is_sign_up == "false"
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "ورود شما با موفقیت انجام شد." },
          ]);

          // deleting related localStorage items.
          localStorage.removeItem(Auth.IS_SIGN_UP);
          localStorage.removeItem(Auth.MIZBAN_PHONE_NUMBER);

          // check for possible Pending_reserve_request in localStorage
          const pendingRequest = localStorage.getItem("Pending_Reserve_Details");

          if (!!pendingRequest) {
            const parsedDataOfPendingRequest = JSON.parse(pendingRequest);

            // do the request
            product_page_url_ref.current = parsedDataOfPendingRequest?.product_page_url;
            submitReserveMutation.mutate({
              product_id: parsedDataOfPendingRequest?.product_id,
              product_type: parsedDataOfPendingRequest?.product_type,
              start_date: parsedDataOfPendingRequest?.start_date,
              end_date: parsedDataOfPendingRequest?.end_date,
              guests_count: parsedDataOfPendingRequest?.guests_count,
              guest: parsedDataOfPendingRequest?.guest,
            });
          } else if (showAsModal) {
            // Signed in without leaving the page they were on.
            profileData.authModalsUtils.setShowOTPModal(false);
          } else {
            router.push(postLoginDestination(redirectToParam));
          }
        }
      }
    }
  });

  const submit = async (values: any, code: string) => {
    verifyCodeMutation.mutate({ otpCode: code || values.Code });
  };

  return (
    <div className={`${showAsModal ? "" : "h-screen max-h-screen"}`}>
      <AuthLayout title="کد تأیید را وارد کنید" showAsModal={showAsModal}>
        <form onSubmit={formik.handleSubmit}>
          <p className="mb-16 text-12 leading-21 text-black text-center">
            کد ارسال شده به شماره{" "}
            {typeof window !== "undefined" ? localStorage?.getItem(Auth.MIZBAN_PHONE_NUMBER) : ""}{" "}
            را وارد کنید
          </p>

          <div dir="ltr" className={`flex justify-center mb-16 flex-col items-center`}>
            <ReactCodeInput
              name="code"
              type="number"
              autoFocus={true}
              value={formik.values.code}
              inputMode="numeric"
              fields={5}
              className={formik.errors.code ? classes.inputTextError : classes.inputText}
              onChange={(e) => {
                // console.log("ReactCodeInput e", e);
                formik.setFieldValue("code", e);
                formik.setFieldError("code", "");
                if (e.length === 5) {
                  submit("", e);
                }
              }}
            />

            <div>
              {!!formik?.errors?.code && (
                <FieldError errorMessage={formik?.errors?.code || null} marginTopClass="mt-8" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-center mb-24">
            <p
              className="text-12 leading-21 text-black font-r border-l-1 border-solid border-l-black pl-12 cursor-pointer"
              onClick={() => {
                if (showAsModal) {
                  profileData.authModalsUtils.setShowOTPModal(false);
                  profileData.authModalsUtils.setShowEnterPhoneNumberModal(true);
                } else {
                  router.push(
                    !!router?.query?.redirectTo
                      ? `/auth/enter_phone?redirectTo=${router?.query?.redirectTo}`
                      : "/auth/enter_phone"
                  );
                }
              }}
            >
              ویرایش شماره موبایل
            </p>
            <div
              className="flex items-center gap-x-6 pr-12"
              onClick={() => {
                if (!!finished) {
                  sendAgain();
                }
              }}
            >
              <p
                className={`
                  text-12 leading-21
                  ${
                    !finished
                      ? "text-[rgba(28,52,84,0.26)]"
                      : "text-primary-main underline underline-offset-4"
                  }
                  font-r
              `}
              >
                ارسال مجدد کد
              </p>
              {!!finished ? (
                <i className={`icon-Resend text-16 text-primary-main ${finished ? "" : ""} `} />
              ) : (
                <AuthTimer hasSentCode={hasSentCode} setFinished={setFinished} timerSeconds={150} />
              )}
            </div>
          </div>

          <Button
            isFullWidth
            disabled={formik.values.code.length < 5}
            type="button"
            // onClick={() => {
            //   submit;
            // }}
          >
            ورود
          </Button>
        </form>
      </AuthLayout>
    </div>
  );
}

export default OTP;
