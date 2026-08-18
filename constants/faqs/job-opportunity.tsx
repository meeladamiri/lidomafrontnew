type IJobOpportunityItem = {
  id: number;
  icon: string;
  title: string;
  description: string;
  longDescription: JSX.Element | string;
};
export const jobOpportunityItems: IJobOpportunityItem[] = [
  {
    id: 1,
    icon: "/assets/job-opportunity/job-position-1.svg",
    title: "کارشناس ارشد سئو",
    description:
      "تحقيق برکلمات كليدي، تحليل رقبا، تحلیل محتوای سایت و تدوین استراتژي های مربوطه...",
    longDescription: (
      <div className="border-r leading-32 border-dashed border-[#263341] pr-16">
        <span className="relative text-16 font-medium flex before:top-2 before:absolute before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
          مهارت های ضروری
        </span>
        <p className="text-14 font-l leading-28">
          تحقيق برکلمات كليدي، تحليل رقبا، تحلیل محتوای سایت و تدوین استراتژي های مربوطه
          <br />
          تسلط بر نرم افزارهای مرتبط همچون Google Analytic، Search Console، Moz ، GTag ، Ahrefّ
          <br />
          نظارت بر شاخص های عملکرد سئوی محتواهای سایت
          <br />
          آشنایی کامل با روش تدوین و توسعه استراتژی سئو و الگوریتم های موتور جستجوی گوگل
        </p>
        <span className="text-[#28CD41] relative text-16 font-medium flex before:top-2 before:absolute  before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#28CD41] before:rounded-full">
          دارا بودن موارد زیر مزیت حساب می شود
        </span>
        <p className="text-14 font-l leading-28">
          تجربه بالا در فرآیند لینک سازی و بهبود سرعت صفحات
          <br />
          ارائه نمونه کار خوب در کلمات کلیدی رقابتی
          <br />
          حداقل دو سال تجربه مرتبط و موثر
        </p>
        <span className="relative text-16  font-medium flex before:top-2 before:absolute  before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
          ویژگی های فردی
        </span>
        <p className="text-14 font-l leading-28">
          مهارت ارتباطی موثر به منظور تعامل با ذینفعان
          <br />
          با انگیزه و مثبت اندیش
          <br />
          منظم و مسئولیت پذیر
        </p>
      </div>
    ),
  },
  {
    id: 2,
    icon: "/assets/job-opportunity/job-position-2.svg",
    title: "توسعه دهنده Front End",
    description: " ... HTML & CSS / ReactJS",
    longDescription: (
      <div className="border-r leading-32 border-dashed border-[#263341] pr-16">
        <span className=" relative text-16 font-medium flex before:top-2 before:absolute before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
          مهارت های ضروری
        </span>
        <p className="text-14 font-l leading-28">HTML & CSS / ReactJS</p>
        <span className="text-[#28CD41] relative text-16 font-medium flex before:top-2 before:absolute  before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#28CD41] before:rounded-full">
          دارا بودن موارد زیر مزیت حساب می شود
        </span>
        <p className="text-14 font-l leading-28">
          Git / ES6
          <br />
          آشنایی با TypeScript
        </p>
        <span className="relative text-16 font-medium flex before:top-2 before:absolute  before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
          ویژگی های فردی
        </span>
        <p className="text-14 font-l leading-28">
          دارای روحیه کار تیمی
          <br />
          با انگیزه و مثبت اندیش
          <br />
          منظم و مسئولیت پذیر
        </p>
      </div>
    ),
  },
  {
    id: 3,
    icon: "/assets/job-opportunity/job-position-3.svg",
    title: "کارشناس تولید محتوی",
    description:
      "دارای ذوق نویسندگی و توانایی وبلاگ‌ نویسی، مسلط به اصول نگارشی و نرم‌افزارهای مرتبط و ...",
    longDescription: (
      <div className="border-r leading-32 border-dashed border-[#263341] pr-16">
        <span className=" relative text-16 font-medium flex before:top-2 before:absolute before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
          مهارت های ضروری
        </span>
        <p className="text-14 font-l leading-28">
          دارای ذوق نویسندگی و توانایی وبلاگ‌ نویسی
          <br />
          مسلط به اصول نگارشی و نرم‌افزارهای مرتبط
          <br />
          مسلط به جستجو در اینترنت جهت گردآوری مطالب
        </p>
        <span className="text-[#28CD41] relative text-16 font-medium flex before:top-2 before:absolute  before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#28CD41] before:rounded-full">
          دارا بودن موارد زیر مزیت حساب می شود
        </span>
        <p className="text-14 font-l leading-28">
          آشنایی با تولید محتوا در حوزه گردشگری
          <br />
          سابقه همکاری با وبسایت‌ها و وبلاگ‌های معتبر
        </p>
        <span className="relative text-16 font-medium flex before:top-2 before:absolute  before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
          ویژگی های فردی
        </span>
        <p className="text-14 font-l leading-28">
          دارای روحیه کار تیمی
          <br />
          با انگیزه و مثبت اندیش
          <br />
          منظم و مسئولیت پذیر
        </p>
      </div>
    ),
  },
  {
    id: 4,
    icon: "/assets/job-opportunity/job-position-4.svg",
    title: "پشتیبانی تلفنی و امور مشتریان",
    description:
      "پاسخگویی تلفنی به کاربران وبسایت، توانایی مذاکره با کاربران برای ایجاد موقعیت فروش و ...",
    longDescription: (
      <div className="border-r leading-32 border-dashed border-[#263341] pr-16">
        <span className=" relative text-16 font-medium flex before:top-2 before:absolute before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
          مهارت های ضروری
        </span>
        <p className="text-14 font-l leading-28">
          پاسخگویی تلفنی به کاربران وبسایت
          <br />
          توانایی مذاکره با کاربران برای ایجاد موقعیت فروش
          <br />
          توانایی کار با کامپیوتر و نرم‌افزارهای مرتبط
        </p>
        <span className="relative text-16 font-medium flex before:top-2 before:absolute  before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
          ویژگی های فردی
        </span>
        <p className="text-14 font-l leading-28">
          دارای اعتماد به نفس و مهارت‌های ارتباطی قوی
          <br />
          توانایی تعامل مستقیم با افراد متعدد
          <br />
          با انگیزه و مثبت‌اندیش
        </p>
      </div>
    ),
  },
  {
    id: 5,
    icon: "/assets/job-opportunity/job-position-5.svg",
    title: "کارشناس تامین و ثبت اقامتگاه‌",
    description:
      "توانایی مذاکره و اقناع تامین‌کنندگان، توانایی کار با کامپیوتر و نرم‌افزارهای مرتبط و ...",
    longDescription: (
      <div className="border-r leading-32 border-dashed border-[#263341] pr-16">
        <span className=" relative text-16 font-medium flex before:top-2 before:absolute before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
          مهارت های ضروری
        </span>
        <p className="text-14 font-l leading-28">
          توانایی مذاکره و اقناع تامین‌کنندگان
          <br />
          توانایی کار با کامپیوتر و نرم‌افزارهای مرتبط
          <br />
          اطلاع از حوزۀ اماکن و مستغلات یک مزیت محسوب می‌شود
        </p>
        <span className="relative text-16 font-medium flex before:top-2 before:absolute  before:right-[-1.27rem] before:w-[7px] before:h-[7px] before:bg-[#263341] before:rounded-full">
          ویژگی های فردی
        </span>
        <p className="text-14 font-l leading-28">
          دارای اعتماد به نفس و مهارت‌های ارتباطی قوی
          <br />
          توانایی تعامل مستقیم با افراد متعدد
          <br />
          با انگیزه و مثبت‌اندیش
        </p>
      </div>
    ),
  },
];
