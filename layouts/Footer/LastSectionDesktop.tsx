// import { rentData } from "@/constants/rent_data_in_footer";
// import { CreateLink } from "./CreateLink";
// import { rentVilla } from "@/constants/rent_villa_in_footer";
import Link from "next/link";
// import { rentSuit } from "@/constants/rent_suit_in_footer";
// import { rentBoomgardi } from "@/constants/rent_boomgardi_in_footer";
// import { rentVillaAroundTehran } from "@/constants/rent_villa_around_tehran_in_footer";
// import { useState } from "react";

function LastSectionDesktop() {
  // const [showMoreLink, setShowMoreLink] = useState<boolean>(false);
  return (
    <>
      {/* <div className="flex flex-wrap justify-between md:border-y md:border-gray-E6E6EA pt-24 pb-20">
        <div className="w-[50%] md:w-[20%] mb-12 md:mb-0">
          <h3 className="text-15 leading-20 text-black font-m mb-10">اجاره ویلا</h3>
          {rentVilla.map((item, i) => {
            return (
              <div className="md:mb-4 mb-2">
                <Link
                  key={i}
                  passHref
                  prefetch={false}
                  href={item.linkTo}
                  className="w-full cursor-pointer text-12 leading-20 text-black font-r"
                >
                  {item.text}
                </Link>
              </div>
            );
          })}
        </div>
        <div className="w-[50%] md:w-[20%] mb-12 md:mb-0">
          <h3 className="text-15 leading-20 text-black font-m mb-10">اطراف تهران</h3>
          {rentVillaAroundTehran.map((item, i) => {
            return (
              <div className="md:mb-4 mb-2">
                <Link
                  key={i}
                  passHref
                  prefetch={false}
                  href={item.linkTo}
                  className="w-full cursor-pointer text-12 leading-20 text-black font-r"
                >
                  {item.text}
                </Link>
              </div>
            );
          })}
        </div>
        <div className="w-[50%] md:w-[20%]">
          <h3 className="text-15 leading-20 text-black font-m mb-10">اجاره سوئیت</h3>
          {rentSuit.map((item, i) => {
            return (
              <div className="md:mb-4 mb-2">
                <Link
                  key={i}
                  passHref
                  prefetch={false}
                  href={item.linkTo}
                  className="w-full cursor-pointer text-12 leading-20 text-black font-r"
                >
                  {item.text}
                </Link>
              </div>
            );
          })}
        </div>
        <div className="w-[50%] md:w-[40%]">
          <h3 className="text-15 leading-20 text-black font-m mb-10">برای همه سلیقه ها</h3>
          <div className={`flex flex-wrap justify-between w-full`}>
            {rentData.map((item, i) => {
              return (
                <div className="mb-12 w-[48%]">
                  <CreateLink text={item.text} linkTo={item.linkTo} />
                </div>
              );
            })}
          </div>
        </div>
      </div> */}
      {/* <div className="md:hidden flex justify-center items-center text-13 text-info font-r leading-16 cursor-pointer pb-20 border-b border-gray-E6E6EA">
        <span onClick={() => setShowMoreLink(!showMoreLink)}>
          {showMoreLink ? "نمایش کمتر" : "نمایش لینک های بیشتر"}
        </span>
        <i className="icon-FlashDown mt-2"></i>
      </div> */}
      <div className="flex md:flex-row flex-col-reverse gap-y-12 md:gap-y-0 items-center justify-between">
        <p className="text-gray-9B9BAA text-12 leading-18 font-r text-center md:border-t-none border-t border-t-gray-E9E9EC md:pt-0 pt-8">
          کلیه حقوق این سایت متعلق به شرکت دانش بنیان لیدوما سیر ایرانیان می باشد
        </p>
        <div className="flex items-end gap-x-24">
          <Link
            rel="nofollow"
            target="_blank"
            prefetch={false}
            passHref
            href={"https://www.aparat.com/lidmatrip.com"}
          >
            <i className="icon-Aparat text-26"></i>
          </Link>

          {/* <Link
            rel="nofollow"
            target="_blank"
            prefetch={false}
            passHref
            href={"https://twitter.com/lidoma_trip"}
          >
            <i className="icon-Facebook text-26"></i>
          </Link> */}

          <Link
            rel="nofollow"
            target="_blank"
            prefetch={false}
            passHref
            href={"https://twitter.com/lidoma_trip"}
          >
            <i className="icon-X text-26"></i>
          </Link>

          <Link
            rel="nofollow"
            target="_blank"
            prefetch={false}
            passHref
            href={"https://www.linkedin.com/company/lidomatrip"}
          >
            <i className="icon-Linkedin text-26"></i>
          </Link>

          <Link
            rel="nofollow"
            target="_blank"
            prefetch={false}
            passHref
            href={"https://www.instagram.com/lidoma_trip/"}
          >
            <i className="icon-Instagram text-26"></i>
          </Link>
        </div>
      </div>
    </>
  );
}

export default LastSectionDesktop;
