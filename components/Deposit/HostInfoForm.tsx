import { Button } from "@/components/General/core/Button";
import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { IHostInfoInitV } from "@/interfaces/Deposit";
import { TextField } from "components/General/core/TextField";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import NameValueCart from "../General/core/NameValueCart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IDepositEditBankInfo, depositEditBankInfo } from "@/api/Deposit/depositEditBankInfo";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { TableItem } from ".";

const hostInfoInitV: IHostInfoInitV = {
  card: "",
  cardOwner: "",
  shabaNumber: "",
  shabaOwner: "",
};

const hostInfoYupSchema = {
  cardOwner: Yup.string(),
  // .required(VALIDATION_MESSAGES.REQUIRED),
  card: Yup.number()
    // .required(VALIDATION_MESSAGES.REQUIRED)
    .typeError(VALIDATION_MESSAGES.REQUIRED)
    .max(9999_9999_9999_9999, VALIDATION_MESSAGES.BANKCARTNUMBER)
    .min(1000_0000_0000_0000, VALIDATION_MESSAGES.BANKCARTNUMBER),
  shabaNumber: Yup.string()
    // .required(VALIDATION_MESSAGES.REQUIRED)
    .max(24, VALIDATION_MESSAGES.SHABANUMBER)
    .min(24, VALIDATION_MESSAGES.SHABANUMBER)
    .matches(/^\d{24}$/, VALIDATION_MESSAGES.ONLY_EN_NUMBERS),
  shabaOwner: Yup.string(),
  // .required(VALIDATION_MESSAGES.REQUIRED),
};

function HostInfoForm({
  order,
  getCheckoutsListRefetch,
}: {
  order: TableItem;
  getCheckoutsListRefetch: any;
}) {
  const [hostInfoV, setHostInfoV] = useState<IHostInfoInitV>(hostInfoInitV);
  const [editable, setEditable] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const hostInfoMutation = useMutation(
    ({ card, card_owner, shaba_number, shaba_owner, host_id }: IDepositEditBankInfo) => {
      return depositEditBankInfo({
        host_id,
        card,
        card_owner,
        shaba_number,
        shaba_owner,
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

  const formik = useFormik({
    initialValues: hostInfoV,
    validationSchema: Yup.object(hostInfoYupSchema),
    onSubmit: (values) => {
      hostInfoMutation.mutate({
        host_id: order?.host_id,
        card: values.card,
        card_owner: values.cardOwner,
        shaba_number: values.shabaNumber,
        shaba_owner: values.shabaOwner,
      });
      setEditable(false);
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (!!order) {
      setHostInfoV({
        card: order?.credit_card || "",
        cardOwner: order?.card_owner || "",
        shabaNumber: order?.shaba || "",
        shabaOwner: order?.shaba_owner || "",
      });
    }
  }, [order]);

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white rounded-16 border border-gray-#E8E8E8 p-16 flex flex-col gap-y-16"
      >
        {editable ? (
          <>
            <TextField formik={formik} name="card" label="کارت" labelInBorder isFullWidth />
            <TextField
              formik={formik}
              name="cardOwner"
              label="صاحب کارت"
              labelInBorder
              isFullWidth
            />
            <TextField formik={formik} name="shabaNumber" label="شبا" labelInBorder isFullWidth />
            <TextField
              formik={formik}
              name="shabaOwner"
              label="صاحب شبا"
              labelInBorder
              isFullWidth
            />
          </>
        ) : (
          <>
            <NameValueCart name="کارت" value={formik.values["card"]} />
            <NameValueCart name="صاحب کارت" value={formik.values["cardOwner"]} />
            <NameValueCart name="شبا" value={formik.values["shabaNumber"]} />
            <NameValueCart name="صاحب شبا" value={formik.values["shabaOwner"]} />
          </>
        )}
        {editable ? (
          <div className="flex items-center gap-x-8">
            <Button onClick={() => setEditable(false)} rounded variant="contained" color="grey">
              انصراف
            </Button>
            <Button type="submit" className="px-30" rounded variant="contained" color="dark-blue">
              ذخیره
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setEditable(true)}
            variant="outlined"
            color="dark-blue"
            rightIcon={<i className="icon-Edit text-20"></i>}
            rounded
          >
            ویرایش
          </Button>
        )}
      </form>
    </>
  );
}

export default HostInfoForm;
