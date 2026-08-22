import ModalWrapper from "@/components/General/core/ModalWrapper";
import { Dispatch, SetStateAction, useState } from "react";
import DropDown from "../General/core/DropDown";
import { I_Deposit_Settlement_Method } from "@/interfaces/Deposit";
import { settlement_methods_list } from "@/constants/settlement_method_list";
import Cart from "components/General/core/DropDown/DropdownCart";
import Image from "next/image";
import PaymentInfo from "./PaymentInfo";
import InfoTag from "./InfoTag";
import HostInfoForm from "./HostInfoForm";
import SalesTeamDescriptionForm from "./SalesTeamDescriptionForm";
import Remainder from "./unsettled/Remainder";
import HostDebitDeduction from "./unsettled/HostDebitDeduction";
import Deposit from "./unsettled/Deposit";
import UpdateRemainderModal from "./UpdateRemainderModal";
import { IPayment, IRemainderUpdate, ISettlementStatus, TableItem } from ".";
import NameValueCart from "../General/core/NameValueCart";
import SettlementStatusTag from "./SettlementStatusTag";
import { copyToClipboard } from "@/utilities/copyToClipboard";
// import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
// import exception from "@/utilities/exception";
import Tooltip from "../General/Tooltip";
// import dynamic from "next/dynamic";

// const Tooltip = dynamic(() => import("@/components/General/Tooltip/index"), {
//   ssr: true,
// });

function PaymentInformationModal({
  getCheckoutsListRefetch,
  order,
  showPaymentInformationModal,
  setShowPaymentInformationModal,
}: {
  getCheckoutsListRefetch: any;
  order: TableItem;
  showPaymentInformationModal: boolean;
  setShowPaymentInformationModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [settlementMethod, setSettlementMethod] =
    useState<I_Deposit_Settlement_Method>("remainder");
  const [showUpdateRemainderModal, setShowUpdateRemainderModal] = useState<boolean>(false);
  const [copiedTooltipPosition, setCopiedTooltipPosition] = useState({ x: 0, y: 0 });

  const handleDisplayCopiedTooltip = (event: React.MouseEvent) => {
    setCopiedTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <>
      <ModalWrapper
        onClose={() => {
          setShowPaymentInformationModal(false);
        }}
        open={showPaymentInformationModal}
        bodyContainerClassname="md:!pb-[20px] flex item-center justify-center"
        modalClassname="md:!w-[1100px] md:max-h-[92%] md:h-full !overflow-y-hidden"
        headerTitle="اطلاعات پرداخت"
        headerContainerClassname="!z-[8] !bg-transparent"
        modalHeaderWrapper="!bg-transparent !justify-start !px-24"
      >
        {showPaymentInformationModal ? "true" : "false"}
        <div className="bg-gradient-to-r from-pink-300 via-purple-200 to-blue-400 w-full h-[30%] absolute right-0 top-0 z-[7]"></div>
        <div className="bg-white p-16 grid grid-cols-12 gap-x-20 rounded-20 absolute top-60 z-10 w-[95%] border border-gray-E8E8E8">
          <div className="col-span-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-20">
                <h2 className="text-17 font-m leading-24 text-black">صورتحساب</h2>
                {/* <span className="rounded-8 py-6 px-12 bg-red-main text-white">تسویه نشده</span> */}
                <SettlementStatusTag tagValue={order?.settlement_status as ISettlementStatus} />
              </div>
              <div className="flex items-center gap-x-8 mb-6 px-16 py-6 rounded-8 border border-gray-C4CAD3 mt-4">
                <p className="text-13 font-r text-black leading-16">کد رزرو :</p>
                <p className="text-15 font-r text-black leading-20">{order?.order_reference}</p>
                {/* <span
                    onClick={(e) => {
                      copyToClipboard(order?.host_phone);
                      // exception.message([
                      //   {
                      //     type: EXCEPTIONTYPES.SUCCESS,
                      //     title: "شماره تلفن میزبان با موفقیت کپی شد.",
                      //   },
                      // ]);
                      handleDisplayCopiedTooltip(e);
                    }}
                    className="d-flex justify-center items-center p-10 hover:bg-slate-200 rounded-[50%]"
                  >
                    <i className="icon- text-black text-24"></i>
                  </span> */}
                <Image
                  onClick={(e) => {
                    copyToClipboard(order?.order_reference);
                    // exception.message([
                    //   { type: EXCEPTIONTYPES.SUCCESS, title: "نام میزبان با موفقیت کپی شد." },
                    // ]);
                    handleDisplayCopiedTooltip(e);
                  }}
                  src="/assets/non-icomoon-icons/copy2.svg"
                  width={24}
                  height={24}
                  alt="copy"
                />
              </div>
            </div>
            <div className="flex items-center gap-x-8 my-16">
              <InfoTag
                tagName="سهم سیستمی میزبان : "
                tagValue={order.host_portion.toLocaleString("en-US")}
                rounded={true}
              />
              <InfoTag
                tagName="بیعانه : "
                tagValue={order.deposit_amount?.toLocaleString("en-US")}
                rounded={true}
              />
              <InfoTag
                onClick={() => setShowUpdateRemainderModal(true)}
                editable={true}
                tagName="مانده واریز : "
                tagValue={order.clear_remainer.toLocaleString("en-US")}
                rounded={true}
              />
            </div>
            <div className="h-[390px] my-10 overflow-y-scroll overflow-x-hidden">
              {order.settlement_status !== "settled" && (
                <div className="bg-white rounded-12 border border-gray-959FA7 p-16 flex flex-col gap-y-16">
                  <h2 className="text-17 font-m leading-24 text-black">تسویه حساب</h2>
                  <DropDown
                    currntValue={settlementMethod}
                    onChange={(e, value, allChildProps) => {
                      setSettlementMethod(allChildProps?.value);
                    }}
                    dropDownItemsWrapperClassName="z-2"
                  >
                    {settlement_methods_list.map((type: any, index: number) => {
                      return (
                        <Cart
                          key={index}
                          value={type?.value}
                          title={type?.name}
                          subText=""
                          type={type?.value}
                          wrapperClassname="cursor-pointer"
                          imageWrapperClassname="!hidden"
                          textWrapperClassname="flex items-center gap-x-40"
                        />
                      );
                    })}
                  </DropDown>
                  {settlementMethod === "remainder" ? (
                    <Remainder getCheckoutsListRefetch={getCheckoutsListRefetch} order={order} />
                  ) : settlementMethod === "host_debit" ? (
                    <HostDebitDeduction
                      getCheckoutsListRefetch={getCheckoutsListRefetch}
                      order={order}
                    />
                  ) : (
                    <Deposit getCheckoutsListRefetch={getCheckoutsListRefetch} order={order} />
                  )}
                </div>
              )}
              <div>
                {order.transactions.map((transaction, index) => (
                  <>
                    {transaction.type === "payment" ? (
                      <PaymentInfo payment={transaction as IPayment} key={index} />
                    ) : (
                      <PaymentInfo remainderUpdate={transaction as IRemainderUpdate} key={index} />
                    )}
                  </>
                ))}
              </div>
              {/* <div>
                {order.remainder_updates.map((remainder, index) => (
                  <PaymentInfo remainderUpdate={remainder} key={index} />
                ))}
              </div> */}
            </div>
          </div>
          <div className="col-span-5 pr-16 border-r border-dashed border-gray-#E8E8E8 flex flex-col gap-y-15">
            <h2 className="text-17 font-m leading-24 text-black">اطلاعات میزبان</h2>
            <div className="flex items-center gap-x-10 justify-start">
              <div className="w-48 h-48 relative">
                <Image
                  className="rounded-[50%] flex-shrink-0"
                  fill
                  alt="hostImage"
                  src={order?.host_image}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-8 mb-6">
                  <p className="text-15 font-r text-blue-main leading-20">{order?.host_name}</p>
                  {/* <span
                    onClick={(e) => {
                      copyToClipboard(order?.host_phone);
                      // exception.message([
                      //   {
                      //     type: EXCEPTIONTYPES.SUCCESS,
                      //     title: "شماره تلفن میزبان با موفقیت کپی شد.",
                      //   },
                      // ]);
                      handleDisplayCopiedTooltip(e);
                    }}
                    className="d-flex justify-center items-center p-10 hover:bg-slate-200 rounded-[50%]"
                  >
                    <i className="icon- text-black text-24"></i>
                  </span> */}
                  <Image
                    onClick={(e) => {
                      copyToClipboard(order?.host_name);
                      // exception.message([
                      //   { type: EXCEPTIONTYPES.SUCCESS, title: "نام میزبان با موفقیت کپی شد." },
                      // ]);
                      handleDisplayCopiedTooltip(e);
                    }}
                    src="/assets/non-icomoon-icons/copy2.svg"
                    width={24}
                    height={24}
                    alt="copy"
                  />
                </div>
                <div className="flex items-center gap-x-8">
                  <p className="text-13 leading-16 text-black font-medium">{order?.host_phone}</p>
                  {/* <span
                    onClick={(e) => {
                      copyToClipboard(order?.host_phone);
                      // exception.message([
                      //   {
                      //     type: EXCEPTIONTYPES.SUCCESS,
                      //     title: "شماره تلفن میزبان با موفقیت کپی شد.",
                      //   },
                      // ]);
                      handleDisplayCopiedTooltip(e);
                    }}
                    className="d-flex justify-center items-center p-10 hover:bg-slate-200 rounded-[50%]"
                  >
                    <i className="icon-Hide text-black text-24"></i>
                  </span> */}
                  <Image
                    onClick={(e) => {
                      copyToClipboard(order?.host_phone);
                      // exception.message([
                      //   {
                      //     type: EXCEPTIONTYPES.SUCCESS,
                      //     title: "شماره تلفن میزبان با موفقیت کپی شد.",
                      //   },
                      // ]);
                      handleDisplayCopiedTooltip(e);
                    }}
                    src="/assets/non-icomoon-icons/copy2.svg"
                    width={24}
                    height={24}
                    alt="copy"
                  />
                </div>
              </div>
            </div>
            {order?.host_debit && (
              <NameValueCart
                name="بدهی میزبان"
                value={order?.host_debit.toLocaleString("en-US")}
                wrapperClassname="!bg-red-light"
                valueClassname="text-red-main"
                copyable={false}
              />
            )}
            <HostInfoForm getCheckoutsListRefetch={getCheckoutsListRefetch} order={order} />
          </div>
          <SalesTeamDescriptionForm
            getCheckoutsListRefetch={getCheckoutsListRefetch}
            order={order}
          />
        </div>
      </ModalWrapper>
      {showUpdateRemainderModal && (
        <UpdateRemainderModal
          getCheckoutsListRefetch={getCheckoutsListRefetch}
          order={order}
          showUpdateRemainderModal={showUpdateRemainderModal}
          setShowUpdateRemainderModal={setShowUpdateRemainderModal}
        />
      )}
      {copiedTooltipPosition.x !== 0 && copiedTooltipPosition.y !== 0 && (
        <Tooltip
          icon="icon-Success"
          text="کپی شد"
          x={copiedTooltipPosition.x - 30}
          y={copiedTooltipPosition.y - 48}
        />
      )}
    </>
  );
}

export default PaymentInformationModal;
