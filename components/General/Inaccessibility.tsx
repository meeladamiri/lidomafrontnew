import { LinkButton } from "components/General/core/Button";
import Image from "next/image";

function Inaccessibility() {
  return (
    <div className="h-screen w-screen flex justify-between items-center">
      <div className="w-full h-full flex justify-center items-center gap-x-56">
        <Image src="/assets/Union.svg" alt="" width={153} height={318} />
        <div className="flex flex-col gap-y-24">
          <p className="text-40 text-black leading-[56px] font-r">با عرض پوزش ...!</p>
          <p className="text-[23px] font-r leading-32 text-error-light">
            شما اجازه دسترسی به این صفحه را ندارید !
          </p>
          <LinkButton href="/">بازگشت به صفحه اصلی</LinkButton>
        </div>
      </div>
    </div>
  );
}

export default Inaccessibility;
