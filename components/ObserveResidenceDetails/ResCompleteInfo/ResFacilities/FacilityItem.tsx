import Image from "next/image";
import { Idata, IShowFacilityDetails } from "./FacilityDetailsBottomSheet";

interface IFacilityItem {
  name: string;
  icon: JSX.Element | string;
  hasDetails?: boolean;
  data: Idata[];
  setShowFacilityDetailsBottomSheet: (parameters: IShowFacilityDetails) => void;
  className?: string;
}

function FacilityItem({
  name,
  icon,
  hasDetails,
  data = [],
  setShowFacilityDetailsBottomSheet,
  className,
}: IFacilityItem) {
  function handleClick() {
    setShowFacilityDetailsBottomSheet({
      show: true,
      payload: {
        title: `مشخصات ${name}`,
        data: data.map((item, i) => {
          if (item.name === "توضیحات") return null;

          return {
            name: item.name,
            value: item.value,
          };
        }),
        description: data.find((el) => el.name === "توضیحات")?.value || "",
      },
    });
  }

  return (
    <li className={`flex items-center gap-x-12 ${className || ""}`}>
      {typeof icon === "string" ? <Image src={icon} width={24} height={24} alt="" /> : icon}

      <p className="text-14 leading-18 text-black font-r">{name}</p>

      {!!hasDetails && (
        <i
          onClick={handleClick}
          className="icon-WarningFill text-blue-main text-20 cursor-pointer"
        />
      )}
    </li>
  );
}

export default FacilityItem;
