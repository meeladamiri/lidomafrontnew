import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import BedsSlider from "./BedsSlider";
import Divider from "@/components/General/Divider";

function ResCapacity() {
  const { data } = useGetObserveResidence();

  return (
    <>
      <section className="pb-24">
        <header>
          <h2 className="text-16 leading-22 text-black font-m mb-20">
            {`ظرفیت ${data?.params?.residence_info?.residence_type}`}
          </h2>
        </header>

        <div className="mb-20">
          <div className="flex items-center gap-x-4">
            <p className="text-15 leading-20 text-black font-m">ظرفیت :</p>
            <span className="text-14 leading-18 text-black font-r">
              {data?.params?.residence_info.capacity} نفر استاندارد
            </span>
            {!!(
              data?.params?.residence_info.max_capacity - data?.params?.residence_info.capacity
            ) && (
              <span className="text-14 leading-18 text-black font-r">
                +{" "}
                {data?.params?.residence_info.max_capacity - data?.params?.residence_info.capacity}{" "}
                نفر اضافه
              </span>
            )}
          </div>

          {!!data?.params?.residence_info?.price_details?.extra_price && (
            <div className="flex items-center mt-12 gap-x-4">
              <p className="text-12 leading-14 text-gray-2D2D2F font-r">
                نرخ هر نفر اضافه به ازای هر شب:
              </p>
              <span className="text-13 leading-16 text-gray-2D2D2F font-r">
                {data?.params?.residence_info?.price_details?.extra_price?.toLocaleString("en-US")} تومان
              </span>
            </div>
          )}
        </div>

        <h3 className="text-15 leading-22 text-black font-m mb-12">سرویس های خواب</h3>

        <div className="Make_swiper_slide_width_auto_height_auto">
          <BedsSlider rooms={data?.params?.rooms} />
        </div>
      </section>

      <Divider className="mb-24" />
    </>
  );
}

export default ResCapacity;
