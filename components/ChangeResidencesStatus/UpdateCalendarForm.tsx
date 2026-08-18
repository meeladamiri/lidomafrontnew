import { TextField } from "components/General/core/TextField";

function UpdateCalendarForm({ UpdateCalendar_formik }: { UpdateCalendar_formik: any }) {
  return (
    <>
      <div className="mb-12">
        <TextField
          name="selected-days-price_UpdateCalendar"
          inputmode="numeric"
          formik={UpdateCalendar_formik}
          wordifyNumbers={false}
          placeholder="قیمت روزهای انتخاب شده"
          label="قیمت روزهای انتخاب شده"
        />
      </div>

      <div className="">
        <TextField
          name="selected-days-discount_UpdateCalendar"
          type="number"
          formik={UpdateCalendar_formik}
          wordifyNumbers={false}
          placeholder="تخفیف روزهای انتخاب شده (درصد)"
          label="تخفیف روزهای انتخاب شده (درصد)"
        />
      </div>
    </>
  );
}

export default UpdateCalendarForm;
