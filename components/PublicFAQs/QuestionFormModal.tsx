import ModalWrapper from "components/General/core/ModalWrapper";
import { Button } from "../General/core/Button";
import { TextField } from "../General/core/TextField";
import { Textarea } from "../General/core/Textarea";
import { useFormik } from "formik";
import * as Yup from "yup";
import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import exception from "@/utilities/exception";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { IQuestionData, questionValues, submitQuestion } from "@/api/question";

const yupSchema = {
  name: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  phone: Yup.string()
    .matches(/^\d{11}$/, VALIDATION_MESSAGES.GENERAL_PHONE)
    .required(VALIDATION_MESSAGES.REQUIRED),
  email: Yup.string().email(VALIDATION_MESSAGES.EMAIL),
  content: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
};

function QuestionFormModal({
  isModalOpen,
  handleClose,
  headerTitle,
}: {
  isModalOpen: boolean;
  handleClose: () => void;
  headerTitle: string;
}) {
  const [initialValues, setInitialValues] = useState<IQuestionData>(questionValues);

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      questionFormMutation.mutate({
        name: values.name,
        phone: values.phone,
        email: values.email,
        content: values.content,
      });
    },
    validationSchema: Yup.object(yupSchema),
    enableReinitialize: true,
  });

  const questionFormMutation = useMutation(
    async (data: IQuestionData) => {
      return submitQuestion(data);
    },
    {
      onSuccess: (res) => {
        if (res?.status === "success") {
          exception.message([{ type: EXCEPTIONTYPES.SUCCESS, title: "اطلاعات با موفقیت ثبت شد." }]);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: res?.err_msg || defaultError }]);
        }
      },
    }
  );

  return (
    <ModalWrapper
      headerTitle={headerTitle}
      onClose={() => {
        handleClose();
      }}
      open={isModalOpen}
      modalClassname={"md:max-h-[90%] md:max-w-[45%]"}
    >
      <div className="my-3">
        <h2 className=" text-16 font-m">سوال خود را ثبت کنید </h2>
        <p className="text-12 font-light mt-8">ما به زودی پاسخ آن را برایتان ارسال خواهیم کرد</p>
      </div>
      <div className=" flex flex-col items-start mt-20">
        <form onSubmit={formik.handleSubmit} className="w-full">
          <div className="mb-14">
            <TextField
              name="name"
              label=" نام و نام خانوادگی"
              formik={formik}
              placeholder="نام و نام خانوادگی خود را وارد کنید"
            />
          </div>
          <div className="mb-14 ">
            <TextField
              name="phone"
              label="شماره موبایل"
              formik={formik}
              maxCharsN={11}
              placeholder="شماره موبایل خود را وارد کنید"
            />
          </div>
          <div className="mb-14 ">
            <TextField
              name="email"
              label="ایمیل"
              formik={formik}
              placeholder="ایمیل خود را وارد کنید"
              fieldIsOptional
            />
          </div>
          <div className="mb-14">
            <Textarea
              formik={formik}
              name="content"
              label="شرح سوال"
              rows={4}
              placeholder="سوال خود را شرح دهید"
            />
          </div>
          <div className="mb-10">
            <Button isFullWidth type="submit" disabled={!(formik.isValid && formik.dirty)}>
              ارسال سوال
            </Button>
          </div>
        </form>
      </div>
      <div className="mt-12 mb-40 md:mb-0 text-center flex flex-col justify-center gap-12">
        <span className="text-16 font-m">پشتیبانی 24 ساعته لیدوما</span>
        <p className="text-12 font-light leading-20">
          اگر همچنان به پشتیبانی نیاز دارید، میتوانید با کارشناسان لیدوماتریپ در تماس باشید
        </p>
        <a
          href="tel:02191070021"
          className="border rounded-100 flex items-center justify-center gap-4 p-12 mt-12"
        >
          <i className="icon-Phone text-24"></i>
          <span className="text-14 font-m">تماس با پشتیبانی</span>
        </a>
      </div>
    </ModalWrapper>
  );
}

export default QuestionFormModal;
