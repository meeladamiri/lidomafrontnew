import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { Button } from "components/General/core/Button";
import { TextField } from "components/General/core/TextField";
import { Textarea } from "components/General/core/Textarea";
import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { complaintFAQs, IComplaintFAQs } from "@/constants/faqs/complaint";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRef, useState } from "react";
import { IComplaintData, complaintValues, submitComplaint, FORM_TYPE } from "api/complaint";
import exception from "@/utilities/exception";
import Footer from "@/layouts/Footer";
import FAQItem from "../General/FAQ/FAQItem";

const yupSchema = {
  name: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  phone: Yup.string()
    .matches(/^\d{11}$/, VALIDATION_MESSAGES.GENERAL_PHONE)
    .required(VALIDATION_MESSAGES.REQUIRED),
  email: Yup.string().email(VALIDATION_MESSAGES.EMAIL),
  content: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
};

const Complaint = () => {
  const [openedFAQId, setOpenedFAQId] = useState<number>();
  const [imagePreviews, setImagePreviews] = useState<any[]>([]);
  const [images, setImages] = useState<FileReader["result"] | undefined>();
  const [initialValues, setInitialValues] = useState<IComplaintData>(complaintValues);
  const fileInputBtn = useRef<any>();

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      complaintMutation.mutate({
        name: values.name,
        phone: values.phone,
        email: values.email,
        content: values.content,
        form_type: FORM_TYPE.Complaint,
        image: images,
      });
    },
    validationSchema: Yup.object(yupSchema),
    enableReinitialize: true,
  });

  const complaintMutation = useMutation(
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

  function readFile(file: any): Promise<FileReader["result"]> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  }

  const onChangeFile = async (e: any) => {
    // let files = e?.target?.files?.[0];
    // if (files && e.target.files.length > 0) {
    //   let images = [];
    //   for (let i = 0; i < e.target.files.length; i++) {
    //     let imageDataBase64Url = await readFile(e.target.files[i]);
    //     images.push(imageDataBase64Url);
    //   }
    //   setImages(files);
    //   setImagePreviews(images);
    // }

    if (e.target.files && e.target.files.length > 0) {
      let images = [];
      for (let i = 0; i < e.target.files.length; i++) {
        let imageDataBase64Url = await readFile(e.target.files[i]);
        images.push(imageDataBase64Url);
      }
      setImagePreviews(images);

      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);
      setImages(imageDataUrl);
    }
  };

  const removeImage = (e: any) => {
    const res = imagePreviews.filter((item, index) => index !== e);
    setImagePreviews(res);
    setImages(undefined);
    fileInputBtn.current.value = null;
  };

  return (
    <>
      <div className="CustomContainer pt-[79px] md:pt-[105px]">
        <h1 className="text-20 mb-18 font-m">ثبت شکایت</h1>
        <p className="mt-3 text-justify font-light text-12 leading-25">
          کاربر گرامی، اگر نسبت به رفتار میزبان و یا اتفاق دیگری که از سمت میزبان سر زده است شکایتی
          دارید میتوانید شکایت خود را با ما در میان بگذارید.
        </p>
        <h1 className="pt-32 text-16 font-medium">فرم ثبت شکایت</h1>
        <div className="flex flex-col items-start mt-24">
          <form onSubmit={formik.handleSubmit} className="w-full">
            <div className="md:grid md:grid-cols-12 gap-10">
              <div className="mb-14 md:col-span-4">
                <TextField
                  name="name"
                  label=" نام و نام خانوادگی"
                  formik={formik}
                  placeholder="نام و نام خانوادگی خود را وارد کنید"
                />
              </div>
              <div className="mb-14 md:col-span-4">
                <TextField
                  name="phone"
                  label="شماره موبایل"
                  formik={formik}
                  maxCharsN={11}
                  placeholder="شماره موبایل خود را وارد کنید"
                />
              </div>
              <div className="mb-14 md:col-span-4">
                <TextField
                  name="email"
                  label="ایمیل"
                  formik={formik}
                  placeholder="ایمیل خود را وارد کنید"
                  fieldIsOptional
                />
              </div>
            </div>
            <div className="mb-14">
              <Textarea
                formik={formik}
                name="content"
                label="  شرح شکایت خود را بنویسید"
                rows={4}
                placeholder="شرح کاملی از آنچه موجب نارضایتی شما شده است را بنویسید و در صورت نیاز تصاویر مربوطه را بارگذاری کنید.
        هرچه توضیحات تکمیل تر باشند، فرایند بررسی در زمان کمتری صورت می پذیرد."
              />
            </div>
            <div className="flex mb-20">
              <div
                className={`flex flex-auto ${
                  imagePreviews.length == 0 ? "md:max-w-full" : "md:max-w-fit"
                }  max-w-full flex-col text-center items-center border border-dashed rounded-lg p-24  gap-15 h-[200px] min-w-[200px]`}
              >
                <Image
                  src="/assets/non-icomoon-icons/upload.svg"
                  width={58}
                  height={48}
                  alt="upload"
                />
                <span className="block  text-14 font-m">
                  تصاویر مربوط به شکایت خود را بارگذاری کنید
                </span>
                <div
                  onClick={() => fileInputBtn.current.click()}
                  className="text-white bg-[#05668D] text-xs rounded-lg py-6 gap-5 px-12 flex justify-start items-center focus:shadow-outline cursor-pointer"
                >
                  <input
                    // multiple
                    name="image"
                    hidden={true}
                    ref={fileInputBtn}
                    type="file"
                    accept="image/jpeg ,image/jpg, image/png, image/webp"
                    onChange={onChangeFile}
                  />
                  <i className="icon-Upload text-white text-20" />
                  <span className="text-14">بارگذاری</span>
                </div>
              </div>
              <div className="flex overflow-x-auto hideScrollbar">
                {imagePreviews &&
                  imagePreviews.map((img, i) => {
                    return (
                      <div key={i} className="relative pr-10">
                        <button
                          type="button"
                          className="absolute top-8 right-18"
                          onClick={() => removeImage(i)}
                        >
                          <div className="p-10 flex items-center rounded-full bg-red-main text-white">
                            <i className="icon-Delete text-20"></i>
                          </div>
                        </button>
                        <Image
                          src={img}
                          alt=""
                          width={250}
                          height={200}
                          style={{
                            objectFit: "cover",
                            height: "200px",
                            width: "250px",
                            maxWidth: "200px",
                          }}
                          className="rounded-8"
                          key={i}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="mb-10 md:flex md:justify-end">
              <Button
                isFullWidth
                className={`md:w-216`}
                type="submit"
                disabled={!(formik.isValid && formik.dirty)}
              >
                ارسال فرم شکایت
              </Button>
            </div>
          </form>
        </div>

        <h2 className="pt-20 mb-10 text-16 font-medium"> سوالات پر تکرار </h2>
        <div className="mb-20 md:grid md:grid-cols-12 md:gap-x-32">
          {(complaintFAQs as IComplaintFAQs[]).map((faq, i) => {
            return (
              <div className="mb-5 last:mb-0 md:col-span-6 border-b-1" key={i}>
                <FAQItem
                  openedFAQId={openedFAQId}
                  setOpenedFAQId={setOpenedFAQId}
                  answer={faq.answer}
                  faqId={faq.id}
                  question={faq.question}
                  hasBg={false}
                />
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Complaint;
