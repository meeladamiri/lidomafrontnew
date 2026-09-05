import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { useUserProfile } from "@/providers/Profile";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import MobileDatepicker from "components/General/MobileDatepicker";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const yupSchema = {
  birthYear: Yup.number().required(VALIDATION_MESSAGES.REQUIRED),
  birthMonth: Yup.number().required(VALIDATION_MESSAGES.REQUIRED),
  birthDay: Yup.number().required(VALIDATION_MESSAGES.REQUIRED),
};

function BirthDateBottomSheet({
  handleSmoothClose,
  updateAccountMutation,
}: {
  handleSmoothClose: THandleSmoothClose;
  updateAccountMutation: any;
}) {
  const [initialValues, setInitialValues] = useState<{
    birthYear: number;
    birthMonth: number;
    birthDay: number;
  }>({
    birthYear: 1370,
    birthMonth: 10,
    birthDay: 12,
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
        emergency_phone: profileData?.emergency_phone || "",
        province_id: "677",
        city: profileData.city,
        email: profileData?.email || "",
        zip: profileData.zip,
        address: profileData.address,
        birth_day: values.birthDay,
        birth_month: values.birthMonth,
        birth_year: values.birthYear,
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
        birthYear: profileData?.birth_year || 1370,
        birthMonth: profileData?.birth_month || 10,
        birthDay: profileData?.birth_day || 12,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData?.birth_year, profileData?.birth_month, profileData?.birth_day]);

  function handleClickOnSave() {
    const navbarBtns = document.querySelectorAll(
      "#custom-mobile-datepicker .datepicker-navbar-btn"
    );

    // console.log("navbar", navbarBtns[0]);

    const selectBtn = navbarBtns[0] as HTMLElement;
    selectBtn.click();
  }

  return (
    <div>
      <div className="mb-32 relative">
        <MobileDatepicker
          year={formik.values["birthYear"]}
          month={formik.values["birthMonth"]}
          day={formik.values["birthDay"]}
          handleDateSubmit={({ year, month, day }) => {
            // console.log("At handleDateSubmit", { year, month, day });
            formik.setFieldValue("birthYear", year);
            formik.setFieldValue("birthMonth", month);
            formik.setFieldValue("birthDay", day);

            formik.handleSubmit();
          }}
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
            onClick={() => handleClickOnSave()}
          >
            ذخیره
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BirthDateBottomSheet;
