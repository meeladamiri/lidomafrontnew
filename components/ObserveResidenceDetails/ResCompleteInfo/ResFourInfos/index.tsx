import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import { InfoItem } from "./InfoItem";

function ResFourInfos() {
  const { data } = useGetObserveResidence();

  return (
    <>
      <section className="mt-24">
        <header>
          <h2>{`مشخصات کلی ${data?.params?.residence_info?.residence_type}`}</h2>
        </header>
        <div className="grid grid-cols-4 md:flex items-center md:gap-x-24 md:gap-y-0 gap-y-8 my-20">
          <InfoItem
            name={`تا ${data?.params?.residence_info?.max_capacity} نفر ظرفیت`}
            icon={`icon-Profile`}
          />
          <InfoItem name={`${data?.params?.rooms?.length} اتاق خواب`} icon={`icon-Rooms`} />
          <InfoItem
            name={`${
              data?.params?.residence_info?.floor
                ? `طبقه ${data?.params?.residence_info?.floor}`
                : "طبقه همکف"
            }`}
            icon={`icon-Floor`}
          />
          <InfoItem
            name={`${data?.params?.residence_info?.foundation_area} متر زیربنا`}
            icon={`icon-LocationHome`}
          />
        </div>
      </section>
    </>
  );
}

export default ResFourInfos;
