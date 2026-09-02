import Counter from "components/General/Counter";
import Divider from "components/General/Divider";
import RoomBox from "components/Residences/Edit/shared/RoomBox";
import { emptyRoomValues } from "constants/Residences/Submit/Steps/Step_5";
import { IOtherRoomData, ISharedSpaceData } from "interfaces/Residences/Submit/Steps/Step_5";
import { Dispatch, SetStateAction } from "react";
import { numericToStringicMap } from "utilities/Number_tools";

const EditResidenceCapacities = ({
  baseCapacityCount,
  setBaseCapacityCount,
  maxCapacityCount,
  setMaxCapacityCount,
  sharedSpaceData,
  setSharedSpaceData,
  additionalRoomsData,
  setAdditionalRoomsData,
}: {
  baseCapacityCount: number;
  setBaseCapacityCount: Dispatch<SetStateAction<number>>;
  maxCapacityCount: number;
  setMaxCapacityCount: Dispatch<SetStateAction<number>>;
  sharedSpaceData: ISharedSpaceData;
  setSharedSpaceData: Dispatch<SetStateAction<ISharedSpaceData>>;
  additionalRoomsData: IOtherRoomData[];
  setAdditionalRoomsData: Dispatch<SetStateAction<IOtherRoomData[]>>;
}) => {
  return (
    <div>
      <p className="text-16 leading-28 text-black font-m mb-24">ظرفیت اقامتگاه خود را مشخص کنید</p>

      {/* form */}
      <div>
        <div className="pb-18">
          <div className="flex items-center justify-between mb-16">
            <p className="text-16 leading-28 font-r text-black">ظرفیت پایه</p>

            <div className="w-[107px]">
              <Counter
                inputName={`baseCapacityCounter`}
                counterMinimum={1}
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
                counterMinimum={1}
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
                  setAdditionalRoomsData((prev) => [...prev.filter((el, i) => i < prev.length - 1)])
                }
              />
            </div>
          </div>

          {/* shared space */}
          <div>
            <RoomBox
              roomData={sharedSpaceData}
              setRoomData={setSharedSpaceData}
              roomName="فضای مشترک"
            />
          </div>

          {/* other rooms container */}
          <div>
            {additionalRoomsData.map((additionalRoomData: IOtherRoomData, index: number) => {
              return (
                <div key={index} className="mt-16">
                  <RoomBox
                    roomData={additionalRoomData}
                    setRoomDataCb={(fullRoomData: IOtherRoomData) => {
                      // console.log("fullRoomData iss", fullRoomData);
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
  );
};

export default EditResidenceCapacities;
