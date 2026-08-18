import Image from "next/image";
import Link from "next/link";

import vezarat1 from "../../public/assets/footer/vezarat-farhang1.webp";
// import khallag1 from "../../public/assets/footer/khallag1.webp";
import eEtemad1 from "../../public/assets/footer/eEtemad1.webp";
import ettehadiie1 from "../../public/assets/footer/ettehadiie1.webp";
import daneshBonyan from "../../public/assets/footer/danesh-bonyan.webp";
import { useMediaQuery } from "@/utilities/useMediaQuery";

function MakeHeading({ text }: { text: string }) {
  return <h3 className="text-14 md:text-16 leading-24 text-black font-m mb-12 md:mb-24">{text}</h3>;
}

function MakeLink({
  linkTo,
  text,
  hasMb = false,
  className,
}: {
  linkTo: string;
  text: string;
  hasMb: boolean;
  className?: string;
}) {
  return (
    <Link
      passHref
      prefetch={false}
      href={linkTo}
      className={`
          text-12 md:text-14 leading-20 text-black font-l block
          ${!!hasMb ? "mb-12 md:mb-16" : ""}
          ${className || ""}
        `}
    >
      {text}
    </Link>
  );
}

function FooterTopSection() {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="grid grid-cols-12 mb-24 md:mb-40 gap-y-24">
      <div className="col-span-full md:col-span-7 order-last md:order-first">
        <div className="w-full grid grid-cols-12 gap-x-24">
          <div className="col-span-6 sm:col-span-4 md:col-span-4">
            <MakeHeading text="خدمات کاربران" />

            <MakeLink text="راهنمای رزرو اقامتگاه" linkTo="/public-faqs" hasMb />
            <MakeLink
              text="مقررات لغو رزرو"
              linkTo="/reserve-cancellation-policy"
              hasMb
              className="sm:hidden md:hidden"
            />
            <MakeLink text="ثبت شکایت" linkTo="/complaint" hasMb className="sm:hidden md:hidden" />
            <MakeLink
              text="راهنمای سایت"
              linkTo="/public-faqs"
              hasMb
              className="hidden sm:block md:block"
            />
            <MakeLink
              text="سوالات متداول مهمان"
              linkTo="/public-faqs?type=guest"
              hasMb
              className="hidden sm:block md:block"
            />
            <MakeLink
              text="سوالات متداول میزبان"
              linkTo="/public-faqs?type=host"
              hasMb
              className="hidden sm:block md:block"
            />
            <MakeLink
              text="سوالات متداول"
              linkTo="/public-faqs"
              hasMb
              className="sm:hidden md:hidden"
            />
            <MakeLink text="ثبت اقامتگاه" linkTo="/residences/submit" hasMb={false} />
          </div>

          <div className="hidden sm:block md:block md:col-span-4 sm:col-span-4">
            <MakeHeading text="قوانین و مقررات" />

            <MakeLink text="شیوه های پرداخت" linkTo={"/public-faqs"} hasMb />
            <MakeLink text="مقررات لغو رزرو" linkTo="/reserve-cancellation-policy" hasMb />
            <MakeLink text="قوانین و مقررات" linkTo="/rules" hasMb />
            <MakeLink text="ثبت شکایت" linkTo="/complaint" hasMb />
          </div>

          <div className="col-span-6 sm:col-span-4 md:col-span-4">
            <MakeHeading text="با لیدوما" />

            <MakeLink text="مجله لیدوما" linkTo="/blog/" hasMb />
            <MakeLink text="درباره ما" linkTo="/about" hasMb />
            <MakeLink text="تماس با ما" linkTo="/contact-us" hasMb />
            <MakeLink
              text="قوانین و مقررات"
              linkTo="/rules"
              hasMb
              className="sm:hidden md:hidden"
            />
            <MakeLink
              text="راهنمای سایت"
              linkTo="/public-faqs"
              hasMb
              className="sm:hidden md:hidden"
            />
          </div>
        </div>
      </div>

      <div className="col-span-full md:col-span-5 order-first md:order-last">
        <Link passHref href={"/"} prefetch={false}>
          <Image
            src={"/assets/logos/Lidoma-logo2.svg"}
            width={110}
            height={24}
            alt="لوگو"
            style={{
              maxWidth: "110%",
              height: "auto",
            }}
          />
        </Link>

        <div className="mt-24 flex items-center gap-x-12 mb-16">
          <Link
            prefetch={false}
            passHref
            href={`tel:02191070021`}
            className="border-1 border-solid border-[rgba(28,52,110,0.26)] w-40 rounded-full h-40 flex items-center justify-center hover:border-primary-main"
          >
            <i className="text-24 icon-Phone" />
          </Link>

          <p dir="ltr" className="text-20 md:text-28 leading-28 md:leading-40 text-black font-m">
            <Link prefetch={false} passHref href={`tel:02191070021`}>
              021 9107 0021
            </Link>
          </p>
          <div className="flex items-center gap-x-8">
            <p className="text-12 sm:text-14 md:text-14 leading-20 text-black font-r">
              پشتیبانی 24 ساعته
            </p>
            <p className="text-14 leading-20 text-gray-616E7C font-r hidden md:block">
              {"( 9 صبح تا 24 )"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-x-8 mb-24">
          <div className="border-1 border-solid border-[rgba(28,52,110,0.26)] w-40 rounded-full h-40 flex items-center justify-center">
            <i className="icon-Location text-24 text-black" />
          </div>

          <h2 className="text-14 leading-20 text-black font-r">
            فارس، شیراز، پارک علم و فناوری فارس
          </h2>
        </div>

        <h3 className="text-17 leading-24 text-black font-r mb-14">آسوده خاطر به ما اعتماد کنید</h3>
        <div className="w-full flex items-center justify-between sm:justify-center sm:gap-x-24 md:justify-between">
          <Link
            rel="nofollow"
            referrerPolicy="origin"
            target="_blank"
            href="https://logo.samandehi.ir/Verify.aspx?id=163660&p=rfthgvkaxlaogvkagvkaobpd"
            className=""
          >
            <Image
              width={isDesktop ? 110 : 84}
              height={isDesktop ? 110 : 84}
              src={vezarat1}
              alt="وزارت فرهنگ و ارشاد اسلامی"
              placeholder="blur"
            />
            {/* <img
              style={{ cursor: "pointer", width: "110%", height: "110%" }}
              alt="logo-samandehi"
              onClick={() =>
                window.open(
                  "https://logo.samandehi.ir/Verify.aspx?id=163660&p=rfthgvkaxlaogvkagvkaobpd",
                  "Popup",
                  "toolbar=no, scrollbars=no, location=no, statusbar=no, menubar=no, resizable=0, width=450, height=630, top=30"
                )
              }
              src="https://logo.samandehi.ir/logo.aspx?id=163660&p=nbpdwlbqqftiwlbqwlbqlyma"
            /> */}
          </Link>
          {/* 
          <Link
            rel="nofollow"
            href={"https://www.google.com"}
            className="p-12 rounded-12 shadow-[0px_8px_12px_rgba(24,39,58,0.07)]"
          >
              <Image
                src={khallag1}
                fill
                alt="برنامه توسعه زیست بوم شرکت های خلاق"
                placeholder="blur"
              />
          </Link> */}

          <Link
            rel="nofollow"
            referrerPolicy="origin"
            target="_blank"
            href="https://trustseal.enamad.ir/?id=118398&amp;Code=JOzd8sROE7Cwx3NVY1im"
            className=""
          >
            {/* <img
                referrerPolicy="origin"
                src="https://Trustseal.eNamad.ir/logo.aspx?id=118398&amp;Code=JOzd8sROE7Cwx3NVY1im"
                alt=""
                style={{ cursor: "pointer", objectFit: "cover", width: "110%", height: "110%" }}
                id="JOzd8sROE7Cwx3NVY1im"
              /> */}
            <Image
              width={isDesktop ? 110 : 84}
              height={isDesktop ? 110 : 84}
              src={eEtemad1}
              alt="نماد اعتماد الکترونیکی"
              placeholder="blur"
            />
          </Link>

          <Link
            rel="nofollow"
            referrerPolicy="origin"
            target="_blank"
            href="https://ecunion.ir/verify/lidomatrip.com?token=59566685e02fab36cb7e"
            className=""
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* <img
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjM2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KCTxwYXRoIGQ9Im0xMjAgMjQzbDk0LTU0IDAtMTA5IC05NCA1NCAwIDEwOSAwIDB6IiBmaWxsPSIjODA4Mjg1Ii8+Cgk8cGF0aCBkPSJtMTIwIDI1NGwtMTAzLTYwIDAtMTE5IDEwMy02MCAxMDMgNjAgMCAxMTkgLTEwMyA2MHoiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDo1O3N0cm9rZTojMDBhZWVmIi8+Cgk8cGF0aCBkPSJtMjE0IDgwbC05NC01NCAtOTQgNTQgOTQgNTQgOTQtNTR6IiBmaWxsPSIjMDBhZWVmIi8+Cgk8cGF0aCBkPSJtMjYgODBsMCAxMDkgOTQgNTQgMC0xMDkgLTk0LTU0IDAgMHoiIGZpbGw9IiM1ODU5NWIiLz4KCTxwYXRoIGQ9Im0xMjAgMTU3bDQ3LTI3IDAtMjMgLTQ3LTI3IC00NyAyNyAwIDU0IDQ3IDI3IDQ3LTI3IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MTU7c3Ryb2tlOiNmZmYiLz4KCTx0ZXh0IHg9IjE1IiB5PSIzMDAiIGZvbnQtc2l6ZT0iMjVweCIgZm9udC1mYW1pbHk9IidCIFlla2FuJyIgc3R5bGU9ImZpbGw6IzI5Mjk1Mjtmb250LXdlaWdodDpib2xkIj7Yudi22Ygg2KfYqtit2KfYr9uM2Ycg2qnYtNmI2LHbjDwvdGV4dD4KCTx0ZXh0IHg9IjgiIHk9IjM0MyIgZm9udC1zaXplPSIyNXB4IiBmb250LWZhbWlseT0iJ0IgWWVrYW4nIiBzdHlsZT0iZmlsbDojMjkyOTUyO2ZvbnQtd2VpZ2h0OmJvbGQiPtqp2LPYqCDZiCDaqdin2LHZh9in24wg2YXYrNin2LLbjDwvdGV4dD4KPC9zdmc+ "
              alt=""
              onClick={() =>
                window.open(
                  "https://ecunion.ir/verify/lidomatrip.com?token=59566685e02fab36cb7e",
                  "Popup",
                  "toolbar=no, location=no, statusbar=no, menubar=no, scrollbars=1, resizable=0, width=580, height=600, top=30"
                )
              }
              style={{ cursor: "pointer", width: "110%", height: "110%" }}
            /> */}
            <Image
              width={isDesktop ? 110 : 84}
              height={isDesktop ? 110 : 84}
              src={ettehadiie1}
              alt="اتحادیه کشوری کسب و کارهای مجازی"
              placeholder="blur"
            />
          </Link>
          <Link
            rel="nofollow"
            referrerPolicy="origin"
            target="_blank"
            href="https://pub.daneshbonyan.ir/"
            className=""
          >
            <Image
              width={isDesktop ? 110 : 84}
              height={isDesktop ? 110 : 84}
              src={daneshBonyan}
              alt="مجوز دانش بنیان"
              placeholder="blur"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FooterTopSection;
