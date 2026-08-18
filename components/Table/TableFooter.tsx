import { useState, useEffect } from "react";
import { IColumnType, ITableDataItem } from ".";
import TableRowCell from "./TableRowCell";

export interface ITableFooterRow<T> {
  tableData: ITableDataItem<T>[];
  columns: IColumnType<T>[];
  onClick?: () => void;
  selectedTableData: ITableDataItem<T>[];
}

function TableFooterRow<T>({ tableData, columns, selectedTableData }: ITableFooterRow<T>) {
  const [footerData, setFooterData] = useState<T>();

  const calculateColumn = (method: string, columnKey: keyof T, data: ITableDataItem<T>[]) => {
    if (method === "sum") {
      let summation = 0;

      data.forEach((data) => {
        summation += data[columnKey] as number;
      });
      return summation;
    }
    return "";
  };

  const calculateFooterData = (data: ITableDataItem<T>[]) => {
    if (data.length > 0) {
      let row: any = {};

      columns.map((column) => {
        if (column.footer) {
          row[column.key] = calculateColumn(column.footer, column.key, data);
        } else row[column.key] = "";
      });

      return row as ITableDataItem<T>;
    }
  };

  useEffect(() => {
    if (selectedTableData.length) {
      setFooterData(calculateFooterData(selectedTableData));
    } else {
      setFooterData(calculateFooterData(tableData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData, selectedTableData]);

  return (
    <>
      <tr
        className={`bg-blue-500 table-row border border-gray-E8E8E8 cursor-pointer text-white`}
        key={`table-footer}`}
      >
        <td className="p-12 break-words"></td>
        <td className="p-12 break-words"></td>
        {columns.map((column, columnIndex) => (
          <TableRowCell
            key={`table-row-cell-${columnIndex}`}
            item={footerData as ITableDataItem<T>}
            columnKey={column.key}
            cellRenderer={column.cellRenderer}
          />
        ))}
      </tr>
    </>
  );
}

export default TableFooterRow;
