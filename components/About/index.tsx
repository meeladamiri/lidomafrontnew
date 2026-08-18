/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import Image from "next/image";
import AboutDetailModal from "./AboutDetailModal";
import GalleryModal from "./GalleryModal";
import { Button } from "../General/core/Button";
import { ValueDataItems } from "./ValueDataItems";
import ValueItem from "./ValueItem";
import { Company_Info } from "@/constants/company_info";
import Footer from "@/layouts/Footer";
import { useQuery } from "@tanstack/react-query";
import { getAboutusPageData } from "@/api/about-us";

const About = () => {
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);

  const { data } = useQuery(["getAboutusPageData"], () => getAboutusPageData());

  return (
    <>
      <div className="pt-[67px] md:pt-[75px]">
        <div>
          <Image
            className="w-full md:hidden"
            src="/assets/about/about-bg-mobile.jpg"
            alt="contact"
            width={360}
            height={380}
          />
          <Image
            className="w-full hidden md:block"
            src="/assets/about/about-bg-md.jpg"
            alt="contact"
            width={1440}
            height={320}
            style={{ width: "100%" }}
          />
        </div>

        <div className="CustomContainer">
          <div className="mt-32 flex flex-col  px-20 text-justify">
            <div className="flex flex-col justify-center items-center">
              <Image
                src="/assets/logos/Logo-green-no-text.svg"
                alt="contact"
                width={48}
                height={48}
              />
              <h3 className="text-16 md:text-28 font-m  mt-8 mb-24">درباره لیدوماتریپ</h3>
            </div>
            <p className="leading-24 text-14 md:text-16">
              <span className="text-primary-main font-normal pl-4">لیدوما</span>
              چهارمین کاخ گردشگری پادشاهان هخامنشی و از شهرهای بین راهی دوران هخامنشی بوده که بر سر
              راه شاهی پاسارگاد و تخت جمشید به شوش قرار داشته و شاهان و فرمانروایانی که در این فاصله
              رفت و آمد داشتند، در این کاخ بین راهی استراحت میکردند. عنوان لیدوما برگرفته از این
              استراحتگاه هخامنشی است.
            </p>
            <p className="leading-24 text-14 md:text-16 mt-12">
              <span className="text-primary-main font-normal pl-4">لیدوماتتریپ </span>
              پلتفرمی امن و جذاب برای رزرو آنلاین اقامتگاه های بومی و محلی در تمام روستاها و شهرهای
              ایران است و با تاکید بر سه هدف « رونق زندگی روستایی » ، «توسعه گردشگری پایدار» و
              «ارتقای کیفیت سفر و اقامت» این فرصت را به وجود آورده تا مسافران در تمام کشور بتوانند
              از نزدیک، زندگی را در فرهنگ های مختلف تجربه کنند، فرصتی که هیچ گاه با زندگی در هتل ها
              و مناطق شهری فراهم نمی شود.
            </p>
            <h3 className="text-16 md:text-18 font-m mt-30">داستان شکل گیری لیدوماتریپ</h3>
            <p className="leading-24 text-14 md:text-16 mt-12">
              داستان لیدوما از سال 96 شروع شد. زمانی که من (میلاد امیری / موسس لیدوماتریپ) به همراه
              تعدادی از همکلاسی‌هایم، که از دانشجویان رشته MBA دانشگاه تبریز بودیم، همزمان با انتخاب
              شهر تبریز به عنوان پایتخت گردشگری جهان اسلام، در جست‌ و جوی فرصتی برای تمرین کارآفرینی
              و کسب درآمد از این موقعیت بودیم.
            </p>
            <Image
              className="w-full my-8 md:hidden"
              src="/assets/about/lidoma-team-mobile.jpg"
              alt="contact"
              width={320}
              height={170}
            />
            <Image
              className="w-full my-20 hidden md:block"
              src="/assets/about/lidoma-team-desktop.jpg"
              alt="contact"
              width={1112}
              height={599}
              style={{ width: "100%" }}
            />
            <p className="leading-24 text-14 md:text-16 mt-12 mb-2">
              پس از تحلیل‌های فراوان، باتوجه به اینکه به این مناسبت حجم زیادی مسافر وارد شهر تبریز
              می‌شد و ...
            </p>
            <button
              className="flex items-center text-16 font-m mt-10"
              onClick={() => setShowAboutModal(true)}
            >
              ادامه مطلب
              <i className="icon-FlashLeft text-20 text-black" />
            </button>

            <div className="flex flex-col justify-center items-center mt-24">
              <Image
                src="/assets/about/Vector-mission.svg"
                alt="contact"
                width={55}
                height={50}
                className="pl-2"
              />
              <h3 className="text-16 md:text-18  font-bold  my-24">مأموریت لیدوماتریپ</h3>
              <span className="flex text-16 md:text-18 my-10 text-center text-[#FFBB00] leading-20">
                تحقق احساس تعلق داشتن همه ایرانیان به همه جای ایران
              </span>
              <p className="leading-24 text-14 md:text-16 mt-12">
                لیدوماتریپ با هدف خدمت به صنعت گردشگری ایران و جذب گردشگران به این مرز بوم فعالیت
                خود را منطبق قوانین جمهوری اسلامی ایران آغاز کرده است . با توجه به پیشرفت صنعت
                گردشگری ، بر آن شدیم تا با استفاده از فضای مجازی بخشی از نیازهای مسافران عزیز را
                برطرف کرده وهمچنین کمکی به چرخش چرخ‌های این صنعت کرده باشیم. با استفاده از فراگیر
                بودن دنیای ارتباطات آنلاین توانستیم نیاز به تامین محل اقامت در هر کجای ایران عزیز را
                برای مسافران آسان کنیم واطلاعات مفیدی برای استفاده بهینه از زمان هنگام سفر در اختیار
                مسافران و گردشگران قرار دهیم که به لذت بخش‌تر شدن سفر شما هموطنان می‌انجامد.
              </p>
              <div className="flex flex-col justify-center items-center my-24 gap-20">
                <Image
                  src="/assets/about/vector-2.svg"
                  alt="contact"
                  width={55}
                  height={50}
                  className="pl-2"
                />
                <h3 className="text-16 font-b">ارزش های لیدوماتریپ</h3>
              </div>
            </div>
          </div>
          <div className="flex md:flex-col md:items-center overflow-x-auto  overflow-y-hidden  relative hideScrollbar">
            <div className="flex">
              {ValueDataItems.firstSection &&
                ValueDataItems.firstSection.map((item, index) => {
                  return (
                    <div key={index} className="mr-20 ml-16 last:ml-32 first:mr-32">
                      <ValueItem
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                      />
                    </div>
                  );
                })}
            </div>
            <div className="flex">
              {ValueDataItems.secondSection &&
                ValueDataItems.secondSection.map((item, index) => {
                  return (
                    <div key={index} className="mr-20 ml-16 last:ml-32 first:mr-32">
                      <ValueItem
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                      />
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="flex flex-col items-center border-t p-6 border-t-gray-100 py-24 mt-20">
            <Image alt="" src="/assets/about/contact-vector.svg" width={56} height={56} />
            <span className="font-m text-16 md:text-18 mb-12">مشخصات ثبتی</span>
            <p className="font-m text-14 md:text-16 leading-36 text-center">
              {Company_Info.COMPANY_NAME} <br />
              شماره ثبت : {Company_Info.REGISTER_NUMBER} <br />
              شماره تماس : {Company_Info.PHONE_NUMBER} <br />
              آدرس : {Company_Info.ADDRESS} <br />
              کد پستی : {Company_Info.POST_CODE}
            </p>
          </div>
        </div>
        <div className="bg-[#F4F5F6] p-16 text-center ">
          <div className="CustomContainer">
            <h3 className="pt-10">گالری تصاویر</h3>
            <div className="md:hidden">
              <div className="flex flex-row w-full gap-12 mt-12">
                <Image
                  className=""
                  alt=""
                  src="/assets/about/gallery/gallery-1.jpg"
                  width={500}
                  height={500}
                  style={{
                    maxWidth: "50%",
                    height: "auto",
                  }}
                />
                <Image
                  className=""
                  alt=""
                  src="/assets/about/gallery/gallery-2.jpg"
                  width={500}
                  height={500}
                  style={{
                    maxWidth: "50%",
                    height: "auto",
                  }}
                />
              </div>
              <div className="flex flex-row w-full gap-12 mt-12">
                <Image
                  className=""
                  alt=""
                  src="/assets/about/gallery/gallery-3.jpg"
                  width={500}
                  height={500}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              </div>
              <div className="flex flex-row w-full gap-12 mt-12">
                <Image
                  className=""
                  alt=""
                  src="/assets/about/gallery/gallery-4.jpg"
                  width={500}
                  height={500}
                  style={{
                    maxWidth: "50%",
                    height: "auto",
                  }}
                />
                <Image
                  className=""
                  alt=""
                  src="/assets/about/gallery/gallery-5.jpg"
                  width={500}
                  height={500}
                  style={{
                    maxWidth: "50%",
                    height: "auto",
                  }}
                />
              </div>
              <div className="flex flex-row w-full gap-12 mt-12">
                <Image
                  className=""
                  alt=""
                  src="/assets/about/gallery/gallery-6.jpg"
                  width={500}
                  height={500}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              </div>
            </div>
            <div className="hidden md:block">
              <div className="grid grid-cols-4 items-center gap-10 mt-12">
                <div className="col-span-1">
                  <Image
                    className=""
                    alt=""
                    src="/assets/about/gallery/gallery-12-md.png"
                    width={200}
                    height={300}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <Image
                    className=""
                    alt=""
                    src="/assets/about/gallery/gallery-13-md.png"
                    width={200}
                    height={300}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Image
                    className="h-full"
                    alt=""
                    src="/assets/about/gallery/gallery-14-md.png"
                    width={507}
                    height={382}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mb-6 md:flex md:justify-center">
              <Button
                className="mt-10 md:w-fit"
                isFullWidth
                type="button"
                color="white"
                onClick={() => setShowGalleryModal(true)}
              >
                مشاهده همه تصاویر
              </Button>
            </div>
          </div>
          {showAboutModal && (
            <AboutDetailModal
              isModalOpen={showAboutModal}
              handleClose={() => setShowAboutModal(false)}
              headerTitle="داستان شکل گیری لیدوماتریپ"
            ></AboutDetailModal>
          )}

          {showGalleryModal && (
            <GalleryModal
              isModalOpen={showGalleryModal}
              handleClose={() => setShowGalleryModal(false)}
              headerTitle="گالری تصاویر"
            ></GalleryModal>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};
export default About;
