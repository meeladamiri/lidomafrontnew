import { getSupportFAQs, ISupportPage_FAQItem } from "@/api/Support";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import exception from "@/utilities/exception";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { TinyLoader } from "../General/Loader/TinyLoader";
import FAQItem from "../General/FAQ/FAQItem";

export function SupportPageFAQs() {
  const [openedFAQId, setOpenedFAQId] = useState<number>();
  const { isSuccess, isLoading, data } = useQuery(["getSupportFAQs"], () => getSupportFAQs());

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        // console.log("In success of getSupportFAQs, data is: ", data);
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data]);

  return (
    <>
      {isLoading ? (
        <TinyLoader />
      ) : (
        (data?.params?.faqs as ISupportPage_FAQItem[])?.map((faq, i) => {
          return (
            <div
              className="mb-12 last:mb-0 pb-12 border-b-1 border-solid border-b-gray-CACFD3"
              key={i}
            >
              <FAQItem
                openedFAQId={openedFAQId}
                setOpenedFAQId={setOpenedFAQId}
                answer={faq.answer}
                faqId={faq.id}
                question={faq.question}
                hasBg={false}
              />
            </div>
          );
        })
      )}
    </>
  );
}
