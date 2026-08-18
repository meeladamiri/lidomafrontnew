import React, { useState } from "react";
import Image from "next/image";
import { LinkButton } from "../General/core/Button";
import BottomSheet, { THandleSmoothClose } from "../General/core/BottomSheet";
import { jobOpportunityItems } from "@/constants/faqs/job-opportunity";
import JobOpportunityDetailModal from "./JobOpportunityDetailModal";
import JobDetailItem from "./JobDeatilItem";
import ShareBottomSheet, { IShare } from "../General/Share/ShareBottomSheet";

const shareInitialValues: IShare = {
  show: false,
  payload: {
    textToBeSmsed: "",
    link: "",
    whatsAppText: "",
    telegramText: "",
    twitter: {
      url_to_go: "",
      text_of_tweet: "",
      via: "",
    },
  },
};

const JobOpportunity = () => {
  const [showJobOpportunityDetailModal, setShowJobOpportunityDetailModal] =
    useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    title: string;
    longDescription: JSX.Element | string;
  }>({ title: "", longDescription: "" });
  const [showShareBottomSheet, setShowShareBottomSheet] = useState<IShare>(shareInitialValues);

  return (
    <div>
      <div className="relative text-white text-center">
        <Image
          className="md:hidden"
          src="/assets/job-opportunity/job-bg.jpg"
          alt="job-bg"
          width={360}
          height={380}
          style={{ width: "100%" }}
        />
        <Image
          className="hidden md:block"
          src="/assets/job-opportunity/job-bg-desktop.jpg"
          alt="job-bg"
          width={1400}
          height={380}
          style={{ width: "100%" }}
        />
        <div className="absolute sm:left-2/4 sm:translate-x-[-50%] md:left-2/4 md:translate-x-[-50%] flex flex-col items-center bottom-26 px-16">
          <div className="flex justify-center items-center mb-24 gap-10">
            <Image src="/assets/job-opportunity/job-bag.svg" alt="bag" width={18} height={17.86} />
            <h5>فرصت های شغلی</h5>
          </div>
          <p className="text-12 leading-21 mb-24">
            لیدوما، فقط یه استارتاپ که توش کار می‌کنیم نیست، لیدوما خونه ماست، جایی که توش یاد
            می‌گیریم، رشد می‌کنیم و در یک کلام زندگی می‌کنیم.
          </p>
          <LinkButton href="#JobOpportunity">مشاهده 5 فرصت شغلی</LinkButton>
        </div>
      </div>
      <div className="flex flex-col items-center my-32">
        <Image
          className="mb-12"
          src="/assets/logos/Logo-green-no-text.svg"
          alt="logo"
          width={48}
          height={48}
        />
        <h4 className="text-20 leading-25 font-m">ارزش های ما در لیدوماتریپ</h4>
      </div>
      <div className="md:grid md:grid-cols-4">
        <div className="my-20 text-14 text-center leading-20 grid grid-cols-2 gap-y-15 md:grid-cols-3 md:col-start-2 md:col-end-4 md:gap-30">
          <div className="px-16 py-10 flex flex-col items-center border-l-1">
            <Image
              className="mb-12"
              src="/assets/job-opportunity/value-1.svg"
              alt="contact"
              width={32}
              height={32}
            />
            <span className="text-14 leading-20">حرمت کلام</span>
          </div>
          <div className="px-16 py-10 flex flex-col items-center md:border-l-1">
            <Image
              className="mb-12"
              src="/assets/job-opportunity/value-2.svg"
              alt="contact"
              width={32}
              height={32}
            />
            <span className="text-14 leading-20">عاملیت</span>
          </div>
          <div className="px-16 py-10 flex flex-col items-center border-l-1 md:border-l-0">
            <Image
              className="mb-12"
              src="/assets/job-opportunity/value-3.svg"
              alt="contact"
              width={32}
              height={32}
            />
            <span className="text-14 leading-20">تمامیت داشتن</span>
          </div>
          <div className="px-16 py-10 flex flex-col items-center md:border-l-1">
            <Image
              className="mb-12"
              src="/assets/job-opportunity/value-4.svg"
              alt="contact"
              width={32}
              height={32}
            />
            <span className="text-14 leading-20">گفت خنثی و شنود موثر</span>
          </div>
          <div className="px-16 py-10 flex flex-col items-center border-l-1">
            <Image
              className="mb-12"
              src="/assets/job-opportunity/value-5.svg"
              alt="contact"
              width={32}
              height={32}
            />
            <span className="text-14 leading-20">در کنار هم یک خانواده‌ایم</span>
          </div>
          <div className="px-16 py-10 flex flex-col items-center">
            <Image
              className="mb-12"
              src="/assets/job-opportunity/value-6.svg"
              alt="contact"
              width={32}
              height={32}
            />
            <span className="text-14 leading-20">خلاقیت، پشتکار و در مسیر رشد مستمر</span>
          </div>
        </div>
      </div>
      <div className="CustomContainer">
        <div className="flex flex-col md:grid md:grid-cols-2 md:flex-row mx-20 my-6 text-center text-white">
          <Image
            className="hidden md:block"
            src="/assets/job-opportunity/job-2-desktop.jpg"
            alt="contact"
            width={564}
            height={220}
            style={{ width: "100%", height: "100%" }}
          />
          <Image
            className="md:hidden"
            src="/assets/job-opportunity/job-2.jpg"
            alt="contact"
            width={320}
            height={320}
            style={{ width: "100%" }}
          />
          <div className="text-center flex flex-col items-center md:justify-center md:gap-y-30 py-16 rounded-bl-20 rounded-br-20 md:rounded-tl-20 md:rounded-br-0 bg-primary-main">
            <h6 className="mb-16 text-16 md:text-26 font-m">داستان لیدوما</h6>
            <p className="text-12 md:text-16 md:leading-30 leading-22 mb-16 px-16">
              لیدوما چهارمین کاخ گردشگری پادشاهان هخامنشی و از شهرهای بین راهی دوران هخامنشی بوده که
              بر سر راه شاهی پاسارگاد و تخت جمشید به شوش قرار داشته و شاهان و فرمانروایانی که در این
              فاصله رفت و آمد داشتند، در این کاخ بین راهی استراحت میکردند. عنوان لیدوما برگرفته از
              این استراحگ...
            </p>
            <div id="JobOpportunity">
              <LinkButton href="/about" color="white">
                قصه ما را دنبال کنید
                <i className="icon-FlashLeft text-26" />
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#F4F5F6] p-16 mt-20">
        <div className="CustomContainer">
          <h4 className="flex items-center gap-10 mb-10">
            <Image
              src="/assets/job-opportunity/job-bag-border.svg"
              alt="contact"
              width={18}
              height={17}
            />
            فرصت های شغلی
          </h4>
          {jobOpportunityItems.map((item, index) => (
            <div key={index} className="bg-white rounded-lg p-16 mb-16">
              <div className=" flex w-full items-center justify-between  h-100">
                <div className="flex items-center">
                  <Image src={item.icon} alt="icon" width={40} height={40} className="pl-8" />
                  <h2 className="text-16 font-m">{item.title}</h2>
                </div>
                <div className="flex-none">
                  <Image
                    className="cursor-pointer"
                    src="/assets/job-opportunity/share-icon.svg"
                    alt="contact"
                    width={32}
                    height={32}
                    onClick={() => {
                      setShowShareBottomSheet({
                        show: true,
                        payload: {
                          textToBeSmsed: "string",
                          link: "string",
                          whatsAppText: "string",
                          telegramText: "string",
                          twitter: {
                            url_to_go: "string",
                            text_of_tweet: "string",
                            via: "string",
                          },
                        },
                      });
                    }}
                  />
                </div>
              </div>
              <div className="border-1 border-dashed border-gray-300 my-12"></div>
              <p className="text-14 leading-20">{item.description}</p>
              <a
                className="flex items-center mt-24 text-12 text-[#007AFF] cursor-pointer md:hidden"
                onClick={() => {
                  setModalData(item);
                  setShowJobOpportunityDetailModal(true);
                }}
              >
                مشاهده جزئیات بیشتر
                <i className="icon-FlashLeft text-16 text-[#007AFF]" />
              </a>
              <div className="hidden md:block pt-20">
                <JobDetailItem body={item.longDescription} />
              </div>
              {showJobOpportunityDetailModal && (
                <JobOpportunityDetailModal
                  isModalOpen={showJobOpportunityDetailModal}
                  handleClose={() => setShowJobOpportunityDetailModal(false)}
                  data={{ title: modalData.title, longDescription: modalData.longDescription }}
                ></JobOpportunityDetailModal>
              )}
            </div>
          ))}
        </div>
      </div>

      <BottomSheet
        open={!!showShareBottomSheet}
        handleClose={() => setShowShareBottomSheet(shareInitialValues)}
        headerTitle="اشتراک گذاری فرصت شغلی"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <ShareBottomSheet
              handleSmoothClose={handleSmoothClose}
              whatIsBeingShared="فرصت شغلی"
              payload={showShareBottomSheet.payload}
            />
          );
        }}
      />
    </div>
  );
};
export default JobOpportunity;
