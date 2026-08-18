import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { useUserProfile } from "@/providers/Profile";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { TextField } from "components/General/core/TextField";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const yupSchema = {
  email: Yup.string().email(VALIDATION_MESSAGES.EMAIL).required(VALIDATION_MESSAGES.REQUIRED),
};

function EmailBottomSheet({
  handleSmoothClose,
  updateAccountMutation,
}: {
  handleSmoothClose: THandleSmoothClose;
  updateAccountMutation: any;
}) {
  const [initialValues, setInitialValues] = useState<{ email: string }>({ email: "" });
  const profileData = useUserProfile();

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      // console.log("values at submit", values);
      updateAccountMutation.mutate({
        name: profileData.name,
        national_code: profileData?.national_code || "",
        phone: profileData.phone,
        emergency_phone: profileData?.emergency_phone || "",
        province_id: "677",
        city: profileData.city,
        email: values.email,
        zip: profileData.zip,
        address: profileData.address,
        birth_day: profileData?.birth_day || 0,
        birth_month: profileData?.birth_month || 0,
        birth_year: profileData?.birth_year || 0,
        education: profileData.education,
        job: profileData.job,
        fax: profileData.fax,
        description: profileData?.description || "",
      });
    },
    validationSchema: Yup.object(yupSchema),
    enableReinitialize: true,
  });

  useEffect(() => {
    if (!!profileData) {
      // console.log("profileData", profileData);
      setInitialValues({
        email: profileData?.email || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData?.email]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="mb-32">
        <TextField name={"email"} label="ایمیل" formik={formik} fillFrom="ltr" />
      </div>

      <div className="grid grid-cols-3 gap-x-12">
        <div className="col-span-1">
          <Button isFullWidth color="grey" onClick={handleSmoothClose} type="button">
            انصراف
          </Button>
        </div>
        <div className="col-span-2">
          <Button isFullWidth type="submit" disabled={!formik.values["email"]}>
            ذخیره
          </Button>
        </div>
      </div>
    </form>
  );
}

export default EmailBottomSheet;
