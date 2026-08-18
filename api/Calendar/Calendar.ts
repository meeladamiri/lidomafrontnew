import { ResidenceTypes_enum } from "constants/enums/residence_types";
import apiBuilder from "../apiBuilder";
import { BASE_URL } from "@/configs/info";

export interface IServerCalendarData_discounted_day {
  amount: number;
  date: string; // ex: "2022-12-14"
  discount_id: number;
  type: "percentage" | "fixed_price"; // Refrence to backend: They never use 'fixed_price';
}

export interface IServerCalendarData {
  capacity: number;
  discounted_days: IServerCalendarData_discounted_day[];
  fast_days: string[];
  filled_dates: string[];
  is_temp: boolean;
  max_capacity: number;
  peak_dates: [
    string, // start of range --> ex:
    string // end of range
  ][];
  prices: {
    extra_guests_price: number;
    monthly_discount: number;
    peak_price: number;
    week_price: number;
    weekend_price: number;
    weekly_discount: number;
  };
  reserved_dates: string[];
  special_dates: [
    string, // date
    number // price
  ][];
}

const getCalendarData = async ({
  residenceId,
  residenceType,
}: {
  residenceId: number | "all";
  residenceType: ResidenceTypes_enum;
}) => {
  const url = `/api/get_calendar_data`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      residence_id: residenceId,
      residence_type: residenceType,
    })
    .call();
};

const getCalendarData2 = async ({
  residenceId,
  residenceType,
}: {
  residenceId: number | "all";
  residenceType: ResidenceTypes_enum;
}) => {
  const url = `${BASE_URL}/api/get_calendar_data`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      residence_id: residenceId,
      residence_type: residenceType,
    })
    .call();
};

export { getCalendarData, getCalendarData2 };
