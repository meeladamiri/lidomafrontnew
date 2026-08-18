import DatePicker from "react-mobile-datepicker-jalaali-persian";
import classes from "styles/Mobile-datepicker.module.css";

// const dateConfigMap = {
//   year: {
//     format: "YYYY",
//     caption: "سال",
//     step: 1,
//   },
//   month: {
//     format: "M",
//     caption: "ماه",
//     step: 1,
//   },
//   date: {
//     format: "D",
//     caption: "روز",
//     step: 1,
//   },
// };
export const month = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
const dateConfigMap2 = {
  year: {
    format: "YYYY",
    caption: "سال",
    step: 1,
  },
  month: {
    format: (value: any) => month[value.jm - 1],
    caption: "ماه",
    step: 1,
  },
  date: {
    format: "D",
    caption: "روز",
    step: 1,
  },
};

function MobileDatepicker({
  year,
  month,
  day,
  handleDateSubmit,
}: {
  year: number;
  month: number;
  day: number;
  handleDateSubmit: ({ year, month, day }: { year: number; month: number; day: number }) => void;
}) {
  return (
    //  {/* IMPORTANT NOTE: Any 'mobile datepicker' being used in this application 'must' be wrapped in an element with class of 'Custom-Mobile-Datepicker'  */}
    <div id="custom-mobile-datepicker" className={`${classes["Custom-Mobile-Datepicker"]}`}>
      <DatePicker
        value={{ jy: year, jm: month, jd: day }}
        isOpen={true}
        theme="android"
        dateConfig={dateConfigMap2}
        onSelect={(item: { jd: number; jm: number; jy: number }) => {
          /* do something */
          // console.log("Hey the item is", item);
          handleDateSubmit({ year: item.jy, month: item.jm, day: item.jd });
        }}
        onCancel={(e: any) => {
          /* do something */
          // console.log("Cancelling", e);
        }}
        // confirmText="تایید"
        // customHeader="تاریخ تولد"
        // cancelText="بازگشت"
        isPopup={false}
        showCaption={true}
        showHeader={false}
        showFooter={!false}
      />
    </div>
  );
}

export default MobileDatepicker;
