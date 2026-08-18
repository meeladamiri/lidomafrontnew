import { Dispatch, SetStateAction } from "react";
import { IColumnType, IRowSettings, ITableDataItem } from ".";
import { Checkbox } from "../General/core/Checkbox";
import TableRowCell from "./TableRowCell";

export interface ITableRow<T> {
  tableData: ITableDataItem<T>[];
  setTableData: any;
  columns: IColumnType<T>[];
  checkedAll?: boolean;
  setCheckedAll?: Dispatch<SetStateAction<boolean>>;
  hasCheckbox?: boolean;
  // setSelectedRow?: Dispatch<SetStateAction<T | undefined>>;
  onCellClick?: (row: T, cell: keyof T) => void;
  rowSettings?: IRowSettings<T>;
}

function TableRow<T>({
  tableData,
  setTableData,
  columns,
  checkedAll,
  setCheckedAll,
  hasCheckbox = false,
  onCellClick,
  rowSettings,
}: ITableRow<T>) {
  const handleCheckboxChange = (item: ITableDataItem<T>) => {
    const copyOfTableDatas = [...tableData];
    const targetItem = copyOfTableDatas.find((copyOfTableData) => item.$id === copyOfTableData.$id);
    targetItem!.$checked = !targetItem!.$checked;

    setTableData(copyOfTableDatas);

    if (targetItem!.$checked === false && checkedAll && setCheckedAll) setCheckedAll(false);
    else if (!checkedAll && copyOfTableDatas.every((x) => x.$checked === true) && setCheckedAll)
      setCheckedAll(true);
  };

  const getRowClassname = (row: T): string => {
    if (rowSettings && rowSettings.classname) {
      if (typeof rowSettings.classname === "string") return rowSettings.classname;
      else return rowSettings.classname(row);
    } else return "";
  };
  //refrence type
  //primitive type

  return (
    <>
      {tableData.map((item, itemIndex) => (
        <tr
          className={`bg-white table-row border border-gray-E8E8E8 cursor-pointer ${getRowClassname(
            item
          )}`}
          // @ts-ignore*/}
          // item?.order_status === "cancel" ? "hover:bg-red-light" : "hover:bg-blue-F3F8FE"
          // rowSettings && rowSettings.classname
          key={`table-body-${itemIndex}`}
          // onClick={() => {
          //   if (setSelectedRow) setSelectedRow(item);
          // }}
        >
          {hasCheckbox && (
            <td className="p-12 break-words w-[40px]">
              <Checkbox
                checked={item.$checked}
                onChange={() => handleCheckboxChange(item)}
                inputClassnames="checked:after:!bg-blue-dark"
              />
            </td>
          )}
          <td className="p-12 break-words text-center w-[40px]">{itemIndex + 1}</td>
          {columns.map((column, columnIndex) => (
            <TableRowCell
              key={`table-row-cell-${columnIndex}`}
              columnClass={column.columnClass}
              item={item}
              columnKey={column.key}
              cellRenderer={column.cellRenderer}
              onClick={() => {
                if (onCellClick) onCellClick(item, column.key);
              }}
            />
          ))}
        </tr>
      ))}
    </>
  );
}

export default TableRow;
