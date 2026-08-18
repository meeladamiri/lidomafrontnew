import { LinkButton } from "components/General/core/Button";
import Image from "next/image";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { miladiToJalali } from "utilities/dateTools";

export type IncompleteResidencesType = {
  title: string;
  updateDate: string;
  completePercentage: number;
  residenceId: number;
  link: string;
  residenceImage: string;
};

function IncompleteResidenceCart({
  title,
  updateDate,
  completePercentage,
  residenceId,
  link,
  residenceImage,
}: IncompleteResidencesType) {
  return (
    <div className="rounded-12 border-gray-C4CAD3 border-1 border-solid flex">
      <div className="w-72 relative shrink-0">
        <div className="absolute z-1 top-0 right-0 left-0 bottom-0 flex items-center">
          <div className="px-12 py-4 relative">
            <CircularProgressbar
              value={completePercentage}
              strokeWidth={50}
              styles={buildStyles({
                strokeLinecap: "butt",
                backgroundColor: "#fff",
                pathColor: "#FFC120",
                trailColor: "#1C2E4599",
              })}
            />
            <div className="w-[calc(66%-14px)] h-[calc(66%-4px)] bg-white text-10 flex items-center justify-center font-m text-black rounded-full absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2">
              {completePercentage}%
            </div>
          </div>
        </div>
        <Image
          src={residenceImage}
          alt=""
          className="rounded-tr-10 rounded-br-10"
          fill
          sizes="100vw"
          style={{
            objectFit: "cover",
          }}
        />
      </div>

      <div className="pl-12 p-10 flex items-center gap-x-4 w-[calc(100%-72px)]">
        <div className="flex flex-col gap-y-16 w-[calc(100%-72px)]">
          <p className="text-14 leading-24 text-black OnlyOneLineAndEndWithElipsis">{title}</p>
          <p className="text-12 leading-21 text-black">بروزرسانی : {miladiToJalali(updateDate)}</p>
        </div>
        <div className="w-72">
          <LinkButton href={link} color="secondary" isFullWidth>
            ادامه
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

export default IncompleteResidenceCart;
