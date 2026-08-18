import { useState } from "react";
import Image from "next/image";
import { Button } from "components/General/core/Button";
import { TextField } from "components/General/core/TextField";
import { Textarea } from "components/General/core/Textarea";
import { useMutation } from "@tanstack/react-query";
import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ContactUsDescription } from "./ContactUsDescription";
import Footer from "@/layouts/Footer";
import exception from "@/utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { complaintValues, FORM_TYPE, IComplaintData, submitComplaint } from "@/api/complaint";

const yupSchema = {
  name: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  phone: Yup.string()
    .matches(/^\d{11}$/, VALIDATION_MESSAGES.GENERAL_PHONE)
    .required(VALIDATION_MESSAGES.REQUIRED),
  content: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
};

const ContactUs = () => {
  const [initialValues, setInitialValues] = useState<IComplaintData>(complaintValues);

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      contactUsMutation.mutate({
        name: values.name,
        phone: values.phone,
        content: values.content,
        form_type: FORM_TYPE.Contact,
      });
    },
    validationSchema: Yup.object(yupSchema),
    enableReinitialize: true,
  });

  const contactUsMutation = useMutation(
    async (data: IComplaintData) => {
      return submitComplaint(data);
    },
    {
      onSuccess: (res) => {
        if (res?.data?.status === "success") {
          exception.message([{ type: EXCEPTIONTYPES.SUCCESS, title: "اطلاعات با موفقیت ثبت شد." }]);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: res?.err_msg || defaultError }]);
        }
      },
    }
  );

  return (
    <>
      <div className="CustomContainer pt-[79px] md:pt-[105px]">
        <div className="flex flex-col md:grid md:grid-cols-12 md:gap-40">
          <div className="order-2 md:col-span-8 md:order-1">
            <h1 className="hidden md:block md:mb-20 font-bold text-32">
              تماس با <span className="text-primary-main">لیدوما</span>
            </h1>
            <ContactUsDescription className="hidden md:block" />
            <div>
              <h2 className="pt-20 text-16 font-m">ارسال پیام به پشتیبانی</h2>
              <div className=" flex flex-col items-start mt-20">
                <form onSubmit={formik.handleSubmit} className="w-full">
                  <div className="md:grid md:grid-cols-12 gap-10">
                    <div className="mb-12 md:col-span-6">
                      <TextField
                        name="name"
                        label=" نام و نام خانوادگی"
                        formik={formik}
                        placeholder="نام و نام خانوادگی خود را وارد کنید"
                      />
                    </div>
                    <div className="mb-12 md:col-span-6">
                      <TextField
                        name="phone"
                        label="شماره موبایل"
                        formik={formik}
                        maxCharsN={11}
                        placeholder="شماره موبایل خود را وارد کنید"
                      />
                    </div>
                  </div>

                  <div className="mb-12">
                    <Textarea
                      formik={formik}
                      name="content"
                      label="متن پیام شما"
                      rows={4}
                      placeholder="پیام خود را بنویسید"
                    />
                  </div>
                  <div className="mb-6 md:flex md:justify-end">
                    <Button
                      isFullWidth
                      className={`md:w-320`}
                      type="submit"
                      disabled={!(formik.isValid && formik.dirty)}
                    >
                      ارسال پیام
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="order-1 md:col-span-4 md:order-2">
            <Image
              src="/assets/contact/contact-vector.svg"
              alt="contact"
              width={427}
              height={320}
              className="w-full"
            />
            <ContactUsDescription className="md:hidden" />
            <h2 className="pt-32 text-16 font-m">راه ها ارتباطی</h2>
            <div className="flex flex-col content-center my-20">
              <div className="flex flex-row items-center gap-10 mb-10">
                <Image
                  src="/assets/contact/circle-email.svg"
                  alt="contact"
                  width={48}
                  height={48}
                />
                <span className="flex flex-col font-n bg-[#F4F5F6] rounded-100 py-10 px-24 flex-grow">
                  ایمیل: info@lidomatrip.info
                </span>
              </div>
              <div className="flex flex-row items-center gap-10">
                <Image src="/assets/contact/circle-call.svg" alt="contact" width={48} height={48} />
                <span className="flex flex-col font-n bg-[#F4F5F6] rounded-100 py-10 px-24 flex-grow">
                  تلفن پشتیبانی :02191070021
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};
export default ContactUs;
