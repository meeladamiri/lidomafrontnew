// import Image from "next/image";
import { useState } from "react";
import { SiteRules } from "@/constants/faqs/site-rules";
import SearchBox from "../General/SearchBox";
import Footer from "@/layouts/Footer";
import FAQItem from "../General/FAQ/FAQItem";
const Rules = ({
  showHeader = true,
  showSearchBox = true,
}: {
  showHeader?: boolean;
  showSearchBox?: boolean;
}) => {
  const [openedFAQId, setOpenedFAQId] = useState<number>();
  const [rulesText, setRulesText] = useState<string>("");
  return (
    <>
      <div className="CustomContainer pt-[79px] md:pt-[105px]">
        {showHeader && <h1 className="text-20 font-m mb-20">قوانین و مقررات</h1>}
        {showSearchBox && (
          <div className="my-16">
            <SearchBox
              inputName="search"
              placeholder="جستجو"
              value={rulesText}
              onChange={(value) => setRulesText(value)}
            />
          </div>
        )}

        <div className="mt-4">
          <h1 className="text-14 font-m leading-24">شرایط و قوانین استفاده از سرویس‌ها و خدمات</h1>
          <p className="text-12 font-l leading-24 text-justify mt-12">
            کاربر گرامی لطفاً موارد زیر را جهت استفاده بهینه از خدمات و برنامه‌های کاربردی لیدوما
            به دقت ملاحظه فرمایید.ورود کاربران به وب‌سایت لیدوما هنگام استفاده از پروفایل شخصی،
            طرح‌های تشویقی، ویدئوهای رسانه تصویری لیدوما و سایر خدمات ارائه شده توسط لیدوما به
            معنای آگاه بودن و پذیرفتن شرایط و قوانین و همچنین نحوه استفاده از سرویس‌ها و خدمات
            لیدوما است. توجه داشته باشید که ثبت سفارش نیز در هر زمان به معنی پذیرفتن کامل کلیه
            شرایط و قوانین لیدوما از سوی کاربر است. لازم به ذکر است شرایط و قوانین مندرج، جایگزین
            کلیه توافق‌های قبلی محسوب می‌شود.
          </p>
        </div>
        <div className="mt-20">
          {SiteRules.map((faq) => {
            return (
              <div className="last:mb-0 border-b-1" key={faq.id}>
                <FAQItem
                  openedFAQId={openedFAQId}
                  setOpenedFAQId={setOpenedFAQId}
                  faqId={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                  hasBg={false}
                />
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </>
  );
};
export default Rules;
