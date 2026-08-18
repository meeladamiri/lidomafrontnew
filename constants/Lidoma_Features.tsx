import Image from "next/image";

export const Lidoma_Features: {
  icon: JSX.Element;
  title: string;
  description: string;
}[] = [
  {
    icon: (
      <Image
        src={"/assets/non-icomoon-icons/Support.svg"}
        width={44}
        height={44}
        alt={"پوشش کل کشور"}
      />
    ),
    title: "رزرواسیون ۲۴ ساعته",
    description: "تمام خدمات به صورت آنلاین و در 24 ساعت شبانه روز در خدمت شماست",
  },
  {
    icon: (
      <Image
        src={"/assets/non-icomoon-icons/Location.svg"}
        width={44}
        height={44}
        alt={"پوشش کل کشور"}
      />
    ),
    title: "پوشش کل کشور",
    description: "اطلاعات شامل تصاویر کل اقامتگاه ، امکانات قیمت ، آدرس و ...",
  },
  {
    icon: (
      <Image
        src={"/assets/non-icomoon-icons/Confirmed.svg"}
        width={44}
        height={44}
        alt={"سامانه رسمی رزرو اقامتگاه"}
      />
    ),
    title: "سامانه رسمی رزرو اقامتگاه",
    description: "دارای نماد اعتماد الکترونیک و عضو اتحادیه کشوری کسب و کارهای مجازی",
  },
];
