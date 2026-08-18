import {
  useState,
  MutableRefObject,
  forwardRef,
  ForwardedRef,
  Dispatch,
  SetStateAction,
} from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TableWrapper from "./TableWrapper";
import TableFooterRow from "./TableFooter";
import { TableItem } from "../Deposit";

export interface IColumnProperties {
  $checked: boolean;
  $id: string;
}

export type ITableDataItem<T> = T & IColumnProperties;

export interface IColumnType<T> {
  label: string;
  key: keyof T;
  cellRenderer?: string | ((value: any) => string | JSX.Element);
  footer?: string;
  columnClass?: string
}

export interface IRowSettings<T> {
  classname?: string | ((row: T) => string);
}
export interface ITableSettings<T> {
  rowSettings?: IRowSettings<T>;
}

interface ICustomTable<T extends TableItem> {
  tableData: ITableDataItem<T>[];
  hasFooter?: boolean;
  columns: IColumnType<T>[];
  tableSettings?: ITableSettings<T>;
  setTableData: Dispatch<SetStateAction<any[]>>;
  ref: MutableRefObject<any>;
  // setSelectedRow?: Dispatch<SetStateAction<T | undefined>>;
  onCellClick?: (row: T, cell: keyof T) => void;
  selectedTableData: ITableDataItem<T>[];
}

const CustomTable = forwardRef(function CustomTable<T extends TableItem>(
  {
    columns,
    hasFooter = false,
    tableData,
    setTableData,
    onCellClick,
    tableSettings,
    selectedTableData,
  }: ICustomTable<T>,
  ref: ForwardedRef<any>
) {
  const [checkedAll, setCheckedAll] = useState(false);

  const toggleAllItems = (state: boolean) => {
    const updatedItems = tableData.map((item) => {
      return {
        ...item,
        $checked: state,
      };
    });
    setTableData(updatedItems);
    setCheckedAll(state);
  };

  return (
    <div className="w-full ">
      <TableWrapper>
        <thead>
          <TableHeader toggleAllItems={toggleAllItems} checkedAll={checkedAll} columns={columns} />
        </thead>
        <tbody>
          <TableRow
            setCheckedAll={setCheckedAll}
            checkedAll={checkedAll}
            tableData={tableData}
            setTableData={setTableData}
            columns={columns}
            hasCheckbox={true}
            onCellClick={onCellClick}
            rowSettings={tableSettings?.rowSettings}
          />
        </tbody>
        <tfoot>
          {hasFooter && (
            <TableFooterRow
              selectedTableData={selectedTableData}
              columns={columns}
              tableData={tableData}
            />
          )}
        </tfoot>
      </TableWrapper>
      {/* {hasFooter && (
        <footer className="bg-blue-dark w-full py-10 rounded-b-8 flex justify-center">
          {typeof footerContent === "string" ? (
            <span className="text-white text-14 leading-20 font-r">{footerContent}</span>
          ) : (
            <>{footerContent}</>
          )}
        </footer>
      )} */}
    </div>
  );
});

export { CustomTable as Table };
