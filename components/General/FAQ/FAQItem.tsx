import { sanitize } from "isomorphic-dompurify";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction, useState } from "react";

const ModalWrapper = dynamic(() => import("@/components/General/core/ModalWrapper"), {
  ssr: true,
});

function FAQItem({
  question,
  answer,
  moreInfo,
  faqId,
  openedFAQId,
  setOpenedFAQId,
  hasBg = true,
}: {
  question: string;
  answer: string | Node;
  moreInfo?: JSX.Element | string;
  faqId: number;
  openedFAQId: number | undefined;
  setOpenedFAQId: Dispatch<SetStateAction<number | undefined>>;
  hasBg?: boolean;
}) {
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  return (
    <div
      className={`
        py-8 rounded-8
        ${!!hasBg ? "typical-gray-bg px-12" : ""}
    `}
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => {
          if (openedFAQId === faqId) setOpenedFAQId(undefined);
          else setOpenedFAQId(faqId);
        }}
      >
        <p className="text-black text-14 leading-24 font-r">{question}</p>
        <div className="flex items-center">
          <i
            className={`
               icon-FlashDown text-24 text-black
               ${openedFAQId === faqId ? "rotate-180" : ""}
               transition-all duration-200
            `}
          />
        </div>
      </div>

      {!!moreInfo ? (
        <div
          className={`
            text-black text-12 leading-21 font-l
            ${openedFAQId === faqId ? "h-auto pb-8 mt-16 " : "h-0 overflow-hidden"}
            transition-all duration-200
          `}
        >
          <>
            {answer}

            {!!moreInfo && (
              <div>
                <a
                  onClick={() => setShowDetailModal(true)}
                  href="#"
                  className="flex items-center gap-4 text-[#007AFF] pt-2 pr-1"
                >
                  <span>اطلاعات بیشتر</span>
                  <i className="icon-FlashLeft text-18 text-[#007AFF] " />
                </a>
                {showDetailModal && (
                  <ModalWrapper
                    headerTitle="توضیحات تکمیلی"
                    open={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    modalClassname={"md:max-h-[90%]"}
                  >
                    <h2 className="text-14 font-m mb-10">{question}</h2>
                    {moreInfo}
                  </ModalWrapper>
                )}
              </div>
            )}
          </>
        </div>
      ) : (
        <div
          className={`
          text-black text-12 leading-21 font-l
          ${openedFAQId === faqId ? "h-auto pb-8 mt-16 " : "h-0 overflow-hidden"}
          transition-all duration-200
        `}
          dangerouslySetInnerHTML={{ __html: sanitize(answer) }}
        ></div>
      )}
    </div>
  );
}

export default FAQItem;
