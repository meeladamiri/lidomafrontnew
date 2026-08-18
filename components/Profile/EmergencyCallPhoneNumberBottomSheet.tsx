import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { useUserProfile } from "@/providers/Profile";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { TextField } from "components/General/core/TextField";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const yupSchema = {
  emergencyPhone: Yup.string()
    .matches(/^\d{11}$/, VALIDATION_MESSAGES.GENERAL_PHONE)
    .required(VALIDATION_MESSAGES.REQUIRED),
};

function EmergencyCallPhoneNumberBottomSheet({
  handleSmoothClose,
  updateAccountMutation,
}: {
  handleSmoothClose: THandleSmoothClose;
  updateAccountMutation: any;
}) {
  const [initialValues, setInitialValues] = useState<{ emergencyPhone: string }>({
    emergencyPhone: "",
  });

  const profileData = useUserProfile();

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      // console.log("values at submit", values);
      updateAccountMutation.mutate({
        name: profileData.name,
        national_code: profileData?.national_code || "",
        phone: profileData.phone,
        emergency_phone: values.emergencyPhone || "",
        province_id: "677",
        city: profileData.city,
        email: profileData?.email || "",
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
        emergencyPhone: profileData?.emergency_phone || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData?.emergency_phone]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="mb-32">
        <TextField
          name={"emergencyPhone"}
          type="tel"
          label="شماره اضطراری"
          formik={formik}
          maxCharsN={11}
          fillFrom="ltr"
        />
      </div>

      <div className="grid grid-cols-3 gap-x-12">
        <div className="col-span-1">
          <Button color="grey" isFullWidth onClick={handleSmoothClose} type="button">
            انصراف
          </Button>
        </div>
        <div className="col-span-2">
          <Button isFullWidth type="submit" disabled={!formik.values.emergencyPhone}>
            ذخیره
          </Button>
        </div>
      </div>
    </form>
  );
}

export default EmergencyCallPhoneNumberBottomSheet;
