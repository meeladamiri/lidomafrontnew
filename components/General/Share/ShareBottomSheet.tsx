import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { EXCEPTIONTYPES } from "constants/enums/exception_types";
import Image from "next/image";
import { copyToClipboard } from "utilities/copyToClipboard";
import exception from "utilities/exception";

export interface IShare {
  show: boolean;
  payload?: {
    // TODO: payload is mandatory
    textToBeSmsed: string;
    link: string;
    whatsAppText: string;
    telegramText: string;
    twitter: {
      url_to_go: string;
      text_of_tweet: string;
      via: string;
    };
  };
}

function ShareBottomSheet({
  handleSmoothClose,
  whatIsBeingShared = "اقامتگاه",
  payload,
}: {
  handleSmoothClose: THandleSmoothClose;
  whatIsBeingShared: string;
  payload: IShare["payload"];
}) {
  return (
    <div>
      <p className="text-14 leading-24 text-black font-r mb-24">
        با استفاده از روش های زیر می توانید این {whatIsBeingShared} را با دوستان خود به اشتراک
        بگذارید
      </p>

      <div className="grid grid-cols-2 gap-12">
        <a
          href={`sms://?body=${payload?.textToBeSmsed || ""}`}
          className="col-span-1 px-16 py-12 rounded-6 flex items-center gap-x-6 bg-warning"
        >
          <div className="flex items-center">
            <Image
              src="/assets/non-icomoon-icons/sms.svg"
              width={20}
              height={17}
              alt=""
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </div>
          <p className="text-14 leading-24 text-white font-m">پیامک</p>
        </a>

        <div
          className="col-span-1 px-16 py-12 rounded-6 flex items-center gap-x-6 typical-gray-bg cursor-pointer"
          onClick={() => {
            copyToClipboard(payload?.link || "");
            exception.message([{ type: EXCEPTIONTYPES.SUCCESS, title: "لینک با موفقیت کپی شد." }]);
          }}
        >
          <div className="flex items-center">
            <Image
              src="/assets/non-icomoon-icons/copy.svg"
              width={24}
              height={24}
              alt=""
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </div>
          <p className="text-14 leading-24 text-black font-m">کپی کردن لینک</p>
        </div>

        <a
          href={`whatsapp://send?text=${payload?.whatsAppText}`}
          className="col-span-1 px-16 py-12 rounded-6 flex items-center gap-x-6 bg-success"
        >
          <div className="flex items-center">
            <Image
              src="/assets/non-icomoon-icons/whatsapp.svg"
              width={18}
              height={18}
              alt=""
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </div>
          <p className="text-14 leading-24 text-white font-m">واتس اپ</p>
        </a>

        <a
          className="col-span-1 px-16 py-12 rounded-6 flex items-center gap-x-6"
          style={{ background: "linear-gradient(93.99deg, #FF008A 3.04%, #FFB520 100%)" }}
          href=""
        >
          <div className="flex items-center">
            <Image
              src="/assets/non-icomoon-icons/instagram.svg"
              width={16}
              height={16}
              alt=""
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </div>
          <p className="text-14 leading-24 text-white font-m">اینستاگرام</p>
        </a>

        <a
          href={`https://telegram.me/share/url?url=${payload?.telegramText || ""}`}
          className="col-span-1 px-16 py-12 rounded-6 flex items-center gap-x-6 bg-info"
        >
          <div className="flex items-center">
            <Image
              src="/assets/non-icomoon-icons/telegram.svg"
              width={18}
              height={16}
              alt=""
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </div>
          <p className="text-14 leading-24 text-white font-m">تلگرام</p>
        </a>

        <a
          href={`https://twitter.com/intent/tweet?url=${payload?.twitter.url_to_go}&text=${payload?.twitter.text_of_tweet}&via=""`}
          className="col-span-1 px-16 py-12 rounded-6 flex items-center gap-x-6 bg-twitter"
          target={"_blank"}
          rel="noreferrer"
        >
          <div className="flex items-center">
            <Image
              src="/assets/non-icomoon-icons/twitter.svg"
              width={20}
              height={16}
              alt=""
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </div>
          <p className="text-14 leading-24 text-white font-m">توئیتر</p>
        </a>
      </div>
    </div>
  );
}

export default ShareBottomSheet;
