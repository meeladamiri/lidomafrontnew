import { getCancelQuote, guestCancelsReserve } from "@/api/MyTrips";
import { invalidateReservationViews } from "@/utilities/reservationCache";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import exception from "@/utilities/exception";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { useRouter } from "next/router";
import { useState } from "react";
import { Checkbox } from "../General/core/Checkbox";
import { Textarea } from "../General/core/Textarea";

const guest_reasons_to_cancel = [
  {
    text: "تأیید میزبان خیلی طول کشید",
    id: 1,
  },
  {
    text: "از انجام سفر منصرف شدم",
    id: 2,
  },
  {
    text: "در ثبت اطلاعات دچار اشتباه شده ام",
    id: 3,
  },
  {
    text: "اقامتگاه دیگری در لیدوما پیدا کردم",
    id: 4,
  },
  {
    text: "نیاز به ارتباط مستقیم با میزبان داشتم ",
    id: 5,
  },
  {
    text: "از عملکرد لیدوما و میزبان راضی نیستم",
    id: 6,
  },
  {
    text: "پشتیبانی سایت پاسخگو نبود",
    id: 7,
  },
  {
    text: "از سایت دیگری رزرو را انجام دادم",
    id: 8,
  },
  {
    text: "با قیمت تمام شده رزرو مشکل داشتم",
    id: 9,
  },
  {
    text: "در پرداخت مشکل داشتم",
    id: 10,
  },
  {
    text: "سایر دلایل",
    id: 0, // NOTE: Leave id 0 for custom reason.
  },
];

function GuestWantsToCancelBottomSheet({
  handleSmoothClose,
  reserveId,
}: {
  handleSmoothClose: THandleSmoothClose;
  reserveId: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetched as soon as the sheet opens, so the number is on screen while the
  // guest is still choosing — not after they have committed.
  const { data: quote } = useQuery(["cancelQuote", reserveId], () => getCancelQuote(reserveId));

  const [selectedReasons, setSelectedReasons] = useState<{ text: string; id: number }[]>([]);
  const [customReason, setCustomReason] = useState<string>("");

  const guestCancelsReserveMutation = useMutation(
    () => {
      return guestCancelsReserve({
        order_id: reserveId,
        reason: [
          ...selectedReasons.map((r) => {
            if (r.id === 0) return customReason;
            return r.text;
          }),
        ].join("-"),
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          invalidateReservationViews(queryClient);

          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "رزرو شما با موفقیت لغو شد." },
          ]);

          handleSmoothClose();

          // As Mr. Rezaee said in figma. -- Milad changed it.
          // router.push("/");
        } else {
          exception.message([
            {
              type: EXCEPTIONTYPES.ERROR,
              title: data?.err_msg || defaultError,
            },
          ]);
        }
      },
    }
  );

  return (
    <div className="relative pb-74 max-h-[480px] overflow-y-auto">
      {!!quote && (
        <div className="mb-12 rounded-12 border-1 border-solid border-gray-CACFD3 p-12">
          <p className="text-13 leading-20 font-m text-black mb-6">صورتحساب لغو</p>
          <div className="flex items-center justify-between text-12 leading-22 text-gray-6C6A7D">
            <span>مبلغ پرداختی شما</span>
            <span className="text-black">{quote.paidAmount.toLocaleString("fa-IR")} تومان</span>
          </div>
          <div className="flex items-center justify-between text-12 leading-22 text-gray-6C6A7D">
            <span>کسر طبق مقررات</span>
            <span className="text-[#C62828]">− {quote.penalty.toLocaleString("fa-IR")} تومان</span>
          </div>
          <div className="flex items-center justify-between text-13 leading-24 font-m border-t-1 border-solid border-gray-CACFD3 mt-6 pt-6">
            <span className="text-black">بازگشت به کیف پول شما</span>
            <span className="text-[#2E7D32]">{quote.refund.toLocaleString("fa-IR")} تومان</span>
          </div>
          {quote.explanation.map((line, i) => (
            <p key={i} className="mt-4 text-11 leading-18 text-gray-9B9BAA">
              · {line}
            </p>
          ))}
        </div>
      )}
      <div>
        {guest_reasons_to_cancel.map((guest_reason, i: number) => {
          return (
            <div
              key={i}
              className="p-12 border-1 border-solid border-gray-CACFD3 rounded-12 mb-4 last:mb-0"
            >
              <Checkbox
                onChange={(e) => {
                  // console.log("e.target.value", e.target.checked);
                  if (!!e.target.checked) {
                    setSelectedReasons((prev) => [...prev, guest_reason]);
                  } else {
                    setSelectedReasons((prev) => [
                      ...prev.filter((el) => el.id !== guest_reason.id),
                    ]);
                  }
                }}
                disabled={false}
                label={guest_reason.text}
                checked={!!selectedReasons.find((el) => el.id === guest_reason.id)}
              />
            </div>
          );
        })}
      </div>

      {selectedReasons.find((el) => el.id === 0) && (
        <div className="mt-8">
          <Textarea
            name={"guest-custom-cancel-reason"}
            customValue={customReason}
            customOnChange={(value) => setCustomReason(value)}
            placeholder={`لطفاً دلیل رد درخواست را شرح دهید`}
            //   maxCharsN={11}
            //   fillFrom="ltr"
            labelClassname="!mb-8"
            rows={4}
          />
        </div>
      )}

      <div className="bg-white py-16 px-20 fixed bottom-0 right-0 left-0 z-2 md:rounded-br-20 md:rounded-bl-20">
        <div className="grid grid-cols-3 gap-x-12">
          <div className="col-span-1">
            <Button isFullWidth color="grey" onClick={handleSmoothClose} type="button">
              انصراف
            </Button>
          </div>
          <div className="col-span-2">
            <Button
              isFullWidth
              type="submit"
              disabled={
                selectedReasons.length === 0 ||
                (!!selectedReasons.find((el) => el.id === 0) && !customReason)
              }
              color="error"
              isLoading={guestCancelsReserveMutation.isLoading}
              onClick={() => {
                guestCancelsReserveMutation.mutate();
              }}
            >
              لغو نهایی رزرو
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default GuestWantsToCancelBottomSheet;
