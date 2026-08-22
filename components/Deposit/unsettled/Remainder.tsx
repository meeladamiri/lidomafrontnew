import { Radio } from "@/components/General/core/Radio";
import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { IRemainderInitV, I_Deposit_Method } from "@/interfaces/Deposit";
import { TextField } from "components/General/core/TextField";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import NameValueCart from "@/components/General/core/NameValueCart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IDepositSaveSettleInfo, depositSaveSettleInfo } from "@/api/Deposit/depositSaveSettleInfo";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { TableItem } from "..";
import { Button } from "@/components/General/core/Button";

const remainderInitV: IRemainderInitV = {
  amount: 0,
  reference: "",
  desc: "",
};

const depositYupSchema = {
  amount: Yup.number().required(VALIDATION_MESSAGES.REQUIRED),
  reference: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  desc: Yup.string(),
};

function Remainder({
  order,
  getCheckoutsListRefetch,
}: {
  order: TableItem;
  getCheckoutsListRefetch: any;
}) {
  const [depositMethod, setDepositMethod] = useState<I_Deposit_Method>("shaba");
  const [remainderV, setRemainderV] = useState<IRemainderInitV>(remainderInitV);
  const queryClient = useQueryClient();

  const remainderMutation = useMutation(
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

  const remainder_formik = useFormik({
    initialValues: remainderV,
    validationSchema: Yup.object(depositYupSchema),
    onSubmit: (values) => {
      remainderMutation.mutate({
        order_id: order?.order_id,
        amount: order?.clear_remainer,
        type: "remainder",
        desc: values.desc,
        reference: values.reference,
        pay_with: depositMethod,
      });
      // setRemainderV({
      //   amount: 0,
      //   desc: "",
      //   reference: "",
      // });
      remainder_formik.resetForm();
    },
    enableReinitialize: true,
  });

  return (
    <>
      <NameValueCart
        name="مانده واریز"
        value={order?.clear_remainer?.toLocaleString("en-US")}
        valueClassname="text-green-main"
      />
      <div>
        <TextField
          formik={remainder_formik}
          name="reference"
          label="کد پیگیری واریز"
          labelInBorder
          isFullWidth
        />
      </div>
      <div>
        <TextField
          formik={remainder_formik}
          name="desc"
          label="یادداشت واریز"
          labelInBorder
          isFullWidth
        />
      </div>
      <div className="flex gap-x-20 items-center">
        <p className="text-13 font-r leading-16 text-gray-#959FA7">واریز از طریق:</p>
        <Radio
          label="شبا"
          name="shaba"
          value="shaba"
          look={"selected"}
          onChange={(e) => {
            setDepositMethod(e.target.value as "shaba");
          }}
          checked={depositMethod === "shaba"}
          color="blue"
        />
        <Radio
          label="کارت"
          name="card"
          value="card"
          look={"selected"}
          onChange={(e) => {
            setDepositMethod(e.target.value as "card");
          }}
          checked={depositMethod === "card"}
          color="blue"
        />
      </div>
      <div className="flex items-center gap-x-8">
        <Button className="px-50" rounded variant="contained" color="grey">
          انصراف
        </Button>
        <Button
          // type="submit"
          onClick={() => remainder_formik.handleSubmit()}
          className="px-50"
          rounded
          variant="contained"
          color="dark-blue"
          disabled={!remainder_formik.values.reference}
        >
          تسویه
        </Button>
      </div>
    </>
  );
}

export default Remainder;
