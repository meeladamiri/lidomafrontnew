import { Button } from "components/General/core/Button";
import { TextField } from "components/General/core/TextField";
import Counter from "components/General/Counter";
import { IOtherRoomData, IOtherRoomData_Payload } from "interfaces/Residences/Submit/Steps/Step_5";
import { Dispatch, SetStateAction } from "react";

function RoomBox({
  roomName, // 'roomNames' which are being used in the same page, must be unique. bcz 'roomName' is being used as name of counter inputs;
  roomData,
  setRoomData, // if not provided, 'setRoomDataCb' must be provided;
  setRoomDataCb, // if not provided, 'setRoomData' must be provided;
}: {
  roomName: string;
  roomData: IOtherRoomData;
  setRoomData?: Dispatch<
    SetStateAction<{
      collapse: boolean;
      payload: IOtherRoomData_Payload;
    }>
  >;
  setRoomDataCb?: (roomData: IOtherRoomData) => void;
}) {
  return (
    <div className="p-12 typical-gray-bg rounded-10">
      <div className="flex items-center justify-between gap-x-8">
        <div className="OnlyOneLineAndEndWithElipsis">
          <p className="text-16 leading-28 font-m text-black">{roomName}</p>
          <p className="mt-2 text-12 leading-21 font-l text-black OnlyOneLineAndEndWithElipsis">
            {roomData?.payload?.singleBedsCount} تخت یک نفره + {roomData?.payload?.doubleBedsCount}{" "}
            تخت دو نفره + {roomData?.payload?.traditionalBedsCount} رخت خواب سنتی
          </p>
        </div>

        <div className="w-fit-content shrink-0">
          <Button
            className="!py-4 sm:!px-16 "
            color={
              !roomData?.collapse
                ? "white"
                : roomData?.payload?.singleBedsCount === 0 &&
                  roomData?.payload?.doubleBedsCount === 0 &&
                  roomData?.payload?.traditionalBedsCount === 0
                ? "secondary"
                : "white"
            }
            onClick={() => {
              if (setRoomData) {
                setRoomData((prev) => ({ ...prev, collapse: !prev?.collapse }));
              } else if (!!setRoomDataCb) {
                setRoomDataCb({
                  ...roomData,
                  collapse: !roomData.collapse,
                });
              }
            }}
          >
            {!roomData?.collapse
              ? "بستن"
              : roomData?.payload?.singleBedsCount === 0 &&
                roomData?.payload?.doubleBedsCount === 0 &&
                roomData?.payload?.traditionalBedsCount === 0
              ? "افزودن تخت"
              : "ویرایش"}
          </Button>
        </div>
      </div>

      {!roomData?.collapse && (
        <div className="pt-28">
          <div className="flex items-center justify-between mb-16">
            <p className="text-16 leading-28 font-r text-black">تعداد تخت یک نفره</p>

            <div className="w-[107px]">
              <Counter
                inputName={`singleBedsCount-${roomName}`}
                counterMinimum={0}
                customValue={roomData?.payload?.singleBedsCount}
                onInc={() => {
                  //   console.log(typeof setRoomData);
                  if (!!setRoomData) {
                    setRoomData((prev) => ({
                      ...prev,
                      payload: {
                        ...prev.payload,
                        singleBedsCount: prev.payload.singleBedsCount + 1,
                      },
                    }));
                  } else if (!!setRoomDataCb) {
                    setRoomDataCb({
                      ...roomData,
                      //   collapse: !roomData.collapse,
                      payload: {
                        ...roomData.payload,
                        singleBedsCount: roomData.payload.singleBedsCount + 1,
                      },
                    });
                  }
                }}
                onDec={() => {
                  if (!!setRoomData) {
                    setRoomData((prev) => ({
                      ...prev,
                      payload: {
                        ...prev.payload,
                        singleBedsCount: prev.payload.singleBedsCount - 1,
                      },
                    }));
                  } else if (!!setRoomDataCb) {
                    setRoomDataCb({
                      ...roomData,
                      //   collapse: !roomData.collapse,
                      payload: {
                        ...roomData.payload,
                        singleBedsCount: roomData.payload.singleBedsCount - 1,
                      },
                    });
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-16">
            <p className="text-16 leading-28 font-r text-black">تعداد تخت دو نفره</p>

            <div className="w-[107px]">
              <Counter
                inputName={`doubleBedsCount-${roomName}`}
                counterMinimum={0}
                customValue={roomData?.payload?.doubleBedsCount}
                onInc={() => {
                  if (!!setRoomData) {
                    setRoomData((prev) => ({
                      ...prev,
                      payload: {
                        ...prev.payload,
                        doubleBedsCount: prev?.payload?.doubleBedsCount + 1,
                      },
                    }));
                  } else if (!!setRoomDataCb) {
                    setRoomDataCb({
                      ...roomData,
                      payload: {
                        ...roomData.payload,
                        doubleBedsCount: roomData.payload.doubleBedsCount + 1,
                      },
                    });
                  }
                }}
                onDec={() => {
                  if (!!setRoomData) {
                    setRoomData((prev) => ({
                      ...prev,
                      payload: {
                        ...prev.payload,
                        doubleBedsCount: prev?.payload?.doubleBedsCount - 1,
                      },
                    }));
                  } else if (!!setRoomDataCb) {
                    setRoomDataCb({
                      ...roomData,
                      payload: {
                        ...roomData.payload,
                        doubleBedsCount: roomData.payload.doubleBedsCount - 1,
                      },
                    });
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-16">
            <p className="text-16 leading-28 font-r text-black">تعداد رخت خواب سنتی</p>

            <div className="w-[107px]">
              <Counter
                inputName={`traditionalBedsCount-${roomName}`}
                counterMinimum={0}
                customValue={roomData?.payload?.traditionalBedsCount}
                onInc={() => {
                  if (!!setRoomData) {
                    setRoomData((prev) => ({
                      ...prev,
                      payload: {
                        ...prev.payload,
                        traditionalBedsCount: prev?.payload?.traditionalBedsCount + 1,
                      },
                    }));
                  } else if (!!setRoomDataCb) {
                    setRoomDataCb({
                      ...roomData,
                      //   collapse: !roomData.collapse,
                      payload: {
                        ...roomData.payload,
                        traditionalBedsCount: roomData.payload.traditionalBedsCount + 1,
                      },
                    });
                  }
                }}
                onDec={() => {
                  if (!!setRoomData) {
                    setRoomData((prev) => ({
                      ...prev,
                      payload: {
                        ...prev.payload,
                        traditionalBedsCount: prev?.payload?.traditionalBedsCount - 1,
                      },
                    }));
                  } else if (!!setRoomDataCb) {
                    setRoomDataCb({
                      ...roomData,
                      //   collapse: !roomData.collapse,
                      payload: {
                        ...roomData.payload,
                        traditionalBedsCount: roomData.payload.traditionalBedsCount - 1,
                      },
                    });
                  }
                }}
              />
            </div>
          </div>

          <TextField
            name={`extraInfo-${roomName}`}
            label="سایر موارد"
            placeholder="مثال : مبل تاشو"
            labelClassname="!mb-8"
            customValue={roomData?.payload?.extra}
            customOnChange={(value) => {
              if (!!setRoomData) {
                setRoomData((prev) => ({
                  ...prev,
                  payload: {
                    ...prev?.payload,
                    //   traditionalBedsCount: prev.payload.traditionalBedsCount - 1,
                    extra: value,
                  },
                }));
              } else if (!!setRoomDataCb) {
                setRoomDataCb({
                  ...roomData,
                  //   collapse: !roomData.collapse,
                  payload: {
                    ...roomData.payload,
                    extra: value,
                  },
                });
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default RoomBox;
