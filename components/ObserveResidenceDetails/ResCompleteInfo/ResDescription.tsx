import Divider from "@/components/General/Divider";
import Image from "next/image";
import IsFastComp from "./IsFastOrOffer/IsFastComp";

function ResDescription({
  description,
  isFast,
  residenceType,
}: {
  description: string;
  isFast: boolean;
  residenceType: string;
}) {
  return (
    <>
      <section id="specifications" className="py-24 ">
        <header>
          <h2 className="text-16 leading-24 text-black font-m mb-24">{`توضیحات ${residenceType}`}</h2>
        </header>

        {/* Descriptions are stored as plain text with real newlines (no HTML
            markup at all), which the browser would otherwise collapse into one
            run-on paragraph — `whitespace-pre-line` keeps the host's line
            breaks without ever injecting markup. */}
        <p className="text-14 leading-24 text-black font-l break-words whitespace-pre-line">
          {description}
        </p>

        <div className="mt-20 flex flex-col gap-16">
          {!!isFast && <IsFastComp />}
          <div className="flex items-center gap-x-10">
            <Image
              src="/assets/non-icomoon-icons/Chats.svg"
              width={32}
              height={32}
              alt="چت با میزبان"
            />
            <div>
              <p className="text-14 leading-24 text-black font-r mb-4">چت با میزبان</p>

              <p className="text-12 leading-21 text-black font-l">
                امکان چت آنلاین با میزبان پس از ثبت درخواست رزرو
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-16">
            <div className="flex items-center gap-x-10">
              <Image
                src="/assets/non-icomoon-icons/guarante.svg"
                width={32}
                height={32}
                alt="ضمانت تحویل و نظافت اقامتگاه"
              />
              <div>
                <p className="text-14 leading-24 text-black font-r mb-4">ضمانت لیدوما</p>

                <p className="text-12 leading-21 text-black font-l">
                  ضمانت تحویل و نظافت اقامتگاه توسط لیدوما
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider className="mb-24" />
    </>
  );
}

export default ResDescription;
