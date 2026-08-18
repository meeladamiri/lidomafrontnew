export interface ITableWrapper {
  children: React.ReactNode | string;
}

function TableWrapper({ children }: ITableWrapper) {
  return (
    <table className="border-none w-full table-fixed mt-24">
        {children}
    </table>
  )
}

export default TableWrapper;
