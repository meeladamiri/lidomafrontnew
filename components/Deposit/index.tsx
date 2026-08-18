import { useEffect, useRef, useState } from "react";
import { Button } from "../General/core/Button";
import { TextField } from "../General/core/TextField";
import moment, { Moment } from "moment-jalaali";
import { momentToJalali, momentToJalaliWithTime2 } from "@/utilities/dateTools";
import { ITableSettings, Table } from "../Table";
import Calendar from "../Calendar";
import { useQuery } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
// import { Switch } from "../General/core/Switch";
import OutsideClickHandler from "@/utilities/OutsideClickHandler";
import { getCheckoutsList } from "@/api/Deposit/getCheckoutsList";
import GroupSettlementModal from "./BatchSettleModal";
import { ICSVHeader, getcsv } from "./getcsv";
import InfoTag from "./InfoTag";
import { IColumnType } from "../Table";
import SettlementStatusTag from "./SettlementStatusTag";
import PaymentInformationModal from "./PaymentInformationModal";
import { checkUserPermission } from "@/api/Deposit/checkUserPermission";
import { getUserToken } from "@/utilities/cookies";
import Loader from "../General/Loader";
import Inaccessibility from "../General/Inaccessibility";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
// import classes from "@/styles/line-clamps.module.css";

export interface IPayment {
  amount: number;
  date_time: string;
  description: string;
  payer: string;
  pay_with: string;
  reference: string;
  payment_type: "deposit" | "remainder" | "host_debit";
  type: "remainder_update" | "payment";
}

export interface IRemainderUpdate {
  amount: number;
  date_time: string;
  description: string;
  payer: string;
  type: "remainder_update" | "payment";
}

export type ISettlementStatus = "settled" | "deposited" | "unsettled";

export interface TableItem {
  // [key: string]: any;
  $checked: boolean;
  $id: string;
  card_owner: string;
  confirmation_date: string;
  credit_card: string;
  host_debit: number;
  host_id: number;
  host_name: string;
  host_phone: string;
  order_description: string;
  order_id: number;
  order_reference: string;
  order_status: string;
  transactions: (IPayment | IRemainderUpdate)[];
  shaba: string;
  shaba_owner: string;
  start_date: string;
  // host_debit_amount?: string | number;
  deposit_amount?: string | number;
  // remainder_amount?: string | number;
  settlement_status?: ISettlementStatus;
  host_portion: number;
  clear_remainer: number;
  host_image: string;
  // remainder_updates: IRemainderUpdate[];
}

const headers: IColumnType<TableItem>[] = [
  { label: "میزبان", key: "host_name" },
  { label: "کد رزرو", key: "order_reference" },
  { label: "تاریخ و ساعت قطعی", key: "confirmation_date" },
  { label: "تاریخ شروع", key: "start_date" },
  // { label: "واریزی به میزبان", key: "host_debit_amount", cellRenderer: "price", footer: "sum" },
  { label: "سهم سیستمی میزبان", key: "host_portion", cellRenderer: "price", footer: "sum" },
  { label: "بیعانه", key: "deposit_amount", cellRenderer: "price", footer: "sum" },
  { label: "مانده واریز", key: "clear_remainer", cellRenderer: "price", footer: "sum" },
  // { label: "مانده واریز", key: "remainder_amount", cellRenderer: "price", footer: "sum" },
  {
    label: "وضعیت تسویه",
    key: "settlement_status",
    cellRenderer(value) {
      return <SettlementStatusTag tagValue={value} />;
    },
  },
  {
    label: "توضیحات تیم فروش",
    key: "order_description",
    columnClass: "OnlyOneLineAndEndWithElipsis",
  },
  {
    label: "",
    key: "order_status",
    cellRenderer(value) {
      return orderStatusTranslator(value);
    },
  },
];

export const orderStatusTranslator = (tag: string): string | JSX.Element => {
  return tag === "cancel" ? (
    <InfoTag
      wrapperClassnames="border border-red-main bg-transparent !px-10 !py-4 !inline-block"
      tagNameClassnames="text-red-main"
      tagName={"کنسلی"}
    />
  ) : (
    ""
  );
};

const tableSettings: ITableSettings<TableItem> = {
  rowSettings: {
    classname: (row) =>
      row.order_status === "cancel" ? "hover:bg-red-light" : "hover:bg-blue-F3F8FE",
  },
};

const bankFileOutput: ICSVHeader[] = [
  { label: "شماره شبای مقصد(اجباری)", key: "shaba" },
  // { label: "مبلغ واریز(ریال)(اجباری)", key: "remainder_amount" },
  { label: "مانده واریز", key: "clear_remainer" },
  { label: "شرح مقصد(اجباری)", key: "shaba_owner" },
];

function Deposit() {
  const [startDateDateToWorkWith, setStartDateDateToWorkWith] = useState<Moment>(
    moment(new Date())
  );
  const [endDateDateToWorkWith, setEndDateDateToWorkWith] = useState<Moment>(moment(new Date()));
  const [tableData, setTableData] = useState<TableItem[]>([]);
  // const [isRangeEnabled, setIsRangeEnabled] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TableItem>();
  // const [selectedRanges, setSelectedRanges] = useState<
  //   [
  //     moment.Moment, // start day of range
  //     moment.Moment | null // end day of range ('null' in case the start day is selected but the end day is not.)
  //   ][]
  // >([]);
  const [startDate, setStartDate] = useState<moment.Moment[]>([]);
  const [endDate, setEndDate] = useState<moment.Moment[]>([]);
  const [showCalendarStartDate, setShowCalendarStartDate] = useState(false);
  const [showCalendarEndDate, setShowCalendarEndDate] = useState(false);
  const startDateTextFieldRef = useRef<any>(null);
  const endDateTextFieldRef = useRef<any>(null);
  const tableRef = useRef();
  const [showGroupSettlementModal, setShowGroupSettlementModal] = useState<boolean>(false);
  const [tableSelectedItems, setTableSelectedItems] = useState<TableItem[]>([]);
  const [showPaymentInformationModal, setShowPaymentInformationModal] = useState<boolean>(false);
  const [showGetCheckoutsList, setShowGetCheckoutsList] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [permissionIsLoading, setIsPermissionIsLoading] = useState(true);

  const {
    data: getCheckoutsListData,
    // isSuccess: getCheckoutsListIsSuccess,
    isLoading: getCheckoutsListIsLoading,
    isFetching: getCheckoutsListIsFetching,
    refetch: getCheckoutsListRefetch,
  } = useQuery(
    ["getCheckoutsList", showGetCheckoutsList, startDate, endDate],
    () => {
      return getCheckoutsList({
        start_date: startDate.length
          ? momentToJalali(startDate[0])
          : momentToJalali(startDateDateToWorkWith),
        till_date: endDate.length
          ? momentToJalali(endDate[0])
          : momentToJalali(startDateDateToWorkWith),
      });
    },
    {
      enabled: !!showGetCheckoutsList,
      onSuccess: () => {
        setShowGetCheckoutsList(false);
      },
    }
  );

  useEffect(() => {
    if (!!getCheckoutsListData) {
      if (getCheckoutsListData?.result === "success") {
        const changedTableData = getCheckoutsListData?.params?.orders?.map((item: TableItem) => {
          // let host_debit_amount = 0;
          let deposit_amount = 0;
          // let remainder_amount = 0;

          item.transactions.forEach((transaction: any) => {
            if (transaction.type === "payment") {
              switch (transaction.payment_type) {
                // case "host_debit":
                //   host_debit_amount += transaction.amount;
                //   break;
                case "deposit":
                  deposit_amount += transaction.amount;
                  break;
                // case "remainder":
                //   remainder_amount += transaction.amount;
                //   break;
              }
            }
          });

          let settlement_status: ISettlementStatus = "unsettled";

          if (item.clear_remainer > 0 && deposit_amount > 0) {
            settlement_status = "deposited";
          } else if (item.clear_remainer === 0) {
            settlement_status = "settled";
          }

          return {
            ...item,
            // we start table properties with $
            confirmation_date: momentToJalaliWithTime2(moment(item.confirmation_date)),
            start_date: momentToJalali(moment(item.start_date)),
            $checked: false,
            $id: Math.random().toString(32).slice(2, 8),
            // host_debit_amount,
            deposit_amount: deposit_amount,
            clear_remainer: item.clear_remainer,
            // remainder_amount,
            settlement_status,
          };
        });
        setTableData(changedTableData);

        if (selectedRow) {
          const itemIndex = changedTableData.findIndex(
            (item: TableItem) => item.order_id == selectedRow.order_id
          );
          if (itemIndex > -1) setSelectedRow(changedTableData[itemIndex]);
        }
      } else {
        exception.message([
          { type: EXCEPTIONTYPES.ERROR, title: getCheckoutsListData?.err_msg || defaultError },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCheckoutsListData]);

  const tabelCellClicked = (row: TableItem, column: keyof TableItem) => {
    setSelectedRow(row);
    setShowPaymentInformationModal(true);
  };

  const {
    data: checkUserPermissionData,
    isLoading: checkUserPermissionDataIsLoading,
    isFetching: checkUserPermissionDataIsFetching,
    refetch: refetchCheckUserPermission,
  } = useQuery(["depositCheckUserPermission"], () => checkUserPermission(), {
    enabled: !!getUserToken(),
  });

  useEffect(() => {
    if (!!checkUserPermissionData) {
      if (checkUserPermissionData?.status === "success") {
        setHasPermission(checkUserPermissionData?.params?.has_permission);
        setIsPermissionIsLoading(false);
      } else {
        // refetchCheckUserPermission();
        setIsPermissionIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkUserPermissionData]);

  // function resetAllSelectedDays() {
  //   setSelectedIndividualDays([]);
  //   setSelectedRanges([]);
  // }

  useEffect(() => {
    setTableSelectedItems(tableData.filter((item) => item.$checked === true));
  }, [tableData]);

  return (
    <>
      <Loader isShowing={permissionIsLoading} />
      {hasPermission && !permissionIsLoading && (
        <div className="CustomContainer !max-w-[1450px] pt-[114px] pb-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-12">
              <div className="relative">
                <TextField
                  customValue={
                    startDate.length
                      ? momentToJalali(startDate[0])
                      : momentToJalali(startDateDateToWorkWith)
                  }
                  readonly={true}
                  labelInBorder={true}
                  label="تاریخ شروع"
                  wrapperClassname="py-8"
                  name="startDate"
                  ref={startDateTextFieldRef}
                  onClick={() => {
                    setShowCalendarStartDate(true);
                    setShowCalendarEndDate(false);
                  }}
                />
                <OutsideClickHandler
                  handleClick={() => setShowCalendarStartDate(false)}
                  exceptionElementsRef={[startDateTextFieldRef, endDateTextFieldRef]}
                >
                  {showCalendarStartDate && (
                    <div className="bg-white w-[300px] border border-gray-#E8E8E8 p-16 rounded-20 shadow-lg z-1 absolute top-50">
                      <Calendar
                        showToday={true}
                        canNavigateToAllPrevMonth={true}
                        canSelectPassedDay={true}
                        wrapperClassname="bg-white"
                        color="blue"
                        rounded={true}
                        hasBorderDashed={false}
                        makeBgConsistentInSelectedRanges={true}
                        aspectRatio1by1
                        setDateToWorkWith={setStartDateDateToWorkWith}
                        dateToWorkWith={startDateDateToWorkWith}
                        onMonthInc={() => {
                          setStartDateDateToWorkWith(
                            startDateDateToWorkWith.clone().add(1, "jMonth")
                          );
                        }}
                        onMonthDec={() => {
                          setStartDateDateToWorkWith(
                            startDateDateToWorkWith.clone().subtract(1, "jMonth")
                          );
                        }}
                        isRangeEnabled={false}
                        // canOnlySelectOneDayWhenRangeIsDisabled={true}
                        filledDays={[]}
                        alreadyReservedDays={[]}
                        peakDays={[]}
                        fastReserveDays={[]}
                        discounted_days={[]}
                        special_dates={[]}
                        offDays={[]}
                        prices={{
                          extra_guests_price: 0,
                          monthly_discount: 0,
                          peak_price: 0,
                          week_price: 0,
                          weekend_price: 0,
                          weekly_discount: 0,
                        }}
                        canSelectDay={true}
                        showNavigateToPrevMonthBtn={true}
                        showNavigateToNextMonthBtn={true}
                        onlyShowCalendarDateNumber={true}
                        noCoOperation={false}
                        selectedIndividualDays={startDate}
                        setSelectedIndividualDays={setStartDate}
                        checkForAlreadyReservedDatesOrFilledDatesValidity={true}
                        canSelectMonth={true}
                        onDaySelectCb={() => {
                          if (startDate.length) {
                            setStartDate((startDate) => startDate.slice(1));
                          }
                          setShowCalendarStartDate(false);
                          setShowCalendarEndDate(true);
                        }}
                      />
                      <div className="flex items-center justify-between mt-16">
                        <div className="flex items-center gap-x-8">
                          {/* <Button
                        rounded
                        color="grey"
                        onClick={() => resetAllSelectedDays()}
                        className="!px-10"
                      >
                        انصراف
                      </Button> */}
                          <Button
                            onClick={() => {
                              setShowCalendarStartDate(false);
                            }}
                            rounded
                            color="dark-blue"
                          >
                            تایید تاریخ
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </OutsideClickHandler>
              </div>
              <div className="relative">
                <TextField
                  customValue={
                    endDate.length
                      ? momentToJalali(endDate[0])
                      : momentToJalali(endDateDateToWorkWith)
                  }
                  readonly={true}
                  labelInBorder={true}
                  label="تاریخ پایان"
                  wrapperClassname="py-8"
                  name="endDate"
                  ref={endDateTextFieldRef}
                  onClick={() => {
                    setShowCalendarEndDate(true);
                    setShowCalendarStartDate(false);
                  }}
                />
                <OutsideClickHandler
                  handleClick={() => setShowCalendarEndDate(false)}
                  exceptionElementsRef={[startDateTextFieldRef, endDateTextFieldRef]}
                >
                  {showCalendarEndDate && (
                    <div className="bg-white w-[300px] border border-gray-#E8E8E8 p-16 rounded-20 shadow-lg z-1 absolute top-50">
                      <Calendar
                        showToday={true}
                        canNavigateToAllPrevMonth={true}
                        canSelectPassedDay={true}
                        wrapperClassname="bg-white"
                        color="blue"
                        rounded={true}
                        hasBorderDashed={false}
                        makeBgConsistentInSelectedRanges={true}
                        aspectRatio1by1
                        setDateToWorkWith={setEndDateDateToWorkWith}
                        dateToWorkWith={endDateDateToWorkWith}
                        onMonthInc={() => {
                          setEndDateDateToWorkWith(endDateDateToWorkWith.clone().add(1, "jMonth"));
                        }}
                        onMonthDec={() => {
                          setEndDateDateToWorkWith(
                            endDateDateToWorkWith.clone().subtract(1, "jMonth")
                          );
                        }}
                        isRangeEnabled={false}
                        // canOnlySelectOneDayWhenRangeIsDisabled={true}
                        filledDays={[]}
                        alreadyReservedDays={[]}
                        peakDays={[]}
                        fastReserveDays={[]}
                        discounted_days={[]}
                        special_dates={[]}
                        offDays={[]}
                        prices={{
                          extra_guests_price: 0,
                          monthly_discount: 0,
                          peak_price: 0,
                          week_price: 0,
                          weekend_price: 0,
                          weekly_discount: 0,
                        }}
                        canSelectDay={true}
                        showNavigateToPrevMonthBtn={true}
                        showNavigateToNextMonthBtn={true}
                        onlyShowCalendarDateNumber={true}
                        noCoOperation={false}
                        selectedIndividualDays={endDate}
                        setSelectedIndividualDays={setEndDate}
                        checkForAlreadyReservedDatesOrFilledDatesValidity={true}
                        canSelectMonth={true}
                        onDaySelectCb={() => {
                          if (endDate.length) {
                            setEndDate((endDate) => endDate.slice(1));
                          }
                          setShowCalendarEndDate(false);
                        }}
                      />
                      <div className="flex items-center justify-between mt-16">
                        <div className="flex items-center gap-x-8">
                          {/* <Button
                        rounded
                        color="grey"
                        onClick={() => resetAllSelectedDays()}
                        className="!px-10"
                      >
                        انصراف
                      </Button> */}
                          <Button
                            onClick={() => {
                              setShowCalendarEndDate(false);
                            }}
                            rounded
                            color="dark-blue"
                          >
                            تایید تاریخ
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </OutsideClickHandler>
              </div>
              <Button
                onClick={() => {
                  // getCheckoutsListRefetch();
                  setShowGetCheckoutsList(true);
                }}
              >
                مشاهده
              </Button>
            </div>
            <div className="flex items-center gap-x-12">
              <Button
                disabled={!tableSelectedItems.length}
                rounded
                onClick={() => setShowGroupSettlementModal(true)}
                color="dark-blue"
              >
                تسویه حساب گروهی
              </Button>
              <CSVLink
                data={getcsv(
                  bankFileOutput,
                  tableSelectedItems.length ? tableSelectedItems : tableData
                )}
              >
                <Button disabled={!tableSelectedItems.length} rounded color="light-blue">
                  خروجی فایل بانکی
                </Button>
              </CSVLink>
              <CSVLink
                data={getcsv(headers, tableSelectedItems.length ? tableSelectedItems : tableData)}
              >
                <Button rounded variant="outlined" color="dark-blue">
                  خروجی اکسل
                </Button>
              </CSVLink>
            </div>
          </div>
          <Table
            tableData={tableData}
            setTableData={setTableData}
            hasFooter={true}
            onCellClick={tabelCellClicked}
            // footerContent={
            //   tableData.length ? (
            //     <div className="flex justify-between gap-x-50 items-center">
            //       {getTotalAmountCalculation(tableData).map((content) => (
            //         <span className="text-white" key={content}>
            //           {content}
            //         </span>
            //       ))}
            //     </div>
            //   ) : (
            //     ""
            //   )
            // }
            tableSettings={tableSettings}
            ref={tableRef}
            columns={headers}
            selectedTableData={tableSelectedItems}
          />
          {showGroupSettlementModal && (
            <GroupSettlementModal
              getCheckoutsListRefetch={getCheckoutsListRefetch}
              tableSelectedItems={tableSelectedItems}
              showGroupSettlementModal={showGroupSettlementModal}
              setShowGroupSettlementModal={setShowGroupSettlementModal}
            />
          )}

          {showPaymentInformationModal && selectedRow && (
            <PaymentInformationModal
              getCheckoutsListRefetch={getCheckoutsListRefetch}
              order={selectedRow}
              showPaymentInformationModal={showPaymentInformationModal}
              setShowPaymentInformationModal={setShowPaymentInformationModal}
            />
          )}
        </div>
      )}
      {!hasPermission && !permissionIsLoading && <Inaccessibility />}
    </>
  );
}

export default Deposit;
