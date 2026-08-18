import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { TextField } from "components/General/core/TextField";
import { useEffect, useRef } from "react";

function ShabaBottomSheet({
  handleSmoothClose,
  name,
  formik,
}: {
  handleSmoothClose: THandleSmoothClose;
  name: string;
  formik: any;
}) {
  const initialValueRef = useRef(formik.values[name]);

  useEffect(() => {
    const initialValue = initialValueRef.current;

    return () => {
      formik.setFieldValue(name, initialValue);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="mb-32">
        <TextField name={name} label="شماره شبا" formik={formik} maxCharsN={24} fillFrom="ltr" />
      </div>

      <div className="grid grid-cols-3 gap-x-12">
        <div className="col-span-1">
          <Button isFullWidth color="grey" onClick={handleSmoothClose} type="button">
            انصراف
          </Button>
        </div>
        <div className="col-span-2">
          <Button isFullWidth type="submit">
            ذخیره
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ShabaBottomSheet;
