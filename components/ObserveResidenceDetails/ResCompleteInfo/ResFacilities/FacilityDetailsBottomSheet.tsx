import { THandleSmoothClose } from "components/General/core/BottomSheet";

export interface Idata {
  name: string;
  value: string;
}
export interface Ipayload {
  title: string;
  description: string;
  data: (Idata | null)[];
}

export interface IShowFacilityDetails {
  show: boolean;
  payload: Ipayload;
}

function FacilityDetailsBottomSheet({
  handleSmoothClose,
  payload,
}: {
  handleSmoothClose: THandleSmoothClose;
  payload: Ipayload;
}) {
  return (
    <div>
      <div>
        {payload?.data?.map((item, i) => {
          if (!item) return;

          return (
            <div key={i} className="flex items-center justify-between mb-16 last:mb-0">
              <p className="text-14 leading-24 text-black font-r">{item.name}</p>
              <p className="text-14 leading-24 text-black font-r">{item.value}</p>
            </div>
          );
        })}
      </div>

      {!!payload.description && (
        <div className="mt-16">
          <p className="text-12 leading-21 text-black font-r mb-8">توضیحات</p>

          <div className="p-12 text-14 leading-24 text-black font-r rounded-6 border-1 border-solid border-[rgba(28,52,84,0.26)]">
            {payload.description}
          </div>
        </div>
      )}
    </div>
  );
}

export default FacilityDetailsBottomSheet;
