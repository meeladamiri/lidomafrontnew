import { EXCEPTIONTYPES } from "constants/enums/exception_types";

interface IMessage {
  title: string;
  type: EXCEPTIONTYPES;
}

export interface IMessageItems extends Array<IMessage> {}
