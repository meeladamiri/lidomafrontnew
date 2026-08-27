import { useMutation } from "@tanstack/react-query";
import { Textarea } from "components/General/core/Textarea";
import { TextField } from "components/General/core/TextField";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { ResidenceSpecs } from "interfaces/Residences/Submit";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import StepTitle from "../../StepTitle";
import { useFormik } from "formik";
import { IResidenceSpecsInitV } from "@/interfaces/Residences/Submit/Steps/Step_4";
import * as Yup from "yup";
import { submitStep } from "@/api/SubmitResidence";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import exception from "@/utilities/exception";
import { Button } from "@/components/General/core/Button";
import BottomActionsWrapper from "../../BottomActions/BottomActionsWrapper";
import { useResidenceDraft } from "../../useWizard";

const residenceSpecsInitV: IResidenceSpecsInitV = {
  resName: "",
  aboutResidence: "",
  totalArea: null,
  infraArea: null,
  floor: "",
};

const residenceSpecsYupSchema = {
  resName: Yup.string().required("نام اقامتگاه نمیتواند خالی باشد."),
  aboutResidence: Yup.string(),
  totalArea: Yup.number().nullable(),
  infraArea: Yup.number().nullable(),
  floor: Yup.string(),
};

function Step4() {
  const router = useRouter();
  const [residenceSpecsV, setResidenceSpecsV] = useState<IResidenceSpecsInitV>(residenceSpecsInitV);

  const { isLoading: getResidenceSubmittedDataIsLaoding, data: residenceSubmittedData } = useResidenceDraft();

  useEffect(() => {
    if (!!residenceSubmittedData) {
      if (residenceSubmittedData?.status === "success") {
        const resSpecsInfo: ResidenceSpecs = residenceSubmittedData?.params?.residence_info;

        setResidenceSpecsV({
          resName: resSpecsInfo.name,
          aboutResidence: resSpecsInfo.description || "",
          totalArea: resSpecsInfo.total_area || null,
          infraArea: resSpecsInfo.foundation_area || null,
          floor: resSpecsInfo.floor || "",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceSubmittedData]);

  const submitStep4Mutation = useMutation(
    ({
      name,
      description,
      total_area,
      foundation_area,
      floor,
      productId,
    }: {
      productId: number;
      name: ResidenceSpecs["name"];
      description: ResidenceSpecs["description"];
      total_area: ResidenceSpecs["total_area"];
      foundation_area: ResidenceSpecs["foundation_area"];
      floor: ResidenceSpecs["floor"];
    }) => {
      return submitStep({
        step: 4,
        productId,
        data: {
          name,
          description,
          total_area,
          foundation_area,
          floor,
        },
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          router.push(`?step=${5}&productId=${data?.params?.product_id}`);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  const residenceSpecsFormik = useFormik({
    initialValues: residenceSpecsV,
    validationSchema: Yup.object(residenceSpecsYupSchema),
    onSubmit: (values) => {
      submitStep4Mutation.mutate({
        productId: Number(router?.query?.productId as string),
        name: values.resName,
        description: values.aboutResidence,
        total_area: values.totalArea || 0,
        foundation_area: values.infraArea || 0,
        floor: values.floor,
      });
    },
    enableReinitialize: true,
  });

  function onSubmitClick() {
    residenceSpecsFormik.handleSubmit();
  }

  return getResidenceSubmittedDataIsLaoding ? (
    <TinyLoader />
  ) : (
    <>
      <div className="pb-120 md:pb-[130px]">
        <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0" />

        <form onSubmit={residenceSpecsFormik.handleSubmit}>
          <div className="mb-16">
            <TextField
              name="resName"
              label="نام اقامتگاه"
              formik={residenceSpecsFormik}
              subLable="برای انتخاب اسم، از کلمات کوتاه و متناسب فضای اقامتگاه خود استفاده کنید"
              placeholder="مانند : ویلای ساحلی رامسر"
            />
          </div>

          <div className="mb-16">
            <Textarea
              name="aboutResidence"
              formik={residenceSpecsFormik}
              rows={6}
              autoResize
              placeholder="مانند : ویلای ساحلی رامسر با پنجره ای رو به دریا و یک بالکن رو به ..."
              label="درباره اقامتگاه"
              subLable="درباره ویژگی ها و هرآنچه اقامتگاه شما را منحصر به فرد میکند بنویسید"
            />
          </div>

          <div className="mb-16">
            <TextField
              name="totalArea"
              inputmode="numeric"
              label="مساحت کل زمین اقامتگاه"
              formik={residenceSpecsFormik}
              leftIcon={<span className="text-12 leading-21 text-black font-l">متر</span>}
            />
          </div>

          <div className="mb-16">
            <TextField
              name="infraArea"
              label="مساحت زیربنای اقامتگاه"
              inputmode="numeric"
              formik={residenceSpecsFormik}
              leftIcon={<span className="text-12 leading-21 text-black font-l">متر</span>}
            />
          </div>

          <TextField
            name="floor"
            label="طبقه"
            formik={residenceSpecsFormik}
            placeholder="مثال : همکف"
          />
        </form>
      </div>

      <BottomActionsWrapper isSaving={submitStep4Mutation.isLoading} onClickOfSubmitStep={() => onSubmitClick()}>
        <Button
          isFullWidth
          isLoading={submitStep4Mutation.isLoading}
          loadingText="در حال ذخیره…"
          onClick={onSubmitClick}
          leftIcon={<i className="icon-FlashLeft text-24 text-white hidden md:block" />}
        >
          ذخیره و ادامه
        </Button>
      </BottomActionsWrapper>
    </>
  );
}

export default Step4;
