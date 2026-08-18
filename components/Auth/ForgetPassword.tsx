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
import exception from "utilities/exception";
import * as Yup from "yup";

const yupSchema = {
  pass: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  pass_repeat: Yup.string()
    .oneOf([Yup.ref("pass")], VALIDATION_MESSAGES.PASSWORDS_DO_NOT_MATCH)
    .required(VALIDATION_MESSAGES.REQUIRED),
};

function ForgetPassword({ showAsModal = false }: { showAsModal?: boolean }) {
  const router = useRouter();
  const redirectToParam = router.query.redirectTo;
  const queryClient = useQueryClient();
  const profileData = useUserProfile();
  const product_page_url_ref = useRef<string>();

  const [initialValues, setInitialValues] = useState<{
    pass: string;
    pass_repeat: string;
  }>({
    pass: "",
    pass_repeat: "",
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
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);

          // lets delete Pending_request info from localStorage
          localStorage.removeItem("Pending_Reserve_Details");

          // close the open modal
          profileData.authModalsUtils.setShowForgetPasswordModal(false);

          // take user back to the product page he was visiting
          router.push(product_page_url_ref.current as string);
        } else {
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "رزرو شما با موفقیت ثبت شد." },
          ]);

          // lets delete Pending_request info from localStorage
          localStorage.removeItem("Pending_Reserve_Details");

          // close the open modal
          profileData.authModalsUtils.setShowForgetPasswordModal(false);

          queryClient.invalidateQueries(["getCalendarData"]);

          router.push(`/my-trips/${data?.params?.order_id}`);
        }
      },
    }
  );

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      resetPasswordMutation.mutate({
        phone: localStorage.getItem(Auth.MIZBAN_PHONE_NUMBER) || "",
        password: values.pass,
        code: localStorage.getItem(Auth.OTP_CODE) || "",
      });
    },
    validationSchema: Yup.object(yupSchema),
    enableReinitialize: true,
  });

  const resetPasswordMutation = useMutation(
    async ({ phone, password, code }: { phone: string; password: string; code: string }) => {
      const resp = await axios.post("/api/user/reset_password", {
        jsonrpc: "2.0",
        method: "call",
        params: {
          code: code,
          new_pass: password,
          phone_number: phone,
        },
        id: 616605554,
      });

      // console.log("reset password, resp is: ", JSON.parse(resp?.data?.result));
      if (JSON.parse(resp?.data?.result).status === "success") {
        exception.message([
          { type: EXCEPTIONTYPES.SUCCESS, title: "تغییر رمز با موفقیت انجام شد." },
        ]);
        // deleting related localStorage items.
        localStorage.removeItem(Auth.IS_FROM_FORGET_PASSWORD);
        localStorage.removeItem(Auth.OTP_CODE);
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
        } else {
          if (showAsModal) {
            profileData.authModalsUtils.setShowForgetPasswordModal(false);
          } else {
            router.push((redirectToParam as string) || "/");
          }
        }
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: defaultError }]);
      }
    }
  );

  return (
    <div className={`${showAsModal ? "" : "h-screen max-h-screen"}`}>
      <AuthLayout
        title="رمز عبور جدید را وارد کنید"
        showAsModal={showAsModal}
        hasCloseBtnInShowAsModal={false}
      >
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-24">
            <TextField name="pass" label="رمز عبور جدید" formik={formik} isPassword />
          </div>

          <div className="mb-24">
            <TextField name="pass_repeat" label="تکرار رمز عبور جدید" formik={formik} isPassword />
          </div>

          <Button
            isFullWidth
            type="submit"
            disabled={
              !formik.values.pass ||
              !formik.values.pass_repeat ||
              formik.values.pass !== formik.values.pass_repeat
            }
          >
            تغییر رمز عبور
          </Button>
        </form>
      </AuthLayout>
    </div>
  );
}
export default ForgetPassword;
