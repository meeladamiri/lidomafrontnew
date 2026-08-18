import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { VALIDATION_MESSAGES } from "constants/enums/validation_messages";
import { Radio } from "components/General/core/Radio";

const GENDERS = ["مرد", "زن"];

const yupSchema = {
  gender: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
};

function GenderBottomSheet({
  handleSmoothClose,
  prevGender,
}: {
  handleSmoothClose: THandleSmoothClose;
  prevGender: string;
}) {
  const [initialValues, setInitialValues] = useState<{ gender: string }>({
    gender: "",
  });

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {},
    validationSchema: Yup.object(yupSchema),
    enableReinitialize: true,
  });

  useEffect(() => {
    setInitialValues({ gender: prevGender });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="mb-16">
        {GENDERS.map((gender, index: number) => (
          <div
            className={`pb-16 ${
              index < GENDERS.length - 1
                ? "border-b-1 border-solid border-b-[rgba(28,52,84,0.26)] mb-16"
                : ""
            }`}
            key={gender}
          >
            <Radio
              name="gender"
              checked={formik.values.gender === gender}
              label={gender}
              value={gender}
              onChange={() => {
                // setRejectReason(Number(e.target.value));
                // reset Manual Reject Reason
                // setManualRejectReason("");
              }}
              formik={formik}
              wrapperClassnames=""
              look="checked"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-x-12">
        <div className="col-span-1">
          <Button isFullWidth color="grey" onClick={handleSmoothClose}>
            انصراف
          </Button>
        </div>
        <div className="col-span-2">
          <Button
            type="submit"
            isFullWidth
            disabled={!formik.values.gender}
            // disabled={true}
          >
            ذخیره
          </Button>
        </div>
      </div>
    </form>
  );
}

export default GenderBottomSheet;
