import ModalWrapper from "@/components/General/core/ModalWrapper";
import { Dispatch, SetStateAction, useState } from "react";
import { TextField } from "../General/core/TextField";
import { Button } from "../General/core/Button";
import { TableItem } from ".";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { IUpdateRemainderInitV } from "@/interfaces/Deposit";
import {
  IDepositUpdateRemainder,
  depositUpdateRemainder,
} from "@/api/Deposit/depositUpdateRemainder";

const updateRemainderInitV: IUpdateRemainderInitV = {
  amount: 0,
  desc: "",
};

const updateRemainderYupSchema = {
  amount: Yup.number().required(VALIDATION_MESSAGES.REQUIRED),
  desc: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
};

function UpdateRemainderModal({
  getCheckoutsListRefetch,
  order,
  showUpdateRemainderModal,
  setShowUpdateRemainderModal,
}: {
  getCheckoutsListRefetch: any;
  order: TableItem;
  showUpdateRemainderModal: boolean;
  setShowUpdateRemainderModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [updateRemainderV, setUpdateRemainderV] =
    useState<IUpdateRemainderInitV>(updateRemainderInitV);
  const queryClient = useQueryClient();

  const updateRemainderMutation = useMutation(
    ({ order_id, amount, desc }: IDepositUpdateRemainder) => {
      return depositUpdateRemainder({
        order_id,
        amount,
        desc,
      });
    },
    {
      onSuccess: (resp) => {
        if (resp?.result === "success") {
          // queryClient.invalidateQueries(["getCheckoutsList"]);
          // queryClient.refetchQueries(["getCheckoutsList"])
          getCheckoutsListRefetch();
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "تغییرات با موفقیت اعمال شد" },
          ]);
          setShowUpdateRemainderModal(false);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: resp?.err_msg || defaultError }]);
        }
      },
    }
  );

  const formik = useFormik({
    initialValues: updateRemainderV,
    validationSchema: Yup.object(updateRemainderYupSchema),
    onSubmit: (values) => {
      updateRemainderMutation.mutate({
        order_id: order?.order_id,
        amount: values.amount,
        desc: values.desc,
      });
    },
    enableReinitialize: true,
  });

  return (
    <ModalWrapper
      onClose={() => {
        setShowUpdateRemainderModal(false);
      }}
      open={showUpdateRemainderModal}
      bodyContainerClassname="md:pt-10 md:pb-20"
      modalClassname="md:!w-[720px] md:h-[43%]"
      headerTitle="ویرایش مانده واریز"
      backdropClassname="!z-[11]"
    >
      <div className="flex flex-col">
        <div className="mb-16">
          <TextField
            formik={formik}
            name="amount"
            inputmode="numeric"
            label="مانده واریز"
            labelInBorder
            isFullWidth
          />
        </div>
        <div className="mb-16">
          <TextField
            formik={formik}
            name="desc"
            label="دلیل ویرایش مبلغ"
            labelInBorder
            isFullWidth
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-8 mt-24">
        <Button
          onClick={() => setShowUpdateRemainderModal(false)}
          className="px-50"
          rounded
          variant="contained"
          color="grey"
        >
          انصراف
        </Button>
        <Button
          onClick={() => formik.handleSubmit()}
          className="px-50"
          rounded
          variant="contained"
          color="dark-blue"
          disabled={!(formik.values.amount && formik.values.desc)}
        >
          ذخیره
        </Button>
      </div>
    </ModalWrapper>
  );
}

export default UpdateRemainderModal;
