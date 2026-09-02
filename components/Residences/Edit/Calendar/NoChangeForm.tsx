import { TextField } from "components/General/core/TextField";

function NoChangeForm({ noChange_formik }: { noChange_formik: any }) {
  return (
    <>
      <div className="mb-12">
        <TextField
          name="selected-days-price_NoChange"
          inputmode="numeric"
          formik={noChange_formik}
          label="قیمت روزهای انتخاب شده"
          leftIcon={<span className="text-12 leading-21 text-black font-l">تومان</span>}
          wordifyNumbers={true}
        />
      </div>

      <div className="">
        <TextField
          name="selected-days-discount_NoChange"
          inputmode="numeric"
          formik={noChange_formik}
          label="تخفیف روزهای انتخاب شده"
          leftIcon={<span className="text-12 leading-21 text-black font-l">درصد</span>}
          wordifyNumbers={false}
        />
      </div>
    </>
  );
}

export default NoChangeForm;
