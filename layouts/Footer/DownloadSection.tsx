import Image from "next/image";

import mayketWhite from "../../public/assets/footer/downloads/MykeyButtonWhite.svg";
import bazaarWhite from "../../public/assets/footer/downloads/BazaarButtonWhite.svg";
import mayketBlack from "../../public/assets/home/MykeyButtonBlack.svg";
import bazaarBlack from "../../public/assets/home/BazaarButtonBlack.svg";
// import sibappWhite from "../../public/assets/footer/downloads/sibapp-white.png";
// import googlePlayWhite from "../../public/assets/footer/downloads/google-play-white.png";
import Link from "next/link";

// import  from "";
// import {  } from "";

function FooterDownloadSection() {
  // async function handleClick() {
  //   const exception: any = await import("@/utilities/exception").then((module) => module.default);
  //   const EXCEPTIONTYPES = await import("@/constants/enums/exception_types").then(
  //     (module) => module.EXCEPTIONTYPES
  //   );
  //   exception?.message([{ type: EXCEPTIONTYPES.INFO, title: "به زودی" }]);
  // }

  return (
    <div className="mb-24 md:mb-40 bg-white sm:bg-transparent md:bg-transparent border border-gray-C4CAD3 md:border-none sm:border-none rounded-14 py-12">
      <p className="text-14 leading-24 text-black font-m text-center mb-16 md:hidden">
        دانلود اپلیکیشن لیدوماتریپ
      </p>

      <div className="sm:py-20 md:py-20 sm:pl-20 md:pl-20 sm:pr-16 md:pr-16 sm:bg-black md:bg-black rounded-16 flex items-center justify-between">
        <div className="hidden sm:flex md:flex items-center gap-x-16">
          <div className="w-48 h-48 shrink-0 bg-primary-main rounded-8 flex items-center justify-center">
            <Image src={"/assets/logos/Logo-tak-white.svg"} height={32} width={32} alt="لوگو" />
          </div>
          <p className="sm:text-16 sm:leading-20 md:text-20 md:leading-28 text-white font-m">
            دانلود اپلیکیشن لیدوماتریپ
          </p>
        </div>

        <div className="flex items-center gap-y-12 justify-center grow sm:grow-0 md:grow-0 gap-x-20 sm:gap-x-16 md:gap-x-16 flex-wrap sm:flex-nowrap md:flex-nowrap">
          <div className="items-center gap-x-12 hidden md:flex sm:flex">
            <Link
              rel="nofollow"
              target="_blank"
              prefetch={false}
              passHref
              href={"https://myket.ir/app/app.lidomatrip.com"}
            >
              <Image
                src={mayketWhite}
                width={135}
                height={40}
                alt="دانلود از مایکت"
                className="rounded-4 cursor-pointer"
                // placeholder="blur"
              />
            </Link>
          </div>
          <div className="items-center gap-x-12 hidden md:flex sm:flex">
            <Link
              rel="nofollow"
              target="_blank"
              prefetch={false}
              passHref
              href={"https://cafebazaar.ir/app/app.lidomatrip.com"}
            >
              <Image
                src={bazaarWhite}
                width={135}
                height={40}
                alt="دانلود از بازار"
                className="rounded-4 cursor-pointer"
                // placeholder="blur"
              />
            </Link>
          </div>
          <div className="flex items-center gap-x-12 md:hidden sm:hidden">
            <Link
              rel="nofollow"
              target="_blank"
              prefetch={false}
              passHref
              href={"https://myket.ir/app/app.lidomatrip.com"}
            >
              <Image
                src={mayketBlack}
                width={135}
                height={40}
                alt="دانلود از مایکت"
                className="rounded-4 cursor-pointer"
                // placeholder="blur"
              />
            </Link>
          </div>
          <div className="flex items-center gap-x-12 md:hidden sm:hidden">
            <Link
              rel="nofollow"
              target="_blank"
              prefetch={false}
              passHref
              href={"https://cafebazaar.ir/app/app.lidomatrip.com"}
            >
              <Image
                src={bazaarBlack}
                width={135}
                height={40}
                alt="دانلود از بازار"
                className="rounded-4 cursor-pointer"
                // placeholder="blur"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default FooterDownloadSection;
