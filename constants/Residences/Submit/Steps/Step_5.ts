import { IEmptyRoomValues } from "interfaces/Residences/Submit/Steps/Step_5";

export const emptyRoomValues: IEmptyRoomValues = {
  collapse: true,
  payload: {
    singleBedsCount: 0,
    doubleBedsCount: 0,
    traditionalBedsCount: 0,
    extra: "",
    // NOTE: 'emptyRoomValues' should NOT have 'id'. bcz it is not yet submitted to server; (Server will assign 'id' to newly created rooms)
  },
};
