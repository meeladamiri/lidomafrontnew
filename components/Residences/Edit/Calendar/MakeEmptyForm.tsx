import { TextField } from "components/General/core/TextField";

function MakeEmptyForm({ makeEmpty_formik }: { makeEmpty_formik: any }) {
  return (
    <>
      <div className="mb-12">
        <TextField
          name="selected-days-price_MakeEmpty"
          inputmode="numeric"
          formik={makeEmpty_formik}
          label="قیمت روزهای انتخاب شده"
          leftIcon={<span className="text-12 leading-21 text-black font-l">تومان</span>}
          wordifyNumbers={true}
        />
      </div>

      <div className="">
        <TextField
          name="selected-days-discount_MakeEmpty"
          inputmode="numeric"
          formik={makeEmpty_formik}
          label="تخفیف روزهای انتخاب شده"
          leftIcon={<span className="text-12 leading-21 text-black font-l">درصد</span>}
          wordifyNumbers={false}
        />
      </div>
    </>
  );
}

export default MakeEmptyForm;
