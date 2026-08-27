import { useMutation } from "@tanstack/react-query";
import Counter from "components/General/Counter";
import Divider from "components/General/Divider";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { IOtherRoomData, ISharedSpaceData } from "interfaces/Residences/Submit/Steps/Step_5";
import {
  IResidenceCapacities_Server,
  ResidenceCapacity_IRoom_For_Submit,
} from "interfaces/Residences/Submit";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { numericToStringicMap } from "utilities/Number_tools";
import RoomBox from "./RoomBox";
import { emptyRoomValues } from "constants/Residences/Submit/Steps/Step_5";
import StepTitle from "../../StepTitle";
import { submitStep } from "@/api/SubmitResidence";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import BottomActionsWrapper from "../../BottomActions/BottomActionsWrapper";
import { Button } from "@/components/General/core/Button";
import { useResidenceDraft } from "../../useWizard";

function Step5() {
  const router = useRouter();
  const [baseCapacityCount, setBaseCapacityCount] = useState<number>(1);
  const [maxCapacityCount, setMaxCapacityCount] = useState<number>(1);
  const [sharedSpaceData, setSharedSpaceData] = useState<ISharedSpaceData>({
    collapse: false,
    payload: {
      singleBedsCount: 0,
      doubleBedsCount: 0,
      traditionalBedsCount: 0,
      extra: "",
    },
  });
  const [additionalRoomsData, setAdditionalRoomsData] = useState<IOtherRoomData[]>([]);

  const {
    isLoading: getResidenceSubmittedDataIsLaoding,
    data: residenceSubmittedData,
    refetch,
  } = useResidenceDraft();

  useEffect(() => {
    if (!!residenceSubmittedData) {
      if (residenceSubmittedData?.status === "success") {
        const residenceCapacityInfo: IResidenceCapacities_Server =
          residenceSubmittedData?.params?.residence_info;

        setBaseCapacityCount(residenceCapacityInfo.capacity);
        setMaxCapacityCount(residenceCapacityInfo.max_capacity);

        const sharedSpaceRoomDataComingFromApi = residenceCapacityInfo.rooms.find(
          (el) => el.name === "فضای مشترک"
        );

        if (!!sharedSpaceRoomDataComingFromApi) {
          setSharedSpaceData((prev) => ({
            ...prev,
            payload: {
              singleBedsCount: sharedSpaceRoomDataComingFromApi.single_bed,
              doubleBedsCount: sharedSpaceRoomDataComingFromApi.double_bed,
              traditionalBedsCount: sharedSpaceRoomDataComingFromApi.traditional_bed,
              extra: sharedSpaceRoomDataComingFromApi.extras,
              // id: sharedSpaceRoomDataComingFromApi.id,
            },
          }));
        }

        const otherRooms = residenceCapacityInfo.rooms.filter((el) => el.name !== "فضای مشترک");

        setAdditionalRoomsData(
          otherRooms.map((otherRoom, index) => ({
            collapse: true,
            payload: {
              doubleBedsCount: otherRoom.double_bed,
              extra: otherRoom.extras,
              singleBedsCount: otherRoom.single_bed,
              traditionalBedsCount: otherRoom.traditional_bed,
              // id: otherRoom.id,
            },
          }))
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceSubmittedData]);

  const submitStep5Mutation = useMutation(
    ({
      productId,
      capacity,
      max_capacity,
      rooms,
    }: {
      productId: number;
      capacity: IResidenceCapacities_Server["capacity"];
      max_capacity: IResidenceCapacities_Server["max_capacity"];
      rooms: ResidenceCapacity_IRoom_For_Submit[];
    }) => {
      return submitStep({
        step: 5,
        productId,
        data: {
          capacity,
          max_capacity,
          rooms,
        },
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          refetch();
          router.push(`?step=${6}&productId=${data?.params?.product_id}`);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  function onSubmitClick() {
    submitStep5Mutation.mutate({
      productId: Number(router?.query?.productId as string),
      capacity: baseCapacityCount,
      max_capacity: maxCapacityCount,
      rooms: [
        {
          double_bed: sharedSpaceData.payload.doubleBedsCount,
          extras: sharedSpaceData.payload.extra,
          name: "فضای مشترک",
          single_bed: sharedSpaceData.payload.singleBedsCount,
          traditional_bed: sharedSpaceData.payload.traditionalBedsCount,
          // id: sharedSpaceData?.payload?.id || undefined,
        },
        ...additionalRoomsData.map((additionalRoom, index) => ({
          double_bed: additionalRoom.payload.doubleBedsCount,
          extras: additionalRoom.payload.extra,
          name: `اتاق ${numericToStringicMap[index + 1]}`,
          single_bed: additionalRoom.payload.singleBedsCount,
          traditional_bed: additionalRoom.payload.traditionalBedsCount,
          // id: additionalRoom?.payload?.id || undefined,
        })),
      ],
    });
  }

  return getResidenceSubmittedDataIsLaoding ? (
    <TinyLoader />
  ) : (
    <>
      <div className="pb-120 md:pb-[130px]">
        <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0" />

        <div>
          <div className="pb-18">
            <div className="flex items-center justify-between mb-16">
              <p className="text-16 leading-28 font-r text-black">ظرفیت پایه</p>

              <div className="w-[107px]">
                <Counter
                  inputName={`baseCapacityCounter`}
                  counterMinimum={0}
                  customValue={baseCapacityCount}
                  onInc={() => setBaseCapacityCount((prev) => prev + 1)}
                  onDec={() => setBaseCapacityCount((prev) => prev - 1)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-16 leading-28 font-r text-black">حداکثر ظرفیت</p>

              <div className="w-[107px]">
                <Counter
                  inputName={`maxCapacityCounter`}
                  counterMinimum={0}
                  customValue={maxCapacityCount}
                  onInc={() => setMaxCapacityCount((prev) => prev + 1)}
                  onDec={() => setMaxCapacityCount((prev) => prev - 1)}
                />
              </div>
            </div>
          </div>

          <Divider />

          <div className="pt-16">
            <div className="flex items-center justify-between mb-16">
              <p className="text-16 leading-28 font-r text-black">تعداد اتاق ها</p>

              <div className="w-[107px]">
                <Counter
                  inputName={`totalRoomsCounter`}
                  counterMinimum={0}
                  customValue={additionalRoomsData.length}
                  onInc={() => setAdditionalRoomsData((prev) => [...prev, emptyRoomValues])}
                  onDec={() =>
                    setAdditionalRoomsData((prev) => [
                      ...prev.filter((el, i) => i < prev.length - 1),
                    ])
                  }
                />
              </div>
            </div>

            <RoomBox
              roomData={sharedSpaceData}
              setRoomData={setSharedSpaceData}
              roomName="فضای مشترک"
            />

            <div>
              {additionalRoomsData.map((additionalRoomData: IOtherRoomData, index: number) => {
                return (
                  <div key={index} className="mt-16">
                    <RoomBox
                      roomData={additionalRoomData}
                      setRoomDataCb={(fullRoomData: IOtherRoomData) => {
                        setAdditionalRoomsData((prev) => {
                          const allAdditionalRoomData = [...prev];
                          allAdditionalRoomData[index] = fullRoomData;
                          return allAdditionalRoomData;
                        });
                      }}
                      roomName={`اتاق ${numericToStringicMap[index + 1]}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <BottomActionsWrapper isSaving={submitStep5Mutation.isLoading} onClickOfSubmitStep={() => onSubmitClick()}>
        <Button
          isFullWidth
          isLoading={submitStep5Mutation.isLoading}
          loadingText="در حال ذخیره…"
          onClick={onSubmitClick}
          leftIcon={<i className="icon-FlashLeft text-24 text-white hidden md:block" />}
        >
          ذخیره و ادامه
        </Button>
      </BottomActionsWrapper>
    </>
  );
}

export default Step5;
