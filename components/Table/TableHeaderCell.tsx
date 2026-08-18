export interface ITableHeaderCell {
  children: React.ReactNode | string;
}

function TableHeaderCell({ children }: ITableHeaderCell) {
  return <th className="table-cell">{children}</th>;
}

export default TableHeaderCell;
