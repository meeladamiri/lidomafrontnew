import { submitNewReserve } from "@/api/Reserves";
import { useUserProfile } from "@/providers/Profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "components/General/core/Button";
import { TextField } from "components/General/core/TextField";
import { Auth } from "constants/enums/auth";
import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import { VALIDATION_MESSAGES } from "constants/enums/validation_messages";
import { useFormik } from "formik";
import AuthLayout from "layouts/Auth";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { setUserToken } from "utilities/cookies";
import exception from "utilities/exception";
import * as Yup from "yup";

const yupSchema = {
  password: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
};

function EnterPassword({ showAsModal = false }: { showAsModal?: boolean }) {
  const router = useRouter();
  const profileData = useUserProfile();
  const redirectToParam = router.query.redirectTo;
  const queryClient = useQueryClient();
  const product_page_url_ref = useRef<string>();

  const [initialValues, setInitialValues] = useState<{
    password: string;
  }>({
    password: "",
  });

  const submitReserveMutation = useMutation(
    ({
      product_id,
      product_type,
      start_date,
      end_date,
      guests_count,
      guest,
      product_page_url,
    }: any) => {
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
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);

          // lets delete Pending_request info from localStorage
          localStorage.removeItem("Pending_Reserve_Details");

          // close the open modal
          profileData.authModalsUtils.setShowEnterPasswordModal(false);

          // take user back to the product page he was visiting
          router.push(product_page_url_ref.current as string);
        } else {
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "رزرو شما با موفقیت ثبت شد." },
          ]);

          // lets delete Pending_request info from localStorage
          localStorage.removeItem("Pending_Reserve_Details");

          // close the open modal
          profileData.authModalsUtils.setShowEnterPasswordModal(false);

          queryClient.invalidateQueries(["getCalendarData"]);

          router.push(`/my-trips/${data?.params?.order_id}`);
        }
      },
    }
  );

  const loginMutate = useMutation(async ({ password }: { password: string }) => {
    // console.log(
    //   "at login password submit, phone in localStorage is: ",
    //   localStorage.getItem(Auth.MIZBAN_PHONE_NUMBER)
    // );
    const resp = await axios.post("/api/user/check_custom_password", {
      jsonrpc: "2.0",
      method: "call",
      params: {
        action: "signin",
        pass: password,
        phone_number: localStorage.getItem(Auth.MIZBAN_PHONE_NUMBER),
        test_param: "09361323233",
      },
      id: 616605554,
    });

    // console.log("login enter password, res is : ", JSON.parse(resp?.data?.result)?.params);

    if (JSON.parse(resp?.data?.result)?.status === "success") {
      if (!!JSON.parse(resp?.data?.result)?.params?.isvalid) {
        // paswword is correct  --> store token at cookie under the name of "session_id"
        if (localStorage.getItem(Auth.MIZBAN_PHONE_NUMBER) === "09361323233") {
          // console.log(
          //   "AUTH_TOKEN COMING FROM /api/user/check_custom_password",
          //   JSON.parse(resp?.data?.result)?.params?.auth_token
          // );
        }
        setUserToken({ token: JSON.parse(resp?.data?.result)?.params?.auth_token });
        if (localStorage.getItem(Auth.MIZBAN_PHONE_NUMBER) === "09361323233") {
          // console.log(
          //   "AUTH_TOKEN SET TO browser_cookie successfully. cookie in browser_storage is: ",
          //   getUserToken()
          // );
        }

        exception.message([
          { type: EXCEPTIONTYPES.SUCCESS, title: "ورود شما با موفقیت انجام شد." },
        ]);

        profileData?.profileQueryUtils?.refetchCheckUserStatus?.();

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
        } else {
          if (!!JSON.parse(resp?.data?.result)?.params?.is_host) {
            profileData.authModalsUtils.setShowEnterPasswordModal(false);
            router.push((redirectToParam as string) || "/dashboard");
          } else {
            // user is guest
            if (!!showAsModal) {
              profileData.authModalsUtils.setShowEnterPasswordModal(false);
            } else {
              router.push((redirectToParam as string) || "/");
            }
          }
        }
      } else {
        // password is not correct
        exception.message([
          { type: EXCEPTIONTYPES.ERROR, title: "رمز عبور وارد شده صحیح نمی باشد." },
        ]);
      }
    } else {
      exception.message([{ type: EXCEPTIONTYPES.ERROR, title: defaultError }]);
    }
  });

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      //   sendSms.mutate({ phone: values.phoneNumber });
      loginMutate.mutate({ password: values.password });
    },
    validationSchema: Yup.object(yupSchema),
    enableReinitialize: true,
  });

  const forgetPasswordMutation = useMutation(async () => {
    const res = await axios.post("/api/user/signup/send_code_2", {
      jsonrpc: "2.0",
      method: "call",
      params: {
        action: "signin",
        phone_number: localStorage.getItem(Auth.MIZBAN_PHONE_NUMBER),
      },
      id: 616605554,
    });

    // console.log("calling send code, res is: ", JSON.parse(res?.data?.result));

    if (JSON.parse(res?.data?.result).status === "success") {
      localStorage.setItem(Auth.IS_FROM_FORGET_PASSWORD, "true");

      const url = !!redirectToParam ? `/auth/otp?redirectTo=${redirectToParam}` : "/auth/otp";

      if (showAsModal) {
        profileData.authModalsUtils.setShowEnterPasswordModal(false);
        profileData.authModalsUtils.setShowOTPModal(true);
      } else {
        router.push(url);
      }
    }
  });

  const continueWithOtpMutation = useMutation(async () => {
    const res = await axios.post("/api/user/signup/send_code_2", {
      jsonrpc: "2.0",
      method: "call",
      params: {
        action: "signin",
        phone_number: localStorage.getItem(Auth.MIZBAN_PHONE_NUMBER),
      },
      id: 616605554,
    });

    // console.log("calling send code, res is: ", JSON.parse(res?.data?.result));

    if (JSON.parse(res?.data?.result).status === "success") {
      const url = !!redirectToParam ? `/auth/otp?redirectTo=${redirectToParam}` : "/auth/otp";

      if (showAsModal) {
        profileData.authModalsUtils.setShowEnterPasswordModal(false);
        profileData.authModalsUtils.setShowOTPModal(true);
      } else {
        router.push(url);
      }
    }
  });

  return (
    <div className={`${showAsModal ? "" : "h-screen max-h-screen"}`}>
      <AuthLayout title="رمز عبور خود را وارد کنید" showAsModal={showAsModal}>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-16">
            <TextField name="password" label="رمز عبور" formik={formik} isPassword />
          </div>

          <div className="flex items-center justify-around mb-24">
            <p
              className="text-12 leading-21 font-r text-black cursor-pointer"
              onClick={() => forgetPasswordMutation.mutate()}
            >
              فراموشی رمز عبور
            </p>
            <span className="h-24 border-l-1 border-solid border-[rgba(28,52,84,0.26)]"></span>
            <p
              className="text-12 leading-21 font-r text-primary-main cursor-pointer"
              onClick={() => continueWithOtpMutation.mutate()}
            >
              ورود با کد یکبار مصرف
            </p>
          </div>

          <Button isFullWidth type="submit" disabled={!formik.values.password}>
            ورود
          </Button>
        </form>
      </AuthLayout>
    </div>
  );
}

export default EnterPassword;
