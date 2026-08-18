import { chargeWallet, getPaymentToken, startPay } from "@/api/Payment";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import exception from "@/utilities/exception";
import { useMutation } from "@tanstack/react-query";
import { Button } from "components/General/core/Button";
import ModalWrapper from "components/General/core/ModalWrapper";
import { TextField } from "components/General/core/TextField";
import Image from "next/image";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

type TIncreaseWalletModal = {
  setShowIncreaseWalletModal: (state: boolean) => void;
  showIncreaseWalletModal: boolean;
  balance: number;
};

const Charge_Items = [50_000, 100_000, 150_000];

function IncreaseWalletModal({
  setShowIncreaseWalletModal,
  showIncreaseWalletModal,
  balance,
}: TIncreaseWalletModal) {
  const [chargeAmount, setChargeAmount] = useState<string>("");
  const router = useRouter();

  const tokenRef = useRef<string>();

  const startPayMutation = useMutation(
    ({ token }: { token: string }) => {
      return startPay({ token, return_url: "/wallet" });
    },
    {
      onSuccess: (data) => {
        // console.log("startPay is", data);
        // router.push(
        //   `https://lidomatrip.com/api/payment/start_pay?acquirer_id=13&token=${
        //     tokenRef.current
        //   }&return_url=${"/wallet"}`
        // );
        if (data?.status === "success") {
          // console.log("startPay is", data);
          // router.push(
          //   `http://test.lidomatrip.com/api/payment/start_pay?acquirer_id=13&token=${
          //     tokenRef.current
          //   }&return_url=${"/wallet"}`
          // );
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

  const getPaymentTokenMutation = useMutation(
    ({ order_id }: { order_id: number }) => {
      return getPaymentToken({ order_id });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          // console.log("getPaymentToken is", data);
          // call 'start pay'
          const token: string = data?.params?.token;
          const return_url = "/wallet";
          // console.log("getPaymentToken token is", token);
          tokenRef.current = token;
          // startPayMutation.mutate({ token });
          router.push(
            `https://lidomatrip.com/api/payment/start_pay?acquirer_id=11&token=${token}&return_url=${return_url}`
          );
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

  const increaseWalletMutation = useMutation(
    () => {
      return chargeWallet({ amount: Number(chargeAmount) });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          const order_id = data?.params.order_id;
          // call 'get payment token'
          getPaymentTokenMutation.mutate({ order_id });
        } else {
          exception.message([
            {
              type: EXCEPTIONTYPES.ERROR,
              title: data?.err_msg || "متاسفانه مشکلی رخ داده است. لطفا مجددا تلاش کنید.",
            },
          ]);
        }
      },
    }
  );

  return (
    <ModalWrapper
      headerTitle="کیف پول"
      onClose={() => {
        setShowIncreaseWalletModal(false);
      }}
      open={showIncreaseWalletModal}
      modalClassname="md:!w-[568px]"
    >
      <div className="rounded-12 bg-[url('/assets/Wallet-Effect.svg')] bg-primary-main bg-no-repeat bg-cover py-16">
        <div className="flex justify-end mb-24 px-16">
          <Image
            src={"/assets/logos/Logo-white-landscape.svg"}
            //  objectFit="cover" layout="fill"
            width={102}
            height={24}
            alt="لوگو"
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </div>

        <div className="px-16">
          <div className="flex items-center justify-between text-12 leading-21 text-white drop-shadow-[0px_2px_4px_rgba(0,0,0,0.2)]">
            <p className="">موجودی کیف پول :</p>
            <p className="font-b">{balance?.toLocaleString()} تومان</p>
          </div>
        </div>
      </div>

      <div className="mt-24 pb-32">
        <p className="text-14 leading-24 text-zilgara mb-24">افزایش اعتبار</p>

        <div className="grid grid-cols-3 gap-x-12 mb-16">
          {Charge_Items.map((chargeItem: number, i: number) => {
            return (
              <div
                key={chargeItem}
                className={`
                  cursor-pointer
                  border-1 border-solid py-8 px-16 rounded-6
                  text-12 leading-21 font-m flex items-center gap-x-4 justify-center
                  border-gray-C4CAD3
                `}
                // ${chargeAmount === chargeItem ? "border-black" : "border-gray-C4CAD3"}
                onClick={() => setChargeAmount((prev) => (Number(prev) + chargeItem).toString())}
              >
                <span>{chargeItem.toLocaleString()}</span>
                <span className="font-l">تومان</span>
              </div>
            );
          })}
        </div>

        <p className="text-12 leading-21 text-black mb-8">مبلغ دلخواه</p>
        <TextField
          name="manualAmount"
          customValue={chargeAmount}
          customOnChange={(value) => {
            setChargeAmount(value);
          }}
          placeholder="0"
          leftIcon={<span className="text-12 font-l leading-21 text-black">تومان</span>}
          inputmode="numeric"
          wordifyNumbers
        />
      </div>

      <div className="absolute bottom-16 right-0 left-0 px-20">
        <Button
          isFullWidth
          className=""
          onClick={() => increaseWalletMutation.mutate()}
          disabled={
            !chargeAmount || chargeAmount.split("").every((char) => char === chargeAmount[0])
          }
        >
          افزایش اعتبار
        </Button>
      </div>
    </ModalWrapper>
  );
}
export default IncreaseWalletModal;
