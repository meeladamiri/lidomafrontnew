import { IColumnType } from ".";
import { Checkbox } from "../General/core/Checkbox";
import TableHeaderCell from "./TableHeaderCell";

interface ITableHeader<T> {
  columns: IColumnType<T>[];
  toggleAllItems: (state: boolean) => void;
  checkedAll: boolean;
}

function TableHeader<T>({ columns, toggleAllItems, checkedAll }: ITableHeader<T>) {
  return (
    <tr className="bg-gray-616E7C">
      <th className="table-cell w-[40px]">
        <Checkbox
          onChange={() => toggleAllItems(!checkedAll)}
          checked={checkedAll}
          inputClassnames="checked:after:!bg-blue-dark"
        />
      </th>
      <th className="table-cell w-[40px]">
        <span className="font-r text-14 text-white leading-20 font-normal">ردیف</span>
      </th>
      {columns.map((column, columnIndex) => (
        <TableHeaderCell key={`table-head-cell-${columnIndex}`}>
          <span className="font-r text-14 text-white leading-20 font-normal">{column.label}</span>
        </TableHeaderCell>
      ))}
    </tr>
  );
}

export default TableHeader;
