import { Button } from "@/components/General/core/Button";
import { TextField } from "components/General/core/TextField";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { IDepositSaveSaleDesc, depositSaveSaleDesc } from "@/api/Deposit/depositSaveSaleDesc";
import { TableItem } from ".";

const SalesTeamDescriptionFormYupSchema = {
  desc: Yup.string(),
  // .required(VALIDATION_MESSAGES.REQUIRED),
};

function SalesTeamDescriptionForm({
  order,
  getCheckoutsListRefetch,
}: {
  order: TableItem;
  getCheckoutsListRefetch: any;
}) {
  const queryClient = useQueryClient();
  const [initialValues, setInitialValues] = useState<{ desc: string }>({
    desc: "",
  });

  const SalesTeamDescriptionFormMutation = useMutation(
    ({ order_id, desc }: IDepositSaveSaleDesc) => {
      return depositSaveSaleDesc({
        order_id,
        desc,
      });
    },
    {
      onSuccess: (resp) => {
        if (resp?.result === "success") {
          // queryClient.invalidateQueries(["getCheckoutsList"]);
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
    initialValues: initialValues,
    validationSchema: Yup.object(SalesTeamDescriptionFormYupSchema),
    onSubmit: (values) => {
      SalesTeamDescriptionFormMutation.mutate({
        order_id: order?.order_id,
        desc: values.desc,
      });
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (!!order) {
      setInitialValues({
        desc: order?.order_description || "",
      });
    }
  }, [order]);

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex items-center mt-8 gap-x-12 justify-between col-span-12"
    >
      <div className="flex-1">
        <TextField
          autoComplete={false}
          name="desc"
          placeholder="توضیحات تیم فروش"
          isFullWidth={false}
          formik={formik}
        />
      </div>
      <Button
        variant="contained"
        color="dark-blue"
        rounded
        type="submit"
        disabled={!formik.values["desc"]}
      >
        ذخیره توضیحات
      </Button>
    </form>
  );
}

export default SalesTeamDescriptionForm;
