import Image from "next/image";
import Link from "next/link";

import miladHimself from "../../public/assets/milad-amiri/milad-amiri-circle.svg";
import linkedin from "../../public/assets/milad-amiri/linkedin.png";
import instagram from "../../public/assets/milad-amiri/insta.png";
import telegram from "../../public/assets/milad-amiri/telegram.png";
import whatsapp from "../../public/assets/milad-amiri/whatsapp.png";

function ContactMiladAmiri({ wrapperClassname }: { wrapperClassname?: string }) {
  return (
    <div
      className={`pt-56 px-16 pb-24 bg-white md:bg-gray-F4F5F6 rounded-20 shadow-[0px_2px_6px_0px_rgba(24,39,58,0.08)] relative ${
        wrapperClassname || ""
      }`}
    >
      <div className="w-[96px] h-[96px] rounded-full bg-white shadow-[0px_2px_6px_0px_rgba(24,39,58,0.08)] absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
        <div className="relative w-full h-full">
          <Image
            src={miladHimself}
            fill
            alt="میلاد امیری"
            // placeholder="blur"
            style={{ objectFit: "cover", borderRadius: "100%" }}
          />
        </div>
      </div>

      <h3 className="text-16 leading-24 font-m text-black mb-12 text-center">ارتباط با من</h3>
      <p className="text-14 leading-24 text-gray-959FA7 mb-24 text-right md:text-center">
        خوشحال می‌شوم در هر زمینه‌ای که مایل به ارتباط با من هستید، از طریق لینک‌های شبکه‌های
        اجتماعی زیر با من در تماس باشید. <br /> همیشه پذیرای گفتگو با شما هستم و مطمئناً ارتباط با
        شما برایم ارزشمند خواهد بود.
      </p>

      <div className="flex items-center justify-center gap-x-24 md:gap-x-32">
        <Link
          href={"https://www.linkedin.com/in/miladamiri70"}
          passHref
          target="_blank"
          prefetch={false}
          className="p-16 rounded-full block bg-[#0030D8]"
        >
          <Image src={linkedin} width={24} height={24} alt="لینکدین" placeholder="blur" />
        </Link>

        <Link
          href={"https://www.instagram.com/meelad_amiri"}
          passHref
          target="_blank"
          prefetch={false}
          className="p-16 rounded-full block bg-[#EB0EA0]"
        >
          <Image src={instagram} width={24} height={24} alt="اینستاگرام" placeholder="blur" />
        </Link>

        <Link
          href={"https://t.me/lidoma_trip"}
          passHref
          target="_blank"
          prefetch={false}
          className="p-16 rounded-full block bg-[#0B8AFF]"
        >
          <Image src={telegram} width={24} height={24} alt="تلگرام" placeholder="blur" />
        </Link>

        <Link
          href={"https://wa.me/+989361323233"}
          passHref
          target="_blank"
          prefetch={false}
          className="p-16 rounded-full block bg-green-main"
        >
          <Image src={whatsapp} width={24} height={24} alt="واتس اپ" placeholder="blur" />
        </Link>
      </div>
    </div>
  );
}

export default ContactMiladAmiri;
