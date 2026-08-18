import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { IHostDebitInitVInitV } from "@/interfaces/Deposit";
import { TextField } from "components/General/core/TextField";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { IDepositSaveSettleInfo, depositSaveSettleInfo } from "@/api/Deposit/depositSaveSettleInfo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TableItem } from "..";
import { Button } from "@/components/General/core/Button";

const hostDebitInitV: IHostDebitInitVInitV = {
  amount: 0,
};

const hostDebitYupSchema = {
  amount: Yup.number().required(VALIDATION_MESSAGES.REQUIRED),
};

function HostDebitDeduction({
  order,
  getCheckoutsListRefetch,
}: {
  order: TableItem;
  getCheckoutsListRefetch: any;
}) {
  const [hostDebitV, setHostDebitV] = useState<IHostDebitInitVInitV>(hostDebitInitV);
  const queryClient = useQueryClient();

  const hostDebitMutation = useMutation(
    ({ order_id, amount, type, desc, reference, pay_with }: IDepositSaveSettleInfo) => {
      return depositSaveSettleInfo({
        order_id,
        amount,
        type,
        desc,
        reference,
        pay_with,
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
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: resp?.err_msg || defaultError }]);
        }
      },
    }
  );

  const hostDebit_formik = useFormik({
    initialValues: hostDebitV,
    validationSchema: Yup.object(hostDebitYupSchema),
    onSubmit: (values) => {
      hostDebitMutation.mutate({
        order_id: order?.order_id,
        amount: Number(values.amount),
        type: "host_debit",
        desc: "",
        reference: "",
        pay_with: "",
      });
      // setHostDebitV({
      //   amount: null,
      // });
      hostDebit_formik.resetForm();
    },
    enableReinitialize: true,
  });

  return (
    <>
      <div>
        <TextField
          formik={hostDebit_formik}
          name="amount"
          inputmode="numeric"
          label="مبلغی که باید کسر شود"
          labelInBorder
          isFullWidth
        />
      </div>
      <div className="flex items-center gap-x-8">
        <Button className="px-50" rounded variant="contained" color="grey">
          انصراف
        </Button>
        <Button
          // type="submit"
          onClick={() => hostDebit_formik.handleSubmit()}
          className="px-50"
          rounded
          variant="contained"
          color="dark-blue"
          disabled={!hostDebit_formik.values.amount}
        >
          کسر بدهی
        </Button>
      </div>
    </>
  );
}

export default HostDebitDeduction;
