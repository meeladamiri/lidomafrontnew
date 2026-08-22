import PageTitle from "components/General/PageTitle";
import { Button } from "components/General/core/Button";
import { useEffect, useMemo, useState } from "react";
import BankCart from "components/Wallet/BankCart";
import Divider from "components/General/Divider";
import BankInfoSection from "components/Wallet/BankInfoSection";
import TransactionsList from "components/Wallet/TransactionsList";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import dynamic from "next/dynamic";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { VALIDATION_MESSAGES } from "constants/enums/validation_messages";
import { getWalletAndTransactions, IUpdateBankInfo, IWalletData, updateBankInfo } from "api/Wallet";
import { miladiToJalaliWithTime2 } from "utilities/dateTools";
import exception from "@/utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { WalletPageSkeleton } from "./Skeletons/WalletPageSkeleton";

const CartNumberBottomSheet = dynamic(() => import("components/Wallet/CartNumberBottomSheet"), {
  ssr: true,
});
const CartOwnerNameBottomSheet = dynamic(
  () => import("components/Wallet/CartOwnerNameBottomSheet"),
  {
    ssr: true,
  }
);
const ShabaBottomSheet = dynamic(() => import("components/Wallet/ShabaBottomSheet"), {
  ssr: true,
});
const ShabaAccountOwnerNameBottomSheet = dynamic(
  () => import("components/Wallet/ShabaAccountOwnerNameBottomSheet"),
  {
    ssr: true,
  }
);
const IncreaseWalletModal = dynamic(() => import("components/Wallet/IncreaseWalletModal"), {
  ssr: true,
});
const TasfieBottomSheet = dynamic(() => import("./TasfieBottomSheet"), {
  ssr: true,
});
const BottomSheet = dynamic(() => import("components/General/core/BottomSheet"), {
  ssr: true,
});

const yupSchema = {
  cartOwner: Yup.string(),
  // .required(VALIDATION_MESSAGES.REQUIRED),
  cartNumber: Yup.number()
    // .required(VALIDATION_MESSAGES.REQUIRED)
    .typeError(VALIDATION_MESSAGES.REQUIRED)
    .max(9999_9999_9999_9999, VALIDATION_MESSAGES.BANKCARTNUMBER)
    .min(1000_0000_0000_0000, VALIDATION_MESSAGES.BANKCARTNUMBER),
  shaba: Yup.string()
    // .required(VALIDATION_MESSAGES.REQUIRED)
    .max(24, VALIDATION_MESSAGES.SHABANUMBER)
    .min(24, VALIDATION_MESSAGES.SHABANUMBER)
    .matches(/^\d{24}$/, VALIDATION_MESSAGES.ONLY_EN_NUMBERS),
  shabaOwnerName: Yup.string(),
  // .required(VALIDATION_MESSAGES.REQUIRED),
};

interface IWalletInfoInitV {
  cartOwner: string;
  cartNumber: string;
  shaba: string;
  shabaOwnerName: string;
}

function Wallet() {
  const [showCartNumberBottomSheet, setShowCartNumberBottomSheet] = useState<boolean>(false);
  const [showCartOwnerNameBottomSheet, setShowCartOwnerNameBottomSheet] = useState<boolean>(false);
  const [showShabaBottomSheet, setShowShabaBottomSheet] = useState<boolean>(false);
  const [showShabaAccountOwnerNameBottomSheet, setShowShabaAccountOwnerNameBottomSheet] =
    useState<boolean>(false);

  const [initialValues, setInitialValues] = useState<IWalletInfoInitV>({
    cartOwner: "",
    cartNumber: "",
    shaba: "",
    shabaOwnerName: "",
  });

  const [showTasfieBottomSheet, setShowTasfieBottomSheet] = useState<boolean>(false);

  const [showIncreaseWalletModal, setShowIncreaseWalletModal] = useState(false);

  const [walletData, setWalletData] = useState<IWalletData>();

  const { isSuccess, isLoading, data, refetch } = useQuery(
    ["getWalletAndTransactions"],
    () => {
      return getWalletAndTransactions();
    },
    {
      onSuccess: (data) => {},
    }
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        setWalletData(data?.params);
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data]);

  const updateBankInfoMutation = useMutation(
    ({ cartNumber, cartOwnerName, shabaNumber, shabaOwnerName }: IUpdateBankInfo) => {
      return updateBankInfo({
        cartNumber,
        cartOwnerName,
        shabaNumber,
        shabaOwnerName,
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          // Closing open bottom sheet
          setShowCartNumberBottomSheet(false);
          setShowCartOwnerNameBottomSheet(false);
          setShowShabaBottomSheet(false);
          setShowShabaAccountOwnerNameBottomSheet(false);

          refetch();
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      // console.log("At updateBankInfoMutation, values are: ", values);
      updateBankInfoMutation.mutate({
        cartNumber: values.cartNumber,
        cartOwnerName: values?.cartOwner,
        shabaNumber: values.shaba,
        shabaOwnerName: values.shabaOwnerName,
      });
    },
    validationSchema: Yup.object(yupSchema),
    enableReinitialize: true,
  });

  useEffect(() => {
    // console.log("Inside useEffect");
    if (!!walletData && !!walletData.bank_account) {
      // console.log("Inside useEffect, setting state");
      setInitialValues({
        cartOwner: walletData?.bank_account.credit_owner || "",
        cartNumber: walletData?.bank_account.credit_number || "",
        shaba: walletData?.bank_account.shaba_number || "",
        shabaOwnerName: walletData?.bank_account.shaba_owner || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    walletData?.bank_account.credit_number,
    walletData?.bank_account.credit_owner,
    walletData?.bank_account.shaba_number,
    walletData?.bank_account.shaba_owner,
  ]);

  const pageIsNotReady: boolean = useMemo(() => {
    return isLoading || !walletData;
  }, [isLoading, walletData]);

  return (
    <>
      <div className="pb-40">
        <PageTitle
          title="کیف پول"
          icon={<i className="icon-message text-24 md:hidden" />}
          containerClassname="mb-16  md:px-0"
        />

        {pageIsNotReady ? (
          <WalletPageSkeleton />
        ) : (
          <div className="grid grid-cols-14 md:gap-x-16">
            <div className="col-span-full md:col-span-6 md:p-24 md:border-gray-CACFD3 md:border-solid md:border-1 md:rounded-20 max-h-[820px]">
              <div className="mb-16  md:px-0">
                <BankCart
                  cartNumber={walletData?.bank_account?.credit_number || ""}
                  cartOwnerName={walletData?.bank_account?.credit_owner || ""}
                  shaba={walletData?.bank_account?.shaba_number || ""}
                />
              </div>

              <div className="mb-24 md:mb-16  md:px-0">
                <div className="text-16 leading-28 text-zilgara flex items-center justify-between mb-12">
                  <p className="">موجودی قابل برداشت</p>
                  <p className="flex items-center gap-x-4">
                    <span>{Number(walletData?.credit_balance || 0).toLocaleString("en-US")}</span>
                    <span>تومان</span>
                  </p>
                </div>

                <div className="text-14 leading-24 font-l text-zilgara flex items-center justify-between mb-12">
                  <p className="">موجودی بلاک شده</p>
                  <p className="flex items-center gap-x-4">
                    <span>{Number(walletData?.blocked_balance || 0).toLocaleString("en-US")}</span>
                    <span>تومان</span>
                  </p>
                </div>

                <div className="text-14 leading-24 font-l text-zilgara flex items-center justify-between">
                  <p className="">اعتبار هدیه</p>
                  <p className="flex items-center gap-x-4">
                    <span>{Number(walletData?.gift_balance || 0).toLocaleString("en-US")}</span>
                    <span>تومان</span>
                  </p>
                </div>
              </div>

              <div className="mb-24  md:px-0">
                <Button
                  isFullWidth
                  className="mb-12"
                  onClick={() => setShowIncreaseWalletModal(true)}
                >
                  افزایش موجودی کیف پول
                </Button>

                <Button isFullWidth color="grey" onClick={() => setShowTasfieBottomSheet(true)}>
                  درخواست تسویه کیف پول
                </Button>
              </div>

              <Divider className="md:hidden" />

              <div className="py-24  md:px-0 md:py-0">
                <BankInfoSection
                  cartNumber={walletData?.bank_account?.credit_number || ""}
                  cartOwnerName={walletData?.bank_account?.credit_owner || ""}
                  shaba={walletData?.bank_account?.shaba_number || ""}
                  shabaOwner={walletData?.bank_account?.shaba_owner || ""}
                  setShowCartNumberBottomSheet={setShowCartNumberBottomSheet}
                  setShowShabaBottomSheet={setShowShabaBottomSheet}
                  setShowCartOwnerNameBottomSheet={setShowCartOwnerNameBottomSheet}
                  setShowShabaAccountOwnerNameBottomSheet={setShowShabaAccountOwnerNameBottomSheet}
                />
              </div>

              <Divider className="md:hidden" />
            </div>

            <div className="col-span-full md:col-span-8 md:px-24 md:pt-16 md:pb-16 md:border-gray-CACFD3 md:border-solid md:border-1 md:rounded-20 md:max-h-[820px]">
              <div className="py-24  md:px-0 md:py-0 h-full overflow-y-auto">
                <PageTitle
                  title="تراکنش ها"
                  icon={<i className="icon-Pay text-24" />}
                  containerClassname="mb-16"
                />

                <TransactionsList
                  transactions={
                    walletData?.transactions.map((t, i) => ({
                      isFailed: t.status !== "success",
                      // failureReason: string, TODO: backend hanuz ino nadade
                      price: t.amount,
                      transferredTo: t.destination || "",
                      reserveCode: t.reserve_code,
                      date: miladiToJalaliWithTime2(t.date),
                    })) || []
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {!!showCartNumberBottomSheet && (
        <BottomSheet
          open={showCartNumberBottomSheet}
          handleClose={() => setShowCartNumberBottomSheet(false)}
          headerTitle="شماره کارت"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <CartNumberBottomSheet
                handleSmoothClose={handleSmoothClose}
                name="cartNumber"
                formik={formik}
              />
            );
          }}
        />
      )}

      {!!showCartOwnerNameBottomSheet && (
        <BottomSheet
          open={showCartOwnerNameBottomSheet}
          handleClose={() => setShowCartOwnerNameBottomSheet(false)}
          headerTitle="صاحب کارت"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <CartOwnerNameBottomSheet
                handleSmoothClose={handleSmoothClose}
                name="cartOwner"
                formik={formik}
              />
            );
          }}
        />
      )}

      {showShabaBottomSheet && (
        <BottomSheet
          open={showShabaBottomSheet}
          handleClose={() => setShowShabaBottomSheet(false)}
          headerTitle="شماره شبا"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <ShabaBottomSheet
                handleSmoothClose={handleSmoothClose}
                name="shaba"
                formik={formik}
              />
            );
          }}
        />
      )}

      {!!showShabaAccountOwnerNameBottomSheet && (
        <BottomSheet
          open={showShabaAccountOwnerNameBottomSheet}
          handleClose={() => setShowShabaAccountOwnerNameBottomSheet(false)}
          headerTitle="صاحب شبا"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <ShabaAccountOwnerNameBottomSheet
                handleSmoothClose={handleSmoothClose}
                name="shabaOwnerName"
                formik={formik}
              />
            );
          }}
        />
      )}

      {!!showIncreaseWalletModal && (
        <IncreaseWalletModal
          setShowIncreaseWalletModal={setShowIncreaseWalletModal}
          showIncreaseWalletModal={showIncreaseWalletModal}
          balance={walletData?.credit_balance || 0}
        />
      )}

      {!!showTasfieBottomSheet && (
        <BottomSheet
          open={showTasfieBottomSheet}
          handleClose={() => setShowTasfieBottomSheet(false)}
          headerTitle="تسویه کیف پول"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <TasfieBottomSheet
                credit_balance={walletData?.credit_balance || 0}
                handleSmoothClose={handleSmoothClose}
              />
            );
          }}
        />
      )}
    </>
  );
}

export default Wallet;
