import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import Image from "next/image";

function TypicalDropDownCart({
  value,
  title,
  subText,
  imgSrc,
  iconSrc,
  type,
  wrapperClassname,
  imageWrapperClassname,
  textWrapperClassname
}: {
  value: number | string;
  title: string;
  subText: string;
  imgSrc?: string;
  iconSrc?: string;
  type: ResidenceTypes_enum | "all"; // TODO: Can this be "all"?
  wrapperClassname?: string;
  imageWrapperClassname?: string;
  textWrapperClassname?: string
}) {
  return (
    <div className={`flex items-center gap-x-12 ${wrapperClassname || ""}`}>
      <div
        className={`bg-gray-F5F9FF w-56 h-56 flex items-center justify-center relative ${
          imageWrapperClassname || ""
        }`}
      >
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            className="rounded-4"
            fill
            sizes="100vw"
            style={{
              objectFit: "cover",
            }}
          />
        ) : (
          <i className={`${iconSrc} text-28 text-black`} />
        )}
      </div>
      <div className={textWrapperClassname || ""}>
        <p className="text-14 leading-24 text-black font-r mb-8">{title}</p>
        <p className="text-14 leading-24 text-black font-r">{subText}</p>
      </div>
    </div>
  );
}

export default TypicalDropDownCart;
