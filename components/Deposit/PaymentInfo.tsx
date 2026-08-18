import Image from "next/image";
import { IPayment, IRemainderUpdate } from ".";
import { momentToJalaliWithTime3 } from "@/utilities/dateTools";
import moment from "moment-jalaali";
import InfoTag from "./InfoTag";
import { copyToClipboard } from "@/utilities/copyToClipboard";
// import classes from "@/styles/line-clamps.module.css";
// import exception from "@/utilities/exception";
// import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import Tooltip from "../General/Tooltip";
import { useState } from "react";

function PaymentInfo({
  payment,
  remainderUpdate,
}: {
  payment?: IPayment;
  remainderUpdate?: IRemainderUpdate;
}) {
  const [copiedTooltipPosition, setCopiedTooltipPosition] = useState({ x: 0, y: 0 });

  const handleDisplayCopiedTooltip = (event: React.MouseEvent) => {
    setCopiedTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <>
      {payment && (
        <div className={`border bg-green-light border-green-main rounded-16 py-6 px-10 mb-8`}>
          <div className="flex justify-between items-center">
            <p className="text-black font-m text-14 leading-20">اطلاعات پرداخت</p>
            <div className="flex gap-x-16 items-center">
              <span className="text-black text-11 leading-16 font-m">
                {payment?.date_time ? momentToJalaliWithTime3(moment(payment?.date_time)) : ""}
              </span>
              <InfoTag
                tagName={
                  payment?.payment_type === "deposit"
                    ? "واریز بیعانه"
                    : payment?.payment_type === "remainder"
                    ? "مانده واریز"
                    : payment?.payment_type === "host_debit"
                    ? "کسر بدهی میزبان"
                    : ""
                }
                wrapperClassnames={`${
                  payment?.payment_type === "deposit"
                    ? "!bg-blue-main"
                    : payment?.payment_type === "remainder"
                    ? "bg-green-main"
                    : payment?.payment_type === "host_debit"
                    ? "!bg-tertiary"
                    : ""
                } !px-6 !py-2`}
                tagNameClassnames="text-white !text-11"
              />
            </div>
          </div>
          <div className="flex items-center my-6">
            <span className="pl-28 border-l border-gray-CACFD3 flex items-center">
              <p className="text-gray-616E7C text-12 font-m leading-16 pl-8">مبلغ واریز شده:</p>
              <p className="text-black text-14 font-m leading-20">
                {payment?.amount.toLocaleString()}
              </p>
            </span>
            <span className="pr-28 flex items-center">
              <p className="text-gray-616E7C text-12 font-m leading-16 pl-8">پرداخت کننده:</p>
              <p className="text-black text-14 font-m leading-20">{payment?.payer}</p>
            </span>
          </div>
          {payment?.payment_type !== "host_debit" && (
            <span className="flex items-center gap-x-8 my-4">
              <p className="text-gray-616E7C text-12 font-m leading-16 pl-8">کد پیگیری واریز:</p>
              <p className="text-black text-14 font-m leading-20">{payment?.reference}</p>
              <Image
                onClick={(e) => {
                  copyToClipboard(payment?.reference);
                  // exception.message([
                  //   { type: EXCEPTIONTYPES.SUCCESS, title: "کدپیگیری با موفقیت کپی شد" },
                  // ]);
                  handleDisplayCopiedTooltip(e);
                }}
                src="/assets/non-icomoon-icons/copy2.svg"
                width={16}
                height={16}
                alt="copy"
              />
              {/* <span
                onClick={(e) => {
                  copyToClipboard(payment?.reference);
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
            </span>
          )}
          {payment?.payment_type !== "host_debit" && (
            <span className="flex items-center pt-4 flex-nowrap">
              <p className="text-gray-616E7C text-12 font-m leading-16 pl-8">توضیحات:</p>
              <p className={`text-12 text-black font-m leading-16 OnlyOneLineAndEndWithElipsis`}>
                {payment?.description}
              </p>
            </span>
          )}
        </div>
      )}
      {remainderUpdate && (
        <div className={`border bg-yellow-light border-yellow-main rounded-16 py-6 px-10 mb-8`}>
          <div className="flex justify-between items-center">
            <p className="text-black font-m text-14 leading-20">اطلاعات ویرایش شده</p>
            <div className="flex gap-x-16 items-center">
              <span className="text-black text-11 leading-16 font-m">
                {momentToJalaliWithTime3(moment(remainderUpdate?.date_time))}
              </span>
              <InfoTag
                tagName="ویرایش مانده واریز"
                wrapperClassnames="bg-yellow-main !px-6 !py-2"
                tagNameClassnames="text-white !text-11"
              />
            </div>
          </div>
          <div className="flex items-center my-6">
            <span className="pl-28 border-l border-gray-CACFD3 flex items-center">
              <p className="text-gray-616E7C text-12 font-m leading-16 pl-8">تغییر مبلغ:</p>
              <p className="text-black text-14 font-m leading-20">
                {remainderUpdate?.amount.toLocaleString()}
              </p>
            </span>
            <span className="pr-28 flex items-center">
              <p className="text-gray-616E7C text-12 font-m leading-16 pl-8">ویرایشگر:</p>
              <p className="text-black text-14 font-m leading-20">{remainderUpdate?.payer}</p>
            </span>
          </div>
          <span className="flex items-center pt-4 flex-nowrap">
            <p className="text-gray-616E7C text-12 font-m leading-16 pl-8">دلیل ویرایش:</p>
            <p className={`text-12 text-black font-m leading-16 OnlyOneLineAndEndWithElipsis`}>
              {remainderUpdate?.description}
            </p>
          </span>
        </div>
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

export default PaymentInfo;
