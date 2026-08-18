import React, { useEffect, useState } from "react";
import Image from "next/image";
import SearchBox from "../General/SearchBox";
import { Button } from "../General/core/Button";
import QuestionFormModal from "./QuestionFormModal";
import Tabs from "../General/core/Tabs";
import { PublicItems_FAQs, IPublicItem_FAQs, ICategory } from "@/constants/faqs/public-faqs";
import Footer from "@/layouts/Footer";
import FAQItem from "../General/FAQ/FAQItem";
import { useRouter } from "next/router";

type IFaqsData = {
  id: number;
  question: string;
  answer: string;
  moreInfo?: JSX.Element | string;
};

const PublicFAQs = () => {
  const router = useRouter();
  const [questionText, setQuestionText] = useState<string>("");
  const [openedFAQId, setOpenedFAQId] = useState<number>();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [publicFaqItemData, setPublicFaqItemData] = useState<IPublicItem_FAQs[]>([]);
  const [faqsData, setFaqsData] = useState<IFaqsData[]>([]);
  const [faqCategoryTitle, setFaqCategoryTitle] = useState<string>("");
  const [showQuestionFormModal, setShowQuestionFormModal] = useState<boolean>(false);
  const [isActiveCategory, setIsActiveCategory] = useState<Boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  useEffect(() => {
    setPublicFaqItemData(PublicItems_FAQs);
    setFaqsData(PublicItems_FAQs[0].category[0].faqData);
    setFaqCategoryTitle(PublicItems_FAQs[0].category[0].title);
  }, []);

  useEffect(() => {
    if (!!router && router?.query) {
      if (router?.query?.type === "guest") {
        setActiveTab(0);
      } else if (router?.query?.type === "host") {
        setActiveTab(1);
      } else if (router?.query?.type === "public-questions") {
        setActiveTab(2);
      }
    }
  }, [router]);

  return (
    <>
      <div className="pb-20 CustomContainer pt-[79px] md:pt-[105px]">
        <h1 className="text-20 font-m mb-20">سوالات متداول</h1>
        <div className="mt-16 mb-24">
          <SearchBox
            inputName="search"
            placeholder="جستجو"
            value={questionText}
            onChange={(value) => setQuestionText(value)}
          />
        </div>
        <div className="my-12">
          <h2 className="my-12 text-16 font-medium">دسته بندی سوالات</h2>
          <Tabs
            activeIndex={activeTab}
            onChange={(idx: number) => {
              setActiveTab(idx);
            }}
            data={[
              {
                tabLabel: `مهمان`,
                tabIndex: 0,
              },
              {
                tabLabel: `میزبان`,
                tabIndex: 1,
              },
              {
                tabLabel: `سوالات عمومی`,
                tabIndex: 2,
              },
            ]}
          />
          <div>
            {publicFaqItemData
              .filter((tab) => tab.value == activeTab)
              .map(({ category }: { category: ICategory[] }, index: number) => (
                <div
                  key={index}
                  className="flex md:flex-wrap w-full overflow-x-auto hideScrollbar gap-8"
                >
                  {category.map(({ value, title, icon, faqData }, index: number) => (
                    <div
                      onClick={() => {
                        setFaqsData(faqData);
                        setFaqCategoryTitle(title);
                        setSelectedCategory(index);
                        setIsActiveCategory(true);
                      }}
                      key={value}
                      className={`cursor-pointer flex items-center min-w-[235px] font-medium  rounded-[14px] border border-[#CACFD3]ّ gap-4 p-8 mx-8 my-12
                    ${
                      isActiveCategory && selectedCategory == index
                        ? "border-1 border-solid border-primary-main shadow-[0px_4px_16px_rgba(3,214,187,0.12)]"
                        : ""
                    }`}
                    >
                      <Image src={icon} alt="contact" width={56} height={56} className="pl-8" />
                      <div className="flex flex-col">
                        <span className="text-13 font-m font-medium">{title}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-11 font-light">{faqData.length} پرسش و پاسخ</span>
                          <i className="icon-FlashLeft text-20 text-black" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
        <div className="mt-14 mb-5">
          <h1 className="text-base font-medium">{faqCategoryTitle}</h1>
        </div>
        <div className="mt-14">
          {faqsData.map((faq: IFaqsData) => {
            return (
              <div className="last:mb-0 border-b-1" key={faq.id}>
                <FAQItem
                  openedFAQId={openedFAQId}
                  setOpenedFAQId={setOpenedFAQId}
                  faqId={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                  hasBg={false}
                  moreInfo={faq.moreInfo}
                />
              </div>
            );
          })}
        </div>
        <div className="flex flex-col items-center p-16 gap-10 mt-10">
          <span className="text-14 font-medium">سوال خود را پیدا نکردید ؟</span>
          <span className="text-12 font-light text-center">
            پرسش خود را ثبت کنید، ما بزودی پاسخ آن را برایتان ارسال خواهیم کرد.
          </span>
          <Button className="!bg-[#05668D]" onClick={() => setShowQuestionFormModal(true)}>
            ثبت آنلاین پرسش شما
          </Button>
          {showQuestionFormModal && (
            <QuestionFormModal
              headerTitle="ثبت سوال"
              isModalOpen={showQuestionFormModal}
              handleClose={() => setShowQuestionFormModal(false)}
            />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};
export default PublicFAQs;
