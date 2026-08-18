import Footer from "@/layouts/Footer";
// import Image from "next/image";
// import { PolictDataItems } from "./PolicyDataItems";
import PolicyItem from "./PolicyItem";

const ReserveCancellationPolicy = () => {
  return (
    <>
      <div className="pt-[79px] md:pt-[105px] CustomContainer">
        <h1 className="font-bold text-21 leading-28 md:hidden mb-32">
          مقررات <span className="text-[#FF3B30]">لغو</span> رزرو اقامتگاه ها
        </h1>
        {/* <div className="flex"> */}
        {/* <div> */}
        <h1 className="font-bold text-32 leading-[44px] hidden md:block mb-40">
          مقررات <span className="text-[#FF3B30]">لغو</span> رزرو اقامتگاه ها
        </h1>
        {/* <p className="mt-12 text-14 md:text-16 font-light leading-24 text-justify">
              هر یک از اقامتگاه های موجود در سایت قوانین لغو رزرو مربوط به خود را دارند که در صفحه
              اقامتگاه و در بخش قوانین لغو رزرو قابل مشاهده می باشد . به صورت کلی این قوانین به 4
              دسته تقسیم می شوند که در ادامه صفحه به آنها اشاره خواهیم کرد.ّ
            </p> */}
        {/* </div> */}
        {/* <Image
            className="hidden md:block"
            src="/assets/red-cancel-icon.png"
            alt="cancel"
            width={160}
            height={160}
          /> */}
        {/* </div> */}
        {/* <div className="md:grid md:grid-cols-2 gap-20"> */}
        {/* {PolictDataItems.map((item, index) => { */}
        {/* return ( */}
        {/* <div className="md:col-span-1"> */}
        <PolicyItem
          befor24="کسر مبلغ شب اول رزرو + 20% مابقی شب ها"
          befor72="کسر 20% از مبلغ کل رزرو"
          entry="کسر مبلغ دو شب اول رزرو (علاوه بر شب های سپری شده) و 20% از مابقی شب ها"
          longtermReserve="تنها با توافق میزبان و کسر حداقل ۲۰٪ کل مبلغ رزرو"
          peakDays="تنها با توافق میزبان و کسر حداقل ۲۰٪ کل مبلغ رزرو"
        />
        {/* </div> */}
        {/* ); */}
        {/* })} */}
        {/* </div> */}

        {/* <div className="flex flex-col text-justify mt-20">
          <h2 className="text-16 font-medium">موارد زیر در همه سیاست‌های لغو رزرو یکسان است :</h2>
          <div className="flex flex-col my-20 text-14 font-light pr-16 border-r leading-32 border-dashed border-[#263341]">
            <p className="mb-10 relative flex before:top-14 before:absolute before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
              در هر شرایط پس از لغو رزرو، معادل %20 از مجموع صورتحساب ، بعنوان کارمزد لیدوما بابت
              رزرو و لغو رزرو کسر خواهد شد.
            </p>
            <p className="mb-10 relative before:top-14 before:absolute before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
              در صورتی که رزرو بعد از ساعت واریز وجوه به حساب میزبان که در ساعت 17 الی 22 شب شروع
              رزرو انجام می شود لغو شود, تسویه وجوه می بایست مستقیما مابین دو طرف انجام گیرد.{" "}
            </p>
            <p className="mb-10 relative before:top-14 before:absolute before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
              هر نوع اختلاف یا شکایتی از هر دو طرف می بایست در اسرع وقت در سامانه “شکایات” در وبسایت
              لیدوما ثبت شود تا پیش از تسویه وجوه ملاک محاسبه قرار گیرد، در غیراینصورت هرگونه توافق
              و تبادل مالی تنها بصورت مستقیم مابین دوطرف قابل انجام خواهد بود.
            </p>
            <p className="relative before:top-14 before:absolute before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
              مبلغ صورتحساب لغو بصورت خودکار محاسبه می شود و در هنگام لغو رزرو برای کاربر به نمایش
              درمی آید لذا لغو رزرو از جانب کاربر با آگاهی کامل انجام می شود و هرگونه ادعایی در این
              ارتباط مردود می‌باشد.
            </p>
          </div>
        </div> */}
      </div>

      <Footer />
    </>
  );
};
export default ReserveCancellationPolicy;
