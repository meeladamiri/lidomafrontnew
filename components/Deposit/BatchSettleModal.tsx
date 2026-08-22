import ModalWrapper from "@/components/General/core/ModalWrapper";
import { Dispatch, SetStateAction, useState } from "react";
import { TextField } from "../General/core/TextField";
import { Button } from "../General/core/Button";
import InfoTag from "./InfoTag";
import { TableItem } from ".";
import * as Yup from "yup";
import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import exception from "@/utilities/exception";
import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IBatchSettleInitV } from "@/interfaces/Deposit";
import {
  IDepositSaveBatchSettle,
  depositSaveBatchSettle,
} from "@/api/Deposit/depositSaveBatchSettle";

const batchSettleInitV: IBatchSettleInitV = {
  reference: "",
  desc: "",
};

const batchSettleYupSchema = {
  reference: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  desc: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
};

function BatchSettleModal({
  getCheckoutsListRefetch,
  tableSelectedItems,
  showGroupSettlementModal,
  setShowGroupSettlementModal,
}: {
  getCheckoutsListRefetch: any;
  tableSelectedItems: TableItem[];
  showGroupSettlementModal: boolean;
  setShowGroupSettlementModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [batchSettleV, setBatchSettleV] = useState<IBatchSettleInitV>(batchSettleInitV);
  const queryClient = useQueryClient();
  const totalClearRemainder = tableSelectedItems.reduce(
    (prev, item) => prev + item.clear_remainer,
    0
  );

  const depositMutation = useMutation(
    ({ order_ids, amount, desc, reference }: IDepositSaveBatchSettle) => {
      return depositSaveBatchSettle({
        order_ids,
        amount,
        desc,
        reference,
      });
    },
    {
      onSuccess: (resp) => {
        if (resp?.result === "success") {
          getCheckoutsListRefetch();
          // queryClient.invalidateQueries(["getCheckoutsList"]);
          // queryClient.refetchQueries(["getCheckoutsList"])
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "تغییرات با موفقیت اعمال شد" },
          ]);
          setShowGroupSettlementModal(false);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: resp?.err_msg || defaultError }]);
        }
      },
    }
  );

  const batchSettle_formik = useFormik({
    initialValues: batchSettleV,
    validationSchema: Yup.object(batchSettleYupSchema),
    onSubmit: (values) => {
      depositMutation.mutate({
        order_ids: tableSelectedItems.map((item) => item.order_id),
        amount: totalClearRemainder,
        desc: values.desc,
        reference: values.reference,
      });
      // setBatchSettleV({
      //   desc: "",
      //   reference: "",
      // });
      batchSettle_formik.resetForm();
    },
    enableReinitialize: true,
  });

  return (
    <ModalWrapper
      onClose={() => {
        setShowGroupSettlementModal(false);
      }}
      open={showGroupSettlementModal}
      bodyContainerClassname="md:pt-10 md:pb-20"
      modalClassname="md:!w-[720px] md:h-[43%]"
      headerTitle="تسویه حساب گروهی"
    >
      <div className="flex flex-col">
        <div className="mb-16">
          <TextField
            formik={batchSettle_formik}
            name="reference"
            label="کد پیگیری واریز"
            labelInBorder
            isFullWidth
          />
        </div>
        <div className="mb-16">
          <TextField
            formik={batchSettle_formik}
            name="desc"
            label="توضیحات تسویه"
            labelInBorder
            isFullWidth
          />
        </div>
        <div className="flex items-center gap-x-12">
          <InfoTag tagName={`${tableSelectedItems.length} رزرو`} rounded />
          <InfoTag tagName={`${totalClearRemainder.toLocaleString("en-US")} تومان`} rounded />
          <InfoTag tagName={`${(totalClearRemainder * 10).toLocaleString("en-US")} ریال`} rounded />
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-8 mt-24">
        <Button
          onClick={() => setShowGroupSettlementModal(false)}
          className="px-50"
          rounded
          variant="contained"
          color="grey"
        >
          انصراف
        </Button>
        <Button
          // type="submit"
          onClick={() => batchSettle_formik.handleSubmit()}
          className="px-50"
          rounded
          variant="contained"
          color="dark-blue"
          disabled={!batchSettle_formik.values.reference}
        >
          تسویه
        </Button>
      </div>
    </ModalWrapper>
  );
}

export default BatchSettleModal;
