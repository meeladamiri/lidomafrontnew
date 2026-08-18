// import { useUserProfile } from "@/providers/Profile";
import { LinkButton } from "components/General/core/Button";

function CallSupport() {
  // const profile = useUserProfile();

  return (
    <div>
      <p className="text-14 leading-24 text-black font-l mb-16">
        برای تماس با پشتیبانی لیدوماتریپ میتوانید از ساعت{" "}
        <span className="font-m">9 صبح تا 12 شب</span> با شماره زیر در تماس باشید
      </p>

      <div className="flex items-center justify-center mb-16">
        <div className="bg-gray-F8F8F8 px-24 py-4 border-1 border-dashed border-gray-D2D2D7 rounded-8 flex items-center gap-x-8 justify-center max-w-[284px]">
          <span className="text-14 leading-24 text-black font-r">شماره تماس :</span>
          {/* <span>021-91070021</span> */}
          <span className="text-18 leading-32 text-black font-m">021-91070021</span>
        </div>
      </div>

      <div className="grid grid-cols-12 mb-16">
        <div className="col-span-6 border-l-1 border-solid border-gray-D2D2D7 flex items-center justify-center gap-x-4">
          <span className="text-14 leading-24 text-black font-m">امور مهمانان :</span>
          <span className="text-14 leading-24 text-black font-l">داخلی 1</span>
        </div>
        <div className="col-span-6 flex items-center gap-x-4 justify-center">
          <span className="text-14 leading-24 text-black font-m">امور میزبانان :</span>
          <span className="text-14 leading-24 text-black font-l">داخلی 2</span>
        </div>
      </div>

      <LinkButton
        href={`tel:02191070021`}
        rightIcon={<i className="icon-Phone text-24 text-white" />}
        isFullWidth
        rounded
      >
        تماس با پشتیبانی
      </LinkButton>
    </div>
  );
}

export default CallSupport;
