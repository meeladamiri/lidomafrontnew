/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import Image from "next/image";
import lidomaApp from "../../public/assets/lidoma-features/lidoma-app.png";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import Link from "next/link";
import mayketBlack from "../../public/assets/home/MykeyButtonBlack.svg";
import bazaarBlack from "../../public/assets/home/BazaarButtonBlack.svg";

const LidomaApp = () => {
  const isMobile: boolean = useMediaQuery("(max-width: 480px)");
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  return (
    <>
      <div
        className={`pt-[140px] md:pt-[99px]
        h-screen
         CustomContainer 
        flex items-center md:flex-row flex-col`}
      >
        <div
          className={`bg-[url("/assets/home/DownloadAppBg.jpg")] bg-cover bg-no-repeat bg-right md:bg-center relative
          w-full ${isMobile ? "h-[290px]" : "h-[75%]"} flex items-center justify-between 
          md:rounded-t-[40px] md:rounded-br-[40px] md:rounded-bl-[150px] rounded-t-24 rounded-br-24 rounded-bl-[60px] }`}
        >
          <div
            className={`hidden flex-[1_1_50%] md:flex flex-col items-center justify-center ${
              isMobile ? "pb-22" : "pb-0"
            }`}
          >
            <p
              className={`text-black ${
                isMobile ? "text-21" : "text-[32px]"
              } font-[IranYekanMedium]`}
            >
              نصب اپلیکیشن لیدوماتریپ
            </p>
            <p
              className={`text-black ${
                isMobile ? "text-15 my-10" : "text-[21px] my-18"
              } font-[YekanBakhRegular]`}
            >
              دریافت از مارکت های رسمی دانلود اپلیکیشن
            </p>
            <div className="flex items-center gap-x-18">
              <Link
                rel="nofollow"
                target="_blank"
                prefetch={false}
                passHref
                href={"https://myket.ir/app/app.lidomatrip.com"}
              >
                <Image
                  src={mayketBlack}
                  width={isDesktop ? 148 : 128}
                  height={isDesktop ? 50 : 44}
                  alt="دانلود از مایکت"
                  className="rounded-4 cursor-pointer"
                />
              </Link>
              <Link
                rel="nofollow"
                target="_blank"
                prefetch={false}
                passHref
                href={"https://cafebazaar.ir/app/app.lidomatrip.com"}
              >
                <Image
                  src={bazaarBlack}
                  width={isDesktop ? 148 : 128}
                  height={isDesktop ? 50 : 44}
                  alt="دانلود از بازار"
                  className="rounded-4 cursor-pointer"
                />
              </Link>
            </div>
          </div>

          <div
            className="md:flex-[1_1_50%] md:block flex justify-center 
            w-full box-border"
          >
            <div className="absolute bottom-0">
              <Image
                height={isDesktop ? 300 : 400}
                width={isDesktop ? 500 : 365}
                src={lidomaApp}
                style={{ objectFit: "contain" }}
                alt={"downloadApp"}
              />
            </div>
          </div>
        </div>
        <div
          className={`md:hidden flex flex-col items-center justify-center mt-[31px] ${
            isMobile ? "pb-22" : "pb-0"
          }`}
        >
          <p
            className={`text-black ${isMobile ? "text-21" : "text-[32px]"} font-[IranYekanMedium]`}
          >
            نصب اپلیکیشن لیدوماتریپ
          </p>
          <p
            className={`text-black ${
              isMobile ? "text-15 my-10" : "text-[21px] my-18"
            } font-[YekanBakhRegular]`}
          >
            دریافت از مارکت های رسمی دانلود اپلیکیشن
          </p>
          <div className="flex items-center gap-x-18">
            <Link
              rel="nofollow"
              target="_blank"
              prefetch={false}
              passHref
              href={"https://myket.ir/app/app.lidomatrip.com"}
            >
              <Image
                src={mayketBlack}
                width={isDesktop ? 148 : 128}
                height={isDesktop ? 50 : 44}
                alt="دانلود از مایکت"
                className="rounded-4 cursor-pointer"
              />
            </Link>
            <Link
              rel="nofollow"
              target="_blank"
              prefetch={false}
              passHref
              href={"https://cafebazaar.ir/app/app.lidomatrip.com"}
            >
              <Image
                src={bazaarBlack}
                width={isDesktop ? 148 : 128}
                height={isDesktop ? 50 : 44}
                alt="دانلود از بازار"
                className="rounded-4 cursor-pointer"
              />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
export default LidomaApp;
