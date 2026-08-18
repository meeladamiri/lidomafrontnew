import { useUserProfile } from "@/providers/Profile";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "components/General/core/Button";
import { TextField } from "components/General/core/TextField";
import { Auth } from "constants/enums/auth";
import { VALIDATION_MESSAGES } from "constants/enums/validation_messages";
import { useFormik } from "formik";
import AuthLayout from "layouts/Auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { removeUserToken } from "utilities/cookies";
import * as Yup from "yup";

const yupSchema = {
  phoneNumber: Yup.string()
    .min(11, VALIDATION_MESSAGES.PHONE)
    .matches(/^09\d{9}$/, VALIDATION_MESSAGES.ONLY_EN_NUMBERS)
    .required(VALIDATION_MESSAGES.REQUIRED),
};

function EnterPhoneNumber({ showAsModal = false }: { showAsModal?: boolean }) {
  const router = useRouter();
  const redirectToParam = router.query.redirectTo;
  const profileData = useUserProfile();

  const [initialValues, setInitialValues] = useState<{
    phoneNumber: string;
  }>({
    phoneNumber: "",
  });

  const checkUserCurrentStatus = useMutation(async ({ phone }: { phone: string }) => {
    const resp = await axios.post("/api/user/has_custom_password", {
      jsonrpc: "2.0",
      method: "call",
      params: {
        action: "signin",
        phone_number: phone,
      },
      id: 616605554,
    });
    // console.log("resp has_password", resp);
    // console.log("resp has_password", JSON.parse(resp?.data?.result));

    if (JSON.parse(resp?.data?.result)?.params?.has_pass) {
      const url = !!redirectToParam
        ? `/auth/login-enter_password?redirectTo=${redirectToParam}`
        : "/auth/login-enter_password";

      if (!!showAsModal) {
        profileData.authModalsUtils.setShowEnterPhoneNumberModal(false);
        // show enter pass modal
        profileData.authModalsUtils.setShowEnterPasswordModal(true);
      } else {
        router.push(url);
      }
    } else {
      // call send_code
      const res = await axios.post("/api/user/signup/send_code_2", {
        jsonrpc: "2.0",
        method: "call",
        params: {
          action: "signin",
          phone_number: phone,
        },
        id: 616605554,
      });

      // console.log("calling send code, res is: ", JSON.parse(res?.data?.result));

      if (!!JSON.parse(res?.data?.result)?.params?.is_signup) {
        // bayad bere be pageE otp baAdesh forme sign-up
        const url = !!redirectToParam ? `/auth/otp?redirectTo=${redirectToParam}` : "/auth/otp";
        localStorage.setItem("is_sign_up", "true");

        if (showAsModal) {
          profileData.authModalsUtils.setShowEnterPhoneNumberModal(false);
          profileData.authModalsUtils.setShowOTPModal(true);
        } else {
          router.push(url);
        }
      } else {
        // bayad bere be pageE otp baAdesh bezar bere tu (ex: /pishkhan)
        const url = !!redirectToParam ? `/auth/otp?redirectTo=${redirectToParam}` : "/auth/otp";
        localStorage.setItem("is_sign_up", "false");

        if (showAsModal) {
          profileData.authModalsUtils.setShowEnterPhoneNumberModal(false);
          profileData.authModalsUtils.setShowOTPModal(true);
        } else {
          router.push(url);
        }
      }
    }
  });

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      localStorage.setItem(Auth.MIZBAN_PHONE_NUMBER, values.phoneNumber);
      checkUserCurrentStatus.mutate({ phone: values.phoneNumber });
    },
    validationSchema: Yup.object(yupSchema),
  });

  useEffect(() => {
    // TODO: clear all login-related localStorage items
    localStorage.removeItem(Auth.MIZBAN_PHONE_NUMBER);
    localStorage.removeItem(Auth.IS_SIGN_UP);
    localStorage.removeItem(Auth.HOST_ID);
    localStorage.removeItem(Auth.IS_FROM_FORGET_PASSWORD);
    localStorage.removeItem(Auth.OTP_CODE);

    removeUserToken();
  }, []);

  return (
    <div className={`${showAsModal ? "" : "h-screen max-h-screen"}`}>
      <AuthLayout title="به لیدوماتریپ خوش آمدید" showAsModal={showAsModal}>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-24">
            <TextField
              name="phoneNumber"
              type={"tel"}
              // inputmode="numeric"
              label="شماره تلفن خود را وارد کنید"
              formik={formik}
              maxCharsN={11}
              fillFrom="ltr"
              placeholder="09xxxxxxxxx"
              leftIcon={<i className="icon-Phone text-24 text-gray-babec4" />}
            />
          </div>

          <Button isFullWidth disabled={!formik.values.phoneNumber} type="submit">
            تأیید و ادامه
          </Button>
        </form>
      </AuthLayout>
    </div>
  );
}
export default EnterPhoneNumber;
