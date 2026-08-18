import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { applySessionStorageValues_residences_list } from "@/constants/session_stores/residences_list";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button, LinkButton } from "components/General/core/Button";
import Image from "next/image";

function FastReservePreviewBottomSheet({
  handleSmoothClose,
  residenceId,
  residenceType,
}: {
  handleSmoothClose: THandleSmoothClose;
  residenceId: number;
  residenceType: ResidenceTypes_enum;
}) {
  return (
    <div>
      <div className="flex items-center gap-x-4 mb-24">
        <p className="text-14 leading-24 text-black font-m">تعریف رزرو آنی</p>
        <i className="icon-Flash text-20 text-warning" />
      </div>

      <p className="text-12 leading-24 text-black font-l text-justify pb-12 border-b-1 border-b-[rgba(28,52,84,0.26)] border-solid mb-12">
        فعالسازی تاریخ های رزرو آنی به منزله خالی بودن اقامتگاه، به روز بودن قیمت اقامتگاه و{" "}
        <span className="font-m">تأیید رزرو از سوی میزبان</span> در تاریخ های فعال شده می باشد و
        مسافر پس از ثبت درخواست رزرو منتظر تایید میزبان نمی ماند و رزرو به صورت «آنی» تایید و پس از
        پرداخت قطعی می شود
      </p>

      <p className="text-14 leading-24 text-black font-m mb-24">مزیت های رزرو آنی چیست؟</p>

      <div>
        <div className="flex items-center gap-x-8 mb-12">
          <i className="text-18 icon-Timer text-primary-main" />
          <p className="text-12 leading-32 text-black font-l">
            رزرو شدن اقامتگاه در کمتر از 5 دقیقه
          </p>
        </div>

        <div className="flex items-center gap-x-4 mb-12">
          {/* <i className="text-18 icon-Timer text-primary-main" /> */}
          <div className="p-4 flex items-center justify-center">
            <Image
              src="/assets/non-icomoon-icons/amar-primary-colour.svg"
              height={14}
              width={14}
              alt=""
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </div>
          <p className="text-12 leading-32 text-black font-l">
            افزایش بیش از 60 درصد میزان رزرو شما
          </p>
        </div>

        <div className="flex items-center gap-x-8">
          <i className="text-18 icon-Search text-primary-main" />
          <p className="text-12 leading-32 text-black font-l">
            نمایش در اولین ردیف های لیست اقامتگاه های هر شهر
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-12 mt-24">
        <div className="col-span-1">
          <Button isFullWidth color="grey" onClick={handleSmoothClose}>
            انصراف
          </Button>
        </div>
        <div className="col-span-2">
          <LinkButton
            href={`/residences/fast-reserve/edit?residenceId=${residenceId}&residenceType=${residenceType}`}
            isFullWidth
            onClick={() => {
              applySessionStorageValues_residences_list({ residenceId, residenceType });
            }}
          >
            ادامه
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

export default FastReservePreviewBottomSheet;
