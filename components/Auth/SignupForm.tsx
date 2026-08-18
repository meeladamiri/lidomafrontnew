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
  firstName: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  lastName: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  password: Yup.string(),
};

function SignupForm({ showAsModal = false }: { showAsModal?: boolean }) {
  const router = useRouter();
  const profileData = useUserProfile();
  const redirectToParam = router.query.redirectTo;
  const queryClient = useQueryClient();
  const product_page_url_ref = useRef<string>();

  const [initialValues, setInitialValues] = useState<{
    firstName: string;
    lastName: string;
    password: string;
  }>({
    firstName: "",
    lastName: "",
    password: "",
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
          profileData.authModalsUtils.setShowSignUpModal(false);

          // take user back to the product page he was visiting
          router.push(product_page_url_ref.current as string);
        } else {
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "رزرو شما با موفقیت ثبت شد." },
          ]);

          // lets delete Pending_request info from localStorage
          localStorage.removeItem("Pending_Reserve_Details");

          // close the open modal
          profileData.authModalsUtils.setShowSignUpModal(false);

          queryClient.invalidateQueries(["getCalendarData"]);

          router.push(`/my-trips/${data?.params?.order_id}`);
        }
      },
    }
  );

  const signupMutation = useMutation(
    async ({
      firstName,
      lastName,
      phoneNumber,
      password,
    }: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      password: string | null;
    }) => {
      const resp = await axios.post("/api/user/submit_signup_form", {
        jsonrpc: "2.0",
        method: "call",
        params: {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          password: password,
        },
        id: 616605554,
      });

      const parsedResp = JSON.parse(resp?.data?.result);
      // console.log("signup resp is", parsedResp);

      if (parsedResp?.status === "error") {
        exception.message([
          { type: EXCEPTIONTYPES.ERROR, title: parsedResp?.err_msg || defaultError },
        ]);
      } else {
        // parsedResp?.status == "success"
        exception.message([
          { type: EXCEPTIONTYPES.SUCCESS, title: "ورود شما با موفقیت انجام شد." },
        ]);
        // deleting related localStorage items.
        localStorage.removeItem(Auth.IS_SIGN_UP);
        localStorage.removeItem(Auth.MIZBAN_PHONE_NUMBER);

        // check for possible Pending_reserve_request in localStorage
        const pendingRequest = localStorage.getItem("Pending_Reserve_Details");

        profileData?.profileQueryUtils?.refetchCheckUserStatus?.();
        profileData?.profileQueryUtils?.refetchProfile?.();

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
          // user is signing up -> so user didn't exist before. -> so user is a guest
          if (showAsModal) {
            profileData.authModalsUtils.setShowSignUpModal(false);
          } else {
            router.push((redirectToParam as string) || "/");
          }
        }
      }
    }
  );

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      signupMutation.mutate({
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: localStorage.getItem("MIZBAN_PHONE_NUMBER") || "",
        password: values.password || null, // TODO: ino bayad api gabul kone
      });
    },
    validationSchema: Yup.object(yupSchema),
    enableReinitialize: true,
  });

  return (
    <div className={`${showAsModal ? "" : "h-screen max-h-screen"}`}>
      <AuthLayout
        title="مشخصات خود را وارد کنید"
        showAsModal={showAsModal}
        hasCloseBtnInShowAsModal={false}
      >
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-12">
            <TextField name="firstName" label="نام" formik={formik} />
          </div>

          <div className="mb-12">
            <TextField name="lastName" label="نام خانوادگی" formik={formik} />
          </div>

          <div className="mb-24">
            <TextField
              name="password"
              label="رمز عبور دلخواه"
              formik={formik}
              fieldIsOptional
              isPassword
            />
          </div>

          <Button
            isFullWidth
            type="submit"
            disabled={!formik.values.firstName || !formik.values.lastName}
          >
            ثبت نام
          </Button>
        </form>
      </AuthLayout>
    </div>
  );
}
export default SignupForm;
