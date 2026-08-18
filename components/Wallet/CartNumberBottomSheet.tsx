import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { TextField } from "components/General/core/TextField";
import { useEffect, useRef } from "react";

function CartNumberBottomSheet({
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
        <TextField name={name} label="شماره کارت" formik={formik} maxCharsN={16} type="number" />
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
            disabled={!formik.values[name]}
            // onClick={() => formik.handleSubmit()}
          >
            ذخیره
          </Button>
        </div>
      </div>
    </form>
  );
}

export default CartNumberBottomSheet;
