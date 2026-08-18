import Image from "next/image";

const JobContactInfo = () => {
  return (
    <div>
      <div
        className="p-12 text-white text-12 rounded-lg mb-12"
        style={{
          background: `linear-gradient(
            60.75deg,
            #ad0171 -6.29%,
            #c80067 15.61%,
            #a30069 44.22%,
            #7e006c 73.62%,
            #96006d 99.59%
          )`,
        }}
      >
        <h4 className="text-14 font-m">مزایای شغلی</h4>
        <div className="flex items-center gap-8 mt-16">
          <Image
            className="mr-8"
            src="/assets/non-icomoon-icons/insurance.svg"
            alt=""
            width={32}
            height={32}
          />
          <span>بیمه تأمین اجتماعی</span>
        </div>
        <div className="border-r border-dashed h-24 mr-24"></div>
        <div className="flex items-center gap-8 ">
          <Image
            className="mr-8"
            src="/assets/non-icomoon-icons/luggage.svg"
            alt=""
            width={32}
            height={32}
          />
          <span>اعتبار سفر</span>
        </div>
      </div>
      <div
        className="p-12  text-white text-12 rounded-lg"
        style={{
          background: `linear-gradient(
    61.26deg,
    #0127ad -7.45%,
    #0020c8 14.15%,
    #002ea3 41.88%,
    #00147e 74.98%,
    #000696 96.96%
  )`,}}
      >
        <div className="flex items-center gap-4">
          <Image
            src="/assets/non-icomoon-icons/location.svg"
            alt="contact"
            width={24}
            height={24}
          />
          <span className="text-14">آدرس دفتر</span>
        </div>
        <div className="flex items-start gap-4 mt-20">
          <Image src="/assets/non-icomoon-icons/map.svg" alt="contact" width={24} height={24} />
          <p className="text-12 leading-20">
            شیراز، بلوار چمران، بعد از بانک ملت مرکزی، بعد از ابیوردی3، ساختمان 77، واحد 5
          </p>
        </div>
      </div>
      <p className="text-12 leading-20 my-12">
        از متقاضیان واجد شرایط خواهشمندیم رزومه خود را به یکی از روش های زیر ارسال نمایند.
      </p>
      <div className="flex flex-col content-center mt-16 mb-32">
        <div className="flex flex-row items-center gap-6  mb-14">
          <Image src="/assets/contact/circle-whatsup.svg" alt="contact" width={48} height={48} />
          <span className="flex flex-col text-14 font-m bg-[#F4F5F6] rounded-100 py-10 px-16 flex-grow">
            واتساپ: 09361323233
          </span>
        </div>
        <div className="flex flex-row items-center gap-6">
          <Image src="/assets/contact/circle-email.svg" alt="contact" width={48} height={48} />
          <span className="flex flex-col text-14 font-m bg-[#F4F5F6] rounded-100 py-10 px-16 flex-grow">
            ایمیل: info@lidomatrip.info
          </span>
        </div>
      </div>
    </div>
  );
};
export default JobContactInfo;
