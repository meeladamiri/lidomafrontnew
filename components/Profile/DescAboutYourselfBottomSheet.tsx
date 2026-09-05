import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { useEffect, useState } from "react";
import { Textarea } from "components/General/core/Textarea";
import { useUserProfile } from "@/providers/Profile";
import { useFormik } from "formik";
import * as Yup from "yup";
import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";

const yupSchema = {
  desc: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
};

function DescAboutYourselfBottomSheet({
  handleSmoothClose,
  updateAccountMutation,
}: {
  handleSmoothClose: THandleSmoothClose;
  updateAccountMutation: any;
}) {
  const [initialValues, setInitialValues] = useState<{ desc: string }>({ desc: "" });
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
        email: profileData?.email || "",
        zip: profileData.zip,
        address: profileData.address,
        birth_day: profileData?.birth_day || 0,
        birth_month: profileData?.birth_month || 0,
        birth_year: profileData?.birth_year || 0,
        education: profileData.education,
        job: profileData.job,
        fax: profileData.fax,
        description: values.desc,
      });
    },
    validationSchema: Yup.object(yupSchema),
    enableReinitialize: true,
  });

  useEffect(() => {
    if (!!profileData) {
      // console.log("profileData", profileData);
      setInitialValues({
        desc: profileData?.description || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData?.description]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="mb-32">
        <Textarea
          name={"desc"}
          label="توضیحاتی در مورد خودتان‌ بنویسید"
          formik={formik}
          placeholder={`توضیح مختصری در مورد علایق خود نظیر تفریحات، غذا موسیقی و نوع سفر مورد علاقه تان، چگونه فردی هستید و چه روحیاتی دارید و... اگر اهداف خاصی از میزبانی دارید حتما به آن اشاره کنید`}
          //   maxCharsN={11}
          //   fillFrom="ltr"
          labelClassname="!mb-8"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-3 gap-x-12">
        <div className="col-span-1">
          <Button isFullWidth color="grey" onClick={handleSmoothClose} type="button">
            انصراف
          </Button>
        </div>
        <div className="col-span-2">
          <Button
            isFullWidth
            type="submit"
            isLoading={updateAccountMutation.isLoading}
            loadingText="در حال ذخیره…"
            disabled={!formik.values["desc"]}
          >
            ذخیره
          </Button>
        </div>
      </div>
    </form>
  );
}

export default DescAboutYourselfBottomSheet;
