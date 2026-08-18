export interface IOtherRoomData_Payload {
  singleBedsCount: number;
  doubleBedsCount: number;
  traditionalBedsCount: number;
  extra: string;
  // id?: number; // if 'room' is retrieved from api, it has id. Rooms which are created in the app and not submitted to server yet, do NOT have id yet;
}

export interface IOtherRoomData {
  collapse: boolean;
  payload: IOtherRoomData_Payload;
}

export interface ISharedSpaceData_Payload {
  singleBedsCount: number;
  doubleBedsCount: number;
  traditionalBedsCount: number;
  extra: string;
  // id?: number; // if 'SharedSpaceData' is retrieved from api, it has id. if 'SharedSpaceData' is not yet submitted to server, it does NOT have id;
}

export interface ISharedSpaceData {
  collapse: boolean;
  payload: ISharedSpaceData_Payload;
}

export interface IEmptyRoomValues {
  collapse: boolean;
  payload: {
    singleBedsCount: number;
    doubleBedsCount: number;
    traditionalBedsCount: number;
    extra: string;
    // NOTE: 'emptyRoomValues' should NOT have 'id'. bcz it is not yet submitted to server; (Server will assign 'id' to newly created rooms)
  };
}
