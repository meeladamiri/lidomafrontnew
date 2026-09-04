import { LinkButton } from "components/General/core/Button";

/**
 * «تماس با پشتیبانی» tab — the phone line, restyled. Content unchanged from
 * the previous support page: hours, the number, and the two internal
 * extensions.
 */
function CallSupport() {
  return (
    <div className="mx-auto flex max-w-[420px] flex-col items-center py-8 text-center">
      <span className="flex h-64 w-64 items-center justify-center rounded-full bg-primary-light">
        <i aria-hidden="true" className="icon-Phone text-28 text-primary-dark" />
      </span>

      <p className="mt-20 text-14 leading-26 font-r text-gray-6C6A7D">
        برای تماس با پشتیبانی لیدوماتریپ می‌توانید از ساعت{" "}
        <span className="font-m text-black">۹ صبح تا ۱۲ شب</span> با شماره زیر در تماس باشید
      </p>

      <div className="mt-20 w-full rounded-18 border-1 border-dashed border-gray-D2D2D7 bg-gray-F8F8F8 px-20 py-14">
        <span className="block text-11 leading-18 font-r text-gray-77828F">شماره تماس</span>
        <span dir="ltr" className="mt-2 block text-22 leading-32 font-b text-black">
          021-91070021
        </span>
      </div>

      <div className="mt-14 grid w-full grid-cols-2 overflow-hidden rounded-16 border-1 border-solid border-gray-F0F0F0">
        <div className="flex flex-col items-center gap-y-2 border-l-1 border-solid border-gray-F0F0F0 px-12 py-14">
          <span className="text-13 leading-20 font-m text-black">امور مهمانان</span>
          <span className="text-12 leading-18 font-r text-gray-77828F">داخلی ۱</span>
        </div>
        <div className="flex flex-col items-center gap-y-2 px-12 py-14">
          <span className="text-13 leading-20 font-m text-black">امور میزبانان</span>
          <span className="text-12 leading-18 font-r text-gray-77828F">داخلی ۲</span>
        </div>
      </div>

      <div className="mt-20 w-full">
        <LinkButton
          href="tel:02191070021"
          rightIcon={<i className="icon-Phone text-24 text-white" />}
          isFullWidth
          rounded
        >
          تماس با پشتیبانی
        </LinkButton>
      </div>
    </div>
  );
}

export default CallSupport;
