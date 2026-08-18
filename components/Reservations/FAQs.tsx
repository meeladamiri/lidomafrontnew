import { IReserveDetailsFAQ } from "api/Reserves";
import { useState } from "react";
import FAQItem from "../General/FAQ/FAQItem";

function FAQs({ faqs }: { faqs: IReserveDetailsFAQ[] }) {
  //   if (!faqs || !faqs.length) return null;
  const [openedFAQId, setOpenedFAQId] = useState<number>();

  return (
    <div className="">
      <div className="text-[#000000] text-16 leading-28 font-m mb-24">سوالات متداول</div>
      {faqs.map((faq) => {
        return (
          <div className="mb-12 last:mb-0" key={faq.id}>
            <FAQItem
              openedFAQId={openedFAQId}
              setOpenedFAQId={setOpenedFAQId}
              answer={faq.answer}
              faqId={faq.id}
              question={faq.question}
            />
          </div>
        );
      })}
    </div>
  );
}
export default FAQs;
