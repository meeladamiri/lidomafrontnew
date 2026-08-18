import { useState } from "react";
import FAQItem from "./FAQItem";

function BeautifulFAQs({
  faqs,
}: {
  faqs: {
    answer: string;
    question: string;
    id: number;
  }[];
}) {
  const [openedFAQId, setOpenedFAQId] = useState<number>();

  return (
    <div className="grid grid-cols-12 gap-y-16 sm:gap-x-24 md:gap-x-40">
      <div className="col-span-full sm:col-span-6 md:col-span-6">
        {faqs?.slice(0, Math.ceil(faqs.length / 2)).map((faqItem, ind) => (
          <div className="mb-16 last:mb-0 border-b-1 border-solid border-b-gray-CACFD3" key={ind}>
            <FAQItem
              openedFAQId={openedFAQId}
              setOpenedFAQId={setOpenedFAQId}
              answer={faqItem.answer}
              faqId={faqItem.id}
              question={faqItem.question}
              hasBg={false}
            />
          </div>
        ))}
      </div>

      <div className="col-span-full sm:col-span-6 md:col-span-6">
        {faqs?.slice(Math.ceil(faqs.length / 2)).map((faqItem, ind) => (
          <div className="mb-16 last:mb-0 border-b-1 border-solid border-b-gray-CACFD3" key={ind}>
            <FAQItem
              openedFAQId={openedFAQId}
              setOpenedFAQId={setOpenedFAQId}
              answer={faqItem.answer}
              faqId={faqItem.id}
              question={faqItem.question}
              hasBg={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default BeautifulFAQs;
