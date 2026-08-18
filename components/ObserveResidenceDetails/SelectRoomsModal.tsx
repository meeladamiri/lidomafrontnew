import classes from "styles/line-clamps.module.css";
import { IAvailableRoom } from "@/api/Boomgardi";
import ModalWrapper from "components/General/core/ModalWrapper";
import Image from "next/image";
import { Button } from "../General/core/Button";
import Divider from "../General/Divider";
import { TinyLoader } from "../General/Loader/TinyLoader";
import BoomgardiRoomCart from "./BoomgardiRoomCart";
import UnHappyMessage from "components/General/UnHappyMessage";
import { useGetAvailableRooms } from "Hooks/ObserveResidence/useGetAvailableRooms";
import { useBoomgardiPropertyPageData } from "@/providers/BoomgardiPropertyPage";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import { IObserveResidenceData } from "@/interfaces/observe_residence";

function SelectRoomsModal({
  isModalOpen,
  handleClose,
  onRoomSelect,
}: {
  isModalOpen: boolean;
  handleClose: () => void;
  onRoomSelect: (selectedRoom: IAvailableRoom) => void;
}) {
  const { data: observeData } = useGetObserveResidence();
  const { selectedRanges, setShowTripleCalendar } = useBoomgardiPropertyPageData();
  const { isLoading, data } = useGetAvailableRooms();
  const availableRoomsForSelectedDate = data?.params?.rooms as IAvailableRoom[];

  const resp: IObserveResidenceData = observeData?.params;

  return (
    <ModalWrapper
      headerTitle="انتخاب اتاق"
      onClose={() => {
        handleClose();
        setShowTripleCalendar(true);
      }}
      open={isModalOpen}
    >
      <div className="">
        <div className="flex items-start gap-x-12 pb-16 border-b-1 border-solid border-b-gray-CACFD3 mb-16">
          <div className="w-[98px] h-[98px] relative shrink-0">
            {!!resp?.residence_info?.main_image?.[0] && (
              <Image
                src={resp?.residence_info.main_image[0]}
                fill
                style={{ objectFit: "cover" }}
                alt=""
                className="rounded-12"
              />
            )}
          </div>

          <div className="grow">
            <div className="flex items-center justify-between mb-16">
              <p className="text-14 leading-24 text-black font-m">{resp?.residence_info.name}</p>
            </div>

            <div className="flex items-center gap-x-4 mb-16 w-full">
              <i className="icon-Location text-20 text-black" />

              <p className={`text-12 leading-21 text-black font-l ${classes["line-clamp-1"]}`}>
                {resp?.residence_info.province} - {resp?.residence_info.city}
              </p>
            </div>

            <div className="flex items-center gap-x-4">
              <i className="icon-Profile text-20 text-black " />

              <p className="text-12 leading-21 text-black font-l ">
                ظرفیت : تا {resp?.residence_info.max_capacity} نفر
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-x-12">
            <i className="icon-Calendar text-24 text-black" />
            <div className="">
              <p className="text-12 leading-21 font-l text-black">تاریخ سفر</p>
              <p className="text-14 leading-24 font-r text-black mt-4">
                {`
                  ${parseInt(selectedRanges?.[0]?.[0]?.format("jDD"))} 
                  ${selectedRanges?.[0]?.[0]?.format("jMMMM")}
                `}{" "}
                تا{" "}
                {`
                  ${parseInt((selectedRanges?.[0]?.[1] as moment.Moment)?.format("jDD"))} 
                  ${(selectedRanges?.[0]?.[1] as moment.Moment)?.format("jMMMM")}
                `}
              </p>
            </div>
          </div>

          <Button
            color="light-blue"
            variant="text"
            leftIcon={<i className="icon-FlashLeft text-20" />}
            onClick={() => {
              handleClose();

              setShowTripleCalendar(true);
            }}
          >
            ویرایش
          </Button>
        </div>

        <Divider height="16px" className="mb-16" />

        {isLoading ? (
          <TinyLoader />
        ) : availableRoomsForSelectedDate?.length === 0 ? (
          <div className="pt-54">
            <UnHappyMessage
              title="متأسفانه برای این تاریخ اتاقی نداریم !"
              iconSrc="/assets/No-basket.svg"
              actions={
                <div className="w-full flex justify-center">
                  <Button
                    variant="outlined"
                    color="grey"
                    leftIcon={<i className="icon-FlashLeft text-20" />}
                    onClick={() => {
                      handleClose();

                      setShowTripleCalendar(true);
                    }}
                  >
                    تغییر تاریخ جستجو
                  </Button>
                </div>
              }
            />
          </div>
        ) : (
          <div>
            {availableRoomsForSelectedDate.map((item, index: number) => {
              return (
                <>
                  <div key={index} className="mb-16 last:mb-0">
                    <BoomgardiRoomCart
                      roomInfoObj={item}
                      selectRoomBtnColor="warning"
                      onRoomSelect={() => {
                        onRoomSelect(item);
                      }}
                    />
                  </div>
                  {index < availableRoomsForSelectedDate.length - 1 ? (
                    <Divider height="16px" className="mb-16" />
                  ) : null}
                </>
              );
            })}
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}

export default SelectRoomsModal;
