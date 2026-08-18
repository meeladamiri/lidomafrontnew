import { translateStatus } from "./SettlementStatusTag";

export interface ICSVHeader {
  label: string;
  key: string;
}

export const getcsv = (headers: ICSVHeader[], data: object[]) => {
  const headerColumns = headers.map((header) => header.label);
  return [
    headerColumns,
    ...data.map((item) =>
      headers.map((header) => {
        if (
          header.key === "clear_remainer" ||
          header.key === "host_portion" ||
          header.key === "deposit_amount"
        ) {
          return ((item as any)[header.key] * 10);
        } else if (header.key === "settlement_status") {
          return translateStatus((item as any)[header.key]);
        } else if (header.key === "order_status") {
          return (item as any)[header.key] === "cancel" ? "کنسلی" : "";
        }
        return (item as any)[header.key];
      })
    ),
  ];
};
