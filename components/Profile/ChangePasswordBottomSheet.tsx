import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { VALIDATION_MESSAGES } from "constants/enums/validation_messages";
import { TextField } from "components/General/core/TextField";
import { useMutation } from "@tanstack/react-query";
import exception from "utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import { changePassword } from "@/api/Auth/changePassword";

const yupSchema = {
  oldPassword: Yup.string(),
  newPassword: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  newPasswordRepeat: Yup.string()
    .oneOf([Yup.ref("newPassword")], VALIDATION_MESSAGES.PASSWORDS_DO_NOT_MATCH)
    .required(VALIDATION_MESSAGES.REQUIRED),
};

function ChangePasswordBottomSheet({
  handleSmoothClose,
}: {
  handleSmoothClose: THandleSmoothClose;
}) {
  const [initialValues, setInitialValues] = useState<{
    // oldPassword: string;
    newPassword: string;
    newPasswordRepeat: string;
  }>({
    // oldPassword: "",
    newPassword: "",
    newPasswordRepeat: "",
  });

  const changePasswordMutation = useMutation(
    ({
      // oldPass,
      newPass,
      newPassRepeat,
    }: {
      // oldPass: string;
      newPass: string;
      newPassRepeat: string;
    }) => {
      return changePassword({
        // oldPassword: oldPass,
        newPassword: newPass,
        newPasswordRepeat: newPassRepeat,
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "تغییر رمز با موفقیت انجام شد." },
          ]);

          handleSmoothClose();
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      changePasswordMutation.mutate({
        // oldPass: values.oldPassword || "",
        newPass: values.newPassword,
        newPassRepeat: values.newPasswordRepeat,
      });
    },
    validationSchema: Yup.object(yupSchema),
    validateOnBlur: true,
    validateOnChange: true,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="mb-32">
        {/* <div className="mb-16">
          <TextField
            name="oldPassword"
            label="رمز عبور قبلی"
            placeholder="رمز عبور قبلی خود را وارد کنید"
            formik={formik}
            type="password"
            isPassword
          />
          <p className="text-10 leading-18 text-error-light mt-4">
            در صورتی که از قبل رمز عبور ندارید، این فیلد را خالی بگذارید.
          </p>
        </div> */}

        <div className="mb-16">
          <TextField
            name="newPassword"
            label="رمز عبور جدید"
            placeholder="رمز عبور جدید خود را وارد کنید"
            formik={formik}
            type="password"
            isPassword
          />
        </div>

        <div>
          <TextField
            name="newPasswordRepeat"
            label="تکرار رمز عبور جدید"
            placeholder="رمز عبور جدید خود را مجددا وارد کنید"
            formik={formik}
            type="password"
            isPassword
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-12">
        <div className="col-span-1">
          <Button isFullWidth color="grey" onClick={handleSmoothClose} type="button">
            انصراف
          </Button>
        </div>
        <div className="col-span-2">
          <Button
            isLoading={changePasswordMutation.isLoading}
            loadingText="در حال ذخیره…"
            isFullWidth
            type="submit"
            disabled={
              !formik.values.newPassword ||
              !formik.values.newPasswordRepeat ||
              formik.values.newPassword !== formik.values.newPasswordRepeat
            }
          >
            ذخیره
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ChangePasswordBottomSheet;
