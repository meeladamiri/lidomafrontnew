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
    // New backend is OTP-first and has no "does this phone already have a password"
    // precheck endpoint, so we always request an OTP here. Returning users who'd
    // rather type their password can use the "ورود با رمز عبور" link below instead.
    const res = await axios.post("/api/auth/otp/request", { phone });
    const data = res?.data;

    const url = !!redirectToParam ? `/auth/otp?redirectTo=${redirectToParam}` : "/auth/otp";
    // exists === true means this phone already has an account (signing in),
    // exists === false means it's brand new (needs the signup/name step after OTP).
    localStorage.setItem("is_sign_up", data?.data?.exists ? "false" : "true");

    if (showAsModal) {
      profileData.authModalsUtils.setShowEnterPhoneNumberModal(false);
      profileData.authModalsUtils.setShowOTPModal(true);
    } else {
      router.push(url);
    }
  });

  const goToPasswordLogin = () => {
    if (!formik.values.phoneNumber) return;
    localStorage.setItem(Auth.MIZBAN_PHONE_NUMBER, formik.values.phoneNumber);

    if (showAsModal) {
      profileData.authModalsUtils.setShowEnterPhoneNumberModal(false);
      profileData.authModalsUtils.setShowEnterPasswordModal(true);
    } else {
      const url = !!redirectToParam
        ? `/auth/login-enter_password?redirectTo=${redirectToParam}`
        : "/auth/login-enter_password";
      router.push(url);
    }
  };

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

          <p
            className="text-12 leading-21 font-r text-primary-main cursor-pointer text-center mt-16"
            onClick={goToPasswordLogin}
          >
            ورود با رمز عبور
          </p>
        </form>
      </AuthLayout>
    </div>
  );
}
export default EnterPhoneNumber;
