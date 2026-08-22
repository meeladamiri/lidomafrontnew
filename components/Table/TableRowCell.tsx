import { momentToJalali, momentToJalaliWithTime2 } from "@/utilities/dateTools";
import moment from "moment-jalaali";
import { ITableDataItem } from ".";

export interface ITableRowCell<T> {
  columnClass?: string;
  item: ITableDataItem<T>;
  columnKey: keyof T;
  cellRenderer?: string | ((value: any) => string | JSX.Element);
  onClick?: () => void;
}

// function getValue(obj: any, key: string) {
//   if (obj && typeof obj === "object" && key in obj) {
//     if (key === "start_date") {
//       return momentToJalali(moment(obj[key]));
//     } else if (key === "confirmation_date") {
//       return momentToJalaliWithTime2(moment(obj[key]));
//     } else if (key === "deposit_amount") {
//       return obj[key].toLocaleString("en-US");
//     } else if (key === "remainder_amount") {
//       return obj[key].toLocaleString("en-US");
//     } else if (key === "host_debit_amount") {
//       return obj[key].toLocaleString("en-US");
//     }
//     else if (key === "order_status") {
//       if (obj[key] === "cancel") {
//         return "کنسلی"
//       }
//       else {
//         return ""
//       }
//     }
//      else {
//       return obj[key];
//     }
//   } else {
//     return undefined;
//   }
// }

function  TableRowCell<T>({
  item,
  columnKey,
  cellRenderer,
  onClick,
  columnClass,
}: ITableRowCell<T>) {
  function render(
    obj: ITableDataItem<T>,
    key: keyof T,
    cellRenderer?: string | ((value: any) => string | JSX.Element)
  ) {
    if (obj && typeof obj === "object" && key in obj) {
      if (cellRenderer && obj[key]) {
        if (typeof cellRenderer === "string") {
          switch (cellRenderer) {
            case "date":
              return momentToJalali(moment(obj[key] as string));
            case "dateTime":
              return momentToJalaliWithTime2(moment(obj[key] as string));
            case "price":
              return (obj[key] as number).toLocaleString("en-US");
          }
        } else {
          return cellRenderer(obj[key]);
        }
      } else {
        return obj[key];
      }
    } else {
      return undefined;
    }
  }
  return (
    <>
      <td
        onClick={onClick}
        className={`py-14 px-12 text-center break-words whitespace-nowrap ${columnClass || ""}`}
      >
        {render(item, columnKey, cellRenderer)}
      </td>
    </>
  );
}

export default TableRowCell;
